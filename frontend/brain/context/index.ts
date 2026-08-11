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

  predictions: string;

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
    (event) =>
      `- ${event}`
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

  const predictions =
    state.predictions.length > 0
      ? `
Relevant Predictions:

${state.predictions
  .map(
    (prediction) =>
      `- ${prediction.statement} [${prediction.kind}] Confidence: ${prediction.confidence.toFixed(
        2
      )}`
  )
  .join("\n")}

Predictions are possibilities derived from available cognitive evidence.
Do not treat predictions as established facts.
`
      : "";

  const prompt = `
${profileContext}

${memory}

${timeline}

${reflections}

${predictions}

${knowledgeContext.prompt}

Human OS has access to its own Knowledge Base.

Use the user's memories, timeline, reflections, and predictions naturally when they help answer the user's request.

Reflections represent inferred long-term patterns, not direct user statements.

Predictions represent possible future events or needs and must not be presented as certain facts.

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

    predictions,

    profile:
      state.profile,
  };
}