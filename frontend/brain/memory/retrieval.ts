import { loadMemories } from "./store";
import type { Memory } from "./types";

export async function retrieveRelevantMemories(
  limit = 10
): Promise<Memory[]> {
  const memories = await loadMemories();

  return memories
    .sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }

      if (a.kind === "long_term" && b.kind !== "long_term") {
        return -1;
      }

      if (a.kind !== "long_term" && b.kind === "long_term") {
        return 1;
      }

      return a.key.localeCompare(b.key);
    })
    .slice(0, limit);
}