import {
  AI_CONFIG,
  assertDualAIProviderConfiguration,
  getMissingAIProviderKeys,
} from "./ai";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `AI provider configuration verification failed: ${message}`
    );
  }
}

assert(
  AI_CONFIG.providers.includes("gemini"),
  "Gemini must remain a configured AI provider"
);

assert(
  AI_CONFIG.providers.includes("openrouter"),
  "OpenRouter must remain a configured AI provider"
);

assert(
  AI_CONFIG.requiredApiKeys.includes("GEMINI_API_KEY"),
  "Gemini API key must be required"
);

assert(
  AI_CONFIG.requiredApiKeys.includes("OPENROUTER_API_KEY"),
  "OpenRouter API key must be required"
);

const originalGeminiKey =
  process.env.GEMINI_API_KEY;
const originalOpenRouterKey =
  process.env.OPENROUTER_API_KEY;

try {
  process.env.GEMINI_API_KEY =
    "test-gemini-key";
  process.env.OPENROUTER_API_KEY =
    "test-openrouter-key";

  assert(
    getMissingAIProviderKeys().length === 0,
    "both configured API keys must satisfy the dual-provider requirement"
  );

  assertDualAIProviderConfiguration();

  delete process.env.GEMINI_API_KEY;

  assert(
    getMissingAIProviderKeys().includes(
      "GEMINI_API_KEY"
    ),
    "missing Gemini API key must be detected"
  );

  let missingProviderRejected =
    false;

  try {
    assertDualAIProviderConfiguration();
  } catch (error) {
    missingProviderRejected =
      error instanceof Error &&
      error.message.includes(
        "GEMINI_API_KEY"
      ) &&
      error.message.includes(
        "both AI providers"
      );
  }

  assert(
    missingProviderRejected,
    "Human OS must reject single-provider AI configuration"
  );

  process.env.GEMINI_API_KEY =
    "test-gemini-key";
  delete process.env.OPENROUTER_API_KEY;

  assert(
    getMissingAIProviderKeys().includes(
      "OPENROUTER_API_KEY"
    ),
    "missing OpenRouter API key must be detected"
  );
} finally {
  if (
    originalGeminiKey === undefined
  ) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY =
      originalGeminiKey;
  }

  if (
    originalOpenRouterKey === undefined
  ) {
    delete process.env.OPENROUTER_API_KEY;
  } else {
    process.env.OPENROUTER_API_KEY =
      originalOpenRouterKey;
  }
}
