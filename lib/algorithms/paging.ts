import { PagingAlgorithm, PagingInput, PagingResult, PagingStep } from "../types/paging";

function validateInput(input: PagingInput): void {
  if (!Number.isInteger(input.frameCount) || input.frameCount <= 0) {
    throw new Error("frameCount must be an integer > 0.");
  }
  if (input.referenceString.length === 0) {
    throw new Error("referenceString must not be empty.");
  }
  for (const page of input.referenceString) {
    if (!Number.isInteger(page) || page < 0) throw new Error("referenceString must contain non-negative integers only.");
  }
}

function buildResult(algorithm: PagingAlgorithm, steps: PagingStep[]): PagingResult {
  const totalReferences = steps.length;
  const totalHits = steps.filter((s) => s.hit).length;
  const totalFaults = totalReferences - totalHits;

  return {
    algorithm,
    steps,
    stats: {
      totalReferences,
      totalHits,
      totalFaults,
      faultRate: totalFaults / totalReferences,
      hitRate: totalHits / totalReferences,
    },
  };
}

export function runFifoPaging(input: PagingInput): PagingResult {
  validateInput(input);
  const { frameCount, referenceString } = input;
  const frames: Array<number | null> = Array(frameCount).fill(null);
  const queue: number[] = [];
  const steps: PagingStep[] = [];

  referenceString.forEach((page, index) => {
    const hitIdx = frames.indexOf(page);
    if (hitIdx !== -1) {
      steps.push({ index, page, frames: [...frames], hit: true, replacedPage: null, reason: "Page already present in memory." });
      return;
    }

    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      queue.push(page);
      steps.push({ index, page, frames: [...frames], hit: false, replacedPage: null, reason: "Page fault with empty frame available." });
      return;
    }

    const victim = queue.shift()!;
    const victimIdx = frames.indexOf(victim);
    frames[victimIdx] = page;
    queue.push(page);
    steps.push({ index, page, frames: [...frames], hit: false, replacedPage: victim, reason: "Page fault; replaced oldest loaded page (FIFO)." });
  });

  return buildResult("FIFO", steps);
}

export function runLruPaging(input: PagingInput): PagingResult {
  validateInput(input);
  const { frameCount, referenceString } = input;
  const frames: Array<number | null> = Array(frameCount).fill(null);
  const lastUsed = new Map<number, number>();
  const steps: PagingStep[] = [];

  referenceString.forEach((page, index) => {
    const hitIdx = frames.indexOf(page);
    if (hitIdx !== -1) {
      lastUsed.set(page, index);
      steps.push({ index, page, frames: [...frames], hit: true, replacedPage: null, reason: "Page hit; update recency timestamp." });
      return;
    }

    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      lastUsed.set(page, index);
      steps.push({ index, page, frames: [...frames], hit: false, replacedPage: null, reason: "Page fault with empty frame available." });
      return;
    }

    let victim: number | null = null;
    let oldest = Number.POSITIVE_INFINITY;
    for (const candidate of frames) {
      const used = lastUsed.get(candidate!) ?? -1;
      if (used < oldest) {
        oldest = used;
        victim = candidate;
      }
    }

    const victimIdx = frames.indexOf(victim);
    frames[victimIdx] = page;
    lastUsed.delete(victim!);
    lastUsed.set(page, index);

    steps.push({ index, page, frames: [...frames], hit: false, replacedPage: victim, reason: "Page fault; replaced least recently used page." });
  });

  return buildResult("LRU", steps);
}

export function runOptPaging(input: PagingInput): PagingResult {
  validateInput(input);
  const { frameCount, referenceString } = input;
  const frames: Array<number | null> = Array(frameCount).fill(null);
  const steps: PagingStep[] = [];

  referenceString.forEach((page, index) => {
    const hitIdx = frames.indexOf(page);
    if (hitIdx !== -1) {
      steps.push({ index, page, frames: [...frames], hit: true, replacedPage: null, reason: "Page already present in memory." });
      return;
    }

    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      steps.push({ index, page, frames: [...frames], hit: false, replacedPage: null, reason: "Page fault with empty frame available." });
      return;
    }

    let victim = frames[0]!;
    let farthest = -1;

    for (const candidate of frames) {
      const nextUse = referenceString.slice(index + 1).indexOf(candidate!);
      if (nextUse === -1) {
        victim = candidate!;
        farthest = Number.POSITIVE_INFINITY;
        break;
      }
      if (nextUse > farthest) {
        farthest = nextUse;
        victim = candidate!;
      }
    }

    const victimIdx = frames.indexOf(victim);
    frames[victimIdx] = page;
    steps.push({ index, page, frames: [...frames], hit: false, replacedPage: victim, reason: "Page fault; replaced page used farthest in future (OPT)." });
  });

  return buildResult("OPT", steps);
}
