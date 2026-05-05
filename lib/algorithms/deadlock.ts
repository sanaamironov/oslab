import { DeadlockDetectionResult, DeadlockDetectionStep, ResourceAllocationGraph } from "../types/deadlock";

function validateGraph(graph: ResourceAllocationGraph): void {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  if (nodeIds.size !== graph.nodes.length) {
    throw new Error("Duplicate node IDs are not allowed.");
  }
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new Error(`Edge references unknown node: ${edge.from} -> ${edge.to}`);
    }
  }
}

export function detectDeadlockCycle(graph: ResourceAllocationGraph): DeadlockDetectionResult {
  validateGraph(graph);

  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const edge of graph.edges) adj.get(edge.from)!.push(edge.to);

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];
  const steps: DeadlockDetectionStep[] = [];
  let cyclePath: string[] = [];

  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    inStack.add(nodeId);
    path.push(nodeId);
    steps.push({ nodeId, action: "enter", details: `Enter ${nodeId} in DFS.` });

    for (const next of adj.get(nodeId) ?? []) {
      if (!visited.has(next)) {
        if (dfs(next)) return true;
      } else if (inStack.has(next)) {
        const start = path.indexOf(next);
        cyclePath = [...path.slice(start), next];
        steps.push({ nodeId: next, action: "cycle_found", details: `Back-edge to ${next} found; cycle detected.` });
        return true;
      }
    }

    path.pop();
    inStack.delete(nodeId);
    steps.push({ nodeId, action: "backtrack", details: `Backtrack from ${nodeId}.` });
    return false;
  };

  for (const node of graph.nodes) {
    if (!visited.has(node.id) && dfs(node.id)) {
      break;
    }
  }

  const waitingChain = cyclePath.length
    ? cyclePath.slice(0, -1).map((node, i) => `${node} -> ${cyclePath[i + 1]}`)
    : [];

  return {
    hasCycle: cyclePath.length > 0,
    cyclePath,
    waitingChain,
    steps,
  };
}
