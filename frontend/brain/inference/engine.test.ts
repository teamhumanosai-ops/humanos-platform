import {
  createBrainState,
} from "../brainState";

import {
  infer,
} from "./engine";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CI-002 inference verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Who won the FIFA World Cup 2026?"
  );

state.reasoningObservations = [
  {
    statement:
      "Spain won the FIFA World Cup 2026 after the final.",
    confidence: 0.95,
    relevance: 1,
    source: "live_knowledge",
    kind: "known_fact",
  },
  {
    statement:
      "Human OS uses a shared BrainState runtime.",
    confidence: 0.99,
    relevance: 0,
    source: "knowledge",
    kind: "known_fact",
  },
];

const inferences =
  infer(state);

assert(
  inferences.length ===
    1,
  "only relevant evidence should become an inference"
);

assert(
  inferences[0].statement.includes(
    "FIFA World Cup 2026"
  ),
  "the retained inference must describe relevant evidence"
);

assert(
  inferences[0].evidence[0].relevance ===
    1,
  "inference evidence must preserve relevance"
);

assert(
  inferences[0].confidence >=
    0.9,
  "high-confidence relevant evidence should remain high-confidence"
);

const lowConfidenceState =
  createBrainState(
    "conversation",
    [],
    "What happened to the project?"
  );

lowConfidenceState.reasoningObservations = [
  {
    statement:
      "The project may have changed recently.",
    confidence: 0.4,
    relevance: 0.8,
    source: "prediction",
    kind: "derived_inference",
  },
];

const lowConfidence =
  infer(
    lowConfidenceState
  );

assert(
  lowConfidence[0].kind ===
    "uncertainty",
  "low-confidence evidence must remain explicitly uncertain"
);

console.log(
  "CI-002 relevance-weighted inference verification passed."
);
