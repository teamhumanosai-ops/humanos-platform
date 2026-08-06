import { graphBuilder } from "./GraphBuilder";

export interface MemoryGraphRecord {
  id: string;
  label: string;
  properties?: Record<string, unknown>;
}

export class MemoryGraphAdapter {
  sync(memory: MemoryGraphRecord): void {
    graphBuilder.addMemory(
      memory.id,
      memory.label,
      memory.properties ?? {}
    );
  }
}

export const memoryGraphAdapter =
  new MemoryGraphAdapter();