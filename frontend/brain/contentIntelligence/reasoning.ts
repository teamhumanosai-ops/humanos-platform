import type {
  ContentIntelligence,
} from "./types";

import type {
  ReasoningObservation,
} from "../reasoning/types";

const MIN_EVIDENCE_CONFIDENCE =
  0.2;

const MAX_EVIDENCE_CONFIDENCE =
  0.98;

function clamp(
  value: number
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}

function evidenceMultiplier(
  intelligence: ContentIntelligence
): number {
  if (
    intelligence.sourceCount === 0
  ) {
    return 1;
  }

  const quality =
    clamp(
      intelligence.averageEvidenceQuality
    );

  const agreement =
    clamp(
      intelligence.agreementCoverage
    );

  return clamp(
    0.55 +
      quality * 0.3 +
      agreement * 0.15
  );
}

export function applyContentEvidenceQuality(
  observations: ReasoningObservation[],
  intelligence: ContentIntelligence | null
): ReasoningObservation[] {
  if (
    !intelligence ||
    intelligence.sourceCount === 0
  ) {
    return observations;
  }

  const multiplier =
    evidenceMultiplier(
      intelligence
    );

  return observations.map(
    (observation) => {
      if (
        observation.source !==
        "live_knowledge"
      ) {
        return observation;
      }

      const confidence =
        clamp(
          observation.confidence *
            multiplier
        );

      return {
        ...observation,

        confidence: Math.max(
          MIN_EVIDENCE_CONFIDENCE,
          Math.min(
            MAX_EVIDENCE_CONFIDENCE,
            confidence
          )
        ),

        kind:
          confidence < 0.7
            ? "uncertainty"
            : observation.kind,
      };
    }
  );
}
