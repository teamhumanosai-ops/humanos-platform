import type { MemoryAnalysis } from "./intelligence";
import type { MemoryAnalyzer } from "./pipeline";

export type ExtractedRelationship = {
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
};

type RelationshipPattern = {
  pattern: RegExp;
  predicate: string;
};

const RELATIONSHIP_PATTERNS: RelationshipPattern[] = [
  {
    pattern:
      /^(.+?)\s+uses\s+(.+)$/i,
    predicate: "uses",
  },
  {
    pattern:
      /^(.+?)\s+use\s+(.+)$/i,
    predicate: "uses",
  },
  {
    pattern:
      /^(.+?)\s+built\s+with\s+(.+)$/i,
    predicate: "built_with",
  },
  {
    pattern:
      /^(.+?)\s+builds?\s+with\s+(.+)$/i,
    predicate: "built_with",
  },
  {
    pattern:
      /^(.+?)\s+depends\s+on\s+(.+)$/i,
    predicate: "depends_on",
  },
  {
    pattern:
      /^(.+?)\s+is\s+based\s+on\s+(.+)$/i,
    predicate: "based_on",
  },
  {
    pattern:
      /^(.+?)\s+created\s+by\s+(.+)$/i,
    predicate: "created_by",
  },
  {
    pattern:
      /^(.+?)\s+was\s+created\s+by\s+(.+)$/i,
    predicate: "created_by",
  },
  {
    pattern:
      /^(.+?)\s+works\s+with\s+(.+)$/i,
    predicate: "works_with",
  },
  {
    pattern:
      /^(.+?)\s+integrates\s+with\s+(.+)$/i,
    predicate: "integrates_with",
  },
  {
    pattern:
      /^(.+?)\s+is\s+part\s+of\s+(.+)$/i,
    predicate: "part_of",
  },
  {
    pattern:
      /^(.+?)\s+belongs\s+to\s+(.+)$/i,
    predicate: "belongs_to",
  },
];

function clean(value: string): string {
  return value
    .trim()
    .replace(/[.!?,;:]+$/g, "")
    .trim();
}

function normalizePredicate(
  predicate: string
): string {
  return predicate
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export class RelationshipAnalyzer
  implements MemoryAnalyzer
{
  analyze(
    key: string,
    value: string,
    analysis: MemoryAnalysis
  ): MemoryAnalysis {
    const relationships: ExtractedRelationship[] =
      [];

    for (const relationshipPattern of RELATIONSHIP_PATTERNS) {
      const match =
        relationshipPattern.pattern.exec(
          clean(value)
        );

      if (!match) {
        continue;
      }

      const subject = clean(
        match[1]
      );

      const object = clean(
        match[2]
      );

      if (
        subject.length === 0 ||
        object.length === 0
      ) {
        continue;
      }

      relationships.push({
        subject,
        predicate:
          normalizePredicate(
            relationshipPattern.predicate
          ),
        object,
        confidence: 0.8,
      });

      break;
    }

    return {
      ...analysis,
      relationships:
        relationships.length > 0
          ? relationships
          : analysis.relationships,
    };
  }
}

export const relationshipAnalyzer =
  new RelationshipAnalyzer();