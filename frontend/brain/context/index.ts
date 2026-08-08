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

  profile: HumanProfile | null;
};

export type BrainKnowledge = {
  source: string;

  text: string;

  score: number;
};

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
  state.profile.mission.currentMission ??
  "Unknown"
}

Biggest Goal:
${
  state.profile.mission.biggestGoal ??
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
Known facts about the user:

${state.memories
  .map(
    (memory) =>
      `- ${memory.key}: ${memory.value}`
  )
  .join("\n")}

Use these naturally in conversation.
Prefer higher-importance memories.
Never invent facts.
`
      : "";

  const timeline =
    state.timeline.length > 0
      ? `
Relevant Timeline:

${state.timeline
  .map(
    (event) => `- ${event}`
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
      `- ${reflection}`
  )
  .join("\n")}
`
      : "";

  const prompt = `
${profileContext}

${memory}

${timeline}

${reflections}

${knowledgeContext.prompt}

Human OS has access to its own Knowledge Base.

Use the user's memories, timeline, and reflections naturally when they help answer the user's request.

Reflections represent inferred long-term patterns, not direct user statements.

If relevant information exists in the Knowledge Base,
prefer using it instead of relying on general model knowledge.

If no relevant knowledge exists,
answer normally.
`;

  return {
    prompt,

    memory,

    knowledge:
      knowledgeContext.results,

    timeline,

    reflections,

    profile:
      state.profile,
  };
}