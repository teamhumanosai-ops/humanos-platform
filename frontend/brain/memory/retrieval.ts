import { loadMemories } from "./store";
import type { Memory } from "./types";
import { semanticScore } from "./semantic";

export async function retrieveRelevantMemories(
  query = "",
  limit = 10
): Promise<Memory[]> {
  const memories = await loadMemories();

  return memories
    .map((memory) => ({
      memory,
      score:
        semanticScore(memory, query) +
        memory.importance,
    }))
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
    .slice(0, limit)
    .map((entry) => entry.memory);
}