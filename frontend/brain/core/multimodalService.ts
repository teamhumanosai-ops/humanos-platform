import {
  generateAIMultimodalResponse,
} from "@/lib/aiService";

import {
  createMultimodalUserMessage,
} from "./multimodalContracts";

export type {
  MultimodalInput,
} from "./multimodalContracts";

export async function runMultimodalInput(
  input: import("./multimodalContracts").MultimodalInput,
  systemContext = ""
): Promise<string> {
  const messages = [] as Parameters<
    typeof generateAIMultimodalResponse
  >[0];

  if (systemContext.trim()) {
    messages.push({
      role: "system",
      parts: [
        {
          type: "text",
          text:
            systemContext.trim(),
        },
      ],
    });
  }

  messages.push(
    createMultimodalUserMessage(
      input
    )
  );

  return generateAIMultimodalResponse(
    messages
  );
}
