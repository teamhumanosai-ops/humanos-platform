export type MemoryKind =
  | "short_term"
  | "long_term"
  | "episodic"
  | "semantic";

/**
 * Classify explicitly extracted memory by its expected persistence horizon.
 *
 * Conversation Memory v2 keeps durable user-authored facts, preferences,
 * work context, projects and goals in the long-term category so the existing
 * retrieval layer can prioritize them across future conversations.
 */
export function classifyMemory(
  key: string,
  value: string
): MemoryKind {
  const combined =
    `${key} ${value}`
      .toLowerCase()
      .trim();

  const longTermMarkers = [
    "name",
    "live",
    "favorite",
    "favourite",
    "project",
    "occupation",
    "workplace",
    "preference",
    "dislike",
    "goal",
  ];

  if (
    longTermMarkers.some(
      (marker) =>
        combined.includes(
          marker
        )
    )
  ) {
    return "long_term";
  }

  return "short_term";
}
