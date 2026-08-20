import {
  clearActionTools,
  getActionTool,
  registerActionTool,
  unregisterActionTool,
} from "./toolCapabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR tool registry lifecycle verification failed: ${message}`
    );
  }
}

clearActionTools();

registerActionTool({
  id: "lifecycle-tool",
  async execute(action) {
    return {
      summary: action,
    };
  },
});

assert(
  getActionTool(" lifecycle-tool ") !==
    null,
  "tool lookup must normalize registered ids"
);

let duplicateRejected =
  false;

try {
  registerActionTool({
    id: "lifecycle-tool",
    async execute(action) {
      return {
        summary: action,
      };
    },
  });
} catch (error) {
  duplicateRejected =
    error instanceof Error &&
    error.message.includes(
      "already registered"
    );
}

assert(
  duplicateRejected,
  "duplicate tool registration must be rejected"
);

assert(
  unregisterActionTool(" lifecycle-tool "),
  "registered tool must be removable by normalized id"
);

assert(
  getActionTool("lifecycle-tool") ===
    null,
  "unregistered tools must no longer resolve"
);

assert(
  !unregisterActionTool("lifecycle-tool"),
  "removing an already absent tool must return false"
);

let emptyIdRejected =
  false;

try {
  registerActionTool({
    id: "   ",
    async execute(action) {
      return {
        summary: action,
      };
    },
  });
} catch (error) {
  emptyIdRejected =
    error instanceof Error &&
    error.message.includes(
      "non-empty id"
    );
}

assert(
  emptyIdRejected,
  "empty tool ids must be rejected"
);

clearActionTools();

console.log(
  "ATR tool registry lifecycle verification passed."
);
