import type {
  BrainState,
} from "../brainState";

import type {
  Recommendation,
  RecommendationEvidence,
} from "./types";

const MAX_CONTEXT_EVIDENCE =
  3;

const MAX_TOTAL_EVIDENCE =
  6;

const MIN_TOKEN_LENGTH =
  3;

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function tokens(
  value: string
): string[] {
  return [
    ...new Set(
      normalize(
        value
      )
        .split(/\s+/)
        .map(
          (token) =>
            token.replace(
              /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,
              ""
            )
        )
        .filter(
          (token) =>
            token.length >=
            MIN_TOKEN_LENGTH
        )
    ),
  ];
}

function hasRelevantOverlap(
  recommendation: Recommendation,
  evidenceText: string
): boolean {
  const recommendationTokens =
    tokens(
      `${recommendation.statement} ${recommendation.rationale}`
    );

  const evidenceTokens =
    new Set(
      tokens(
        evidenceText
      )
    );

  return recommendationTokens.some(
    (token) =>
      evidenceTokens.has(
        token
      )
  );
}

function addEvidence(
  evidence: RecommendationEvidence[],
  item: RecommendationEvidence,
  limit: number
): void {
  if (
    evidence.length >=
    limit
  ) {
    return;
  }

  const statement =
    item.statement.trim();

  if (
    !statement
  ) {
    return;
  }

  const duplicate =
    evidence.some(
      (existing) =>
        existing.source ===
          item.source &&
        normalize(
          existing.statement
        ) ===
          normalize(
            statement
          )
    );

  if (
    duplicate
  ) {
    return;
  }

  evidence.push({
    source:
      item.source,

    statement,

    confidence:
      Math.max(
        0,
        Math.min(
          1,
          item.confidence
        )
      ),
  });
}

function buildMemoryEvidence(
  state: BrainState,
  recommendation: Recommendation
): RecommendationEvidence[] {
  const evidence:
    RecommendationEvidence[] =
    [];

  for (
    const memory of
    state.memories
  ) {
    const statement =
      `${memory.key}: ${memory.value}`;

    if (
      !hasRelevantOverlap(
        recommendation,
        statement
      )
    ) {
      continue;
    }

    addEvidence(
      evidence,
      {
        source:
          "memory",

        statement,

        confidence:
          memory.confidence,
      },
      MAX_CONTEXT_EVIDENCE
    );

    if (
      evidence.length >=
      MAX_CONTEXT_EVIDENCE
    ) {
      break;
    }
  }

  return evidence;
}

function buildReflectionEvidence(
  state: BrainState,
  recommendation: Recommendation
): RecommendationEvidence[] {
  const evidence:
    RecommendationEvidence[] =
    [];

  for (
    const reflection of
    state.reflections
  ) {
    if (
      !hasRelevantOverlap(
        recommendation,
        reflection
      )
    ) {
      continue;
    }

    addEvidence(
      evidence,
      {
        source:
          "reflection",

        statement:
          reflection,

        confidence:
          0.75,
      },
      MAX_CONTEXT_EVIDENCE
    );

    if (
      evidence.length >=
      MAX_CONTEXT_EVIDENCE
    ) {
      break;
    }
  }

  return evidence;
}

function buildProfileEvidence(
  state: BrainState,
  recommendation: Recommendation
): RecommendationEvidence[] {
  if (
    !state.profile
  ) {
    return [];
  }

  const profile =
    state.profile;

  const fields = [
    profile.mission.currentMission,
    profile.mission.biggestGoal,
    profile.mission.currentProject,
    profile.personality.decisionStyle,
    profile.productivity.planningStyle,
    profile.productivity.bestWorkingHours,
    ...(
      profile.interests.favoriteTopics ??
      []
    ),
  ].filter(
    (
      value
    ): value is string =>
      Boolean(
        value?.trim()
      )
  );

  const matches =
    fields.filter(
      (field) =>
        hasRelevantOverlap(
          recommendation,
          field
        )
    );

  if (
    matches.length === 0
  ) {
    return [];
  }

  return [
    {
      source:
        "profile",

      statement:
        `Profile context: ${matches[0]}`,

      confidence:
        0.8,
    },
  ];
}

function buildLifeDomainEvidence(
  state: BrainState,
  recommendation: Recommendation
): RecommendationEvidence[] {
  const domain =
    state.primaryLifeDomain;

  if (
    !domain ||
    domain === "general"
  ) {
    return [];
  }

  if (
    !hasRelevantOverlap(
      recommendation,
      domain
    )
  ) {
    return [];
  }

  return [
    {
      source:
        "profile",
      statement:
        `Life-domain context: ${domain}`,
      confidence:
        0.7,
    },
  ];
}

function normalizeEvidence(
  evidence: RecommendationEvidence[]
): RecommendationEvidence[] {
  const normalized:
    RecommendationEvidence[] =
    [];

  for (
    const item of
    evidence
  ) {
    addEvidence(
      normalized,
      item,
      MAX_TOTAL_EVIDENCE
    );

    if (
      normalized.length >=
      MAX_TOTAL_EVIDENCE
    ) {
      break;
    }
  }

  return normalized;
}

function recalculateConfidence(
  recommendation: Recommendation,
  evidence: RecommendationEvidence[]
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
        item.confidence,
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

  const diversityBonus =
    sourceCount >= 2
      ? 0.05
      : 0;

  return Math.max(
    0,
    Math.min(
      1,
      recommendation.confidence *
        0.2 +
        average *
        0.8 +
        diversityBonus
    )
  );
}

export function enrichRecommendationsWithContext(
  state: BrainState,
  recommendations: Recommendation[]
): Recommendation[] {
  return recommendations.map(
    (recommendation) => {
      const contextualEvidence = [
        ...buildMemoryEvidence(
          state,
          recommendation
        ),
        ...buildReflectionEvidence(
          state,
          recommendation
        ),
        ...buildProfileEvidence(
          state,
          recommendation
        ),
        ...buildLifeDomainEvidence(
          state,
          recommendation
        ),
      ];

      const evidence =
        normalizeEvidence([
          ...recommendation.evidence,
          ...contextualEvidence,
        ]);

      return {
        ...recommendation,

        evidence,

        confidence:
          recalculateConfidence(
            recommendation,
            evidence
          ),
      };
    }
  );
}
