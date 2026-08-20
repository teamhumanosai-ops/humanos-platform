import {
  clearActionTools,
  getActionTool,
  registerActionTool,
} from "./toolCapabilities";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR tool registration verification failed: ${message}`);
  }
}

clearActionTools();

registerActionTool({
  id: "verification-tool",
  async execute(action) {
    return { summary: `executed:${action}` };
  },
});

assert(
  getActionTool(" verification-tool ")?.id === "verification-tool",
  "registered tool ids must be normalized consistently"
);

let duplicateRejected = false;
try {
  registerActionTool({
    id: "verification-tool",
    async execute() {
      return { summary: "duplicate" };
    },
  });
} catch (error) {
  duplicateRejected =
    error instanceof Error &&
    error.message.includes("already registered");
}

assert(
  duplicateRejected,
  "duplicate tool registration must be rejected"
);

clearActionTools();

console.log("ATR tool registration integrity verification passed.");
