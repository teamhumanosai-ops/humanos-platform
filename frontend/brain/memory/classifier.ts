export type MemoryKind =
  | "short_term"
  | "long_term"
  | "episodic"
  | "semantic";

export function classifyMemory(
  key: string,
  value: string
): MemoryKind {
  const combined = `${key} ${value}`.toLowerCase();

  if (
    combined.includes("name") ||
    combined.includes("live") ||
    combined.includes("favorite") ||
    combined.includes("project")
  ) {
    return "long_term";
  }

  return "short_term";
}