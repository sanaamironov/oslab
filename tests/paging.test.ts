import { runFifoPaging, runLruPaging, runOptPaging } from "../lib/algorithms/paging";

const input = {
  referenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
  frameCount: 3,
};

describe("paging algorithms", () => {
  test("FIFO canonical page fault count", () => {
    const result = runFifoPaging(input);
    expect(result.stats.totalFaults).toBe(10);
    expect(result.stats.totalHits).toBe(3);
  });

  test("LRU canonical page fault count", () => {
    const result = runLruPaging(input);
    expect(result.stats.totalFaults).toBe(9);
    expect(result.stats.totalHits).toBe(4);
  });

  test("OPT canonical page fault count", () => {
    const result = runOptPaging(input);
    expect(result.stats.totalFaults).toBe(7);
    expect(result.stats.totalHits).toBe(6);
  });
});
