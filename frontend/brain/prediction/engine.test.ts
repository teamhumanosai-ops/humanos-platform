import {
  createBrainState,
} from "../brainState";

import {
  predict,
} from "./engine";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PI-001 engine verification failed: ${message}`
    );
  }
}

function createState() {
  return createBrainState(
    "conversation",
    [],
    "Continue my work"
  );
}

function verifyEmptyState(): void {
  const state =
    createState();

  const predictions =
    predict(state);

  assert(
    predictions.length === 0,
    "empty cognitive state must not fabricate predictions"
  );
}

function verifyTimelinePrediction(): void {
  const state =
    createState();

  state.timeline = [
    "Project review is due tomorrow",
  ];

  const predictions =
    predict(state);

  assert(
    predictions.length === 1,
    "one timeline signal must create one prediction"
  );

  assert(
    predictions[0]?.kind ===
      "likely_deadline",
    "deadline timeline signal must classify as likely_deadline"
  );

  assert(
    predictions[0]?.confidence === 0.8,
    "timeline prediction must preserve its evidence confidence"
  );
}

function verifyGraphRelationship(): void {
  const state =
    createState();

  state.graph = [
    {
      id: "project",
      label: "Project",
      type: "project",
      confidence: 0.9,
    },
    {
      id: "release",
      label: "Release",
      type: "task",
      confidence: 0.9,
    },
  ];

  state.graphEdges = [
    {
      from: "project",
      to: "release",
      type: "requires",
      weight: 0.9,
    },
  ];

  const predictions =
    predict(state);

  assert(
    predictions.length === 1,
    "qualifying graph relationship must create one prediction"
  );

  assert(
    predictions[0]?.kind ===
      "likely_need",
    "requires graph relationship must classify as likely_need"
  );
}

function verifyGoalSignals(): void {
  const state =
    createState();

  state.goal = {
    id: "goal-1",
    statement: "Ship the Human OS planner",
    status: "active",
    progress: 60,
    nextAction: "finish runtime integration",
    dependencies: [
      "runtime validation",
    ],
    obstacles: [
      "missing integration test",
    ],
    confidence: 0.9,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const predictions =
    predict(state);

  assert(
    predictions.length === 2,
    "active goal must create bounded next-action and obstacle predictions"
  );

  assert(
    predictions.some(
      (prediction) =>
        prediction.statement.includes(
          "finish runtime integration"
        )
    ),
    "goal next action must be represented"
  );

  assert(
    predictions.some(
      (prediction) =>
        prediction.statement.includes(
          "missing integration test"
        )
    ),
    "goal obstacle must be represented"
  );
}

function verifyPredictionBound(): void {
  const state =
    createState();

  state.timeline = [
    "Task one",
    "Task two",
    "Task three",
    "Task four",
  ];

  state.reflections = [
    "A repeated workflow often follows review",
    "A repeated workflow often follows testing",
    "A repeated workflow often follows deployment",
  ];

  state.graph = [
    {
      id: "a",
      label: "A",
      type: "task",
      confidence: 0.9,
    },
    {
      id: "b",
      label: "B",
      type: "task",
      confidence: 0.9,
    },
    {
      id: "c",
      label: "C",
      type: "task",
      confidence: 0.9,
    },
    {
      id: "d",
      label: "D",
      type: "task",
      confidence: 0.9,
    },
  ];

  state.graphEdges = [
    {
      from: "a",
      to: "b",
      type: "requires",
      weight: 0.9,
    },
    {
      from: "b",
      to: "c",
      type: "requires",
      weight: 0.9,
    },
    {
      from: "c",
      to: "d",
      type: "requires",
      weight: 0.9,
    },
  ];

  const predictions =
    predict(state);

  assert(
    predictions.length <= 8,
    "prediction engine must never exceed its global prediction bound"
  );
}

function verifyEvidenceIsBounded(): void {
  const state =
    createState();

  state.timeline = Array.from(
    { length: 30 },
    (_, index) =>
      `Timeline item ${index + 1}`
  );

  state.memories = Array.from(
    { length: 30 },
    (_, index) => ({
      key: `memory-${index + 1}`,
      value: `Memory item ${index + 1}`,
      confidence: 0.9,
      updatedAt: new Date().toISOString(),
      kind: "long_term" as const,
      importance: 0.8,
    })
  );

  const predictions =
    predict(state);

  for (
    const prediction of
    predictions
  ) {
    assert(
      prediction.evidence.length <= 16,
      "prediction evidence must remain bounded"
    );
  }
}

function verifyStableStateDoesNotCreateGoalPrediction(): void {
  const state =
    createState();

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

  const predictions =
    predict(state);

  assert(
    predictions.length === 0,
    "stable preference alone must not create a prediction"
  );
}

function runPI001EngineVerification(): void {
  verifyEmptyState();
  verifyTimelinePrediction();
  verifyGraphRelationship();
  verifyGoalSignals();
  verifyPredictionBound();
  verifyEvidenceIsBounded();
  verifyStableStateDoesNotCreateGoalPrediction();

  console.log(
    "PI-001 prediction engine verification passed."
  );
}

runPI001EngineVerification();
