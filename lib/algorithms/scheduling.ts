import {
  GanttSegment,
  ProcessInput,
  ProcessMetrics,
  SchedulingAlgorithm,
  SchedulingResult,
  SchedulingStep,
} from "../types/scheduling";

interface InternalProcess extends ProcessInput {
  remainingTime: number;
  startTime: number | null;
  completionTime: number | null;
}

function validateProcesses(processes: ProcessInput[]): void {
  if (processes.length === 0) throw new Error("At least one process is required.");

  const seen = new Set<string>();
  for (const p of processes) {
    if (!p.processId.trim()) throw new Error("Process ID cannot be empty.");
    if (seen.has(p.processId)) throw new Error(`Duplicate process ID: ${p.processId}`);
    seen.add(p.processId);

    if (!Number.isInteger(p.arrivalTime) || p.arrivalTime < 0) {
      throw new Error(`Invalid arrival time for ${p.processId}. Must be an integer >= 0.`);
    }
    if (!Number.isInteger(p.burstTime) || p.burstTime <= 0) {
      throw new Error(`Invalid burst time for ${p.processId}. Must be an integer > 0.`);
    }
    if (!Number.isInteger(p.priority)) {
      throw new Error(`Invalid priority for ${p.processId}. Must be an integer.`);
    }
  }
}

function appendGantt(gantt: GanttSegment[], processId: string | "IDLE", start: number, end: number): void {
  if (start === end) return;
  const last = gantt[gantt.length - 1];
  if (last && last.processId === processId && last.end === start) {
    last.end = end;
    return;
  }
  gantt.push({ processId, start, end });
}

function finalize(algorithm: SchedulingAlgorithm, base: ProcessInput[], done: InternalProcess[], gantt: GanttSegment[], steps: SchedulingStep[]): SchedulingResult {
  const metrics: ProcessMetrics[] = done
    .map((p) => {
      const start = p.startTime ?? p.arrivalTime;
      const completion = p.completionTime ?? start;
      const turnaround = completion - p.arrivalTime;
      const waiting = turnaround - p.burstTime;
      const response = start - p.arrivalTime;
      return {
        processId: p.processId,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        startTime: start,
        completionTime: completion,
        turnaroundTime: turnaround,
        waitingTime: waiting,
        responseTime: response,
      };
    })
    .sort((a, b) => a.processId.localeCompare(b.processId));

  const n = metrics.length;
  const totalWaiting = metrics.reduce((s, m) => s + m.waitingTime, 0);
  const totalTurnaround = metrics.reduce((s, m) => s + m.turnaroundTime, 0);
  const totalResponse = metrics.reduce((s, m) => s + m.responseTime, 0);
  const busyTime = base.reduce((s, p) => s + p.burstTime, 0);
  const makespan = gantt.length ? gantt[gantt.length - 1].end : 0;
  const idleTime = Math.max(0, makespan - busyTime);

  return {
    algorithm,
    gantt,
    metrics,
    averages: {
      averageWaitingTime: totalWaiting / n,
      averageTurnaroundTime: totalTurnaround / n,
      averageResponseTime: totalResponse / n,
    },
    summary: {
      cpuUtilization: makespan === 0 ? 0 : (busyTime / makespan) * 100,
      idleTime,
      makespan,
    },
    steps,
  };
}

function clone(processes: ProcessInput[]): InternalProcess[] {
  return processes.map((p) => ({ ...p, remainingTime: p.burstTime, startTime: null, completionTime: null }));
}

export function runFcfs(processes: ProcessInput[]): SchedulingResult {
  validateProcesses(processes);
  const ps = clone(processes).sort((a, b) => a.arrivalTime - b.arrivalTime || a.processId.localeCompare(b.processId));
  const gantt: GanttSegment[] = [];
  const steps: SchedulingStep[] = [];
  let time = 0;

  for (const p of ps) {
    if (time < p.arrivalTime) {
      appendGantt(gantt, "IDLE", time, p.arrivalTime);
      steps.push({ time, selectedProcessId: "IDLE", reason: `No process arrived until t=${p.arrivalTime}.` });
      time = p.arrivalTime;
    }
    p.startTime = time;
    p.completionTime = time + p.burstTime;
    appendGantt(gantt, p.processId, time, p.completionTime);
    steps.push({ time, selectedProcessId: p.processId, reason: "Selected first-come process in arrival order." });
    time = p.completionTime;
  }

  return finalize("FCFS", processes, ps, gantt, steps);
}

export function runSjfNonPreemptive(processes: ProcessInput[]): SchedulingResult {
  validateProcesses(processes);
  const ps = clone(processes);
  const gantt: GanttSegment[] = [];
  const steps: SchedulingStep[] = [];
  let time = 0;
  let completed = 0;

  while (completed < ps.length) {
    const ready = ps.filter((p) => p.completionTime === null && p.arrivalTime <= time);
    if (ready.length === 0) {
      const nextArrival = Math.min(...ps.filter((p) => p.completionTime === null).map((p) => p.arrivalTime));
      appendGantt(gantt, "IDLE", time, nextArrival);
      steps.push({ time, selectedProcessId: "IDLE", reason: `No ready process; jump to next arrival at t=${nextArrival}.` });
      time = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime || a.processId.localeCompare(b.processId));
    const p = ready[0];
    p.startTime = time;
    p.completionTime = time + p.burstTime;
    appendGantt(gantt, p.processId, time, p.completionTime);
    steps.push({ time, selectedProcessId: p.processId, reason: "Selected shortest burst among ready processes." });
    time = p.completionTime;
    completed += 1;
  }

  return finalize("SJF_NON_PREEMPTIVE", processes, ps, gantt, steps);
}

