import {
  semanticScore,
} from "./semantic";

const memory = {
  key: "preferred learning style",
  value: "The user prefers practical examples and concise explanations.",
  confidence: 1,
  updatedAt: "2026-08-21T00:00:00.000Z",
  kind: "long_term" as const,
  importance: 0.8,
};

const relevant =
  semanticScore(
    memory,
    "preferred learning style"
  );

const unrelated =
  semanticScore(
    memory,
    "weather forecast"
  );

if (relevant <= unrelated) {
  throw new Error(
    "Memory semantic regression: relevant queries must outrank unrelated queries."
  );
}

if (
  semanticScore(
    memory,
    "   "
  ) !== 0
) {
  throw new Error(
    "Memory semantic regression: blank queries must score zero."
  );
}

console.log(
  "Memory semantic scoring regression verification passed."
);
