export type SchedulingAlgorithm =
  | "FCFS"
  | "SJF_NON_PREEMPTIVE"
  | "SRTF_PREEMPTIVE"
  | "ROUND_ROBIN"
  | "PRIORITY_NON_PREEMPTIVE";

export interface ProcessInput {
  processId: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

export interface GanttSegment {
  processId: string | "IDLE";
  start: number;
  end: number;
}

export interface ProcessMetrics {
  processId: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  startTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface SchedulingAverages {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
}

export interface SchedulingSummary {
  cpuUtilization: number;
  idleTime: number;
  makespan: number;
}

export interface SchedulingStep {
  time: number;
  selectedProcessId: string | "IDLE";
  reason: string;
}

export interface SchedulingResult {
  algorithm: SchedulingAlgorithm;
  gantt: GanttSegment[];
  metrics: ProcessMetrics[];
  averages: SchedulingAverages;
  summary: SchedulingSummary;
  steps: SchedulingStep[];
}

export interface RoundRobinOptions {
  timeQuantum: number;
}
