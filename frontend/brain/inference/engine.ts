import type {
  BrainState,
} from "../brainState";

import type {
  CognitiveInference,
  InferenceEvidence,
} from "./types";

function createEvidence(
  state: BrainState
): InferenceEvidence[] {
  return state.reasoningObservations.map(
    (observation) => ({
      source:
        observation.source,

      statement:
        observation.statement,

      confidence:
        observation.confidence,
    })
  );
}

function calculateConfidence(
  evidence: InferenceEvidence[]
): number {
  if (evidence.length === 0) {
    return 0;
  }

  const total =
    evidence.reduce(
      (sum, item) =>
        sum + item.confidence,
      0
    );

  return total / evidence.length;
}

export function infer(
  state: BrainState
): CognitiveInference[] {
  const evidence =
    createEvidence(state);

  if (evidence.length < 2) {
    return [];
  }

  const confidence =
    calculateConfidence(evidence);

  const statement =
    `The available cognitive evidence suggests that multiple independent signals are relevant to the current request.`;

  return [
    {
      id:
        crypto.randomUUID(),

      statement,

      kind:
        confidence < 0.7
          ? "uncertainty"
          : "derived_inference",

      confidence,

      evidence,

      createdAt:
        new Date(),
    },
  ];
}