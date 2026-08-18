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

const MAX_MEMORY_PREDICTIONS =
  2;

const FUTURE_MEMORY_PATTERN =
  /(deadline|due|renew|renewal|next action|upcoming|follow.?up|todo|task|goal)/i;

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function createPredictionId(
  statement: string
): string {
  return `prediction-${normalize(
    statement
  )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      "")}`;
}

function addPrediction(
  predictions: Prediction[],
  statement: string,
  evidence: PredictionEvidence[]
): void {
  if (
    !statement.trim() ||
    predictions.length >=
      MAX_MEMORY_PREDICTIONS
  ) {
    return;
  }

  const id =
    createPredictionId(
      statement
    );

  if (
    predictions.some(
      (prediction) =>
        prediction.id === id
    )
  ) {
    return;
  }

  const confidence =
    evidence.reduce(
      (
        total,
        item
      ) =>
        total + item.confidence,
      0
    ) /
    Math.max(
      1,
      evidence.length
    );

  predictions.push({
    id,

    kind:
      "likely_need",

    statement,

    confidence:
      Math.max(
        0,
        Math.min(
          1,
          confidence
        )
      ),

    evidence,

    createdAt:
      new Date(),
  });
}

/**
 * PredictionMemoryStage
 *
 * Converts high-confidence durable memories that explicitly describe
 * future-oriented work into bounded prediction candidates.
 *
 * Stable preferences and identity facts are intentionally ignored so
 * durable memory does not become speculative future behavior.
 */
export class PredictionMemoryStage
  extends BaseStage {
  readonly name =
    "PredictionMemory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    for (
      const memory of
      state.memories
    ) {
      if (
        memory.confidence <
        0.65
      ) {
        continue;
      }

      const sourceText =
        `${memory.key}: ${memory.value}`;

      if (
        !FUTURE_MEMORY_PATTERN.test(
          sourceText
        )
      ) {
        continue;
      }

      const statement =
        `A future action or need may follow from durable memory: ${memory.value}.`;

      addPrediction(
        state.predictions,
        statement,
        [
          {
            source:
              "memory",

            statement:
              `Durable memory ${memory.key}: ${memory.value}.`,

            confidence:
              Math.max(
                0,
                Math.min(
                  1,
                  memory.confidence
                )
              ),
          },
        ]
      );

      if (
        state.predictions.length >=
        MAX_MEMORY_PREDICTIONS
      ) {
        break;
      }
    }

    return state;
  }
}
