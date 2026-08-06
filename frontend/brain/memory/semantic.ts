import type { Memory } from "./types";

export function semanticScore(
  memory: Memory,
  query: string
): number {
  const text = `${memory.key} ${memory.value}`.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;

  for (const term of terms) {
    if (text.includes(term)) {
      score += 1;
    }
  }

  return score;
}