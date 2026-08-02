import { saveMemory } from "./store";

export async function extractSimpleMemory(
  message: string
) {
  const text = message.trim();

  const lower = text.toLowerCase();

  if (lower.startsWith("my name is ")) {
    await saveMemory(
      "name",
      text.substring(11).trim()
    );
  }

  if (lower.startsWith("i live in ")) {
    await saveMemory(
      "city",
      text.substring(10).trim()
    );
  }

  if (
    lower.startsWith(
      "my favorite color is "
    )
  ) {
    await saveMemory(
      "favorite_color",
      text.substring(21).trim()
    );
  }

  if (
    lower.startsWith(
      "my favourite color is "
    )
  ) {
    await saveMemory(
      "favorite_color",
      text.substring(22).trim()
    );
  }

  if (
    lower.startsWith("i am building ")
  ) {
    await saveMemory(
      "project",
      text.substring(14).trim()
    );
  }
}