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

const stage =
  runtime.getStages()[0];

assert(
  Boolean(stage),
  "canonical runtime must register at least one stage"
);

const state = {
  userMessage:
    "diagnostics test",
  diagnostics: [],
  errors: [],
} as unknown as BrainState;

const result =
  await runtime["executeStage"](
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

console.log(
  "Runtime diagnostics verification passed."
);
