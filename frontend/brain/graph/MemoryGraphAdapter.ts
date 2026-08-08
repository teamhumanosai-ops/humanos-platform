import { graphBuilder } from "./GraphBuilder";

import type {
  ExtractedRelationship,
} from "../memory/RelationshipAnalyzer";

export interface MemoryGraphRecord {
  id: string;

  label: string;

  properties?: Record<string, unknown>;

  entities?: string[];

  relationships?: ExtractedRelationship[];
}

function entityId(
  value: string
): string {
  return `entity:${value
    .trim()
    .toLowerCase()}`;
}

function addEntity(
  label: string
): string {
  const id = entityId(label);

  graphBuilder.addEntity(
    id,
    label,
    {
      source: "memory",
    }
  );

  return id;
}

export class MemoryGraphAdapter {
  sync(
    memory: MemoryGraphRecord
  ): void {
    graphBuilder.addMemory(
      memory.id,
      memory.label,
      memory.properties ?? {}
    );

    for (
      const entity of
      memory.entities ?? []
    ) {
      const id =
        addEntity(entity);

      graphBuilder.connect(
        memory.id,
        id,
        "mentions"
      );
    }

    for (
      const relationship of
      memory.relationships ?? []
    ) {
      const subjectId =
        addEntity(
          relationship.subject
        );

      const objectId =
        addEntity(
          relationship.object
        );

      graphBuilder.connect(
        subjectId,
        objectId,
        relationship.predicate as
          | "uses"
          | "built_with"
          | "depends_on"
          | "based_on"
          | "created_by"
          | "works_with"
          | "integrates_with"
          | "part_of"
          | "belongs_to",
        relationship.confidence,
        {
          source: "memory",
          confidence:
            relationship.confidence,
        }
      );
    }
  }
}

export const memoryGraphAdapter =
  new MemoryGraphAdapter();