import {
  BrainState,
} from "../brainState";

import {
  CognitiveRuntime,
} from "./pipeline";

import {
  BaseStage,
} from "./steps/baseStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime stage-boundary verification failed: ${message}`
    );
  }
}

class SuccessfulBoundaryStage
  extends BaseStage {
  readonly name =
    "SuccessfulBoundaryStage";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    return state;
  }
}

const runtime =
  new CognitiveRuntime(
    {} as never
  );

const state = {
  userMessage:
    "stage boundary test",
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
        stage: BaseStage,
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
    new SuccessfulBoundaryStage(),
    state
  );

assert(
  result.halted === false,
  "successful stage execution must not halt the runtime"
);
assert(
  state.executedStages.length === 1,
  "runtime must record a BaseStage exactly once"
);
assert(
  state.diagnostics.length === 1,
  "runtime must record one diagnostic for a BaseStage"
);
assert(
  state.diagnostics[0]?.stage ===
    "SuccessfulBoundaryStage",
  "runtime diagnostic must preserve the stage identity"
);

console.log(
  "Runtime stage-boundary verification passed."
);
