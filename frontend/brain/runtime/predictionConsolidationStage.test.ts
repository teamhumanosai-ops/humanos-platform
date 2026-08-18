import {
  createBrainState,
} from "../brainState";

import {
  PredictionConsolidationStage,
} from "./steps/predictionConsolidationStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Prediction consolidation verification failed: ${message}`
    );
  }
}

function createPrediction(
  id: string,
  statement: string,
  confidence: number
) {
  return {
    id,
    kind: "likely_need" as const,
    statement,
    confidence,
    evidence: [
      {
        source: "memory" as const,
        statement,
        confidence,
      },
    ],
    createdAt: new Date(),
  };
}

async function verifyConsolidation(): Promise<void> {
  const state = createBrainState(
    "conversation",
    [],
    "test prediction consolidation"
  );

  state.predictions = [
    createPrediction(
      "prediction-a",
      "Finish the project review",
      0.8
    ),
    createPrediction(
      "prediction-a",
      "Finish the project review",
      0.9
    ),
    createPrediction(
      "prediction-b",
      "Resolve the dependency",
      0.7
    ),
  ];

  const next =
    await new PredictionConsolidationStage().execute(
      state
    );

  assert(
    next.predictions.length === 2,
    "duplicate predictions must be consolidated"
  );

  assert(
    next.predictions[0]?.id ===
      "prediction-a",
    "consolidation must preserve first-seen order"
  );

  assert(
    next.predictions[0]?.evidence.length === 1,
    "duplicate evidence must not be repeated"
  );
}

async function verifyPredictionBound(): Promise<void> {
  const state = createBrainState(
    "conversation",
    [],
    "test prediction bound"
  );

  state.predictions = Array.from(
    { length: 12 },
    (_, index) =>
      createPrediction(
        `prediction-${index}`,
        `Prediction ${index}`,
        0.6
      )
  );

  const next =
    await new PredictionConsolidationStage().execute(
      state
    );

  assert(
    next.predictions.length === 8,
    "consolidation must enforce the runtime prediction bound"
  );
}

async function runVerification(): Promise<void> {
  await verifyConsolidation();
  await verifyPredictionBound();

  console.log(
    "Prediction consolidation verification passed."
  );
}

void runVerification();
