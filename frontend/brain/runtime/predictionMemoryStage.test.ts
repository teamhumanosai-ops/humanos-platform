import {
  createBrainState,
} from "../brainState";

import {
  Memory,
} from "../memory";

import {
  PredictionMemoryStage,
} from "./steps/predictionMemoryStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PI-001 verification failed: ${message}`
    );
  }
}

function createState(): ReturnType<
  typeof createBrainState
> {
  return createBrainState(
    "conversation",
    [],
    "Continue my work"
  );
}

function createMemory(
  key: string,
  value: string,
  confidence = 0.9
): Memory {
  const now =
    new Date();

  return {
    id:
      `memory-${key}`,

    key,

    value,

    type:
      "fact",

    confidence,

    source:
      "conversation",

    createdAt:
      now,

    updatedAt:
      now,
  };
}

async function verifyFutureMemoryCreatesPrediction(): Promise<void> {
  const state =
    createState();

  state.memories = [
    createMemory(
      "next_action",
      "finish the Human OS planner"
    ),
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 1,
    "future-oriented durable memory must create one prediction"
  );

  const prediction =
    state.predictions[0];

  assert(
    prediction !== undefined,
    "created prediction must exist"
  );

  assert(
    prediction.kind === "likely_need",
    "memory-derived prediction must use likely_need kind"
  );

  assert(
    prediction.confidence === 0.9,
    "prediction confidence must preserve the memory confidence"
  );

  assert(
    prediction.evidence.length === 1,
    "prediction must retain memory evidence"
  );

  assert(
    prediction.evidence[0]?.source === "memory",
    "prediction evidence source must be memory"
  );

  assert(
    prediction.evidence[0]?.confidence === 0.9,
    "memory evidence confidence must match source confidence"
  );

  assert(
    prediction.statement.includes(
      "finish the Human OS planner"
    ),
    "prediction statement must contain the durable memory value"
  );
}

async function verifyHighConfidenceThreshold(): Promise<void> {
  const state =
    createState();

  state.memories = [
    createMemory(
      "todo",
      "review the release checklist",
      0.64
    ),
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 0,
    "memory below the confidence threshold must not create a prediction"
  );
}

async function verifyStableMemoryIsIgnored(): Promise<void> {
  const state =
    createState();

  state.memories = [
    createMemory(
      "favorite_editor",
      "VS Code",
      0.99
    ),

    createMemory(
      "timezone",
      "America/New_York",
      0.99
    ),
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 0,
    "stable preference and identity memory must not become predictions"
  );
}

async function verifyFuturePatternCanUseMemoryKey(): Promise<void> {
  const state =
    createState();

  state.memories = [
    createMemory(
      "renewal_date",
      "Human OS service renewal",
      0.8
    ),
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 1,
    "future-oriented memory key must be sufficient to identify a prediction candidate"
  );
}

async function verifyDuplicatePredictionIsSuppressed(): Promise<void> {
  const state =
    createState();

  state.memories = [
    createMemory(
      "task",
      "finish the runtime integration",
      0.9
    ),

    {
      ...createMemory(
        "task_copy",
        "finish the runtime integration",
        0.9
      ),

      value:
        "finish the runtime integration",
    },
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 1,
    "identical prediction statements must be deduplicated"
  );
}

async function verifyPredictionLimitIsBounded(): Promise<void> {
  const state =
    createState();

  state.memories = [
    createMemory(
      "task_1",
      "complete task one",
      0.91
    ),

    createMemory(
      "task_2",
      "complete task two",
      0.92
    ),

    createMemory(
      "task_3",
      "complete task three",
      0.93
    ),

    createMemory(
      "task_4",
      "complete task four",
      0.94
    ),
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 2,
    "prediction memory stage must remain bounded to two predictions"
  );
}

async function verifyExistingPredictionsAreRespected(): Promise<void> {
  const state =
    createState();

  state.predictions = [
    {
      id:
        "existing-prediction",

      kind:
        "upcoming_task",

      statement:
        "Existing upcoming task",

      confidence:
        0.95,

      evidence: [],

      createdAt:
        new Date(),
    },
  ];

  state.memories = [
    createMemory(
      "task",
      "complete the runtime integration",
      0.9
    ),
  ];

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.predictions.length === 2,
    "stage must append to existing predictions without replacing them"
  );
}

async function verifyStageExecutionIsRecorded(): Promise<void> {
  const state =
    createState();

  await new PredictionMemoryStage().execute(
    state
  );

  assert(
    state.executedStages.includes(
      "PredictionMemory"
    ),
    "BaseStage execution must record PredictionMemory"
  );

  assert(
    state.diagnostics.some(
      (diagnostic) =>
        diagnostic.stage ===
        "PredictionMemory" &&
        diagnostic.success
    ),
    "successful PredictionMemory execution must create a diagnostic"
  );
}

async function runPI001Verification(): Promise<void> {
  await verifyFutureMemoryCreatesPrediction();

  await verifyHighConfidenceThreshold();

  await verifyStableMemoryIsIgnored();

  await verifyFuturePatternCanUseMemoryKey();

  await verifyDuplicatePredictionIsSuppressed();

  await verifyPredictionLimitIsBounded();

  await verifyExistingPredictionsAreRespected();

  await verifyStageExecutionIsRecorded();

  console.log(
    "PI-001 prediction memory verification passed."
  );
}

void runPI001Verification();
