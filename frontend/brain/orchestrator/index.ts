import { initializeBrain } from "../bootstrap";

import {
  executeRuntime,
} from "../runtime";

import type {
  ConversationMessage,
} from "../brainState";

export type OrchestratorResult = {
  message: string;

  citations: {
    index: number;
    title: string;
    url: string;
    domain: string;
    publishedDate?: string;
  }[];
};

export async function orchestrate(
  messages: ConversationMessage[]
): Promise<OrchestratorResult> {
  await initializeBrain();

  const state =
    await executeRuntime(
      messages
    );

  return {
    message:
      state.response ??
      "I couldn't generate a response.",

    citations:
      state.citations,
  };
}