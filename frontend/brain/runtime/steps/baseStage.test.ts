import {
  createBrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

class SuccessfulStage
  extends BaseStage {
  readonly name =
    "DiagnosticSuccess";

  protected async process() {
    return createBrainState(
      "conversation",
      [],
      "test diagnostics"
    );
  }
}

class FailingStage
  extends BaseStage {
  readonly name =
    "DiagnosticFailure";

  protected async process() {
    throw new Error(
      "expected diagnostic failure"
    );
  }
}

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

const successState =
  createBrainState(
    "conversation",
    [],
    "test diagnostics"
  );

await new SuccessfulStage().execute(
  successState
);

assert(
  successState.diagnostics.length ===
    1,
  "successful stages must persist one diagnostic"
);

assert(
  successState.diagnostics[0].stage ===
    "DiagnosticSuccess",
  "diagnostic must identify the stage"
);

assert(
  successState.diagnostics[0].success ===
    true,
  "successful diagnostic must be marked successful"
);

assert(
  successState.diagnostics[0].durationMs >=
    0,
  "diagnostic duration must be non-negative"
);

const failureState =
  createBrainState(
    "conversation",
    [],
    "test failure diagnostics"
  );

try {
  await new FailingStage().execute(
    failureState
  );
} catch {
  // Expected failure for diagnostic verification.
}

assert(
  failureState.diagnostics.length ===
    1,
  "failed stages must persist one diagnostic"
);

assert(
  failureState.diagnostics[0].stage ===
    "DiagnosticFailure",
  "failure diagnostic must identify the stage"
);

assert(
  failureState.diagnostics[0].success ===
    false,
  "failed diagnostic must be marked unsuccessful"
);

assert(
  failureState.diagnostics[0].error ===
    "expected diagnostic failure",
  "failure diagnostic must preserve the error"
);

assert(
  failureState.errors.some(
    (error) =>
      error.includes(
        "DiagnosticFailure"
      )
  ),
  "failed stages must preserve runtime errors"
);

console.log(
  "Runtime stage diagnostics verification passed."
);
