import {
  executeWithAIProviderFailover,
} from "./providerResilience";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Provider resilience verification failed: ${message}`
    );
  }
}

const originalGeminiKey =
  process.env.GEMINI_API_KEY;
const originalOpenRouterKey =
  process.env.OPENROUTER_API_KEY;

try {
  process.env.GEMINI_API_KEY =
    "test-gemini";
  process.env.OPENROUTER_API_KEY =
    "test-openrouter";

  const result =
    await executeWithAIProviderFailover(
      async (provider) => {
        if (
          provider === "gemini"
        ) {
          throw new Error(
            "simulated Gemini failure"
          );
        }

        return "OpenRouter success";
      }
    );

  assert(
    result.value ===
      "OpenRouter success",
    "failover must return the successful provider result"
  );

  assert(
    result.provider ===
      "openrouter",
    "failover must identify the successful provider"
  );

  assert(
    result.attempts.length === 2,
    "both provider attempts must be auditable"
  );

  assert(
    result.attempts[0]?.succeeded ===
      false,
    "failed provider attempt must be recorded"
  );

  assert(
    result.attempts[1]?.succeeded ===
      true,
    "successful provider attempt must be recorded"
  );

  console.log(
    "Provider resilience verification passed."
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
}
