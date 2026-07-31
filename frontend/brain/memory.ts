export type Memory = {
  key: string;
  value: string;
};

const memoryStore: Memory[] = [];

export function getMemories(): Memory[] {
  return memoryStore;
}

export function remember(key: string, value: string) {
  const existing = memoryStore.find((m) => m.key === key);

  if (existing) {
    existing.value = value;
    return;
  }

  memoryStore.push({
    key,
    value,
  });
}

export function buildMemoryPrompt(): string {
  if (memoryStore.length === 0) {
    return "";
  }

  return `
Known facts about the user:

${memoryStore
  .map((m) => `- ${m.key}: ${m.value}`)
  .join("\n")}

Use these naturally in conversation.
Never invent facts.
`;
}

export function extractSimpleMemory(message: string) {
  const text = message.trim();

  const lower = text.toLowerCase();

  if (lower.startsWith("my name is ")) {
    remember("name", text.substring(11).trim());
  }

  if (lower.startsWith("i live in ")) {
    remember("city", text.substring(10).trim());
  }

  if (lower.startsWith("my favorite color is ")) {
    remember("favorite_color", text.substring(21).trim());
  }

  if (lower.startsWith("my favourite color is ")) {
    remember("favorite_color", text.substring(22).trim());
  }

  if (lower.startsWith("i am building ")) {
    remember("project", text.substring(14).trim());
  }
}