import {
  applyMultimodalInput,
} from "./multimodalRuntime";

import {
  createRuntimeBrainState,
} from "../runtime/createBrainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Multimodal runtime integration verification failed: ${message}`
    );
  }
}

const originalGeminiKey =
  process.env.GEMINI_API_KEY;
const originalOpenRouterKey =
  process.env.OPENROUTER_API_KEY;
const originalFetch =
  globalThis.fetch;

process.env.GEMINI_API_KEY =
  "test-gemini";
process.env.OPENROUTER_API_KEY =
  "test-openrouter";

const requests: Array<{
  provider: "gemini" | "openrouter";
  body: Record<string, unknown>;
}> = [];

let forceGeminiFailure =
  false;

globalThis.fetch =
  async (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => {
    const url = String(input);
    const body =
      JSON.parse(
        String(
          init?.body ??
            "{}"
        )
      ) as Record<string, unknown>;

    if (
      url.includes(
        "generativelanguage.googleapis.com"
      )
    ) {
      requests.push({
        provider: "gemini",
        body,
      });

      if (
        forceGeminiFailure
      ) {
        return new Response(
          JSON.stringify({
            error: {
              message:
                "Gemini unavailable",
            },
          }),
          {
            status: 503,
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text:
                      "Gemini multimodal response",
                  },
                ],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    if (
      url.includes(
        "openrouter.ai/api/v1/chat/completions"
      )
    ) {
      requests.push({
        provider: "openrouter",
        body,
      });

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  "OpenRouter multimodal response",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    throw new Error(
      `Unexpected multimodal provider URL: ${url}`
    );
  };

try {
  const input = {
    text: "Inspect this image and audio.",
    image: {
      mimeType: "image/png",
      dataBase64: "aW1hZ2U=",
    },
    audio: {
      mimeType: "audio/wav",
      dataBase64: "YXVkaW8=",
    },
  };

  const initialState =
    createRuntimeBrainState(
      [
        {
          role: "user",
          message:
            "Inspect this image and audio.",
        },
      ],
      input
    );

  const firstResult =
    await applyMultimodalInput(
      initialState,
      input,
      "Use grounded multimodal context."
    );

  assert(
    firstResult.response ===
      "Gemini multimodal response",
    "Gemini multimodal execution must materialize the provider response"
  );

  assert(
    firstResult.userMessage ===
      input.text,
    "multimodal execution must preserve the canonical user message"
  );

  assert(
    firstResult.context ===
      "Multimodal input received: text, image, audio.",
    "multimodal execution must materialize modality context"
  );

  assert(
    firstResult.messages.at(-1)?.role ===
      "assistant" &&
      firstResult.messages.at(-1)?.message ===
        "Gemini multimodal response",
    "multimodal execution must append the assistant response to BrainState"
  );

  const geminiBody =
    requests.find(
      (request) =>
        request.provider ===
        "gemini"
    )?.body;

  const geminiContents =
    geminiBody?.contents as Array<{
      parts?: Array<Record<string, unknown>>;
    }> | undefined;

  const geminiParts =
    geminiContents?.[0]?.parts ?? [];

  assert(
    geminiParts.some(
      (part) =>
        typeof part.inlineData ===
        "object" &&
        part.inlineData !== null
    ),
    "Gemini must receive actual inline multimodal data"
  );

  const systemInstruction =
    geminiBody?.systemInstruction as {
      parts?: Array<{
        text?: string;
      }>;
    } | undefined;

  assert(
    systemInstruction?.parts?.[0]?.text ===
      "Use grounded multimodal context.",
    "multimodal system context must reach the provider"
  );

  requests.length =
    0;
  forceGeminiFailure =
    true;

  const fallbackState =
    createRuntimeBrainState(
      [
        {
          role: "user",
          message:
            "Fallback multimodal request",
        },
      ],
      {
        text:
          "Fallback multimodal request",
        image: {
          mimeType: "image/jpeg",
          dataBase64:
            "aW1hZ2U=",
        },
      }
    );

  const fallbackResult =
    await applyMultimodalInput(
      fallbackState,
      fallbackState.multimodalInput!
    );

  assert(
    fallbackResult.response ===
      "OpenRouter multimodal response",
    "OpenRouter must execute after Gemini provider failure"
  );

  assert(
    requests.some(
      (request) =>
        request.provider ===
        "gemini"
    ) &&
      requests.some(
        (request) =>
          request.provider ===
          "openrouter"
      ),
    "multimodal provider fallback must preserve both configured AI providers"
  );

  const openRouterBody =
    requests.find(
      (request) =>
        request.provider ===
        "openrouter"
    )?.body;

  const openRouterMessages =
    openRouterBody?.messages as Array<{
      content?: Array<Record<string, unknown>>;
    }> | undefined;

  assert(
    openRouterMessages?.[0]?.content?.some(
      (part) =>
        part.type ===
        "image_url"
    ) === true,
    "OpenRouter must receive an actual image payload during fallback"
  );

  forceGeminiFailure =
    false;
  requests.length =
    0;

  const whitespaceState =
    createRuntimeBrainState(
      [
        {
          role: "user",
          message: "   ",
        },
      ],
      {
        text: "   ",
        image: {
          mimeType: "image/png",
          dataBase64: "aW1hZ2U=",
        },
      }
    );

  const whitespaceResult =
    await applyMultimodalInput(
      whitespaceState,
      whitespaceState.multimodalInput!
    );

  assert(
    whitespaceResult.userMessage ===
      "[image input]",
    "whitespace-only text must fall back to the actual multimodal modality context"
  );

  assert(
    whitespaceResult.messages.at(-2)?.message ===
      "[image input]",
    "BrainState must not retain a blank user message for image-only multimodal input"
  );

  console.log(
    "Multimodal runtime provider execution verification passed."
  );
} finally {
  if (
    originalGeminiKey ===
    undefined
  ) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY =
      originalGeminiKey;
  }

  if (
    originalOpenRouterKey ===
    undefined
  ) {
    delete process.env.OPENROUTER_API_KEY;
  } else {
    process.env.OPENROUTER_API_KEY =
      originalOpenRouterKey;
  }

  globalThis.fetch =
    originalFetch;
}
