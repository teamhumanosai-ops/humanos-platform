import {
  createBrainState,
} from "../../brainState";

import {
  PredictionConsolidationStage,
} from "./predictionConsolidationStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PredictionConsolidation verification failed: ${message}`
    );
  }
}

async function verifyDuplicateMerge(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue"
    );

  state.predictions = [
    {
      id: "prediction-same",
      kind: "likely_need",
      statement: "A dependency may require attention.",
      confidence: 0.9,
      evidence: [
        {
          source: "graph",
          statement: "Project requires release.",
          confidence: 0.9,
        },
      ],
      createdAt: new Date(),
    },
    {
      id: "prediction-same",
      kind: "likely_need",
      statement: "A dependency may require attention.",
      confidence: 0.7,
      evidence: [
        {
          source: "history",
          statement: "The user revisited the dependency.",
          confidence: 0.7,
        },
        {
          source: "graph",
          statement: "Project requires release.",
          confidence: 0.9,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const result =
    await new PredictionConsolidationStage().execute(
      state
    );

  assert(
    result.predictions.length === 1,
    "duplicate prediction IDs must consolidate into one prediction"
  );

  assert(
    result.predictions[0]?.evidence.length === 2,
    "duplicate evidence must be removed while distinct evidence is preserved"
  );

  assert(
    result.predictions[0]?.confidence === 0.8,
    "merged confidence must reflect the consolidated evidence"
  );

  assert(
    result.executedStages.includes(
      "PredictionConsolidation"
    ),
    "stage execution must be recorded"
  );
}

async function verifyBounds(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Continue"
    );

  state.predictions = Array.from(
    { length: 12 },
    (_, index) => ({
      id: `prediction-${index}`,
      kind: "upcoming_task" as const,
      statement: `Task ${index}`,
      confidence: 0.8,
      evidence: Array.from(
        { length: 20 },
        (_, evidenceIndex) => ({
          source: "timeline" as const,
          statement: `Evidence ${index}-${evidenceIndex}`,
          confidence: 0.8,
        })
      ),
      createdAt: new Date(),
    })
  );

  const result =
    await new PredictionConsolidationStage().execute(
      state
    );

  assert(
    result.predictions.length === 8,
    "consolidation must enforce the global prediction bound"
  );

  for (
    const prediction of result.predictions
  ) {
    assert(
      prediction.evidence.length <= 16,
      "consolidation must enforce the evidence bound"
    );
  }
}

async function runVerification(): Promise<void> {
  await verifyDuplicateMerge();
  await verifyBounds();

  console.log(
    "PredictionConsolidation verification passed."
  );
}

void runVerification();
