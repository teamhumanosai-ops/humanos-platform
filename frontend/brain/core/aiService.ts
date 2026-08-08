import { AI_CONFIG } from "@/lib/ai";
import { SYSTEM_PROMPT } from "@/brain/systemPrompt";
import { buildMemoryPrompt } from "@/brain/memory";

type ChatMessage = {
  role:
    | "user"
    | "assistant";

  message: string;
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

export async function aiService(
  systemContext: string,
  messages: ChatMessage[]
): Promise<string> {
  const liveKnowledgePolicy =
    buildLiveKnowledgePolicy(
      systemContext
    );

  const response =
    await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model:
            AI_CONFIG.model,

          temperature:
            AI_CONFIG.temperature,

          max_tokens:
            AI_CONFIG.maxTokens,

          messages: [
            {
              role: "system",

              content: `
${SYSTEM_PROMPT}

${buildMemoryPrompt()}

${systemContext}

${liveKnowledgePolicy}
`,
            },

            ...messages.map(
              (msg) => ({
                role:
                  msg.role,

                content:
                  msg.message,
              })
            ),
          ],
        }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `AI service failed (${response.status}): ${errorText}`
    );
  }

  const data =
    await response.json();

  return (
    data.choices?.[0]
      ?.message?.content ??
    "Sorry, I couldn't generate a response."
  );
}