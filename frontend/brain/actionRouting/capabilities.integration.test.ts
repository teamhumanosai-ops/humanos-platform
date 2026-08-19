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
      `ATR-002 capability integration failed: ${message}`
    );
  }
}

const cognitiveCapability =
  getActionCapability(
    "cognitive"
  );

assert(
  cognitiveCapability !== null,
  "cognitive capability must resolve"
);

if (cognitiveCapability) {
  const result =
    await cognitiveCapability.execute(
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

const searchCapability =
  getActionCapability(
    "web-search"
  );

assert(
  searchCapability !== null,
  "web-search capability must resolve through the runtime boundary"
);

const contentCapability =
  getActionCapability(
    "web-content"
  );

assert(
  contentCapability !== null,
  "web-content capability must resolve through the runtime boundary"
);

const toolCapability =
  getActionCapability(
    "tool"
  );

assert(
  toolCapability !== null,
  "tool capability must remain available behind the explicit registry boundary"
);
