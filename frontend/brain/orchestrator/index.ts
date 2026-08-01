import { detectIntent, Intent } from "../intent";
import { executeSkills } from "../router";
import { buildContext } from "../context";
import { formatResponse } from "../formatter";
import { extractSimpleMemory } from "../memory";
import { aiService } from "../core/aiService";
import { initializeBrain } from "../bootstrap";

export async function orchestrate(
  messages: {
    role: "user" | "assistant";
    message: string;
  }[]
): Promise<string> {
  await initializeBrain();

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMessage) {
    return "How can I help you?";
  }

  extractSimpleMemory(lastUserMessage.message);

  const intent = detectIntent(lastUserMessage.message);

  const localResponse = await executeSkills(lastUserMessage.message);

  if (localResponse) {
    return formatResponse(localResponse);
  }

  let systemContext = buildContext(lastUserMessage.message);

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