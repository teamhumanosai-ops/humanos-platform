import type {
  BrainState,
} from "../brainState";

import type {
  GraphEdge,
  GraphNode,
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
    .replace(
      /\s+/g,
      " "
    )
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
  preferredKind?:
    ReasoningObservationKind
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
    source ===
    "reflection"
  ) {
    return "derived_inference";
  }

  if (
    source ===
    "knowledge_graph"
  ) {
    return "observed_relationship";
  }

  if (
    source ===
    "prediction"
  ) {
    return "derived_inference";
  }

  return "known_fact";
}

function createObservation(
  statement: string,
  confidence: number,
  source: ReasoningSource,
  preferredKind?:
    ReasoningObservationKind
): ReasoningObservation {
  return {
    statement:
      normalize(
        statement
      ),

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

function buildMemoryObservations(
  state: BrainState
): ReasoningObservation[] {
  return limitItems(
    state.memories
      .map(
        (memory) =>
          createObservation(
            `${memory.key}: ${memory.value}`,
            memory.confidence,
            "memory"
          )
      )
      .filter(
        (observation) =>
          observation.statement
            .length > 0
      )
  );
}

function buildKnowledgeObservations(
  state: BrainState
): ReasoningObservation[] {
  return limitItems(
    state.knowledge
      .map(
        (knowledge) =>
          createObservation(
            knowledge.text,
            knowledge.score,
            "knowledge"
          )
      )
      .filter(
        (observation) =>
          observation.statement
            .length > 0
      )
  );
}

function buildGraphObservations(
  state: BrainState
): ReasoningObservation[] {
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

  const edges:
    GraphEdge[] =
    limitItems(
      state.graphEdges
    );

  return edges
    .map(
      (edge) => {
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

        return createObservation(
          `${from.label} ${edge.type} ${to.label}.`,
          Math.max(
            0,
            Math.min(
              1,
              edge.weight
            )
          ),
          "knowledge_graph",
          "observed_relationship"
        );
      }
    )
    .filter(
      (
        observation
      ): observation is ReasoningObservation =>
        Boolean(
          observation
        )
    );
}

function buildTimelineObservations(
  state: BrainState
): ReasoningObservation[] {
  return limitItems(
    state.timeline
      .filter(
        Boolean
      )
      .map(
        (event) =>
          createObservation(
            event,
            0.85,
            "timeline"
          )
      )
  );
}

function buildReflectionObservations(
  state: BrainState
): ReasoningObservation[] {
  return limitItems(
    state.reflections
      .filter(
        Boolean
      )
      .map(
        (reflection) =>
          createObservation(
            reflection,
            0.8,
            "reflection",
            "derived_inference"
          )
      )
  );
}

function buildPredictionObservations(
  state: BrainState
): ReasoningObservation[] {
  return limitItems(
    state.predictions
      .map(
        (prediction) =>
          createObservation(
            prediction.statement,
            prediction.confidence,
            "prediction",
            "derived_inference"
          )
      )
  );
}

function buildLiveKnowledgeObservations(
  state: BrainState
): ReasoningObservation[] {
  return limitItems(
    state.liveKnowledge
      .filter(
        Boolean
      )
      .map(
        (knowledge) =>
          createObservation(
            knowledge,
            0.95,
            "live_knowledge"
          )
      )
  );
}

function buildObservations(
  state: BrainState
): ReasoningObservation[] {
  return [
    ...buildMemoryObservations(
      state
    ),

    ...buildKnowledgeObservations(
      state
    ),

    ...buildGraphObservations(
      state
    ),

    ...buildTimelineObservations(
      state
    ),

    ...buildReflectionObservations(
      state
    ),

    ...buildPredictionObservations(
      state
    ),

    ...buildLiveKnowledgeObservations(
      state
    ),
  ];
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