import {
  BrainState,
} from "../../brainState";

import {
  Prediction,
} from "../../prediction/types";

import {
  BaseStage,
} from "./baseStage";

const MAX_PREDICTIONS =
  8;

const MAX_EVIDENCE =
  16;

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mergeEvidence(
  predictions: Prediction[]
): PredictionEvidence[] {
  const evidence: PredictionEvidence[] = [];

  for (
    const prediction of predictions
  ) {
    for (
      const item of prediction.evidence
    ) {
      const duplicate = evidence.some(
        (existing) =>
          existing.source === item.source &&
          normalize(existing.statement) ===
            normalize(item.statement)
      );

      if (duplicate) {
        continue;
      }

      if (evidence.length >= MAX_EVIDENCE) {
        return evidence;
      }

      evidence.push({
        source: item.source,
        statement: item.statement.trim(),
        confidence: Math.max(
          0,
          Math.min(1, item.confidence)
        ),
      });
    }
  }

  return evidence;
}

type PredictionEvidence = Prediction["evidence"][number];

function consolidate(
  predictions: Prediction[]
): Prediction[] {
  const unique = new Map<string, Prediction>();

  for (
    const prediction of predictions
  ) {
    const id =
      prediction.id.trim() ||
      `prediction-${normalize(prediction.statement)}`;

    const existing = unique.get(id);

    if (!existing) {
      unique.set(id, {
        ...prediction,
        id,
        confidence: Math.max(
          0,
          Math.min(1, prediction.confidence)
        ),
        evidence: mergeEvidence([prediction]),
      });
      continue;
    }

    const mergedEvidence =
      mergeEvidence([
        existing,
        prediction,
      ]);

    const mergedConfidence =
      mergedEvidence.length > 0
        ? mergedEvidence.reduce(
            (total, item) =>
              total + item.confidence,
            0
          ) / mergedEvidence.length
        : Math.max(
            existing.confidence,
            prediction.confidence
          );

    unique.set(id, {
      ...existing,
      confidence: Math.max(
        0,
        Math.min(1, mergedConfidence)
      ),
      evidence: mergedEvidence,
    });
  }

  return [...unique.values()].slice(
    0,
    MAX_PREDICTIONS
  );
}

/**
 * PredictionConsolidationStage
 *
 * Provides the runtime-level prediction boundary after all prediction
 * enrichment stages have contributed their candidates. It prevents
 * downstream cognitive stages from receiving duplicate or unbounded
 * prediction state while preserving insertion order for determinism.
 */
export class PredictionConsolidationStage
  extends BaseStage {
  readonly name =
    "PredictionConsolidation";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.predictions =
      consolidate(
        state.predictions
      );

    return state;
  }
}
