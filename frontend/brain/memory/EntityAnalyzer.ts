import type { MemoryAnalysis } from "./intelligence";
import type { MemoryAnalyzer } from "./pipeline";

export class EntityAnalyzer implements MemoryAnalyzer {
  analyze(
    key: string,
    value: string,
    analysis: MemoryAnalysis
  ): MemoryAnalysis {
    const entities = value
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(
        (word) =>
          word.length > 2 &&
          /^[A-Za-z0-9._-]+$/.test(word)
      );

    return {
      ...analysis,
      entities: [...new Set(entities)],
    };
  }
}

export const entityAnalyzer =
  new EntityAnalyzer();