import {
  clearInFlightIntegrationExecutions,
  executeWithIntegrationSafety,
  getInFlightIntegrationExecutionCount,
} from "./integrationExecution";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `External integration execution verification failed: ${message}`
    );
  }
}

clearInFlightIntegrationExecutions();

let executionCount = 0;
let resolveExecution: (() => void) | null = null;

const pendingExecution =
  new Promise<string>((resolve) => {
    resolveExecution = () =>
      resolve("completed");
  });

const first =
  executeWithIntegrationSafety(
    "provider:operation:action-1",
    "deduplicate-concurrent",
    async () => {
      executionCount += 1;
      return pendingExecution;
    }
  );

const second =
  executeWithIntegrationSafety(
    "provider:operation:action-1",
    "deduplicate-concurrent",
    async () => {
      executionCount += 1;
      return "duplicate";
    }
  );

assert(
  first === second,
  "concurrent duplicate executions must share the same promise"
);

assert(
  executionCount === 1,
  "concurrent duplicate executions must invoke the provider once"
);

assert(
  getInFlightIntegrationExecutionCount() === 1,
  "an active integration execution must remain tracked"
);

resolveExecution?.();

assert(
  await first === "completed",
  "the shared execution must return the provider result"
);

await Promise.resolve();

assert(
  getInFlightIntegrationExecutionCount() === 0,
  "completed executions must be removed from the in-flight registry"
);

let retryCount = 0;

const retry =
  await executeWithIntegrationSafety(
    "provider:operation:action-1",
    "deduplicate-concurrent",
    async () => {
      retryCount += 1;
      return "retry-success";
    }
  );

assert(
  retry === "retry-success" &&
    retryCount === 1,
  "a completed execution key must be reusable for a later execution"
);

const duplicateA =
  executeWithIntegrationSafety(
    "provider:operation:action-2",
    "allow-duplicate",
    async () => "first"
  );

const duplicateB =
  executeWithIntegrationSafety(
    "provider:operation:action-2",
    "allow-duplicate",
    async () => "second"
  );

assert(
  await duplicateA === "first" &&
    await duplicateB === "second",
  "allow-duplicate executions must remain independent"
);

let invalidKeyRejected = false;

try {
  executeWithIntegrationSafety(
    "   ",
    "deduplicate-concurrent",
    async () => "invalid"
  );
} catch {
  invalidKeyRejected = true;
}

assert(
  invalidKeyRejected,
  "blank idempotency keys must be rejected"
);

clearInFlightIntegrationExecutions();
