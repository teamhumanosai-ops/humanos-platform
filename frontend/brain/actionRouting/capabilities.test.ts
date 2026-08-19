import {
  getActionCapability,
  hasActionCapability,
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
      `ATR-001 capability verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer:
      `Search result for ${query}`,
    results: [],
    searchedAt:
      new Date().toISOString(),
  }),
  aiService:
    {} as never,
};

assert(
  hasActionCapability("web-search"),
  "web-search must be explicitly registered"
);

assert(
  hasActionCapability("cognitive"),
  "cognitive execution must be explicitly registered"
);

assert(
  hasActionCapability("tool"),
  "tool execution must use the explicit capability boundary"
);

assert(
  !hasActionCapability("web-content"),
  "unregistered web-content must not become executable"
);

assert(
  getActionCapability("web-search") !== null,
  "registered web-search capability must resolve"
);

assert(
  getActionCapability("unknown") === null,
  "unknown capabilities must resolve to null"
);

clearActionTools();

registerActionTool({
  id: "test-tool",
  async execute(action) {
    return {
      summary:
        `Tool result: ${action}`,
      metadata: {
        toolId:
          "test-tool",
      },
    };
  },
});

const toolCapability =
  getActionCapability("tool");

assert(
  toolCapability !== null,
  "tool capability must resolve"
);

if (toolCapability) {
  const result =
    await toolCapability.execute(
      "test-tool:perform action",
      services
    );

  assert(
    result.summary ===
      "Tool result: perform action",
    "tool capability must delegate only the action payload"
  );

  assert(
    result.metadata?.toolId ===
      "test-tool",
    "tool metadata must identify the registered tool"
  );
}

let unknownToolRejected =
  false;

if (toolCapability) {
  try {
    await toolCapability.execute(
      "missing-tool:perform action",
      services
    );
  } catch {
    unknownToolRejected = true;
  }
}

assert(
  unknownToolRejected,
  "unknown tool ids must be rejected"
);

clearActionTools();
