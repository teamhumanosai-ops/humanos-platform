import type {
  BrainState,
} from "../brainState";

import type {
  Prediction,
  PredictionEvidence,
  PredictionKind,
} from "./types";

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
      ""
    )}`;
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
    if (
      event.trim()
    ) {
      evidence.push({
        source:
          "timeline",

        statement:
          event,

        confidence:
          0.8,
      });
    }
  }

  for (
    const memory of
    state.memories
  ) {
    if (
      memory.value.trim()
    ) {
      evidence.push({
        source:
          "memory",

        statement:
          memory.value,

        confidence:
          0.75,
      });
    }
  }

  for (
    const node of
    state.graph
  ) {
    evidence.push({
      source:
        "graph",

      statement:
        `Graph entity: ${node.label}.`,

      confidence:
        0.7,
    });
  }

  for (
    const reflection of
    state.reflections
  ) {
    if (
      reflection.trim()
    ) {
      evidence.push({
        source:
          "reflection",

        statement:
          reflection,

        confidence:
          0.8,
      });
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
    )
  ) {
    return "likely_need";
  }

  return "upcoming_task";
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
      3
    )
  ) {
    const statement =
      `A future action or event may be associated with: ${item.statement}`;

    predictions.push({
      id:
        createPredictionId(
          statement
        ),

      kind:
        classifyPrediction(
          statement
        ),

      statement,

      confidence:
        item.confidence,

      evidence: [
        item,
      ],

      createdAt:
        new Date(),
    });
  }

  const reflectionEvidence =
    evidence.filter(
      (
        item
      ) =>
        item.source ===
        "reflection"
    );

  for (
    const item of
    reflectionEvidence.slice(
      0,
      2
    )
  ) {
    const statement =
      `A previously observed pattern may continue: ${item.statement}`;

    predictions.push({
      id:
        createPredictionId(
          statement
        ),

      kind:
        "recurring_behavior",

      statement,

      confidence:
        item.confidence,

      evidence: [
        item,
      ],

      createdAt:
        new Date(),
    });
  }

  return predictions;
}

export function predict(
  state: BrainState
): Prediction[] {
  return createCandidatePredictions(
    state
  );
}