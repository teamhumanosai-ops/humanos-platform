import { detectIntent, Intent } from "../intent";
import { executeSkills } from "../router";
import { buildContext } from "../context";
import { formatResponse } from "../formatter";
import { extractSimpleMemory } from "../memory";
import { aiService } from "../core/aiService";

export async function orchestrate(
  messages: {
    role: "user" | "assistant";
    message: string;
  }[]
): Promise<string> {
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMessage) {
    return "How can I help you?";
  }

  // Learn from the latest message
  extractSimpleMemory(lastUserMessage.message);

  // Detect intent
  const intent = detectIntent(lastUserMessage.message);

  // Execute local skills (Memory, Notes, etc.)
  const localResponse = await executeSkills(lastUserMessage.message);

  if (localResponse) {
    return formatResponse(localResponse);
  }

  // Build AI context
  let systemContext = buildContext();

  switch (intent) {
    case Intent.STARTUP_PLANNING:
      systemContext +=
        "\n\nThe user wants startup advice. Think like an experienced startup founder and advisor.";
      break;

    case Intent.LIVE_SEARCH:
      systemContext +=
        "\n\nThe user needs current information. Use live search when appropriate.";
      break;

    case Intent.GENERAL_CHAT:
    default:
      break;
  }

  return await aiService(systemContext, messages);
}