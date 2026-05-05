import {
  runFcfs,
  runPriorityNonPreemptive,
  runRoundRobin,
  runSjfNonPreemptive,
  runSrtfPreemptive,
} from "../lib/algorithms/scheduling";
import { ProcessInput } from "../lib/types/scheduling";

const baseProcesses: ProcessInput[] = [
  { processId: "P1", arrivalTime: 0, burstTime: 8, priority: 2 },
  { processId: "P2", arrivalTime: 1, burstTime: 4, priority: 1 },
  { processId: "P3", arrivalTime: 2, burstTime: 2, priority: 3 },
];

describe("scheduling algorithms", () => {
  test("FCFS canonical metrics", () => {
    const result = runFcfs(baseProcesses);
    const p1 = result.metrics.find((p) => p.processId === "P1")!;
    const p2 = result.metrics.find((p) => p.processId === "P2")!;
    const p3 = result.metrics.find((p) => p.processId === "P3")!;

    expect(result.gantt).toEqual([
      { processId: "P1", start: 0, end: 8 },
      { processId: "P2", start: 8, end: 12 },
      { processId: "P3", start: 12, end: 14 },
    ]);
    expect([p1.waitingTime, p2.waitingTime, p3.waitingTime]).toEqual([0, 7, 10]);
    expect(result.averages.averageWaitingTime).toBeCloseTo(17 / 3, 5);
    expect(result.summary.cpuUtilization).toBe(100);
    expect(result.summary.idleTime).toBe(0);
  });

  test("SJF non-preemptive canonical metrics", () => {
    const result = runSjfNonPreemptive(baseProcesses);
    expect(result.gantt).toEqual([
      { processId: "P1", start: 0, end: 8 },
      { processId: "P3", start: 8, end: 10 },
      { processId: "P2", start: 10, end: 14 },
    ]);
    const waits = result.metrics.map((m) => [m.processId, m.waitingTime]);
    expect(waits).toEqual([
      ["P1", 0],
      ["P2", 9],
      ["P3", 6],
    ]);
  });

  test("SRTF preemptive canonical metrics", () => {
    const result = runSrtfPreemptive(baseProcesses);
    expect(result.gantt).toEqual([
      { processId: "P1", start: 0, end: 1 },
      { processId: "P2", start: 1, end: 2 },
      { processId: "P3", start: 2, end: 4 },
      { processId: "P2", start: 4, end: 7 },
      { processId: "P1", start: 7, end: 14 },
    ]);

    const byId = Object.fromEntries(result.metrics.map((m) => [m.processId, m]));
    expect(byId.P1.completionTime).toBe(14);
    expect(byId.P2.completionTime).toBe(7);
    expect(byId.P3.completionTime).toBe(4);
    expect(byId.P2.responseTime).toBe(0);
    expect(byId.P3.responseTime).toBe(0);
  });

  test("Round Robin canonical metrics (q=2)", () => {
    const result = runRoundRobin(baseProcesses, 2);
    expect(result.gantt).toEqual([
      { processId: "P1", start: 0, end: 2 },
      { processId: "P2", start: 2, end: 4 },
      { processId: "P3", start: 4, end: 6 },
      { processId: "P1", start: 6, end: 8 },
      { processId: "P2", start: 8, end: 10 },
      { processId: "P1", start: 10, end: 14 },
    ]);

    const byId = Object.fromEntries(result.metrics.map((m) => [m.processId, m]));
    expect(byId.P1.waitingTime).toBe(6);
    expect(byId.P2.waitingTime).toBe(5);
    expect(byId.P3.waitingTime).toBe(2);
  });

  test("Priority non-preemptive canonical metrics", () => {
    const result = runPriorityNonPreemptive(baseProcesses);
    expect(result.gantt).toEqual([
      { processId: "P1", start: 0, end: 8 },
      { processId: "P2", start: 8, end: 12 },
      { processId: "P3", start: 12, end: 14 },
    ]);
  });
});
