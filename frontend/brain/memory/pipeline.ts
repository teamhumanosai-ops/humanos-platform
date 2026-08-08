import type { MemoryAnalysis } from "./intelligence";

import { entityAnalyzer } from "./EntityAnalyzer";

import {
  relationshipAnalyzer,
} from "./RelationshipAnalyzer";

export interface MemoryAnalyzer {
  analyze(
    key: string,
    value: string,
    analysis: MemoryAnalysis
  ): MemoryAnalysis;
}

export class MemoryAnalysisPipeline {
  constructor(
    private readonly analyzers: MemoryAnalyzer[]
  ) {}

  run(
    key: string,
    value: string,
    initial: MemoryAnalysis
  ): MemoryAnalysis {
    return this.analyzers.reduce(
      (
        analysis,
        analyzer
      ) =>
        analyzer.analyze(
          key,
          value,
          analysis
        ),
      initial
    );
  }
}

export const memoryAnalysisPipeline =
  new MemoryAnalysisPipeline([
    entityAnalyzer,
    relationshipAnalyzer,
  ]);