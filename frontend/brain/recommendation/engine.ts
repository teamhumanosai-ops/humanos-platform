import type {
  BrainState,
} from "../brainState";

import type {
  Prediction,
} from "../prediction";

import type {
  Recommendation,
  RecommendationEvidence,
  RecommendationKind,
} from "./types";

const MAX_RECOMMENDATIONS =
  8;

const MIN_PREDICTION_CONFIDENCE =
  0.55;

const MAX_EVIDENCE =
  6;

const MIN_EVIDENCE_FOR_DIVERSITY_BONUS =
  2;

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function clamp(
  value: number
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}

function createRecommendationId(
  statement: string
): string {
  return `recommendation-${normalize(
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

function addEvidence(
  evidence: RecommendationEvidence[],
  item: RecommendationEvidence
): void {
  const statement =
    item.statement.trim();

  if (
    !statement ||
    evidence.length >= MAX_EVIDENCE
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
      clamp(
        item.confidence
      ),
  });
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
      item
    );
  }

  return normalized;
}

function calculateRecommendationConfidence(
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
        clamp(
          item.confidence
        ),
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
    sourceCount >=
    MIN_EVIDENCE_FOR_DIVERSITY_BONUS
      ? 0.05
      : 0;

  const existingConfidence =
    clamp(
      recommendation.confidence
    );

  return clamp(
    existingConfidence *
      0.2 +
      average *
      0.8 +
      diversityBonus
  );
}

function normalizeRecommendation(
  recommendation: Recommendation
): Recommendation {
  const evidence =
    normalizeEvidence(
      recommendation.evidence
    );

  return {
    ...recommendation,

    confidence:
      calculateRecommendationConfidence(
        recommendation,
        evidence
      ),

    priority:
      clamp(
        recommendation.priority
      ),

    evidence,
  };
}

function createRecommendation(
  statement: string,
  rationale: string,
  kind: RecommendationKind,
  priority: number,
  evidence: RecommendationEvidence[]
): Recommendation {
  const normalizedEvidence =
    normalizeEvidence(
      evidence
    );

  const confidence =
    normalizedEvidence.length === 0
      ? 0
      : clamp(
          normalizedEvidence.reduce(
            (
              total,
              item
            ) =>
              total +
              clamp(
                item.confidence
              ),
            0
          ) /
            normalizedEvidence.length
        );

  return {
    id:
      createRecommendationId(
        statement
      ),

    kind,

    statement,

    rationale,

    priority:
      clamp(
        priority
      ),

    confidence,

    evidence:
      normalizedEvidence,

    createdAt:
      new Date(),
  };
}

function predictionEvidence(
  prediction: Prediction
): RecommendationEvidence[] {
  const evidence:
    RecommendationEvidence[] =
    [];

  addEvidence(
    evidence,
    {
      source:
        "prediction",

      statement:
        prediction.statement,

      confidence:
        prediction.confidence,
    }
  );

  for (
    const item of
    prediction.evidence
  ) {
    if (
      evidence.length >=
      MAX_EVIDENCE
    ) {
      break;
    }

    addEvidence(
      evidence,
      {
        source:
          item.source ===
            "history"
            ? "reflection"
            : item.source,

        statement:
          item.statement,

        confidence:
          item.confidence,
      }
    );
  }

  return evidence;
}

function buildPredictionRecommendations(
  state: BrainState
): Recommendation[] {
  const recommendations:
    Recommendation[] =
    [];

  const predictions =
    [...state.predictions]
      .filter(
        (prediction) =>
          prediction.confidence >=
          MIN_PREDICTION_CONFIDENCE
      )
      .sort(
        (a, b) =>
          b.confidence -
          a.confidence
      );

  for (
    const prediction of
    predictions
  ) {
    const evidence =
      predictionEvidence(
        prediction
      );

    switch (
      prediction.kind
    ) {
      case "likely_need":
        recommendations.push(
          createRecommendation(
            `Address the likely need before it becomes a blocker: ${prediction.statement}`,
            "The prediction indicates a likely unmet requirement or obstacle.",
            "risk_reduction",
            prediction.confidence,
            evidence
          )
        );
        break;

      case "likely_deadline":
        recommendations.push(
          createRecommendation(
            `Prepare for the likely deadline or renewal: ${prediction.statement}`,
            "Preparing early reduces the risk of a time-sensitive failure.",
            "preparation",
            Math.min(
              1,
              prediction.confidence +
                0.08
            ),
            evidence
          )
        );
        break;

      case "recurring_behavior":
        recommendations.push(
          createRecommendation(
            `Consider preparing for the recurring pattern: ${prediction.statement}`,
            "The prediction suggests a behavior or event may repeat.",
            "preparation",
            prediction.confidence *
              0.95,
            evidence
          )
        );
        break;

      default:
        recommendations.push(
          createRecommendation(
            `Consider taking the next action early: ${prediction.statement}`,
            "The prediction identifies a plausible upcoming action or event.",
            "next_action",
            prediction.confidence,
            evidence
          )
        );
        break;
    }
  }

  return recommendations;
}

function buildGoalRecommendations(
  state: BrainState
): Recommendation[] {
  if (
    !state.goal
  ) {
    return [];
  }

  const recommendations:
    Recommendation[] =
    [];

  const goalEvidence:
    RecommendationEvidence[] =
    [];

  addEvidence(
    goalEvidence,
    {
      source:
        "goal",

      statement:
        `Active goal: ${state.goal.statement}. Progress: ${state.goal.progress}%.`,

      confidence:
        state.goal.confidence,
    }
  );

  if (
    state.goal.nextAction.trim()
  ) {
    recommendations.push(
      createRecommendation(
        `Prioritize the next goal action: ${state.goal.nextAction}.`,
        `The active goal is ${state.goal.progress}% complete and already identifies a next action.`,
        "next_action",
        Math.max(
          0.5,
          state.goal.confidence
        ),
        goalEvidence
      )
    );
  }

  const obstacle =
    state.goal.obstacles[0];

  if (
    obstacle?.trim()
  ) {
    const evidence =
      [...goalEvidence];

    addEvidence(
      evidence,
      {
        source:
          "reflection",

        statement:
          `Goal obstacle: ${obstacle}.`,

        confidence:
          0.72,
      }
    );

    recommendations.push(
      createRecommendation(
        `Resolve the active goal obstacle before advancing: ${obstacle}.`,
        "The obstacle is explicitly associated with the active goal.",
        "risk_reduction",
        0.8,
        evidence
      )
    );
  }

  return recommendations;
}

function buildGraphRecommendations(
  state: BrainState
): Recommendation[] {
  const nodesById =
    new Map(
      state.graph.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const recommendations:
    Recommendation[] =
    [];

  for (
    const edge of
    state.graphEdges
  ) {
    if (
      recommendations.length >=
      4
    ) {
      break;
    }

    const from =
      nodesById.get(
        edge.from
      );

    const to =
      nodesById.get(
        edge.to
      );

    if (
      !from ||
      !to
    ) {
      continue;
    }

    const relationship =
      normalize(
        edge.type
      );

    const isDependency =
      relationship.includes(
        "depend"
      ) ||
      relationship.includes(
        "require"
      ) ||
      relationship.includes(
        "block"
      );

    if (
      !isDependency
    ) {
      continue;
    }

    const evidence:
      RecommendationEvidence[] =
      [];

    addEvidence(
      evidence,
      {
        source:
          "graph",

        statement:
          `${from.label} ${edge.type} ${to.label}.`,

        confidence:
          edge.weight,
      }
    );

    recommendations.push(
      createRecommendation(
        `Resolve the dependency before relying on the downstream item: ${from.label} ${edge.type} ${to.label}.`,
        "The knowledge graph identifies a relationship that may constrain the next step.",
        "dependency_resolution",
        clamp(
          edge.weight
        ),
        evidence
      )
    );
  }

  return recommendations;
}

function deduplicate(
  recommendations: Recommendation[]
): Recommendation[] {
  const unique =
    new Map<
      string,
      Recommendation
    >();

  for (
    const recommendation of
    recommendations
  ) {
    const normalized =
      normalizeRecommendation(
        recommendation
      );

    const existing =
      unique.get(
        normalized.id
      );

    if (
      !existing ||
      normalized.confidence >
        existing.confidence
    ) {
      unique.set(
        normalized.id,
        normalized
      );
    }
  }

  return [
    ...unique.values(),
  ]
    .sort(
      (a, b) =>
        b.priority -
        a.priority ||
        b.confidence -
        a.confidence
    )
    .slice(
      0,
      MAX_RECOMMENDATIONS
    );
}

export function recommend(
  state: BrainState
): Recommendation[] {
  return deduplicate([
    ...buildGoalRecommendations(
      state
    ),
    ...buildPredictionRecommendations(
      state
    ),
    ...buildGraphRecommendations(
      state
    ),
  ]);
}
