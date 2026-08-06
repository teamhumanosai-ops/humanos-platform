import { classifyMemory, MemoryKind } from "./classifier";

export interface MemoryAnalysis {
  kind: MemoryKind;
  importance: number;
}

export function analyzeMemory(
  key: string,
  value: string
): MemoryAnalysis {
  const kind = classifyMemory(key, value);

  return {
    kind,
    importance:
      kind === "long_term"
        ? 1.0
        : 0.5,
  };
}