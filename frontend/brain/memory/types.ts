import type { MemoryKind } from "./classifier";

export interface Memory {
  key: string;

  value: string;

  confidence: number;

  updatedAt: string;

  kind: MemoryKind;

  importance: number;
}