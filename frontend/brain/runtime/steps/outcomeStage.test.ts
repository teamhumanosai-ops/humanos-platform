import {
  createBrainState,
} from "../../brainState";

import {
  OutcomeStage,
} from "./outcomeStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `OutcomeStage verification failed: ${message}`
    );
  }
}

async function runSuccessfulResponseVerification(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Give me a concise summary."
    );

  state.response =
    "Here is the summary.";

  const result =
    await new OutcomeStage().execute(
      state
    );

  assert(
    result.outcome?.status ===
      "completed",
    "successful response must create a completed runtime outcome"
  );

  assert(
    result.runtimeStatus ===
      "completed",
    "successful response must complete the runtime"
  );

  assert(
    result.outcome?.metadata.stagesExecuted.includes(
      "Outcome"
    ) === true,
    "outcome metadata must include the Outcome stage"
  );
}

async function runConservativeStateVerification(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue processing."
    );

  const result =
    await new OutcomeStage().execute(
      state
    );

  assert(
    result.outcome?.status ===
      "in_progress",
    "missing result must not claim completion"
  );

  assert(
    result.runtimeStatus ===
      "in_progress",
    "missing result must leave the runtime in progress"
  );
}

async function runFailurePrecedenceVerification(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue processing."
    );

  state.response =
    "A response was generated.";

  state.errors.push(
    "Validation: unsafe response"
  );

  const result =
    await new OutcomeStage().execute(
      state
    );

  assert(
    result.outcome?.status ===
      "failed",
    "runtime errors must override a successful response"
  );

  assert(
    result.runtimeStatus ===
      "failed",
    "runtime status must remain failed when outcome has errors"
  );

  assert(
    result.outcome?.errors.includes(
      "Validation: unsafe response"
    ) === true,
    "outcome must preserve runtime errors"
  );
}

async function runVerification(): Promise<void> {
  await runSuccessfulResponseVerification();
  await runConservativeStateVerification();
  await runFailurePrecedenceVerification();

  console.log(
    "OutcomeStage verification passed."
  );
}

void runVerification();
