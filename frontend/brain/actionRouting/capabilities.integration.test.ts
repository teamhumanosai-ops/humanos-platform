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
    result.summary.trim().length > 0,
    "registered cognitive capability must return a real provider-backed result"
  );

  assert(
    result.metadata?.executionType ===
      "cognitive-ai",
    "cognitive execution must preserve its execution type"
  );

  assert(
    result.metadata?.providerBoundary ===
      "aiService",
    "cognitive execution must preserve the AI service boundary"
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
