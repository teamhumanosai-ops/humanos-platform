import {
  AI_CONFIG,
  AIProvider,
  assertDualAIProviderConfiguration,
} from "./ai";

type ChatMessage = {
  role:
    | "system"
    | "user"
    | "assistant";

  content:
    string;
};

export type MultimodalPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      mimeType: string;
      dataBase64: string;
    }
  | {
      type: "audio";
      mimeType: string;
      dataBase64: string;
    };

export type MultimodalMessage = {
  role:
    | "system"
    | "user"
    | "assistant";

  parts: MultimodalPart[];
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;

  error?: {
    message?: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;

  error?: {
    message?: string;
  };
};

const providerFailures =
  new Map<
    AIProvider,
    number
  >();

function isProviderAvailable(
  provider: AIProvider
): boolean {
  const failedAt =
    providerFailures.get(
      provider
    );

  if (
    failedAt === undefined
  ) {
    return true;
  }

  const cooldownExpired =
    Date.now() -
      failedAt >=
    AI_CONFIG.providerFailureCooldownMs;

  if (
    cooldownExpired
  ) {
    providerFailures.delete(
      provider
    );

    return true;
  }

  return false;
}

function markProviderHealthy(
  provider: AIProvider
): void {
  providerFailures.delete(
    provider
  );
}

function markProviderFailed(
  provider: AIProvider
): void {
  providerFailures.set(
    provider,
    Date.now()
  );
}

function getProviderOrder(): AIProvider[] {
  return AI_CONFIG.providers.filter(
    (
      provider
    ) =>
      isProviderAvailable(
        provider
      )
  );
}

function getAvailableProviders(): AIProvider[] {
  const providers =
    getProviderOrder();

  if (
    providers.length ===
    0
  ) {
    providerFailures.clear();
    providers.push(
      ...AI_CONFIG.providers
    );
  }

  return providers;
}

async function callOpenRouter(
  messages: ChatMessage[]
): Promise<string> {
  const apiKey =
    process.env
      .OPENROUTER_API_KEY;

  if (
    !apiKey
  ) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured."
    );
  }

  const response =
    await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            model:
              AI_CONFIG.openRouterModel,

            temperature:
              AI_CONFIG.temperature,

            max_tokens:
              AI_CONFIG.maxTokens,

            messages,
          }),
      }
    );

  const data:
    OpenRouterResponse =
    await response.json();

  if (
    !response.ok
  ) {
    throw new Error(
      data.error?.message ??
        `OpenRouter request failed with status ${response.status}.`
    );
  }

  const content =
    data
      .choices?.[0]
      ?.message
      ?.content;

  if (
    !content?.trim()
  ) {
    throw new Error(
      "OpenRouter returned no usable response."
    );
  }

  return content;
}

async function callGemini(
  messages: ChatMessage[]
): Promise<string> {
  const apiKey =
    process.env
      .GEMINI_API_KEY;

  if (
    !apiKey
  ) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const systemMessage =
    messages.find(
      (
        message
      ) =>
        message.role ===
        "system"
    )?.content ?? "";

  const contents =
    messages
      .filter(
        (
          message
        ) =>
          message.role !==
          "system"
      )
      .map(
        (
          message
        ) => ({
          role:
            message.role ===
            "assistant"
              ? "model"
              : "user",

          parts: [
            {
              text:
                message.content,
            },
          ],
        })
      );

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.geminiModel}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            systemInstruction:
              systemMessage
                ? {
                    parts: [
                      {
                        text:
                          systemMessage,
                      },
                    ],
                  }
                : undefined,

            contents,

            generationConfig: {
              temperature:
                AI_CONFIG.temperature,

              maxOutputTokens:
                AI_CONFIG.maxTokens,
            },
          }),
      }
    );

  const data:
    GeminiResponse =
    await response.json();

  if (
    !response.ok
  ) {
    throw new Error(
      data.error?.message ??
        `Gemini request failed with status ${response.status}.`
    );
  }

  const content =
    data
      .candidates?.[0]
      ?.content
      ?.parts
      ?.map(
        (
          part
        ) =>
          part.text ?? ""
      )
      .join("")
      .trim();

  if (
    !content
  ) {
    throw new Error(
      "Gemini returned no usable response."
    );
  }

  return content;
}

