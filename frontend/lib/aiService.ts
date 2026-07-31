import { AI_CONFIG } from "./ai";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generateAIResponse(messages: ChatMessage[]) {
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

        tools: [
          {
            type: "openrouter:web_search",
          },
        ],

        messages,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.choices[0].message.content;
}