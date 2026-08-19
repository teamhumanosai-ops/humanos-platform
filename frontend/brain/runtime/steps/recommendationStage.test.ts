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

  state.memories = [
    {
      key:
        "current review",

      value:
        "The review follows the current project task.",

      confidence:
        0.9,

      updatedAt:
        new Date().toISOString(),

      kind:
        "long_term",

      importance:
        0.9,
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
    result.recommendations[0]?.evidence.some(
      (item) =>
        item.source ===
          "memory" &&
        item.statement.includes(
          "review"
        )
    ) === true,
    "recommendation stage must enrich recommendations with relevant memory evidence"
  );

  assert(
    result.context?.includes(
      "RECOMMENDATIONS:"
    ) === true,
    "recommendation stage must expose recommendations to downstream context"
  );
}

void verifyRecommendationIntegration();
