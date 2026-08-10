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

function observation(
  statement: string,
  confidence: number,
  source: ReasoningSource
): ReasoningObservation {
  return {
    statement,

    confidence,

    source,
  };
}

function buildGraphObservations(
  state: BrainState
): ReasoningObservation[] {
  const observations: ReasoningObservation[] =
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
        "knowledge_graph"
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
          "knowledge_graph"
        )
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Relationship-aware query
  |--------------------------------------------------------------------------
  */

  const relationshipSummary =
    limitItems(
      state.graph
        .flatMap(
          (node) =>
            graphQuery
              .getWeightedRelationships(
                node.id
              )
              .map(
                (edge) => ({
                  nodeId:
                    node.id,

                  edge,
                })
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
          ({
            edge,
          }) => {
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
          `The graph provides weighted relationship evidence: ${weightedRelationships.join(
            "; "
          )}.`,
          0.9,
          "knowledge_graph"
        )
      );
    }
  }

  return observations;
}

function buildObservations(
  state: BrainState
): ReasoningObservation[] {
  const observations: ReasoningObservation[] =
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
        "reflection"
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
    buildObservations(
      state
    );

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