import { AI_CONFIG } from "@/lib/ai";
import { SYSTEM_PROMPT } from "@/brain/systemPrompt";

type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export async function aiService(
  systemContext: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}

${systemContext}`,
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
          })),
        ],
      }),
    }
  );

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ??
    "Sorry, I couldn't generate a response."
  );
}