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

const MAX_OBSERVATIONS_PER_SOURCE = 5;

const MAX_TOTAL_OBSERVATIONS = 12;

const MIN_RELEVANCE = 0.12;

function normalize(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getTokens(
  value: string
): string[] {
  return [
    ...new Set(
      normalize(value)
        .split(" ")
        .filter(
          (token) =>
            token.length >= 3
        )
    ),
  ];
}

function calculateRelevance(
  statement: string,
  requestTokens: string[]
): number {
  if (
    requestTokens.length === 0
  ) {
    return 1;
  }

  const normalizedStatement =
    normalize(statement);

  if (
    !normalizedStatement
  ) {
    return 0;
  }

  const matched =
    requestTokens.filter(
      (token) =>
        normalizedStatement.includes(
          token
        )
    ).length;

  if (
    matched === 0
  ) {
    return 0;
  }

  return Math.min(
    1,
    matched /
      requestTokens.length
  );
}

function limitItems<T>(
  items: T[],
  limit =
    MAX_OBSERVATIONS_PER_SOURCE
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
  requestTokens: string[],
  preferredKind?:
    ReasoningObservationKind
): ReasoningObservation {
  return {
    statement:
      statement
        .replace(
          /\s+/g,
          " "
        )
        .trim(),

    confidence:
      Math.max(
        0,
        Math.min(
          1,
          confidence
        )
      ),

    relevance:
      calculateRelevance(
        statement,
        requestTokens
      ),

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
  state: BrainState,
  requestTokens: string[]
): ReasoningObservation[] {
  return limitItems(
    state.memories
      .map(
        (memory) =>
          createObservation(
            `${memory.key}: ${memory.value}`,
            memory.confidence,
            "memory",
            requestTokens
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
  state: BrainState,
  requestTokens: string[]
): ReasoningObservation[] {
  return limitItems(
    state.knowledge
      .map(
        (knowledge) =>
          createObservation(
            knowledge.text,
            knowledge.score,
            "knowledge",
            requestTokens
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
  state: BrainState,
  requestTokens: string[]
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
          requestTokens,
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
  state: BrainState,
  requestTokens: string[]
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
            "timeline",
            requestTokens
          )
      )
  );
}

function buildReflectionObservations(
  state: BrainState,
  requestTokens: string[]
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
            requestTokens,
            "derived_inference"
          )
      )
  );
}

function buildPredictionObservations(
  state: BrainState,
  requestTokens: string[]
): ReasoningObservation[] {
  return limitItems(
    state.predictions
      .map(
        (prediction) =>
          createObservation(
            prediction.statement,
            prediction.confidence,
            "prediction",
            requestTokens,
            "derived_inference"
          )
      )
  );
}

function buildLiveKnowledgeObservations(
  state: BrainState,
  requestTokens: string[]
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
            "live_knowledge",
            requestTokens
          )
      )
  );
}

function buildObservations(
  state: BrainState
): ReasoningObservation[] {
  const requestTokens =
    getTokens(
      state.userMessage
    );

  const observations = [
    ...buildMemoryObservations(
      state,
      requestTokens
    ),

    ...buildKnowledgeObservations(
      state,
      requestTokens
    ),

    ...buildGraphObservations(
      state,
      requestTokens
    ),

    ...buildTimelineObservations(
      state,
      requestTokens
    ),

    ...buildReflectionObservations(
      state,
      requestTokens
    ),

    ...buildPredictionObservations(
      state,
      requestTokens
    ),

    ...buildLiveKnowledgeObservations(
      state,
      requestTokens
    ),
  ];

  return observations
    .filter(
      (observation) =>
        observation.relevance >=
        MIN_RELEVANCE
    )
    .sort(
      (a, b) => {
        const aScore =
          a.relevance * 0.65 +
          a.confidence * 0.35;

        const bScore =
          b.relevance * 0.65 +
          b.confidence * 0.35;

        return bScore -
          aScore;
      }
    )
    .slice(
      0,
      MAX_TOTAL_OBSERVATIONS
    );
}

export function reason(
  state: BrainState
): ReasoningResult {
  const observations =
    buildObservations(
      state
    );

  const userRequest =
    state.userMessage
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  const summary =
    observations.length > 0
      ? `The request "${userRequest}" can be answered using ${observations.length} relevant cognitive observations.`
      : `The request "${userRequest}" does not currently have sufficiently relevant structured reasoning evidence.`;

  const confidence =
    observations.length === 0
      ? 0.25
      : observations.reduce(
          (
            total,
            observation
          ) =>
            total +
            observation.confidence *
              observation.relevance,
          0
        ) /
        observations.reduce(
          (
            total,
            observation
          ) =>
            total +
            observation.relevance,
          0
        );

  return {
    summary,

    observations,

    confidence,
  };
}
