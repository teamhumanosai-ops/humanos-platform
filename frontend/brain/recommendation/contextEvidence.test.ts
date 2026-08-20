import {
  createBrainState,
} from "../brainState";

import {
  enrichRecommendationsWithContext,
} from "./contextEvidence";

import type {
  Recommendation,
} from "./types";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `RI-001 contextual evidence verification failed: ${message}`
    );
  }
}

function createRecommendation(): Recommendation {
  return {
    id:
      "recommendation-project-review",

    kind:
      "next_action",

    statement:
      "Prioritize the next goal action: review the project plan.",

    rationale:
      "The active goal is already in progress and identifies a next action.",

    priority:
      0.8,

    confidence:
      0.8,

    evidence: [
      {
        source:
          "goal",

        statement:
          "Active goal: review the project plan.",

        confidence:
          0.8,
      },
    ],

    createdAt:
      new Date(),
  };
}

function verifyMemoryEvidence(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.memories = [
    {
      key:
        "current project",

      value:
        "The project plan is due for review.",

      confidence:
        0.9,

      updatedAt:
        new Date().toISOString(),

      kind:
        "semantic",

      importance:
        0.9,
    },

    {
      key:
        "unrelated preference",

      value:
        "Prefers tea.",

      confidence:
        0.95,

      updatedAt:
        new Date().toISOString(),

      kind:
        "semantic",

      importance:
        0.8,
    },
  ];

  const recommendations =
    enrichRecommendationsWithContext(
      state,
      [
        createRecommendation(),
      ]
    );

  assert(
    recommendations[0]?.evidence.some(
      (item) =>
        item.source ===
          "memory" &&
        item.statement.includes(
          "project plan"
        )
    ) === true,
    "relevant memory must enrich the recommendation"
  );

  assert(
    recommendations[0]?.evidence.some(
      (item) =>
        item.statement ===
        "unrelated preference: Prefers tea."
    ) === false,
    "unrelated memory must not enrich the recommendation"
  );
}

function verifyReflectionEvidence(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.reflections = [
    "Project reviews are often delayed when the plan is not prepared early.",
  ];

  const recommendations =
    enrichRecommendationsWithContext(
      state,
      [
        createRecommendation(),
      ]
    );

  assert(
    recommendations[0]?.evidence.some(
      (item) =>
        item.source ===
          "reflection" &&
        item.statement.includes(
          "Project reviews"
        )
    ) === true,
    "relevant reflection must enrich the recommendation"
  );
}

function verifyProfileEvidence(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.profile = {
    id:
      "profile-1",

    identity: {
      fullName:
        "Human",
    },

    mission: {
      currentProject:
        "Review the project plan",
    },

    personality: {},

    productivity: {},

    interests: {
      favoriteTopics: [],
    },

    metadata: {
      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    },
  };

  const recommendations =
    enrichRecommendationsWithContext(
      state,
      [
        createRecommendation(),
      ]
    );

  assert(
    recommendations[0]?.evidence.some(
      (item) =>
        item.source ===
          "profile" &&
        item.statement.includes(
          "Review the project plan"
        )
    ) === true,
    "matching profile mission context must enrich the recommendation"
  );
}

function verifyLifeDomainEvidence(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "Help me prepare for my quarterly work review."
    );

  state.primaryLifeDomain =
    "work";

  const recommendations =
    enrichRecommendationsWithContext(
      state,
      [
        {
          ...createRecommendation(),

          statement:
            "Prepare the work review agenda and next steps.",

          rationale:
            "The current work responsibility needs a clear review plan.",
        },
      ]
    );

  const lifeDomainEvidence =
    recommendations[0]?.evidence.find(
      (item) =>
        item.source ===
        "life_domain"
    );

  assert(
    Boolean(
      lifeDomainEvidence
    ),
    "matching life-domain context must enrich the recommendation"
  );

  assert(
    lifeDomainEvidence?.statement.includes(
      "Work (work)"
    ) === true,
    "life-domain evidence must preserve canonical domain identity"
  );

  assert(
    lifeDomainEvidence?.confidence ===
      0.8,
    "life-domain evidence must use the canonical contextual confidence"
  );

  const unrelated =
    enrichRecommendationsWithContext(
      state,
      [
        createRecommendation(),
      ]
    );

  assert(
    !unrelated[0]?.evidence.some(
      (item) =>
        item.source ===
        "life_domain"
    ),
    "unrelated recommendations must not receive life-domain evidence"
  );
}

function verifyConfidenceNormalization(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.memories = [
    {
      key:
        "project",

      value:
        "Review the project plan.",

      confidence:
        1.5,

      updatedAt:
        new Date().toISOString(),

      kind:
        "semantic",

      importance:
        1,
    },
  ];

  const recommendations =
    enrichRecommendationsWithContext(
      state,
      [
        createRecommendation(),
      ]
    );

  assert(
    recommendations[0]?.confidence >=
      0,
    "contextual recommendation confidence must not fall below zero"
  );

  assert(
    recommendations[0]?.confidence <=
      1,
    "contextual recommendation confidence must remain bounded"
  );
}

verifyMemoryEvidence();
verifyReflectionEvidence();
verifyProfileEvidence();
verifyLifeDomainEvidence();
verifyConfidenceNormalization();
