import { getDocuments } from "./store";
import { SearchResult } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "how", "i", "in", "is", "it", "me", "of", "on", "or", "that",
  "the", "this", "to", "was", "what", "with",
]);

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function tokenize(query: string): string[] {
  return [
    ...new Set(
      normalizeQuery(query)
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 1 &&
            !STOP_WORDS.has(word)
        )
    ),
  ];
}

export function searchKnowledge(
  query: string
): SearchResult[] {
  const normalizedQuery =
    normalizeQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const words =
    tokenize(normalizedQuery);

  if (words.length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const document of getDocuments()) {
    const metadata = [
      document.id,
      document.title,
      document.source,
    ]
      .join(" ")
      .toLowerCase();

    const normalizedMetadata =
      normalizeQuery(metadata);

    const metadataTokens =
      new Set(tokenize(metadata));

    const metadataMatchedCount =
      words.filter((word) =>
        metadataTokens.has(word)
      ).length;

    for (const chunk of document.chunks) {
      const text =
        normalizeQuery(chunk.text);

      const source =
        normalizeQuery(chunk.source);

      let score = 0;

      for (const word of words) {
        if (text.includes(word)) {
          score += 1;
        }
      }

      if (
        normalizedQuery.length > 2 &&
        text.includes(normalizedQuery)
      ) {
        score += 4;
      }

      score +=
        metadataMatchedCount * 2;

      if (
        source.includes(normalizedQuery)
      ) {
        score += 6;
      }

      if (
        normalizedMetadata.includes(
          normalizedQuery
        )
      ) {
        score += 3;
      }

      if (score > 0) {
        results.push({
          chunk,
          score,
        });
      }
    }
  }

  return results.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    return `${a.chunk.source}\n${a.chunk.text}`.localeCompare(
      `${b.chunk.source}\n${b.chunk.text}`
    );
  });
}
