import { buildMemoryPrompt } from "../memory";
import { buildTimelinePrompt } from "../timeline";
import { buildReflectionPrompt } from "../reflection";
import { retrieveKnowledge } from "../knowledge";
import { profileEngine } from "../profile/profileEngine";

export async function buildContext(
  userMessage: string
): Promise<string> {
  const profile = profileEngine.get();

  const memory = await buildMemoryPrompt();

  const timeline =
    await buildTimelinePrompt();

  const reflections =
    await buildReflectionPrompt();

  const knowledge =
    await retrieveKnowledge(userMessage);

  let profileContext = "";

  if (profile) {
    profileContext = `
Current Human Profile:

Name:
${profile.identity.fullName}

Mission:
${profile.mission.currentMission ?? "Unknown"}

Biggest Goal:
${profile.mission.biggestGoal ?? "Unknown"}

Communication Style:
${
  profile.personality.communicationStyle ??
  "Natural"
}

Use this information naturally.

Do not mention it unless it helps answer the user's request.
`;
  }

  return `
${profileContext}

${memory}

${timeline}

${reflections}

${knowledge}

Human OS has access to its own Knowledge Base.

Use the user's memories, timeline, and reflections naturally when they help answer the user's request.

Reflections represent inferred long-term patterns, not direct user statements.

If relevant information exists in the Knowledge Base,
prefer using it instead of relying on general model knowledge.

If no relevant knowledge exists,
answer normally.
`;
}