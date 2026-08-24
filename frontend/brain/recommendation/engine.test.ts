import {
  createBrainState,
} from "../brainState";

import {
  recommend,
} from "./engine";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `RI-001 engine verification failed: ${message}`
    );
  }
}

function createState() {
  return createBrainState(
    "conversation",
    [],
    "What should I do next?"
  );
}

function verifyEmptyState(): void {
  const recommendations =
    recommend(
      createState()
    );

  assert(
    recommendations.length === 0,
    "empty cognitive state must not fabricate recommendations"
  );
}

function verifyPredictionRecommendation(): void {
  const state =
    createState();

  state.predictions = [
    {
      id: "prediction-1",
      kind: "likely_deadline",
      statement: "A renewal is likely due soon.",
      confidence: 0.9,
      evidence: [
        {
          source: "timeline",
          statement: "The renewal is due next week.",
          confidence: 0.9,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const recommendations =
    recommend(
      state
    );

  assert(
    recommendations.length === 1,
    "high-confidence prediction must produce a recommendation"
  );

  assert(
    recommendations[0]?.kind ===
      "preparation",
    "deadline prediction must produce preparation guidance"
  );

  assert(
    recommendations[0]?.confidence ===
      0.95,
    "recommendation confidence must reflect its evidence"
  );
}

function verifyGoalRecommendation(): void {
  const state =
    createState();

  state.goal = {
    id: "goal-1",
    statement: "Finish the project",
    status: "active",
    progress: 40,
    priority: 0.8,
    confidence: 0.85,
    nextAction: "Review the remaining work",
    obstacles: [],
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const recommendations =
    recommend(
      state
    );

  assert(
    recommendations.length === 1,
    "active goal next action must produce a recommendation"
  );

  assert(
    recommendations[0]?.kind ===
      "next_action",
    "goal next action must be classified as next_action"
  );
}

function verifyDependencyRecommendation(): void {
  const state =
    createState();

  state.graph = [
    {
      id: "input",
      label: "Input",
      type: "task",
      confidence: 0.9,
      properties: {},
    },
    {
      id: "output",
      label: "Output",
      type: "task",
      confidence: 0.9,
      properties: {},
    },
  ];

  state.graphEdges = [
    {
      id: "edge-1",
      from: "input",
      to: "output",
      type: "depends_on",
      weight: 0.8,
    },
  ];

  const recommendations =
    recommend(
      state
    );

  assert(
    recommendations.length === 1,
    "dependency graph relationship must produce a recommendation"
  );

  assert(
    recommendations[0]?.kind ===
      "dependency_resolution",
    "dependency relationship must produce dependency guidance"
  );
}

verifyEmptyState();
verifyPredictionRecommendation();
verifyGoalRecommendation();
verifyDependencyRecommendation();
