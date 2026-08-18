import {
  createBrainState,
} from "../brainState";

import {
  reason,
} from "./engine";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CI-002 reasoning verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Who won the FIFA World Cup 2026?"
  );

state.knowledge = [
  {
    source: "knowledge",
    text: "The FIFA World Cup is an international football tournament.",
    score: 0.8,
  },
  {
    source: "knowledge",
    text: "Human OS uses a shared BrainState runtime.",
    score: 0.99,
  },
];

state.liveKnowledge = [
  "Spain won the FIFA World Cup 2026 after the final.",
  "Human OS uses a cognitive runtime.",
];

state.graph = [
  {
    id: "world-cup-2026",
    type: "entity",
    label: "FIFA World Cup 2026",
    properties: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "human-os",
    type: "entity",
    label: "Human OS",
    properties: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

state.graphEdges = [
  {
    id: "world-cup-edge",
    from: "world-cup-2026",
    to: "human-os",
    type: "related_to",
    weight: 0.5,
    properties: {},
    createdAt: new Date().toISOString(),
  },
];

const result =
  reason(state);

assert(
  result.observations.length > 0,
  "relevant cognitive evidence must be retained"
);

assert(
  result.observations.every(
    (observation) =>
      observation.relevance >= 0.12
  ),
  "irrelevant evidence must be filtered before reasoning"
);

assert(
  result.observations.some(
    (observation) =>
      observation.source ===
        "live_knowledge" &&
      observation.statement.includes(
        "FIFA World Cup 2026"
      )
  ),
  "current live evidence must remain available when it matches the request"
);

assert(
  !result.observations.some(
    (observation) =>
      observation.statement.includes(
        "shared BrainState runtime"
      )
  ),
  "unrelated stored knowledge must not dominate the current request"
);

assert(
  result.confidence > 0.8,
  "confidence must be weighted by relevant evidence"
);

const emptyState =
  createBrainState(
    "conversation",
    [],
    "What is the weather in Tokyo?"
  );

emptyState.knowledge = [
  {
    source: "knowledge",
    text: "Human OS uses a shared BrainState runtime.",
    score: 0.99,
  },
];

const emptyResult =
  reason(emptyState);

assert(
  emptyResult.observations.length ===
    0,
  "unrelated context must not become reasoning evidence"
);

assert(
  emptyResult.confidence <
    0.5,
  "reasoning confidence must remain low without relevant evidence"
);

console.log(
  "CI-002 request-aware reasoning verification passed."
);
