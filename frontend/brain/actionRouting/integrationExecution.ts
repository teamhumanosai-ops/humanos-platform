export type IntegrationExecutionPolicy =
  | "allow-duplicate"
  | "deduplicate-concurrent";

const inFlightExecutions =
  new Map<string, Promise<unknown>>();

function normalizeExecutionKey(
  key: string
): string {
  return key.trim();
}

export function executeWithIntegrationSafety<T>(
  key: string,
  policy: IntegrationExecutionPolicy,
  execute: () => Promise<T>
): Promise<T> {
  const normalizedKey =
    normalizeExecutionKey(key);

  if (!normalizedKey) {
    throw new Error(
      "External integration execution requires a non-empty idempotency key."
    );
  }

  if (
    policy === "allow-duplicate"
  ) {
    return execute();
  }

  const existing =
    inFlightExecutions.get(
      normalizedKey
    );

  if (existing) {
    return existing as Promise<T>;
  }

  const execution =
    execute();

  inFlightExecutions.set(
    normalizedKey,
    execution
  );

  const cleanup = () => {
    if (
      inFlightExecutions.get(
        normalizedKey
      ) === execution
    ) {
      inFlightExecutions.delete(
        normalizedKey
      );
    }
  };

  void execution.then(
    cleanup,
    cleanup
  );

  return execution;
}

export function getInFlightIntegrationExecutionCount(): number {
  return inFlightExecutions.size;
}

export function clearInFlightIntegrationExecutions(): void {
  inFlightExecutions.clear();
}
