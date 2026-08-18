import {
  BrainState,
} from "../../brainState";

import {
  Prediction,
  PredictionEvidence,
} from "../../prediction/types";

import {
  BaseStage,
} from "./baseStage";

const MIN_CONFIDENCE =
  0;

const MAX_CONFIDENCE =
  1;

const MIN_EVIDENCE_FOR_HIGH_CONFIDENCE =
  2;

function clamp(
  value: number
): number {
  return Math.max(
    MIN_CONFIDENCE,
    Math.min(
      MAX_CONFIDENCE,
      value
    )
  );
}

function normalizeEvidence(
  evidence: PredictionEvidence[]
): PredictionEvidence[] {
  const unique =
    new Map<
      string,
      PredictionEvidence
    >();

  for (
    const item of
    evidence
  ) {
    const statement =
      item.statement.trim();

    if (
      !statement
    ) {
      continue;
    }

    const key =
      `${item.source}:${statement.toLowerCase()}`;

    if (
      !unique.has(
        key
      )
    ) {
      unique.set(
        key,
        {
          source:
            item.source,

          statement,

          confidence:
            clamp(
              item.confidence
            ),
        }
      );
    }
  }

  return [
    ...unique.values(),
  ];
}

function calculateConfidence(
  prediction: Prediction,
  evidence: PredictionEvidence[]
): number {
  if (
    evidence.length === 0
  ) {
    return 0;
  }

  const average =
    evidence.reduce(
      (
        total,
        item
      ) =>
        total +
        clamp(
          item.confidence
        ),
      0
    ) /
    evidence.length;

  const sourceCount =
    new Set(
      evidence.map(
        (item) =>
          item.source
      )
    ).size;

  const sourceDiversityBonus =
    sourceCount >=
    MIN_EVIDENCE_FOR_HIGH_CONFIDENCE
      ? 0.05
      : 0;

  const existingConfidence =
    clamp(
      prediction.confidence
    );

  return clamp(
    Math.max(
      existingConfidence *
        0.35,
      average *
        0.65
    ) +
      sourceDiversityBonus
  );
}

/**
 * PredictionConfidenceStage
 *
 * Normalizes prediction confidence after all PI-001 evidence
 * sources have contributed and before downstream cognitive stages
 * consume the prediction set.
 *
 * Confidence is evidence-derived rather than an assertion of truth.
 * Multiple independent evidence sources receive a small bounded
 * diversity bonus; no prediction can exceed the [0, 1] interval.
 */
export class PredictionConfidenceStage
  extends BaseStage {
  readonly name =
    "PredictionConfidence";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.predictions =
      state.predictions.map(
        (prediction) => {
          const evidence =
            normalizeEvidence(
              prediction.evidence
            );

          return {
            ...prediction,

            confidence:
              calculateConfidence(
                prediction,
                evidence
              ),

            evidence,
          };
        }
      );

    return state;
  }
}
