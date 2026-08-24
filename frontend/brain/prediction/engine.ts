import type {
  BrainState,
} from "../brainState";

import type {
  Prediction,
  PredictionEvidence,
  PredictionKind,
} from "./types";

const MAX_EVIDENCE =
  16;

const MAX_PREDICTIONS =
  8;

const MAX_TIMELINE_PREDICTIONS =
  3;

const MAX_REFLECTION_PREDICTIONS =
  2;

const MAX_GRAPH_PREDICTIONS =
  3;

const MAX_GOAL_PREDICTIONS =
  2;

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
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

function clampConfidence(
  confidence: number
): number {
  return Math.max(
    0,
    Math.min(
      1,
      confidence
    )
  );
}

function addEvidence(
  evidence: PredictionEvidence[],
  item: PredictionEvidence
): void {
  if (
    !item.statement.trim()
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
            item.statement
          )
    );

  if (
    duplicate
  ) {
    return;
  }

  if (
    evidence.length >=
    MAX_EVIDENCE
  ) {
    return;
  }

  evidence.push({
    source:
      item.source,

    statement:
      item.statement.trim(),

    confidence:
      clampConfidence(
        item.confidence
      ),
  });
}

function buildEvidence(
  state: BrainState
): PredictionEvidence[] {
  const evidence:
    PredictionEvidence[] =
    [];

  for (
    const event of
    state.timeline
  ) {
    addEvidence(
      evidence,
      {
        source:
          "timeline",

        statement:
          event,

        confidence:
          0.8,
      }
    );
  }

  for (
    const memory of
    state.memories
  ) {
    addEvidence(
      evidence,
      {
        source:
          "memory",

        statement:
          memory.value,

        confidence:
          memory.confidence,
      }
    );
  }

  const nodesById =
    new Map(
      state.graph.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  for (
    const edge of
    state.graphEdges
  ) {
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

    addEvidence(
      evidence,
      {
        source:
          "graph",

        statement:
          `${from.label} ${edge.type} ${to.label}.`,

        confidence:
          clampConfidence(
            edge.weight
          ),
      }
    );
  }

  for (
    const reflection of
    state.reflections
  ) {
    addEvidence(
      evidence,
      {
        source:
          "reflection",

        statement:
          reflection,

        confidence:
          0.8,
      }
    );
  }

  if (
    state.goal
  ) {
    const goal =
      state.goal;

    addEvidence(
      evidence,
      {
        source:
          "history",

        statement:
          `Active goal: ${goal.statement}. Status: ${goal.status}. Progress: ${goal.progress}%. Next action: ${goal.nextAction}.`,

        confidence:
          clampConfidence(
            goal.confidence
          ),
      }
    );

    for (
      const dependency of
      goal.dependencies
    ) {
      addEvidence(
        evidence,
        {
          source:
            "graph",

          statement:
            `Goal dependency: ${dependency}.`,

          confidence:
            0.78,
        }
      );
    }

    for (
      const obstacle of
      goal.obstacles
    ) {
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
    }
  }

  return evidence;
}

function classifyPrediction(
  statement: string
): PredictionKind {
  const text =
    normalize(
      statement
    );

  if (
    text.includes(
      "deadline"
    ) ||
    text.includes(
      "due"
    ) ||
    text.includes(
      "renew"
    )
  ) {
    return "likely_deadline";
  }

  if (
    text.includes(
      "every"
    ) ||
    text.includes(
      "usually"
    ) ||
    text.includes(
      "often"
    ) ||
    text.includes(
      "recurring"
    ) ||
    text.includes(
      "repeated"
    ) ||
    text.includes(
      "again"
    )
  ) {
    return "recurring_behavior";
  }

  if (
    text.includes(
      "need"
    ) ||
    text.includes(
      "requires"
    ) ||
    text.includes(
      "missing"
    ) ||
    text.includes(
      "depends"
    ) ||
    text.includes(
      "blocked"
    ) ||
    text.includes(
      "obstacle"
    ) ||
    text.includes(
      "dependency"
    )
  ) {
    return "likely_need";
  }

  return "upcoming_task";
}

function createPrediction(
  statement: string,
  evidence: PredictionEvidence[],
  kind?: PredictionKind
): Prediction {
  const confidence =
    clampConfidence(
      evidence.reduce(
        (
          total,
          item
        ) =>
          total +
          item.confidence,
        0
      ) /
        Math.max(
          1,
          evidence.length
        )
    );

  return {
    id:
      createPredictionId(
        statement
      ),

    kind:
      kind ??
      classifyPrediction(
        statement
      ),

    statement,

    confidence,

    evidence,

    createdAt:
      new Date(),
  };
}

function createCandidatePredictions(
  state: BrainState
): Prediction[] {
  const evidence =
    buildEvidence(
      state
    );

  if (
    evidence.length === 0
  ) {
    return [];
  }

  const predictions:
    Prediction[] =
    [];

  const timelineEvidence =
    evidence.filter(
      (
        item
      ) =>
        item.source ===
        "timeline"
    );

  for (
    const item of
    timelineEvidence.slice(
      0,
      MAX_TIMELINE_PREDICTIONS
    )
  ) {
    const statement =
      `A future action or event may be associated with: ${item.statement}`;

    predictions.push(
      createPrediction(
        statement,
        [item]
      )
    );
  }

  const reflectionEvidence =
    evidence.filter(
      (
        item
      ) =>
        item.source ===
        "reflection" &&
        !item.statement.includes("Goal obstacle:")
    );

  for (
    const item of
    reflectionEvidence.slice(
      0,
      MAX_REFLECTION_PREDICTIONS
    )
  ) {
    const statement =
      `A previously observed pattern may continue: ${item.statement}`;

    predictions.push(
      createPrediction(
        statement,
        [item],
        "recurring_behavior"
      )
    );
  }

  const graphEvidence =
    evidence.filter(
      (
        item
      ) =>
        item.source ===
        "graph" &&
        !item.statement.includes("Goal dependency:") &&
        /(depends|requires|blocks|blocked|deadline|due|renew|recurring)/i.test(
          item.statement
        )
    );

  for (
    const item of
    graphEvidence.slice(
      0,
      MAX_GRAPH_PREDICTIONS
    )
  ) {
    const statement =
      `A graph relationship may create a future action or dependency: ${item.statement}`;

    predictions.push(
      createPrediction(
        statement,
        [item]
      )
    );
  }

  if (
    state.goal
  ) {
    const goal =
      state.goal;

    let goalPredictionCount =
      0;

    if (
      goal.nextAction.trim() &&
      goalPredictionCount <
        MAX_GOAL_PREDICTIONS
    ) {
      const goalEvidence =
        evidence.filter(
          (
            item
          ) =>
            item.statement.includes(
              "Active goal:"
            ) ||
            item.statement.includes(
              "Goal dependency:"
            )
        );

      const statement =
        `The next likely action is related to the active goal: ${goal.nextAction}.`;

      predictions.push(
        createPrediction(
          statement,
          goalEvidence.length > 0
            ? goalEvidence
            : [
                {
                  source:
                    "history",

                  statement:
                    `Active goal: ${goal.statement}.`,

                  confidence:
                    clampConfidence(
                      goal.confidence
                    ),
                },
              ]
        )
      );

      goalPredictionCount +=
        1;
    }

    if (
      goal.obstacles.length > 0 &&
      goalPredictionCount <
        MAX_GOAL_PREDICTIONS
    ) {
      const obstacle =
        goal.obstacles[0];

      const obstacleEvidence =
        evidence.filter(
          (
            item
          ) =>
            item.statement.includes(
              "Goal obstacle:"
            )
        );

      const statement =
        `The active goal may require resolving an identified obstacle before the next step: ${obstacle}.`;

      predictions.push(
        createPrediction(
          statement,
          obstacleEvidence.length > 0
            ? obstacleEvidence
            : [
                {
                  source:
                    "reflection",

                  statement:
                    `Goal obstacle: ${obstacle}.`,

                  confidence:
                    0.72,
                },
              ],
          "likely_need"
        )
      );

      goalPredictionCount +=
        1;
    }
  }

  const unique =
    new Map<
      string,
      Prediction
    >();

  for (
    const prediction of
    predictions
  ) {
    if (
      !unique.has(
        prediction.id
      )
    ) {
      unique.set(
        prediction.id,
        prediction
      );
    }
  }

  return [
    ...unique.values(),
  ].slice(
    0,
    MAX_PREDICTIONS
  );
}

export function predict(
  state: BrainState
): Prediction[] {
  return createCandidatePredictions(
    state
  );
}
