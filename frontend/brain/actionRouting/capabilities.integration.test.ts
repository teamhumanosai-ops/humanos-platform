import {
  getActionCapability,
} from "./capabilities";

import {
  runtimeServices,
} from "../runtime/runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 capability integration failed: ${message}`
    );
  }
}

const capability =
  getActionCapability(
    "cognitive"
  );

assert(
  capability !== null,
  "cognitive capability must resolve"
);

if (capability) {
  const result =
    await capability.execute(
      "Continue the cognitive loop",
      runtimeServices
    );

  assert(
    result.summary.includes(
      "Cognitive action acknowledged"
    ),
    "registered cognitive capability must execute through its explicit handler"
  );
}

assert(
  getActionCapability(
    "tool"
  ) === null,
  "tool target must remain blocked until a concrete tool capability is registered"
);
