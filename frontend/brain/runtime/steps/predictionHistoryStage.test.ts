import {
  createBrainState,
} from "../../brainState";

import {
  PredictionHistoryStage,
} from "./predictionHistoryStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PredictionHistory verification failed: ${message}`
    );
  }
}

async function verifyRepeatedUserPattern(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [
        {
          role: "user",
          message: "Review my planner",
        },
        {
          role: "assistant",
          message: "Planner reviewed.",
        },
        {
          role: "user",
          message: "Review my planner",
        },
      ],
      "Continue"
    );

  const result =
    await new PredictionHistoryStage().execute(
      state
    );

  assert(
    result.predictions.length === 1,
    "a repeated user-authored request pattern must create one prediction"
  );

  assert(
    result.predictions[0]?.kind ===
      "recurring_behavior",
    "historical repetition must classify as recurring_behavior"
  );

  assert(
    result.predictions[0]?.statement.includes(
      "Review my planner"
    ),
    "prediction must preserve the repeated request example"
  );

  assert(
    result.predictions[0]?.evidence[0]?.source ===
      "history",
    "historical prediction must use history evidence"
  );

  assert(
    result.executedStages.includes(
      "PredictionHistory"
    ),
    "stage execution must be recorded"
  );
}

async function verifyAssistantMessagesDoNotCount(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [
        {
          role: "assistant",
          message: "Review my planner",
        },
        {
          role: "assistant",
          message: "Review my planner",
        },
      ],
      "Continue"
    );

  const result =
    await new PredictionHistoryStage().execute(
      state
    );

  assert(
    result.predictions.length === 0,
    "assistant messages must not create user behavior predictions"
  );
}

async function verifyHistoryBound(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [
        {
          role: "user",
          message: "First request",
        },
        {
          role: "user",
          message: "First request",
        },
        {
          role: "user",
          message: "Second request",
        },
        {
          role: "user",
          message: "Second request",
        },
        {
          role: "user",
          message: "Third request",
        },
        {
          role: "user",
          message: "Third request",
        },
      ],
      "Continue"
    );

  const result =
    await new PredictionHistoryStage().execute(
      state
    );

  assert(
    result.predictions.length <= 2,
    "history stage must remain bounded"
  );
}

async function runVerification(): Promise<void> {
  await verifyRepeatedUserPattern();
  await verifyAssistantMessagesDoNotCount();
  await verifyHistoryBound();

  console.log(
    "PredictionHistory verification passed."
  );
}

void runVerification();
