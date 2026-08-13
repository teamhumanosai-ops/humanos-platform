import type {
  BrainState,
} from "../brainState";

import type {
  ReasoningObservation,
} from "../reasoning";

import type {
  CognitiveInference,
  InferenceEvidence,
  InferenceKind,
} from "./types";

function createEvidence(
  observation: ReasoningObservation
): InferenceEvidence {
  return {
    source:
      observation.source,

    statement:
      observation.statement,

    confidence:
      observation.confidence,
  };
}

function calculateConfidence(
  evidence: InferenceEvidence[]
): number {
  if (
    evidence.length === 0
  ) {
    return 0;
  }

  const total =
    evidence.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.confidence,
      0
    );

  return total /
    evidence.length;
}

function classifyInference(
  observation: ReasoningObservation
): InferenceKind {
  if (
    observation.confidence <
    0.7
  ) {
    return "uncertainty";
  }

  if (
    observation.kind ===
    "known_fact"
  ) {
    return "known_fact";
  }

  if (
    observation.kind ===
    "observed_relationship"
  ) {
    return "observed_relationship";
  }

  if (
    observation.kind ===
    "derived_inference"
  ) {
    if (
      observation.source ===
      "prediction"
    ) {
      return "hypothesis";
    }

    return "derived_inference";
  }

  return "uncertainty";
}

function buildObservationInferences(
  observations: ReasoningObservation[]
): CognitiveInference[] {
  return observations.map(
    (
      observation
    ) => {
      const evidence =
        [
          createEvidence(
            observation
          ),
        ];

      return {
        id:
          crypto.randomUUID(),

        statement:
          observation.statement,

        kind:
          classifyInference(
            observation
          ),

        confidence:
          observation.confidence,

        evidence,

        createdAt:
          new Date(),
      };
    }
  );
}

function buildCrossSourceInference(
  observations: ReasoningObservation[]
): CognitiveInference | null {
  const independentSources =
    new Set(
      observations.map(
        (
          observation
        ) =>
          observation.source
      )
    );

  if (
    independentSources.size <
    2
  ) {
    return null;
  }

  const evidence =
    observations
      .slice(
        0,
        5
      )
      .map(
        createEvidence
      );

  const confidence =
    Math.min(
      0.9,
      calculateConfidence(
        evidence
      ) +
        0.05
    );

  return {
    id:
      crypto.randomUUID(),

    statement:
      "Multiple independent cognitive sources provide converging evidence relevant to the current request.",

    kind:
      confidence < 0.7
        ? "uncertainty"
        : "derived_inference",

    confidence,

    evidence,

    createdAt:
      new Date(),
  };
}

export function infer(
  state: BrainState
): CognitiveInference[] {
  const observations =
    state.reasoningObservations;

  if (
    observations.length === 0
  ) {
    return [];
  }

  const inferences =
    buildObservationInferences(
      observations
    );

  const crossSourceInference =
    buildCrossSourceInference(
      observations
    );

  if (
    crossSourceInference
  ) {
    inferences.push(
      crossSourceInference
    );
  }

  return inferences;
}