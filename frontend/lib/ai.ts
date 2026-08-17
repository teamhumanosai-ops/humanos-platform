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
  | Both providers are permanently configured.
  |
  | The order is the preferred order only.
  | It is NOT a manual provider switch.
  |
  */

  providers: [
    "gemini",
    "openrouter",
  ] as AIProvider[],

  /*
  |--------------------------------------------------------------------------
  | Models
  |--------------------------------------------------------------------------
  */

  geminiModel:
    "gemini-2.5-flash",

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