import type {
  BrainState,
} from "../brainState";

import type {
  GraphEdge,
  GraphNode,
} from "../graph";

import {
  graphQuery,
} from "../graph";

import type {
  ReasoningObservation,
  ReasoningObservationKind,
  ReasoningResult,
  ReasoningSource,
} from "./types";

function normalize(
  value: string
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function limitItems<T>(
  items: T[],
  limit = 5
): T[] {
  return items.slice(
    0,
    limit
  );
}

function classifyObservation(
  source: ReasoningSource,
  confidence: number,
  preferredKind?: ReasoningObservationKind
): ReasoningObservationKind {
  if (
    confidence < 0.7
  ) {
    return "uncertainty";
  }

  if (
    preferredKind
  ) {
    return preferredKind;
  }

  if (
    source === "reflection"
  ) {
    return "derived_inference";
  }

  if (
    source === "knowledge_graph"
  ) {
    return "observed_relationship";
  }

  if (
    source === "prediction"
  ) {
    return "derived_inference";
  }

  return "known_fact";
}

function observation(
  statement: string,
  confidence: number,
  source: ReasoningSource,
  preferredKind?: ReasoningObservationKind
): ReasoningObservation {
  return {
    statement,

    confidence,

    source,

    kind:
      classifyObservation(
        source,
        confidence,
        preferredKind
      ),
  };
}

function buildGraphObservations(
  state: BrainState
): ReasoningObservation[] {
  const observations:
    ReasoningObservation[] =
    [];

  const graphNodes =
    limitItems(
      state.graph
    );

  if (
    graphNodes.length > 0
  ) {
    const labels =
      graphNodes.map(
        (node) =>
          `${node.label} (${node.type})`
      );

    observations.push(
      observation(
        `Relevant knowledge graph entities include: ${labels.join(
          ", "
        )}.`,
        0.85,
        "knowledge_graph",
        "known_fact"
      )
    );
  }

  const graphEdges =
    limitItems(
      state.graphEdges
    );

  if (
    graphEdges.length > 0
  ) {
    const nodesById =
      new Map<
        string,
        GraphNode
      >(
        state.graph.map(
          (node) => [
            node.id,
            node,
          ]
        )
      );

    const relationships =
      graphEdges
        .map(
          (
            edge: GraphEdge
          ) => {
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
              return null;
            }

            return `${from.label} ${edge.type} ${to.label}`;
          }
        )
        .filter(
          (
            relationship
          ): relationship is string =>
            Boolean(
              relationship
            )
        );

    if (
      relationships.length > 0
    ) {
      observations.push(
        observation(
          `Relevant knowledge graph relationships include: ${relationships.join(
            "; "
          )}.`,
          0.9,
          "knowledge_graph",
          "observed_relationship"
        )
      );
    }
  }

  const relationshipSummary =
    limitItems(
      state.graph.flatMap(
        (
          node
        ) =>
          graphQuery
            .getWeightedRelationships(
              node.id
            )
      ),
      8
    );

  if (
    relationshipSummary.length > 0
  ) {
    const nodesById =
      new Map<
        string,
        GraphNode
      >(
        state.graph.map(
          (node) => [
            node.id,
            node,
          ]
        )
      );

    const weightedRelationships =
      relationshipSummary
        .map(
          (
            edge: GraphEdge
          ) => {
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
              return null;
            }

            return `${from.label} ${edge.type} ${to.label} (weight ${edge.weight.toFixed(
              2
            )})`;
          }
        )
        .filter(
          (
            relationship
          ): relationship is string =>
            Boolean(
              relationship
            )
        );

    if (
      weightedRelationships.length > 0
    ) {
      observations.push(
        observation(
          `Weighted knowledge graph relationships provide additional evidence: ${weightedRelationships.join(
            "; "
          )}.`,
          0.9,
          "knowledge_graph",
          "observed_relationship"
        )
      );
    }
  }

  return observations;
}

function buildObservations(
  state: BrainState
): ReasoningObservation[] {
  const observations:
    ReasoningObservation[] =
    [];

  if (
    state.intent
  ) {
    observations.push(
      observation(
        `The detected intent is ${state.intent}.`,
        0.8,
        "intent"
      )
    );
  }

  if (
    state.memories.length > 0
  ) {
    observations.push(
      observation(
        `Relevant long-term memory is available for this request.`,
        0.9,
        "memory"
      )
    );
  }

  observations.push(
    ...buildGraphObservations(
      state
    )
  );

  if (
    state.timeline.length > 0
  ) {
    const timelineItems =
      limitItems(
        state.timeline
      );

    observations.push(
      observation(
        `Relevant timeline information includes: ${timelineItems.join(
          "; "
        )}.`,
        0.85,
        "timeline"
      )
    );
  }

  if (
    state.reflections.length > 0
  ) {
    const reflectionItems =
      limitItems(
        state.reflections
      );

    observations.push(
      observation(
        `Relevant inferred patterns include: ${reflectionItems.join(
          "; "
        )}.`,
        0.8,
        "reflection",
        "derived_inference"
      )
    );
  }

  if (
    state.knowledge.length > 0
  ) {
    const knowledgeSources =
      limitItems(
        state.knowledge.map(
          (item) =>
            item.source
        )
      );

    observations.push(
      observation(
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
        0.9,
        "knowledge"
      )
    );
  }

  if (
    state.liveKnowledge.length > 0
  ) {
    observations.push(
      observation(
        `Current external knowledge was retrieved for this request.`,
        0.95,
        "live_knowledge"
      )
    );
  }

  if (
    state.profile
  ) {
    observations.push(
      observation(
        `A user profile is available to personalize the reasoning.`,
        0.85,
        "profile"
      )
    );
  }

  for (
    const prediction of
    state.predictions
  ) {
    observations.push(
      observation(
        `Prediction: ${prediction.statement}`,
        prediction.confidence,
        "prediction",
        "derived_inference"
      )
    );
  }

  return observations;
}

function buildCrossSourceInference(
  observations: ReasoningObservation[]
): ReasoningObservation | null {
  const sources =
    new Set(
      observations
        .filter(
          (item) =>
            item.kind ===
            "known_fact"
        )
        .map(
          (item) =>
            item.source
        )
    );

  if (
    sources.size < 2
  ) {
    return null;
  }

  const confidence =
    Math.min(
      0.9,
      0.65 +
        sources.size *
          0.05
    );

  return observation(
    `Multiple independent cognitive sources provide converging evidence for the current request.`,
    confidence,
    "reflection",
    "derived_inference"
  );
}

export function reason(
  state: BrainState
): ReasoningResult {
  const userRequest =
    normalize(
      state.userMessage
    );

  const observations =
    buildObservations(
      state
    );

  const crossSourceInference =
    buildCrossSourceInference(
      observations
    );

  if (
    crossSourceInference
  ) {
    observations.push(
      crossSourceInference
    );
  }

  if (
    observations.length === 0
  ) {
    return {
      summary:
        `The request "${userRequest}" does not currently have additional structured reasoning evidence.`,

      observations:
        [],

      confidence:
        0.5,
    };
  }

  const confidence =
    observations.reduce(
      (
        total,
        current
      ) =>
        total +
        current.confidence,
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