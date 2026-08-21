import type { Memory } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "how", "i", "in", "is", "it", "me", "of", "on", "or", "that",
  "the", "this", "to", "was", "what", "with",
]);

function normalizeText(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function tokenize(
  value: string
): string[] {
  return [
    ...new Set(
      normalizeText(value)
        .split(/\s+/)
        .filter(
          (term) =>
            term.length > 1 &&
            !STOP_WORDS.has(term)
        )
    ),
  ];
}

export function semanticScore(
  memory: Memory,
  query: string
): number {
  const normalizedQuery =
    normalizeText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const queryTerms =
    tokenize(normalizedQuery);

  if (queryTerms.length === 0) {
    return 0;
  }

  const key =
    normalizeText(memory.key);
  const value =
    normalizeText(memory.value);

  const keyTerms =
    new Set(tokenize(key));
  const valueTerms =
    new Set(tokenize(value));

  let score = 0;

  for (const term of queryTerms) {
    if (keyTerms.has(term)) {
      score += 3;
    }

    if (valueTerms.has(term)) {
      score += 1;
    }
  }

  if (
    normalizedQuery.length > 2 &&
    key.includes(normalizedQuery)
  ) {
    score += 4;
  }

  if (
    normalizedQuery.length > 2 &&
    value.includes(normalizedQuery)
  ) {
    score += 2;
  }

  return score;
}
