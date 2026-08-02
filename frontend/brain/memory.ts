export type Memory = {
  key: string;
  value: string;
  confidence: number;
  updatedAt: Date;
};

const memoryStore = new Map<string, Memory>();

export function getMemories(): Memory[] {
  return Array.from(memoryStore.values());
}

export function getMemory(
  key: string
): Memory | undefined {
  return memoryStore.get(key);
}

export function remember(
  key: string,
  value: string,
  confidence = 1
) {
  memoryStore.set(key, {
    key,
    value,
    confidence,
    updatedAt: new Date(),
  });
}

export function buildMemoryPrompt(): string {
  const memories = getMemories();

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

export function extractSimpleMemory(
  message: string
) {
  const text = message.trim();

  const lower = text.toLowerCase();

  if (lower.startsWith("my name is ")) {
    remember(
      "name",
      text.substring(11).trim()
    );
  }

  if (lower.startsWith("i live in ")) {
    remember(
      "city",
      text.substring(10).trim()
    );
  }

  if (
    lower.startsWith(
      "my favorite color is "
    )
  ) {
    remember(
      "favorite_color",
      text.substring(21).trim()
    );
  }

  if (
    lower.startsWith(
      "my favourite color is "
    )
  ) {
    remember(
      "favorite_color",
      text.substring(22).trim()
    );
  }

  if (
    lower.startsWith("i am building ")
  ) {
    remember(
      "project",
      text.substring(14).trim()
    );
  }
}