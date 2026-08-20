export type ExternalIntegration = {
  provider: string;
  operation: string;
};

export function normalizeExternalIntegrations(
  integrations: readonly ExternalIntegration[]
): readonly ExternalIntegration[] {
  const normalized = integrations.map(
    (integration) => {
      const provider = integration.provider.trim();
      const operation = integration.operation.trim();

      if (!provider) {
        throw new Error(
          "External integration requires a provider."
        );
      }

      if (!operation) {
        throw new Error(
          `External integration for ${provider} requires an operation.`
        );
      }

      return {
        provider,
        operation,
      };
    }
  );

  return normalized.filter(
    (integration, index) =>
      normalized.findIndex(
        (candidate) =>
          candidate.provider === integration.provider &&
          candidate.operation === integration.operation
      ) === index
  );
}

export function integrationMetadata(
  integrations: readonly ExternalIntegration[]
): Record<string, string> {
  const normalized =
    normalizeExternalIntegrations(
      integrations
    );

  return {
    integrationProviders:
      normalized
        .map(
          (integration) =>
            integration.provider
        )
        .join(","),

    integrationOperations:
      normalized
        .map(
          (integration) =>
            `${integration.provider}:${integration.operation}`
        )
        .join(","),
  };
}
