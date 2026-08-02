import { loadReflections } from "./store";

export async function buildReflectionPrompt(): Promise<string> {
  const reflections = await loadReflections();

  if (reflections.length === 0) {
    return "";
  }

  return `
Current reflections:

${reflections
  .map(
    (reflection) =>
      `- ${reflection.summary}`
  )
  .join("\n")}

These are inferred patterns based on the user's history.

Use them naturally when they help answer the user's request.

Do not invent new reflections.
`;
}