function assertMultimodalPart(
  part: MultimodalPart
): void {
  if (
    part.type ===
    "text"
  ) {
    if (!part.text.trim()) {
      throw new Error(
        "Multimodal text content cannot be empty."
      );
    }

    return;
  }

  if (
    !part.mimeType.trim()
  ) {
    throw new Error(
      `Multimodal ${part.type} content requires a MIME type.`
    );
  }

  if (
    !part.dataBase64.trim()
  ) {
    throw new Error(
      `Multimodal ${part.type} content requires base64 data.`
    );
  }
}

function validateMultimodalMessages(
  messages: MultimodalMessage[]
): void {
  if (
    messages.length ===
    0
  ) {
    throw new Error(
      "Multimodal generation requires at least one message."
    );
  }

  for (
    const message of
    messages
  ) {
    if (
      message.parts.length ===
      0
    ) {
      throw new Error(
        "Multimodal messages require at least one content part."
      );
    }

    for (
      const part of
      message.parts
    ) {
      assertMultimodalPart(
        part
      );
    }

    if (
      message.role ===
        "system" &&
      message.parts.some(
        (part) =>
          part.type !==
          "text"
      )
    ) {
      throw new Error(
        "System multimodal messages may contain text only."
      );
    }
  }
}

function toOpenRouterContent(
  parts: MultimodalPart[]
): Array<Record<string, unknown>> {
  return parts.map(
    (part) => {
      switch (
        part.type
      ) {
        case "text":
          return {
            type: "text",
            text: part.text,
          };

        case "image":
          return {
            type:
              "image_url",
            image_url: {
              url: `data:${part.mimeType};base64,${part.dataBase64}`,
            },
          };

        case "audio":
          return {
            type:
              "input_audio",
            input_audio: {
              data:
                part.dataBase64,
              format:
                part.mimeType.split(
                  "/"
                )[1] ??
                "wav",
            },
          };
      }
    }
  );
}

function toGeminiParts(
  parts: MultimodalPart[]
): Array<Record<string, unknown>> {
  return parts.map(
    (part) => {
      switch (
        part.type
      ) {
        case "text":
          return {
            text: part.text,
          };

        case "image":
        case "audio":
          return {
            inlineData: {
              mimeType:
                part.mimeType,
              data:
                part.dataBase64,
            },
          };
      }
    }
  );
}

