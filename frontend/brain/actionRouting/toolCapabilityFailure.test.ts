import {
  clearActionTools,
  registerActionTool,
} from "./toolCapabilities";

import {
  getActionCapability,
} from "./capabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR tool capability failure verification failed: ${message}`
    );
  }
}

clearActionTools();

registerActionTool({
  id: "failure-test-tool",
  async execute() {
    throw new Error(
      "provider execution failed"
    );
  },
});

const capability =
  getActionCapability(
    "tool"
  );

assert(
  capability !== null,
  "tool capability must remain registered"
);

if (capability) {
  let propagated =
    false;

  try {
    await capability.execute(
      "failure-test-tool:run",
      {} as never
    );
  } catch (error) {
    propagated =
      error instanceof Error &&
      error.message ===
        "provider execution failed";
  }

  assert(
    propagated,
    "registered tool failures must propagate instead of being converted into success"
  );
}

clearActionTools();

console.log(
  "ATR tool capability failure verification passed."
);
