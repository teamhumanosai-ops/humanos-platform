import { getDocuments } from "./store";
import { SearchResult } from "./types";

export function searchKnowledge(
  query: string
): SearchResult[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const results: SearchResult[] = [];

  for (const doc of getDocuments()) {
    for (const chunk of doc.chunks) {
      let score = 0;

      const text = chunk.text.toLowerCase();

      for (const word of words) {
        if (text.includes(word)) {
          score++;
        }
      }

      if (score > 0) {
        results.push({
          chunk,
          score,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results;
}