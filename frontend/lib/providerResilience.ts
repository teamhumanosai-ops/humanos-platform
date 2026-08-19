import {
  AIProvider,
  AI_CONFIG,
  assertDualAIProviderConfiguration,
} from "./ai";

export type ProviderAttempt = {
  provider: AIProvider;
  succeeded: boolean;
  error?: string;
};

export type ProviderExecutionResult<T> = {
  value: T;
  provider: AIProvider;
  attempts: ProviderAttempt[];
};

export async function executeWithAIProviderFailover<T>(
  execute: (
    provider: AIProvider
  ) => Promise<T>
): Promise<ProviderExecutionResult<T>> {
  assertDualAIProviderConfiguration();

  const attempts: ProviderAttempt[] = [];
  const providers = [
    ...AI_CONFIG.providers,
  ];

  let lastError: unknown =
    undefined;

  for (
    const provider of providers
  ) {
    try {
      const value =
        await execute(provider);

      attempts.push({
        provider,
        succeeded: true,
      });

      return {
        value,
        provider,
        attempts,
      };
    } catch (error) {
      lastError = error;

      attempts.push({
        provider,
        succeeded: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  throw new Error(
    `All configured AI providers failed. Attempts: ${JSON.stringify(
      attempts
    )}. Last error: ${
      lastError instanceof Error
        ? lastError.message
        : String(lastError)
    }`
  );
}
