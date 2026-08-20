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
      `Runtime failure diagnostics verification failed: ${message}`
    );
  }
}

const runtime =
  new CognitiveRuntime(
    {} as never
  );

const stage = {
  name:
    "FailingDiagnosticsTest",
  execute: async (
    _state: BrainState
  ): Promise<BrainState> => {
    throw new Error(
      "diagnostic failure"
    );
  },
};

const state = {
  userMessage:
    "failure diagnostics test",
  diagnostics: [],
  executedStages: [],
  errors: [],
  runtimeStatus:
    "in_progress",
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
  result.halted === true,
  "a failing stage must halt the runtime boundary"
);

const diagnostic =
  state.diagnostics[0];

assert(
  diagnostic?.stage === stage.name,
  "failure diagnostic must identify the failing stage"
);
assert(
  diagnostic?.success === false,
  "failure diagnostic must be marked unsuccessful"
);
assert(
  diagnostic?.error ===
    "diagnostic failure",
  "failure diagnostic must preserve the thrown error message"
);
assert(
  (diagnostic?.durationMs ?? -1) >= 0,
  "failure diagnostic duration must be non-negative"
);
assert(
  state.executedStages.length === 1 &&
    state.executedStages[0] === stage.name,
  "failed stage must remain visible in executed stage history"
);
assert(
  state.runtimeStatus ===
    "failed",
  "failed stage execution must set runtime status to failed"
);

console.log(
  "Runtime failure diagnostics verification passed."
);
