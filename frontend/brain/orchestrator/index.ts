import { detectIntent, Intent } from "../intent";
import { executeSkills } from "../router";
import { buildContext } from "../context";
import { formatResponse } from "../formatter";
import { extractSimpleMemory } from "../memory";
import { extractTimelineEvent } from "../timeline";
import { aiService } from "../core/aiService";
import { initializeBrain } from "../bootstrap";

import { profileEngine } from "../profile/profileEngine";
import { enrichmentEngine } from "../enrichment";

import { CognitiveRuntime } from "../runtime/pipeline";
import { createRuntimeBrainState } from "../runtime/createBrainState";
import { runtimeServices } from "../runtime/runtimeServices";

export async function orchestrate(
  messages: {
    role: "user" | "assistant";
    message: string;
  }[]
): Promise<string> {
  await initializeBrain();

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUserMessage) {
    return "How can I help you?";
  }

  /**
   * -----------------------------
   * Cognitive Runtime
   * -----------------------------
   */

  const runtime = new CognitiveRuntime(
    runtimeServices
  );

  const brainState =
    createRuntimeBrainState(messages);

  await runtime.execute(brainState);

  /**
   * -----------------------------
   * Human Profile
   * -----------------------------
   */

  const profile = profileEngine.get();

  if (profile) {
    const enrichmentSuggestion =
      enrichmentEngine.getNextQuestion(profile);

    console.debug(
      "[Human OS] Next enrichment:",
      enrichmentSuggestion
    );
  }

  /**
   * -----------------------------
   * Memory
   * -----------------------------
   */

  await extractSimpleMemory(
    lastUserMessage.message
  );

  /**
   * -----------------------------
   * Timeline
   * -----------------------------
   */

  await extractTimelineEvent(
    lastUserMessage.message
  );

  /**
   * -----------------------------
   * Intent
   * -----------------------------
   */

  brainState.intent =
    detectIntent(
      lastUserMessage.message
    ).toString();

  const localResponse =
    await executeSkills(
      lastUserMessage.message
    );

  if (localResponse) {
    return formatResponse(localResponse);
  }

  /**
   * -----------------------------
   * Context
   * -----------------------------
   */

  let systemContext =
    await buildContext(
      lastUserMessage.message
    );

  switch (
    detectIntent(lastUserMessage.message)
  ) {
    case Intent.STARTUP_PLANNING:
      systemContext +=
        "\n\nThe user wants startup advice. Think like an experienced startup founder and advisor.";
      break;

    case Intent.LIVE_SEARCH:
      systemContext +=
        "\n\nThe user needs current information. Use live search when appropriate.";
      break;

    default:
      break;
  }

  brainState.context = systemContext;

  /**
   * -----------------------------
   * AI Response
   * -----------------------------
   */

  const response =
    await aiService(
      systemContext,
      messages
    );

  brainState.response = response;

  console.debug(
    "[Human OS Runtime]",
    brainState
  );

  return response;
}