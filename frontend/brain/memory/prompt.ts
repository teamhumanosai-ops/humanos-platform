import { loadMemories } from "./store";

export async function buildMemoryPrompt(): Promise<string> {
  const memories = await loadMemories();

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
Never invent facts.
`;
}