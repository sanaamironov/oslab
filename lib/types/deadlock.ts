export type NodeType = "process" | "resource";
export type EdgeType = "request" | "allocation";

export interface GraphNode {
  id: string;
  type: NodeType;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export interface ResourceAllocationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DeadlockDetectionStep {
  nodeId: string;
  action: "enter" | "backtrack" | "cycle_found";
  details: string;
}

export interface DeadlockDetectionResult {
  hasCycle: boolean;
  cyclePath: string[];
  waitingChain: string[];
  steps: DeadlockDetectionStep[];
}
