import type { GraphNode } from "./graph";
import type { Memory } from "./memory";
import type { HumanProfile } from "./profile/types";

export type ConversationMessage = {
  role: "user" | "assistant";
  message: string;
};

export type BrainState = {
  /*
  |--------------------------------------------------------------------------
  | Conversation
  |--------------------------------------------------------------------------
  */

  conversation: string;

  messages: ConversationMessage[];

  userMessage: string;

  /*
  |--------------------------------------------------------------------------
  | Cognitive State
  |--------------------------------------------------------------------------
  */

  intent: string | null;

  context: string | null;

  memory: string[];

  knowledge: string[];

  reasoning: string | null;

  plan: string | null;

  decision: string | null;

  response: string | null;

  /*
  |--------------------------------------------------------------------------
  | Unified Brain Context
  |--------------------------------------------------------------------------
  */

  memories: Memory[];

  graph: GraphNode[];

  timeline: string[];

  reflections: string[];

  profile: HumanProfile | null;

  /*
  |--------------------------------------------------------------------------
  | Runtime Context
  |--------------------------------------------------------------------------
  */

  currentGoal: string | null;

  currentPlanId: string | null;

  currentDecisionId: string | null;

  currentExecutionId: string | null;

  /*
  |--------------------------------------------------------------------------
  | Diagnostics
  |--------------------------------------------------------------------------
  */

  executedStages: string[];

  errors: string[];

  /*
  |--------------------------------------------------------------------------
  | Metadata
  |--------------------------------------------------------------------------
  */

  createdAt: Date;

  updatedAt: Date;
};

export function createBrainState(
  conversation: string,
  messages: ConversationMessage[],
  userMessage: string
): BrainState {
  const now = new Date();

  return {
    conversation,

    messages,

    userMessage,

    intent: null,

    context: null,

    memory: [],

    knowledge: [],

    reasoning: null,

    plan: null,

    decision: null,

    response: null,

    memories: [],

    graph: [],

    timeline: [],

    reflections: [],

    profile: null,

    currentGoal: null,

    currentPlanId: null,

    currentDecisionId: null,

    currentExecutionId: null,

    executedStages: [],

    errors: [],

    createdAt: now,

    updatedAt: now,
  };
}