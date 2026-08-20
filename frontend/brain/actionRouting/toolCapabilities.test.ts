import {
  clearActionTools,
  getActionTool,
  getActionTools,
  getExternalActionTools,
  hasActionTool,
  hasExternalActionTool,
  registerActionTool,
  unregisterActionTool,
} from "./toolCapabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `External integration tool registry verification failed: ${message}`
    );
  }
}

clearActionTools();

registerActionTool({
  id: "  external-test-tool  ",
  integration: {
    provider: "  test-provider  ",
    operation: "  execute  ",
    isConfigured: () => true,
  },
  async execute(action) {
    return {
      summary:
        `External tool executed: ${action}`,
    };
  },
});

registerActionTool({
  id: "local-test-tool",
  async execute(action) {
    return {
      summary:
        `Local tool executed: ${action}`,
    };
  },
});

assert(
  hasActionTool("external-test-tool"),
  "registered external tools must be discoverable"
);
assert(
  hasExternalActionTool("external-test-tool"),
  "external tools must be distinguishable from local tools"
);
assert(
  !hasExternalActionTool("local-test-tool"),
  "tools without integration metadata must not be classified as external"
);
assert(
  getExternalActionTools().length === 1,
  "external tool listing must include only provider-bound tools"
);
assert(
  getExternalActionTools()[0]?.integration?.provider ===
    "test-provider",
  "provider metadata must be normalized"
);
assert(
  getExternalActionTools()[0]?.integration?.operation ===
    "execute",
  "operation metadata must be normalized"
);
assert(
  getExternalActionTools()[0]?.integration?.isConfigured?.() === true,
  "external integration configuration checks must remain executable"
);
assert(
  getActionTool("external-test-tool")?.integration?.provider ===
    "test-provider",
  "resolved tools must preserve external provider provenance"
);

let missingProviderRejected = false;

try {
  registerActionTool({
    id: "missing-provider",
    integration: {
      provider: "  ",
      operation: "execute",
    },
    async execute() {
      return {
        summary: "invalid",
      };
    },
  });
} catch {
  missingProviderRejected = true;
}

assert(
  missingProviderRejected,
  "external integrations without a provider must be rejected"
);

let missingOperationRejected = false;

try {
  registerActionTool({
    id: "missing-operation",
    integration: {
      provider: "test-provider",
      operation: "  ",
    },
    async execute() {
      return {
        summary: "invalid",
      };
    },
  });
} catch {
  missingOperationRejected = true;
}

assert(
  missingOperationRejected,
  "external integrations without an operation must be rejected"
);

assert(
  unregisterActionTool("external-test-tool"),
  "external tools must support explicit removal"
);
assert(
  !hasExternalActionTool("external-test-tool"),
  "removed external tools must no longer resolve"
);

clearActionTools();

assert(
  getActionTools().length === 0,
  "tool registry cleanup must remain deterministic"
);
