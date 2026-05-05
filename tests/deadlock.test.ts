import { detectDeadlockCycle } from "../lib/algorithms/deadlock";


describe("deadlock cycle detection", () => {
  test("detects canonical cycle in resource allocation graph", () => {
    const result = detectDeadlockCycle({
      nodes: [
        { id: "P1", type: "process" },
        { id: "P2", type: "process" },
        { id: "R1", type: "resource" },
        { id: "R2", type: "resource" },
      ],
      edges: [
        { from: "P1", to: "R1", type: "request" },
        { from: "R1", to: "P2", type: "allocation" },
        { from: "P2", to: "R2", type: "request" },
        { from: "R2", to: "P1", type: "allocation" },
      ],
    });

    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath[0]).toBe(result.cyclePath[result.cyclePath.length - 1]);
    expect(result.cyclePath).toEqual(["P1", "R1", "P2", "R2", "P1"]);
  });

  test("reports no deadlock when graph is acyclic", () => {
    const result = detectDeadlockCycle({
      nodes: [
        { id: "P1", type: "process" },
        { id: "P2", type: "process" },
        { id: "R1", type: "resource" },
      ],
      edges: [
        { from: "P1", to: "R1", type: "request" },
        { from: "R1", to: "P2", type: "allocation" },
      ],
    });

    expect(result.hasCycle).toBe(false);
    expect(result.cyclePath).toEqual([]);
  });
});
