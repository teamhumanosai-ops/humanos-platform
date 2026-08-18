import {
  createBrainState,
} from "../../brainState";

import {
  PredictionMemoryStage,
} from "./predictionMemoryStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PredictionMemory verification failed: ${message}`
    );
  }
}

async function verifyFutureMemory(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue"
    );

  state.memories = [
    {
      key: "project_deadline",
      value: "The project review is due Friday",
      confidence: 0.9,
      updatedAt: new Date().toISOString(),
      kind: "long_term",
      importance: 0.9,
    },
  ];

  const result =
    await new PredictionMemoryStage().execute(
      state
    );

  assert(
    result.predictions.length === 1,
    "a high-confidence future-oriented memory must create one prediction"
  );

  assert(
    result.predictions[0]?.kind ===
      "likely_need",
    "future memory prediction must classify as likely_need"
  );

  assert(
    result.predictions[0]?.confidence ===
      0.9,
    "memory prediction must preserve memory confidence"
  );

  assert(
    result.predictions[0]?.evidence[0]?.source ===
      "memory",
    "memory prediction must use memory evidence"
  );
}

async function verifyLowConfidenceMemoryIgnored(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue"
    );

  state.memories = [
    {
      key: "task",
      value: "The task is due tomorrow",
      confidence: 0.64,
      updatedAt: new Date().toISOString(),
      kind: "long_term",
      importance: 0.7,
    },
  ];

  const result =
    await new PredictionMemoryStage().execute(
      state
    );

  assert(
    result.predictions.length === 0,
    "low-confidence future memory must not create a prediction"
  );
}

async function verifyStablePreferenceIgnored(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue"
    );

  state.memories = [
    {
      key: "favorite_editor",
      value: "VS Code",
      confidence: 0.99,
      updatedAt: new Date().toISOString(),
      kind: "long_term",
      importance: 0.9,
    },
  ];

  const result =
    await new PredictionMemoryStage().execute(
      state
    );

  assert(
    result.predictions.length === 0,
    "stable preference memory must not create a future prediction"
  );
}

async function verifyMemoryBound(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue"
    );

  state.memories = [
    {
      key: "task_one",
      value: "Task one is due tomorrow",
      confidence: 0.9,
      updatedAt: new Date().toISOString(),
      kind: "long_term",
      importance: 0.8,
    },
    {
      key: "task_two",
      value: "Task two is due next week",
      confidence: 0.9,
      updatedAt: new Date().toISOString(),
      kind: "long_term",
      importance: 0.8,
    },
    {
      key: "task_three",
      value: "Task three is due next month",
      confidence: 0.9,
      updatedAt: new Date().toISOString(),
      kind: "long_term",
      importance: 0.8,
    },
  ];

  const result =
    await new PredictionMemoryStage().execute(
      state
    );

  assert(
    result.predictions.length <= 2,
    "memory prediction stage must remain bounded"
  );
}

async function runVerification(): Promise<void> {
  await verifyFutureMemory();
  await verifyLowConfidenceMemoryIgnored();
  await verifyStablePreferenceIgnored();
  await verifyMemoryBound();

  console.log(
    "PredictionMemory verification passed."
  );
}

void runVerification();
