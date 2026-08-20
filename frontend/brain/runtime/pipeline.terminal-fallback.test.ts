import {
  BrainState,
} from "../brainState";

import {
  CognitiveRuntime,
} from "./pipeline";

import {
  Stage,
} from "./steps/stage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime terminal fallback verification failed: ${message}`
    );
  }
}

function createState(): BrainState {
  return {
    userMessage:
      "terminal fallback test",
    diagnostics: [],
    executedStages: [],
    errors: [],
    outcome:
      null,
  } as unknown as BrainState;
}

const runtime =
  new CognitiveRuntime(
    {} as never
  );

const runtimeWithPrivateStages =
  runtime as unknown as {
    stages: Stage[];
  };

runtimeWithPrivateStages.stages = [];

const result =
  await runtime.execute(
    createState()
  );

assert(
  result.outcome?.status ===
    "failed",
  "missing terminal Outcome registration must materialize a failed outcome"
);
assert(
  result.errors.includes(
    "CognitiveRuntime: terminal Outcome stage is not registered."
  ),
  "missing terminal Outcome registration must be preserved as a runtime error"
);
assert(
  result.runtimeStatus ===
    "failed",
  "missing terminal Outcome registration must leave runtime status failed"
);
assert(
  result.executedStages.length ===
    0,
  "fallback materialization must not invent an executed Outcome stage"
);
assert(
  result.diagnostics.length ===
    0,
  "fallback materialization must not invent an Outcome diagnostic"
);

console.log(
  "Runtime terminal fallback verification passed."
);
