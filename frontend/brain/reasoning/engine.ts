import type { BrainState } from "../brainState";

import type {
  ReasoningObservation,
  ReasoningResult,
} from "./types";

function normalize(
  value: string
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function limitItems(
  items: string[],
  limit = 5
): string[] {
  return items
    .map((item) =>
      normalize(item)
    )
    .filter(Boolean)
    .slice(0, limit);
}

function buildObservations(
  state: BrainState
): ReasoningObservation[] {
  const observations: ReasoningObservation[] = [];

  if (state.intent) {
    observations.push({
      statement:
        `The detected intent is "${state.intent}".`,
      confidence: 0.8,
    });
  }

  const memoryValues =
    limitItems(
      state.memories.map(
        (memory) => memory.value
      )
    );

  if (memoryValues.length > 0) {
    observations.push({
      statement:
        `Relevant long-term memory is available for this request: ${memoryValues.join(
          "; "
        )}.`,
      confidence: 0.9,
    });
  }

  const graphLabels =
    limitItems(
      state.graph.map(
        (node) => node.label
      )
    );

  if (graphLabels.length > 0) {
    observations.push({
      statement:
        `Relevant knowledge graph entities are available: ${graphLabels.join(
          ", "
        )}.`,
      confidence: 0.85,
    });
  }

  if (
    state.graphEdges.length > 0
  ) {
    observations.push({
      statement:
        `Relevant relationships are available in the knowledge graph.`,
      confidence: 0.85,
    });
  }

  const timelineItems =
    limitItems(
      state.timeline
    );

  if (timelineItems.length > 0) {
    observations.push({
      statement:
        `Relevant timeline information is available: ${timelineItems.join(
          "; "
        )}.`,
      confidence: 0.85,
    });
  }

  const reflectionItems =
    limitItems(
      state.reflections
    );

  if (reflectionItems.length > 0) {
    observations.push({
      statement:
        `Relevant reflections are available: ${reflectionItems.join(
          "; "
        )}.`,
      confidence: 0.8,
    });
  }

  if (
    state.knowledge.length > 0
  ) {
    const knowledgeSources =
      limitItems(
        state.knowledge.map(
          (item) => item.source
        )
      );

    observations.push({
      statement:
        knowledgeSources.length > 0
          ? `Knowledge retrieval returned ${state.knowledge.length} relevant result${
              state.knowledge.length === 1
                ? ""
                : "s"
            } from: ${knowledgeSources.join(
              ", "
            )}.`
          : `Knowledge retrieval returned ${state.knowledge.length} relevant result${
              state.knowledge.length === 1
                ? ""
                : "s"
            }.`,
      confidence: 0.9,
    });
  }

  if (
    state.liveKnowledge.length > 0
  ) {
    observations.push({
      statement:
        `Current external knowledge was retrieved for this request.`,
      confidence: 0.95,
    });
  }

  if (state.profile) {
    observations.push({
      statement:
        `A user profile is available to personalize the reasoning.`,
      confidence: 0.85,
    });
  }

  return observations;
}

export function reason(
  state: BrainState
): ReasoningResult {
  const userRequest =
    normalize(
      state.userMessage
    );

  const observations =
    buildObservations(state);

  if (
    observations.length === 0
  ) {
    return {
      summary:
        `The request "${userRequest}" does not currently have additional structured reasoning evidence.`,

      observations: [],

      confidence: 0.5,
    };
  }

  const confidence =
    observations.reduce(
      (
        total,
        observation
      ) =>
        total +
        observation.confidence,
      0
    ) /
    observations.length;

  const summary =
    `The request "${userRequest}" was evaluated against ${observations.length} available cognitive signal${
      observations.length === 1
        ? ""
        : "s"
    }.`;

  return {
    summary,

    observations,

    confidence,
  };
}