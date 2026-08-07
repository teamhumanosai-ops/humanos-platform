import { classifyMemory, MemoryKind } from "./classifier";
import { memoryAnalysisPipeline } from "./pipeline";

export interface MemoryAnalysis {
  kind: MemoryKind;
  importance: number;
  entities?: string[];
}

export function analyzeMemory(
  key: string,
  value: string
): MemoryAnalysis {
  const kind = classifyMemory(key, value);

  return memoryAnalysisPipeline.run(
    key,
    value,
    {
      kind,
      importance:
        kind === "long_term"
          ? 1
          : 0.5,
      entities: [],
    }
  );
}