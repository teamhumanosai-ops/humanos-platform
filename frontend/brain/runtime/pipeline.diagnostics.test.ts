import {
  BrainState,
} from "../brainState";

import {
  CognitiveRuntime,
} from "./pipeline";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime diagnostics verification failed: ${message}`
    );
  }
}

const runtime =
  new CognitiveRuntime(
    {} as never
  );

const stage = {
  name:
    "DiagnosticsTest",
  execute: async (
    state: BrainState
  ): Promise<BrainState> =>
    state,
};

const state = {
  userMessage:
    "diagnostics test",
  diagnostics: [],
  executedStages: [],
  errors: [],
} as unknown as BrainState;

const executeStage =
  (
    runtime as unknown as {
      executeStage: (
        stage: typeof stage,
        state: BrainState
      ) => Promise<{
        state: BrainState;
        halted: boolean;
      }>;
    }
  ).executeStage;

const result =
  await executeStage.call(
    runtime,
    stage,
    state
  );

assert(
  result.halted === false,
  "a normal stage execution must not halt"
);

const diagnostic =
  state.diagnostics[0];

assert(
  Boolean(diagnostic),
  "every executed stage must produce a diagnostic"
);
assert(
  diagnostic?.stage === stage.name,
  "diagnostic must identify the executed stage"
);
assert(
  diagnostic?.success === true,
  "successful stage execution must be marked successful"
);
assert(
  diagnostic?.error === null,
  "successful stage execution must not contain an error"
);
assert(
  diagnostic?.completedAt.getTime() >=
    diagnostic?.startedAt.getTime(),
  "diagnostic timestamps must be ordered"
);
assert(
  (diagnostic?.durationMs ?? -1) >= 0,
  "diagnostic duration must be non-negative"
);
assert(
  state.executedStages.length === 1 &&
    state.executedStages[0] === stage.name,
  "executed stage history must record the stage exactly once"
);

console.log(
  "Runtime diagnostics verification passed."
);
