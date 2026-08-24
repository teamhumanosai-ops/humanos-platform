import {
  createBrainState,
} from "../brainState";

import {
  recommend,
} from "./engine";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `RI-001 confidence verification failed: ${message}`
    );
  }
}

function verifySingleSourceConfidence(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.predictions = [
    {
      id: "prediction-single-source",
      kind: "likely_deadline",
      statement: "A renewal is likely due soon.",
      confidence: 0.9,
      evidence: [
        {
          source: "timeline",
          statement: "The renewal is due next week.",
          confidence: 0.9,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const recommendations =
    recommend(
      state
    );

  assert(
    recommendations.length === 1,
    "single-source prediction must produce one recommendation"
  );

  assert(
    Math.abs(
      (recommendations[0]?.confidence ?? 0) -
        0.95
    ) < 0.000001,
    "single-source confidence must remain stable"
  );
}

function verifyDiverseEvidenceBonus(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.predictions = [
    {
      id: "prediction-diverse-source",
      kind: "likely_deadline",
      statement: "A renewal is likely due soon.",
      confidence: 0.9,
      evidence: [
        {
          source: "timeline",
          statement: "The renewal is due next week.",
          confidence: 0.9,
        },
        {
          source: "memory",
          statement: "The renewal has required preparation before.",
          confidence: 0.8,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const recommendations =
    recommend(
      state
    );

  assert(
    recommendations.length === 1,
    "diverse evidence must produce one recommendation"
  );

  assert(
    recommendations[0]?.evidence.length ===
      3,
    "prediction evidence and its supporting sources must be retained"
  );

  assert(
    recommendations[0]?.confidence >
      0.85,
    "multiple evidence sources must receive a bounded diversity confidence bonus"
  );

  assert(
    recommendations[0]?.confidence <=
      1,
    "recommendation confidence must remain bounded"
  );
}

function verifyDuplicateEvidenceNormalization(): void {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.predictions = [
    {
      id: "prediction-duplicate-evidence",
      kind: "upcoming_task",
      statement: "The next action is likely review.",
      confidence: 0.8,
      evidence: [
        {
          source: "timeline",
          statement: "Review is scheduled next.",
          confidence: 0.8,
        },
        {
          source: "timeline",
          statement: "  REVIEW IS SCHEDULED NEXT.  ",
          confidence: 0.2,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const recommendations =
    recommend(
      state
    );

  assert(
    recommendations.length === 1,
    "duplicate evidence must not duplicate recommendations"
  );

  assert(
    recommendations[0]?.evidence.length ===
      2,
    "duplicate evidence statements must be normalized while preserving the prediction evidence"
  );
}

verifySingleSourceConfidence();
verifyDiverseEvidenceBonus();
verifyDuplicateEvidenceNormalization();
