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
  ReasoningResult,
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

function buildGraphObservations(
  state: BrainState
): {
  statement: string;
  confidence: number;
}[] {
  const observations: {
    statement: string;
    confidence: number;
  }[] = [];

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

    observations.push({
      statement:
        `Relevant knowledge graph entities include: ${labels.join(
          ", "
        )}.`,

      confidence:
        0.85,
    });
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
      observations.push({
        statement:
          `Relevant knowledge graph relationships include: ${relationships.join(
            "; "
          )}.`,

        confidence:
          0.9,
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Relationship-aware query
  |--------------------------------------------------------------------------
  |
  | Use GraphQuery as the canonical traversal API.
  | This avoids duplicating graph traversal logic
  | inside the reasoning engine.
  |
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
      observations.push({
        statement:
          `The graph provides weighted relationship evidence: ${weightedRelationships.join(
            "; "
          )}.`,

        confidence:
          0.9,
      });
    }
  }

  return observations;
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

  if (
    state.intent
  ) {
    observations.push({
      statement:
        `The detected intent is ${state.intent}.`,

      confidence:
        0.8,
    });
  }

  if (
    state.memories.length > 0
  ) {
    observations.push({
      statement:
        `Relevant long-term memory is available for this request.`,

      confidence:
        0.9,
    });
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

    observations.push({
      statement:
        `Relevant timeline information includes: ${timelineItems.join(
          "; "
        )}.`,

      confidence:
        0.85,
    });
  }

  if (
    state.reflections.length > 0
  ) {
    const reflectionItems =
      limitItems(
        state.reflections
      );

    observations.push({
      statement:
        `Relevant inferred patterns include: ${reflectionItems.join(
          "; "
        )}.`,

      confidence:
        0.8,
    });
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
      confidence:
        0.9,
    });
  }

  if (
    state.liveKnowledge.length > 0
  ) {
    observations.push({
      statement:
        `Current external knowledge was retrieved for this request.`,

      confidence:
        0.95,
    });
  }

  if (
    state.profile
  ) {
    observations.push({
      statement:
        `A user profile is available to personalize the reasoning.`,

      confidence:
        0.85,
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