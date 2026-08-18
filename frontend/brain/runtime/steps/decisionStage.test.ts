import {
  createBrainState,
} from "../../brainState";

import {
  formatInferenceEvidence,
} from "./decisionStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CI-004 decision inference verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "What should I do next?"
  );

state.inferences = [
  {
    id: "inference-high",
    statement:
      "The runtime validation is the highest-confidence next step.",
    kind: "derived_inference",
    confidence: 0.94,
    evidence: [
      {
        source: "memory",
        statement:
          "Runtime validation was planned next.",
        confidence: 0.9,
        relevance: 0.9,
      },
      {
        source: "timeline",
        statement:
          "Validation was scheduled after implementation.",
        confidence: 0.95,
        relevance: 0.95,
      },
    ],
    createdAt: new Date(),
  },
  {
    id: "inference-second",
    statement:
      "The current implementation may still need review.",
    kind: "uncertainty",
    confidence: 0.62,
    evidence: [
      {
        source: "reflection",
        statement:
          "A previous validation required a follow-up fix.",
        confidence: 0.62,
        relevance: 0.7,
      },
    ],
    createdAt: new Date(),
  },
];

const evidence =
  formatInferenceEvidence(
    state
  );

assert(
  evidence.length === 2,
  "inference evidence should preserve the bounded inference set"
);

assert(
  evidence[0].includes(
    "[derived_inference]"
  ),
  "inference kind should be preserved"
);

assert(
  evidence[0].includes(
    "confidence 0.94"
  ),
  "inference confidence should be preserved"
);

assert(
  evidence[0].includes(
    "sources memory, timeline"
  ),
  "independent evidence sources should be preserved"
);

assert(
  evidence[1].includes(
    "[uncertainty]"
  ),
  "uncertainty inferences must remain explicitly labeled"
);

const emptyState =
  createBrainState(
    "conversation",
    [],
    "Hello"
  );

assert(
  formatInferenceEvidence(
    emptyState
  ).length === 0,
  "missing inferences should produce no decision evidence"
);

console.log(
  "CI-004 decision inference verification passed."
);
