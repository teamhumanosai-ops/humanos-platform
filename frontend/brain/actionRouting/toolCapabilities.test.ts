import {
  clearActionTools,
  getActionTool,
  hasActionTool,
  registerActionTool,
} from "./toolCapabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 tool registry verification failed: ${message}`
    );
  }
}

clearActionTools();

registerActionTool({
  id: "test-tool",
  async execute(action) {
    return {
      summary:
        `Tool executed: ${action}`,
    };
  },
});

assert(
  hasActionTool("test-tool"),
  "registered tools must be discoverable"
);

assert(
  getActionTool("test-tool") !== null,
  "registered tools must resolve"
);

assert(
  !hasActionTool("missing-tool"),
  "unregistered tools must not resolve"
);

let duplicateRejected = false;

try {
  registerActionTool({
    id: "test-tool",
    async execute() {
      return {
        summary: "duplicate",
      };
    },
  });
} catch {
  duplicateRejected = true;
}

assert(
  duplicateRejected,
  "duplicate tool registration must be rejected"
);

clearActionTools();
