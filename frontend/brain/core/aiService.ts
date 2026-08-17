import {
  SYSTEM_PROMPT,
} from "@/brain/systemPrompt";

import {
  buildMemoryPrompt,
} from "@/brain/memory";

import {
  generateAIResponse,
} from "@/lib/aiService";

type ChatMessage = {
  role:
    | "user"
    | "assistant";

  message:
    string;
};

function hasLiveEvidence(
  systemContext: string
): boolean {
  return (
    systemContext.includes(
      "LIVE WEB SEARCH EXECUTED."
    ) ||
    systemContext.includes(
      "LIVE KNOWLEDGE POLICY:"
    )
  );
}

function buildLiveKnowledgePolicy(
  systemContext: string
): string {
  if (
    !hasLiveEvidence(
      systemContext
    )
  ) {
    return "";
  }

  return `
LIVE KNOWLEDGE POLICY

This request was explicitly routed through the Human OS Live Knowledge system.

The supplied web evidence is the primary source of truth for current facts.

Your pretrained knowledge can be outdated and MUST NOT override the supplied current evidence.

Do not say that you lack real-time access.

Do not invent current facts.

Do not invent sources.

When making a factual claim from the supplied evidence, associate it with the corresponding source number, such as [1] or [2].

Use only source numbers that actually exist in the supplied evidence.

If sources disagree, explain the disagreement instead of silently choosing one.

If the evidence is insufficient to answer confidently, say that the available evidence is insufficient.

Keep source references compact and factual.
`;
}

async function buildSystemMessage(
  systemContext: string
): Promise<string> {
  const memoryPrompt =
    await buildMemoryPrompt();

  const liveKnowledgePolicy =
    buildLiveKnowledgePolicy(
      systemContext
    );

  return [
    SYSTEM_PROMPT,
    memoryPrompt,
    systemContext,
    liveKnowledgePolicy,
  ]
    .filter(
      (
        value
      ) =>
        value.trim()
          .length > 0
    )
    .join(
      "\n\n"
    );
}

export async function aiService(
  systemContext: string,
  messages: ChatMessage[]
): Promise<string> {
  const systemMessage =
    await buildSystemMessage(
      systemContext
    );

  return generateAIResponse(
    [
      {
        role:
          "system",

        content:
          systemMessage,
      },

      ...messages.map(
        (
          message
        ) => ({
          role:
            message.role,

          content:
            message.message,
        })
      ),
    ]
  );
}