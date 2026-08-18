import {
  createBrainState,
} from "../../brainState";

import {
  RecommendationStage,
} from "./recommendationStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `RI-001 runtime verification failed: ${message}`
    );
  }
}

async function verifyRecommendationIntegration(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.context =
    "Base cognitive context.";

  state.predictions = [
    {
      id: "prediction-1",
      kind: "upcoming_task",
      statement: "A review is likely next.",
      confidence: 0.8,
      evidence: [
        {
          source: "timeline",
          statement: "The review follows the current task.",
          confidence: 0.8,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const result =
    await new RecommendationStage().execute(
      state
    );

  assert(
    result.recommendations.length === 1,
    "recommendation stage must persist generated recommendations"
  );

  assert(
    result.context?.includes(
      "RECOMMENDATIONS:"
    ) === true,
    "recommendation stage must expose recommendations to downstream context"
  );
}

void verifyRecommendationIntegration();
