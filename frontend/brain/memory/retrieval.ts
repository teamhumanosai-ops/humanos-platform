import { loadMemories } from "./store";
import type { Memory } from "./types";
import { semanticScore } from "./semantic";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

function normalizeLimit(
  limit: number
): number {
  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(limit))
  );
}

export async function retrieveRelevantMemories(
  query = "",
  limit = DEFAULT_LIMIT
): Promise<Memory[]> {
  const normalizedQuery =
    query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const memories =
    await loadMemories();

  const maxResults =
    normalizeLimit(limit);

  return memories
    .map((memory) => ({
      memory,
      score:
        semanticScore(
          memory,
          normalizedQuery
        ) +
        memory.importance,
    }))
    .filter(
      (entry) =>
        entry.score > 0
    )
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      if (
        a.memory.kind === "long_term" &&
        b.memory.kind !== "long_term"
      ) {
        return -1;
      }

      if (
        a.memory.kind !== "long_term" &&
        b.memory.kind === "long_term"
      ) {
        return 1;
      }

      return a.memory.key.localeCompare(
        b.memory.key
      );
    })
    .slice(0, maxResults)
    .map(
      (entry) =>
        entry.memory
    );
}
