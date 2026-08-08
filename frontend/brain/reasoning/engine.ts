import type {
  BrainState,
} from "../brainState";

import type {
  ReasoningResult,
} from "./types";

function normalize(
  value: string
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function buildObservations(
  state: BrainState
): {
  statement: string;
  confidence: number;
}[] {
  const observations: {
    statement: string;
    confidence: number;
  }[] = [];

  if (state.intent) {
    observations.push({
      statement:
        `The detected intent is ${state.intent}.`,
      confidence: 0.8,
    });
  }

  if (
    state.memories.length > 0
  ) {
    observations.push({
      statement:
        `Relevant long-term memory is available for this request.`,
      confidence: 0.9,
    });
  }

  if (
    state.graph.length > 0
  ) {
    observations.push({
      statement:
        `Relevant knowledge graph entities are available.`,
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

  if (
    state.timeline.length > 0
  ) {
    observations.push({
      statement:
        `Relevant timeline information is available.`,
      confidence: 0.85,
    });
  }

  if (
    state.reflections.length > 0
  ) {
    observations.push({
      statement:
        `Relevant reflections are available.`,
      confidence: 0.8,
    });
  }

  if (
    state.knowledge.length > 0
  ) {
    observations.push({
      statement:
        `Relevant knowledge retrieval results are available.`,
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

  return observations;
}

export function reason(
  state: BrainState
): ReasoningResult {
  const observations =
    buildObservations(
      state
    );

  const userRequest =
    normalize(
      state.userMessage
    );

  const summary =
    observations.length > 0
      ? `The request "${userRequest}" can be answered using the available cognitive context and ${observations.length} relevant observations.`
      : `The request "${userRequest}" does not currently have additional structured reasoning evidence.`;

  const confidence =
    observations.length === 0
      ? 0.5
      : observations.reduce(
          (
            total,
            observation
          ) =>
            total +
            observation.confidence,
          0
        ) /
        observations.length;

  return {
    summary,

    observations,

    confidence,
  };
}