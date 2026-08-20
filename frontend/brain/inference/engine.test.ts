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
      `CI-003 inference verification failed: ${message}`
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

const duplicateState =
  createBrainState(
    "conversation",
    [],
    "What is the current project status?"
  );

duplicateState.reasoningObservations = [
  {
    statement:
      "The project is active.",
    confidence: 0.9,
    relevance: 0.8,
    source: "memory",
    kind: "known_fact",
  },
  {
    statement:
      "  The project is active.  ",
    confidence: 0.7,
    relevance: 0.7,
    source: "memory",
    kind: "known_fact",
  },
  {
    statement:
      "The project is active.",
    confidence: 0.85,
    relevance: 0.9,
    source: "knowledge",
    kind: "known_fact",
  },
];

const duplicateInferences =
  infer(
    duplicateState
  );

assert(
  duplicateInferences.length ===
    2,
  "duplicate evidence from the same source must be collapsed while independent sources remain"
);

assert(
  duplicateInferences[0].confidence <=
    1 &&
  duplicateInferences[0].confidence >=
    0,
  "inference confidence must remain bounded"
);

assert(
  duplicateInferences[0].confidence >=
    duplicateInferences[1].confidence,
  "higher-confidence inferences must be ranked first"
);

const crossSource =
  createBrainState(
    "conversation",
    [],
    "What is the project status?"
  );

crossSource.reasoningObservations = [
  {
    statement:
      "The project is active.",
    confidence: 0.9,
    relevance: 0.9,
    source: "memory",
    kind: "known_fact",
  },
  {
    statement:
      "The project is active.",
    confidence: 0.95,
    relevance: 0.9,
    source: "knowledge",
    kind: "known_fact",
  },
];

const crossSourceInferences =
  infer(
    crossSource
  );

assert(
  crossSourceInferences.length ===
    3,
  "independent sources must produce a bounded cross-source inference"
);

const convergingInference =
  crossSourceInferences.find(
    (inference) =>
      inference.evidence.length ===
      2
  );

assert(
  Boolean(
    convergingInference
  ),
  "cross-source inference must preserve independent evidence"
);

assert(
  crossSourceInferences[0].confidence >=
    crossSourceInferences[1].confidence,
  "inference results must be ordered by confidence"
);

console.log(
  "CI-003 inference prioritization verification passed."
);
