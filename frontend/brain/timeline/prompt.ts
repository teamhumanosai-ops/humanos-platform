import { getRecentTimelineEvents } from "./query";

export async function buildTimelinePrompt(): Promise<string> {
  const events = await getRecentTimelineEvents(10);

  if (events.length === 0) {
    return "";
  }

  return `
Recent timeline events:

${events
  .map(
    (event) =>
      `- ${event.timestamp}: ${event.title}`
  )
  .join("\n")}

Use these events naturally when they help answer the user's questions.

Do not invent timeline events.
`;
}