export function runSrtfPreemptive(processes: ProcessInput[]): SchedulingResult {
  validateProcesses(processes);
  const ps = clone(processes);
  const gantt: GanttSegment[] = [];
  const steps: SchedulingStep[] = [];
  let time = 0;
  let completed = 0;

  while (completed < ps.length) {
    const ready = ps.filter((p) => p.remainingTime > 0 && p.arrivalTime <= time);
    if (ready.length === 0) {
      appendGantt(gantt, "IDLE", time, time + 1);
      steps.push({ time, selectedProcessId: "IDLE", reason: "No ready process at this time unit." });
      time += 1;
      continue;
    }

    ready.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime || a.processId.localeCompare(b.processId));
    const p = ready[0];
    if (p.startTime === null) p.startTime = time;
    appendGantt(gantt, p.processId, time, time + 1);
    p.remainingTime -= 1;
    steps.push({ time, selectedProcessId: p.processId, reason: "Selected process with minimum remaining time." });

    if (p.remainingTime === 0) {
      p.completionTime = time + 1;
      completed += 1;
    }
    time += 1;
  }

  return finalize("SRTF_PREEMPTIVE", processes, ps, gantt, steps);
}

export function runRoundRobin(processes: ProcessInput[], timeQuantum: number): SchedulingResult {
  validateProcesses(processes);
  if (!Number.isInteger(timeQuantum) || timeQuantum <= 0) throw new Error("Time quantum must be an integer > 0.");

  const ps = clone(processes).sort((a, b) => a.arrivalTime - b.arrivalTime || a.processId.localeCompare(b.processId));
  const byId = new Map(ps.map((p) => [p.processId, p]));
  const gantt: GanttSegment[] = [];
  const steps: SchedulingStep[] = [];
  const queue: string[] = [];
  let time = 0;
  let nextIdx = 0;
  let completed = 0;

  const enqueueArrivals = (): void => {
    while (nextIdx < ps.length && ps[nextIdx].arrivalTime <= time) {
      queue.push(ps[nextIdx].processId);
      nextIdx += 1;
    }
  };

  enqueueArrivals();
  while (completed < ps.length) {
    if (queue.length === 0) {
      if (nextIdx < ps.length) {
        const nextArrival = ps[nextIdx].arrivalTime;
        appendGantt(gantt, "IDLE", time, nextArrival);
        steps.push({ time, selectedProcessId: "IDLE", reason: `Ready queue empty; jump to t=${nextArrival}.` });
        time = nextArrival;
        enqueueArrivals();
      }
      continue;
    }

    const pid = queue.shift()!;
    const p = byId.get(pid)!;
    if (p.remainingTime <= 0) continue;

    if (p.startTime === null) p.startTime = time;
    const slice = Math.min(timeQuantum, p.remainingTime);
    appendGantt(gantt, p.processId, time, time + slice);
    steps.push({ time, selectedProcessId: p.processId, reason: `Runs for min(quantum=${timeQuantum}, remaining=${p.remainingTime}).` });

    time += slice;
    p.remainingTime -= slice;
    enqueueArrivals();

    if (p.remainingTime > 0) {
      queue.push(p.processId);
    } else {
      p.completionTime = time;
      completed += 1;
    }
  }

  return finalize("ROUND_ROBIN", processes, ps, gantt, steps);
}

export function runPriorityNonPreemptive(processes: ProcessInput[]): SchedulingResult {
  validateProcesses(processes);
  const ps = clone(processes);
  const gantt: GanttSegment[] = [];
  const steps: SchedulingStep[] = [];
  let time = 0;
  let completed = 0;

  while (completed < ps.length) {
    const ready = ps.filter((p) => p.completionTime === null && p.arrivalTime <= time);
    if (ready.length === 0) {
      const nextArrival = Math.min(...ps.filter((p) => p.completionTime === null).map((p) => p.arrivalTime));
      appendGantt(gantt, "IDLE", time, nextArrival);
      steps.push({ time, selectedProcessId: "IDLE", reason: `No ready process; jump to t=${nextArrival}.` });
      time = nextArrival;
      continue;
    }

    // Lower numeric priority value => higher priority.
    ready.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime || a.processId.localeCompare(b.processId));
    const p = ready[0];
    p.startTime = time;
    p.completionTime = time + p.burstTime;
    appendGantt(gantt, p.processId, time, p.completionTime);
    steps.push({ time, selectedProcessId: p.processId, reason: "Selected highest priority (smallest priority value) among ready processes." });
    time = p.completionTime;
    completed += 1;
  }

  return finalize("PRIORITY_NON_PREEMPTIVE", processes, ps, gantt, steps);
}
