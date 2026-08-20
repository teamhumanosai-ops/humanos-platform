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
      `Runtime terminal idempotency verification failed: ${message}`
    );
  }
}

function createState(): BrainState {
  return {
    userMessage:
      "terminal idempotency test",
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

let outcomeCalls =
  0;

const outcomeStage: Stage = {
  name:
    "Outcome",

  execute: async (
    state: BrainState
  ): Promise<BrainState> => {
    outcomeCalls += 1;

    state.outcome = {
      status:
        "failed",
      result:
        null,
      errors: [
        "terminal artifact materialized before failure",
      ],
      metadata: {
        executionId:
          null,
        executionStatus:
          null,
        executionResult:
          null,
        planId:
          null,
        decisionId:
          null,
        stagesExecuted:
          [...state.executedStages],
        createdAt:
          new Date(),
        completedAt:
          new Date(),
      },
    };

    throw new Error(
      "terminal persistence failed after outcome materialization"
    );
  },
};

const runtimeWithPrivateStages =
  runtime as unknown as {
    stages: Stage[];
  };

runtimeWithPrivateStages.stages = [
  outcomeStage,
];

const state =
  createState();

const result =
  await runtime.execute(
    state
  );

assert(
  outcomeCalls === 1,
  "a failed terminal Outcome stage must not be executed again when the outcome artifact already exists"
);
assert(
  result.outcome?.status ===
    "failed",
  "the already-materialized terminal outcome must be preserved"
);
assert(
  result.diagnostics.length ===
    1,
  "terminal failure must produce exactly one runtime diagnostic"
);
assert(
  result.executedStages.length ===
    1 &&
    result.executedStages[0] ===
      "Outcome",
  "terminal failure must record Outcome exactly once"
);
assert(
  result.errors.length ===
    1 &&
    result.errors[0] ===
      "Outcome: terminal persistence failed after outcome materialization",
  "terminal failure must preserve one canonical runtime error"
);

console.log(
  "Runtime terminal idempotency verification passed."
);
