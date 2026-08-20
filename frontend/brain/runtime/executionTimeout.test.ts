import {
  DEFAULT_RUNTIME_EXECUTION_TIMEOUT_MS,
  RuntimeExecutionTimeoutError,
  withRuntimeExecutionTimeout,
} from "./executionTimeout";

describe(
  "runtime execution timeout",
  () => {
    it(
      "uses the production default timeout",
      () => {
        expect(
          DEFAULT_RUNTIME_EXECUTION_TIMEOUT_MS
        ).toBe(30_000);
      }
    );

    it(
      "resolves when execution completes before the timeout",
      async () => {
        await expect(
          withRuntimeExecutionTimeout(
            Promise.resolve("ok"),
            50
          )
        ).resolves.toBe("ok");
      }
    );

    it(
      "rejects with a deterministic timeout error",
      async () => {
        await expect(
          withRuntimeExecutionTimeout(
            new Promise<never>(
              () => undefined
            ),
            5
          )
        ).rejects.toEqual(
          expect.objectContaining({
            name:
              "RuntimeExecutionTimeoutError",
            timeoutMs:
              5,
          })
        );

        expect(
          new RuntimeExecutionTimeoutError(5).message
        ).toContain("5 ms");
      }
    );

    it(
      "rejects invalid timeout configuration",
      async () => {
        await expect(
          withRuntimeExecutionTimeout(
            Promise.resolve("ok"),
            0
          )
        ).rejects.toThrow(
          "Runtime execution timeout must be a positive finite number."
        );
      }
    );
  }
);
