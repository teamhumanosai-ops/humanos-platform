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

const MAX_HISTORY_PREDICTIONS =
  2;

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
      MAX_HISTORY_PREDICTIONS
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
      "recurring_behavior",

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
 * PredictionHistoryStage
 *
 * Adds bounded historical conversation signals to the
 * predictions already produced by PredictionStage.
 *
 * The stage only considers repeated user-authored messages.
 * Assistant output is never treated as evidence of a user's
 * recurring behavior.
 */
export class PredictionHistoryStage
  extends BaseStage {
  readonly name =
    "PredictionHistory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const userMessages =
      state.messages.filter(
        (message) =>
          message.role ===
          "user"
      );

    const occurrences =
      new Map<
        string,
        number
      >();

    const examples =
      new Map<
        string,
        string
      >();

    for (
      const message of
      userMessages
    ) {
      const normalized =
        normalize(
          message.message
        );

      if (
        !normalized
      ) {
        continue;
      }

      occurrences.set(
        normalized,
        (occurrences.get(
          normalized
        ) ?? 0) + 1
      );

      if (
        !examples.has(
          normalized
        )
      ) {
        examples.set(
          normalized,
          message.message.trim()
        );
      }
    }

    for (
      const [
        normalized,
        count,
      ] of occurrences
    ) {
      if (
        count < 2
      ) {
        continue;
      }

      const example =
        examples.get(
          normalized
        ) ?? normalized;

      const evidence: PredictionEvidence[] =
        [
          {
            source:
              "history",

            statement:
              `The user previously repeated this request pattern ${count} times: ${example}.`,

            confidence:
              Math.min(
                0.95,
                0.65 +
                  count * 0.08
              ),
          },
        ];

      addPrediction(
        state.predictions,
        `A similar request pattern may recur: ${example}.`,
        evidence
      );

      if (
        state.predictions.length >=
        MAX_HISTORY_PREDICTIONS
      ) {
        break;
      }
    }

    return state;
  }
}
