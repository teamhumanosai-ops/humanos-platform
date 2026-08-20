export const DEFAULT_RUNTIME_EXECUTION_TIMEOUT_MS = 30_000;

export class RuntimeExecutionTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(
      `Runtime execution exceeded the configured timeout of ${timeoutMs} ms.`
    );

    this.name = "RuntimeExecutionTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export function withRuntimeExecutionTimeout<T>(
  operation: Promise<T>,
  timeoutMs = DEFAULT_RUNTIME_EXECUTION_TIMEOUT_MS
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return Promise.reject(
      new Error(
        "Runtime execution timeout must be a positive finite number."
      )
    );
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new RuntimeExecutionTimeoutError(timeoutMs)
      );
    }, timeoutMs);
  });

  return Promise.race([operation, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}
