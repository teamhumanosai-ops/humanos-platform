import { graphBuilder } from "./GraphBuilder";

export interface MemoryGraphRecord {
  id: string;
  label: string;
  properties?: Record<string, unknown>;
  entities?: string[];
}

export class MemoryGraphAdapter {
  sync(memory: MemoryGraphRecord): void {
    graphBuilder.addMemory(
      memory.id,
      memory.label,
      memory.properties ?? {}
    );

    for (const entity of memory.entities ?? []) {
      const entityId = `entity:${entity.toLowerCase()}`;

      graphBuilder.addEntity(
        entityId,
        entity,
        {
          source: "memory",
        }
      );

      graphBuilder.connect(
        memory.id,
        entityId,
        "mentions"
      );
    }
  }
}

export const memoryGraphAdapter =
  new MemoryGraphAdapter();