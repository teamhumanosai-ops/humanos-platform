import {
  clearActionTools,
  registerActionTool,
} from "./toolCapabilities";

import {
  getActionCapability,
} from "./capabilities";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR tool provenance verification failed: ${message}`);
  }
}

clearActionTools();

registerActionTool({
  id: "provenance-tool",
  async execute(action) {
    return {
      summary: `completed:${action}`,
      metadata: { source: "test-tool" },
    };
  },
});

const capability = getActionCapability("tool");
assert(capability !== null, "tool capability must remain available");

if (capability) {
  const result = await capability.execute(
    "tool:provenance-tool:Perform task",
    {} as never
  );

  assert(
    result.summary === "completed:Perform task",
    "tool execution must preserve the registered tool result"
  );

  assert(
    result.metadata?.toolId === "provenance-tool",
    "tool provenance must identify the registered tool"
  );

  assert(
    result.metadata?.executionType === "registered-tool",
    "tool execution must preserve its execution type"
  );

  assert(
    result.metadata?.capabilityTarget === "tool",
    "capability provenance must identify the capability target"
  );
}

clearActionTools();

console.log("ATR tool execution provenance verification passed.");
