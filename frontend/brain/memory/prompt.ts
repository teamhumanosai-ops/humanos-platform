import { retrieveRelevantMemories } from "./retrieval";

export async function buildMemoryPrompt(): Promise<string> {
  const memories =
    await retrieveRelevantMemories();

  if (memories.length === 0) {
    return "";
  }

  return `
Known facts about the user:

${memories
  .map(
    (memory) =>
      `- ${memory.key}: ${memory.value}`
  )
  .join("\n")}

Use these naturally in conversation.
Prefer higher-importance memories.
Never invent facts.
`;
}