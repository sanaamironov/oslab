export type PagingAlgorithm = "FIFO" | "LRU" | "OPT";

export interface PagingInput {
  referenceString: number[];
  frameCount: number;
}

export interface PagingStep {
  index: number;
  page: number;
  frames: Array<number | null>;
  hit: boolean;
  replacedPage: number | null;
  reason: string;
}

export interface PagingStats {
  totalReferences: number;
  totalHits: number;
  totalFaults: number;
  faultRate: number;
  hitRate: number;
}

export interface PagingResult {
  algorithm: PagingAlgorithm;
  steps: PagingStep[];
  stats: PagingStats;
}
