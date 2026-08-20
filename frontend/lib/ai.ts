export type AIProvider =
  | "gemini"
  | "openrouter";

export type AIProviderStatus = {
  provider: AIProvider;
  available: boolean;
  lastFailureAt: number | null;
};

export const AI_CONFIG = {
  /*
  |--------------------------------------------------------------------------
  | Providers
  |--------------------------------------------------------------------------
  |
  | Human OS requires both independent AI providers to be configured.
  | The order is the preferred failover order only; it is never a manual
  | provider switch and Human OS must never silently become single-provider.
  |
  */

  providers: [
    "gemini",
    "openrouter",
  ] as AIProvider[],

  requiredApiKeys: [
    "GEMINI_API_KEY",
    "OPENROUTER_API_KEY",
  ] as const,

  /*
  |--------------------------------------------------------------------------
  | Models
  |--------------------------------------------------------------------------
  */

  geminiModel:
    "gemini-3.6-flash",

  openRouterModel:
    "openai/gpt-4.1-mini",

  /*
  |--------------------------------------------------------------------------
  | Generation
  |--------------------------------------------------------------------------
  */

  temperature:
    0.7,

  maxTokens:
    1500,

  /*
  |--------------------------------------------------------------------------
  | Provider routing
  |--------------------------------------------------------------------------
  */

  retryFailedProvider:
    true,

  providerFailureCooldownMs:
    30_000,
};

export function getMissingAIProviderKeys(): string[] {
  return AI_CONFIG.requiredApiKeys.filter(
    (key) =>
      !process.env[key]?.trim()
  );
}

export function assertDualAIProviderConfiguration(): void {
  const missing =
    getMissingAIProviderKeys();

  if (
    missing.length > 0
  ) {
    throw new Error(
      `Human OS requires both AI providers. Missing API key(s): ${missing.join(", ")}.`
    );
  }
}