async function callOpenRouterMultimodal(
  messages: MultimodalMessage[]
): Promise<string> {
  const apiKey =
    process.env
      .OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured."
    );
  }

  const response =
    await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method:
          "POST",
        headers: {
          Authorization:
            `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            model:
              AI_CONFIG.openRouterModel,
            temperature:
              AI_CONFIG.temperature,
            max_tokens:
              AI_CONFIG.maxTokens,
            messages:
              messages.map(
                (message) => ({
                  role:
                    message.role,
                  content:
                    toOpenRouterContent(
                      message.parts
                    ),
                })
              ),
          }),
      }
    );

  const data:
    OpenRouterResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ??
        `OpenRouter multimodal request failed with status ${response.status}.`
    );
  }

  const content =
    data.choices?.[0]
      ?.message?.content;

  if (!content?.trim()) {
    throw new Error(
      "OpenRouter returned no usable multimodal response."
    );
  }

  return content;
}

async function callGeminiMultimodal(
  messages: MultimodalMessage[]
): Promise<string> {
  const apiKey =
    process.env
      .GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const systemMessage =
    messages
      .find(
        (message) =>
          message.role ===
          "system"
      );

  const contents =
    messages
      .filter(
        (message) =>
          message.role !==
          "system"
      )
      .map(
        (message) => ({
          role:
            message.role ===
            "assistant"
              ? "model"
              : "user",
          parts:
            toGeminiParts(
              message.parts
            ),
        })
      );

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.geminiModel}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            systemInstruction:
              systemMessage
                ? {
                    parts:
                      toGeminiParts(
                        systemMessage.parts
                      ),
                  }
                : undefined,
            contents,
            generationConfig: {
              temperature:
                AI_CONFIG.temperature,
              maxOutputTokens:
                AI_CONFIG.maxTokens,
            },
          }),
      }
    );

  const data:
    GeminiResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ??
        `Gemini multimodal request failed with status ${response.status}.`
    );
  }

  const content =
    data.candidates?.[0]
      ?.content?.parts
      ?.map(
        (part) =>
          part.text ?? ""
      )
      .join("")
      .trim();

  if (!content) {
    throw new Error(
      "Gemini returned no usable multimodal response."
    );
  }

  return content;
}

async function callMultimodalProvider(
  provider: AIProvider,
  messages: MultimodalMessage[]
): Promise<string> {
  switch (
    provider
  ) {
    case "gemini":
      return callGeminiMultimodal(
        messages
      );

    case "openrouter":
      return callOpenRouterMultimodal(
        messages
      );

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
}

/**
 * Human OS multi-provider multimodal AI service.
 *
 * The existing text-only AI path remains unchanged. This additive path
 * preserves the same Gemini/OpenRouter provider boundary and failover
 * policy while allowing image and audio content to reach the provider
 * APIs as actual multimodal payloads.
 */
export async function generateAIMultimodalResponse(
  messages: MultimodalMessage[]
): Promise<string> {
  assertDualAIProviderConfiguration();
  validateMultimodalMessages(
    messages
  );

  let lastError:
    | unknown =
    undefined;

  for (
    const provider of
    getAvailableProviders()
  ) {
    try {
      console.log(
        `🧠 Human OS multimodal AI provider: ${provider}`
      );

      const response =
        await callMultimodalProvider(
          provider,
          messages
        );

      markProviderHealthy(
        provider
      );

      return response;
    } catch (
      error
    ) {
      lastError =
        error;

      markProviderFailed(
        provider
      );

      console.error(
        `AI multimodal provider failed: ${provider}`,
        error
      );

      if (
        !AI_CONFIG.retryFailedProvider
      ) {
        break;
      }
    }
  }

  throw new Error(
    `All configured multimodal AI providers failed. Last error: ${
      lastError instanceof Error
        ? lastError.message
        : String(lastError)
    }`
  );
}

async function callProvider(
  provider: AIProvider,
  messages: ChatMessage[]
): Promise<string> {
  switch (
    provider
  ) {
    case "gemini":
      return callGemini(
        messages
      );

    case "openrouter":
      return callOpenRouter(
        messages
      );

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
  }
}

/**
 * Human OS multi-provider AI service.
 *
 * Gemini and OpenRouter are both required configuration dependencies.
 * Runtime generation uses the configured preference order with automatic
 * failover so a transient provider failure does not make Human OS depend
 * permanently on a single API.
 */
export async function generateAIResponse(
  messages: ChatMessage[]
): Promise<string> {
  assertDualAIProviderConfiguration();

  const providers =
    getAvailableProviders();

  let lastError:
    | unknown =
    undefined;

  for (
    const provider of
    providers
  ) {
    try {
      console.log(
        `🧠 Human OS AI provider: ${provider}`
      );

      const response =
        await callProvider(
          provider,
          messages
        );

      markProviderHealthy(
        provider
      );

      return response;
    } catch (
      error
    ) {
      lastError =
        error;

      markProviderFailed(
        provider
      );

      console.error(
        `AI provider failed: ${provider}`,
        error
      );

      if (
        !AI_CONFIG.retryFailedProvider
      ) {
        break;
      }
    }
  }

  throw new Error(
    `All configured AI providers failed. Last error: ${
      lastError instanceof Error
        ? lastError.message
        : String(lastError)
    }`
  );
}
