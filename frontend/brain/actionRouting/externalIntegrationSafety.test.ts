import {
  getActionCapability,
} from "./capabilities";

import {
  clearActionTools,
  registerActionTool,
} from "./toolCapabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `External integration safety verification failed: ${message}`
    );
  }
}

clearActionTools();

let executionCount = 0;
let resolveExecution: (() => void) | null = null;

const pendingExecution =
  new Promise<{
    summary: string;
  }>((resolve) => {
    resolveExecution = () =>
      resolve({
        summary:
          "External tool completed",
      });
  });

registerActionTool({
  id: "external-test-tool",
  integration: {
    provider: "test-provider",
    operation: "execute",
    isConfigured: () => true,
    executionPolicy:
      "deduplicate-concurrent",
  },
  async execute() {
    executionCount += 1;
    return pendingExecution;
  },
});

const toolCapability =
  getActionCapability("tool");

assert(
  toolCapability !== null,
  "tool capability must be available"
);

if (toolCapability) {
  const first =
    toolCapability.execute(
      "external-test-tool:perform",
      {} as never
    );

  const second =
    toolCapability.execute(
      "external-test-tool:perform",
      {} as never
    );

  assert(
    executionCount === 1,
    "configured external tools must deduplicate concurrent executions"
  );

  resolveExecution?.();

  const [firstResult, secondResult] =
    await Promise.all([
      first,
      second,
    ]);

  assert(
    firstResult.summary ===
      secondResult.summary,
    "deduplicated executions must share the provider result"
  );

  assert(
    firstResult.metadata?.integrationProviders ===
      "test-provider",
    "execution result must preserve integration provider provenance"
  );

  assert(
    firstResult.metadata?.executionPolicy ===
      "deduplicate-concurrent",
    "execution result must preserve the integration execution policy"
  );
}

clearActionTools();

registerActionTool({
  id: "unconfigured-external-tool",
  integration: {
    provider: "missing-provider",
    operation: "execute",
    isConfigured: () => false,
  },
  async execute() {
    throw new Error(
      "Unconfigured tool must never execute"
    );
  },
});

let configurationRejected = false;

if (toolCapability) {
  try {
    await toolCapability.execute(
      "unconfigured-external-tool:perform",
      {} as never
    );
  } catch (error) {
    configurationRejected =
      error instanceof Error &&
      error.message.includes(
        "is not configured"
      );
  }
}

assert(
  configurationRejected,
  "unconfigured external integrations must be blocked before execution"
);

clearActionTools();
