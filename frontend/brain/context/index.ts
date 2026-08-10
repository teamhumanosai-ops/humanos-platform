import {
  BrainState,
} from "../brainState";

import {
  buildKnowledgeContext,
} from "./knowledge";

import type {
  HumanProfile,
} from "../profile/types";

export type StructuredContext = {
  prompt: string;

  memory: string;

  knowledge: BrainKnowledge[];

  timeline: string;

  reflections: string;

  graph: string;

  profile:
    | HumanProfile
    | null;
};

export type BrainKnowledge = {
  source: string;

  text: string;

  score: number;
};

function buildTimelineGraphContext(
  state: BrainState
): string {
  const timelineNodes =
    state.graph.filter(
      (node) =>
        node.type ===
        "timeline"
    );

  if (
    timelineNodes.length === 0
  ) {
    return "";
  }

  const timelineIds =
    new Set(
      timelineNodes.map(
        (node) =>
          node.id
      )
    );

  const categoryEdges =
    state.graphEdges.filter(
      (edge) =>
        edge.type ===
          "belongs_to" &&
        timelineIds.has(
          edge.from
        )
    );

  const nodesById =
    new Map(
      state.graph.map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const lines =
    timelineNodes.map(
      (node) => {
        const categories =
          categoryEdges
            .filter(
              (edge) =>
                edge.from ===
                node.id
            )
            .map(
              (edge) =>
                nodesById.get(
                  edge.to
                )
            )
            .filter(
              (
                category
              ) =>
                Boolean(category)
            )
            .map(
              (
                category
              ) =>
                category!.label
            );

        if (
          categories.length === 0
        ) {
          return `• ${node.label}`;
        }

        return `• ${node.label} — category: ${categories.join(
          ", "
        )}`;
      }
    );

  return `
Knowledge Graph Timeline:

${lines.join("\n")}
`;
}

function buildGraphContext(
  state: BrainState
): string {
  if (
    state.graph.length === 0
  ) {
    return "";
  }

  const timelineContext =
    buildTimelineGraphContext(
      state
    );

  const nonTimelineNodes =
    state.graph
      .filter(
        (node) =>
          node.type !==
          "timeline"
      )
      .slice(0, 20);

  const lines =
    nonTimelineNodes.map(
      (node) =>
        `• ${node.label} (${node.type})`
    );

  const sections: string[] =
    [];

  if (
    lines.length > 0
  ) {
    sections.push(
      `
Knowledge Graph Entities:

${lines.join("\n")}
`
    );
  }

  if (
    timelineContext
  ) {
    sections.push(
      timelineContext
    );
  }

  return sections.join(
    "\n"
  );
}

export async function buildContext(
  state: BrainState
): Promise<StructuredContext> {
  const knowledgeContext =
    await buildKnowledgeContext(
      state.userMessage
    );

  let profileContext =
    "";

  if (state.profile) {
    profileContext = `
Current Human Profile:

Name:
${state.profile.identity.fullName}

Mission:
${
  state.profile.mission
    .currentMission ??
  "Unknown"
}

Biggest Goal:
${
  state.profile.mission
    .biggestGoal ??
  "Unknown"
}

Communication Style:
${
  state.profile.personality
    .communicationStyle ??
  "Natural"
}

Use this information naturally.

Do not mention it unless it helps answer the user's request.
`;
  }

  const memory =
    state.memories.length > 0
      ? `
Relevant Memories:

${state.memories
  .map(
    (memory) =>
      `• ${memory.key}: ${memory.value}`
  )
  .join("\n")}
`
      : "";

  const timeline =
    state.timeline.length > 0
      ? `
Relevant Timeline:

${state.timeline
  .map(
    (event) =>
      `• ${event}`
  )
  .join("\n")}
`
      : "";

  const reflections =
    state.reflections.length > 0
      ? `
Relevant Reflections:

${state.reflections
  .map(
    (reflection) =>
      `• ${reflection}`
  )
  .join("\n")}
`
      : "";

  const graph =
    buildGraphContext(
      state
    );

  const prompt = `
${profileContext}

${memory}

${timeline}

${reflections}

${graph}

${knowledgeContext}

Human OS has access to its own Knowledge Base and Knowledge Graph.

Use memories, timeline events, reflections, and graph relationships naturally when they help answer the user's request.

Timeline graph information represents structured historical information associated with the user's timeline.

Do not invent timeline events or graph relationships that are not present in the supplied context.

If relevant information exists in the Knowledge Base or Knowledge Graph,
prefer using it instead of relying on general model knowledge.

If no relevant information exists,
answer normally.
`;

  return {
    prompt,

    memory,

    knowledge:
      [],

    timeline,

    reflections,

    graph,

    profile:
      state.profile,
  };
}