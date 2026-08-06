import { getDocuments } from "./store";
import { SearchResult } from "./types";

export function searchKnowledge(
  query: string
): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  const words = normalizedQuery
    .split(/\s+/)
    .filter(Boolean);

  const results: SearchResult[] = [];

  for (const document of getDocuments()) {
    const metadata = [
      document.id,
      document.title,
      document.source,
    ]
      .join(" ")
      .toLowerCase();

    const metadataMatched = words.some(
      (word) =>
        metadata.includes(word) ||
        normalizedQuery.includes(metadata)
    );

    for (const chunk of document.chunks) {
      let score = 0;

      const text = chunk.text.toLowerCase();

      // Existing keyword search
      for (const word of words) {
        if (text.includes(word)) {
          score += 1;
        }
      }

      // Metadata-aware search
      if (metadataMatched) {
        score += 10;
      }

      // Chunk source match
      if (
        chunk.source
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        score += 10;
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