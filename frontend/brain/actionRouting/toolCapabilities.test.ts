import {
  clearActionTools,
  getActionTool,
  getActionTools,
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
  id: "  test-tool  ",
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
  hasActionTool("  test-tool  "),
  "tool lookup must normalize ids"
);

assert(
  getActionTool("test-tool") !== null,
  "registered tools must resolve"
);

assert(
  getActionTool("test-tool")?.id ===
    "test-tool",
  "registered tools must retain normalized ids"
);

assert(
  getActionTools().length ===
    1,
  "tool listing must expose the registered tool"
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

let invalidExecutorRejected = false;

try {
  registerActionTool({
    id: "invalid-tool",
    execute:
      null as never,
  });
} catch {
  invalidExecutorRejected = true;
}

assert(
  invalidExecutorRejected,
  "tools without an executable function must be rejected"
);

clearActionTools();
