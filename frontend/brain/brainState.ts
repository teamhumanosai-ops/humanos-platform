import type {
  GraphEdge,
  GraphNode,
} from "./graph";

import type {
  Memory,
} from "./memory";

import type {
  HumanProfile,
} from "./profile/types";

import type {
  ReasoningObservation,
} from "./reasoning";

import type {
  CitationSource,
} from "./websearch/citations";

import type {
  RuntimeOutcome,
} from "./runtime/outcome";

import type {
  Goal,
} from "./planning";

import type {
  Prediction,
} from "./prediction";

import type {
  CognitiveInference,
} from "./inference";

export type ConversationMessage = {
  role:
    | "user"
    | "assistant";

  message: string;
};

export type BrainKnowledge = {
  source: string;

  text: string;

  score: number;
};

export type BrainDiagnostic = {
  stage: string;

  startedAt: Date;

  completedAt: Date;

  durationMs: number;

  success: boolean;

  error:
    | string
    | null;
};

export type BrainRuntimeStatus =
  | "in_progress"
  | "completed"
  | "failed"
  | "blocked";

export type BrainState = {
  /*
  |--------------------------------------------------------------------------
  | Conversation
  |--------------------------------------------------------------------------
  */

  conversation: string;

  messages:
    ConversationMessage[];

  userMessage: string;

  conversationContinuity:
    string;

  /*
  |--------------------------------------------------------------------------
  | Cognitive State
  |--------------------------------------------------------------------------
  */

  intent:
    | string
    | null;

  context:
    | string
    | null;

  memory:
    string[];

  knowledge:
    BrainKnowledge[];

  liveKnowledge:
    string[];

  reasoning:
    | string
    | null;

  reasoningObservations:
    ReasoningObservation[];

  reasoningConfidence:
    number;

  inferences:
    CognitiveInference[];

  plan:
    | string
    | null;

  decision:
    | string
    | null;

  execution:
    | string
    | null;

  response:
    | string
    | null;

  outcome:
    | RuntimeOutcome
    | null;

  /*
  |--------------------------------------------------------------------------
  | Unified Brain Context
  |--------------------------------------------------------------------------
  */

  memories:
    Memory[];

  graph:
    GraphNode[];

  graphEdges:
    GraphEdge[];

  timeline:
    string[];

  reflections:
    string[];

  profile:
    HumanProfile
    | null;

  citations:
    CitationSource[];

  /*
  |--------------------------------------------------------------------------
  | Goal Intelligence
  |--------------------------------------------------------------------------
  */

  goal:
    Goal
    | null;

  /*
  |--------------------------------------------------------------------------
  | Prediction Intelligence
  |--------------------------------------------------------------------------
  */

  predictions:
    Prediction[];

  /*
  |--------------------------------------------------------------------------
  | Runtime Context
  |--------------------------------------------------------------------------
  */

  currentGoal:
    | string
    | null;

  currentPlanId:
    | string
    | null;

  currentDecisionId:
    | string
    | null;

  currentExecutionId:
    | string
    | null;

  /*
  |--------------------------------------------------------------------------
  | Runtime Status
  |--------------------------------------------------------------------------
  */

  runtimeStatus:
    BrainRuntimeStatus;

  /*
  |--------------------------------------------------------------------------
  | Runtime Diagnostics
  |--------------------------------------------------------------------------
  */

  executedStages:
    string[];

  diagnostics:
    BrainDiagnostic[];

  errors:
    string[];

  /*
  |--------------------------------------------------------------------------
  | Metadata
  |--------------------------------------------------------------------------
  */

  createdAt:
    Date;

  updatedAt:
    Date;
};

export function createBrainState(
  conversation: string,
  messages:
    ConversationMessage[],
  userMessage: string,
  conversationContinuity = ""
): BrainState {
  const now =
    new Date();

  return {
    /*
    |--------------------------------------------------------------------------
    | Conversation
    |--------------------------------------------------------------------------
    */

    conversation,

    messages,

    userMessage,

    conversationContinuity,

    /*
    |--------------------------------------------------------------------------
    | Cognitive State
    |--------------------------------------------------------------------------
    */

    intent:
      null,

    context:
      null,

    memory:
      [],

    knowledge:
      [],

    liveKnowledge:
      [],

    reasoning:
      null,

    reasoningObservations:
      [],

    reasoningConfidence:
      0,

    inferences:
      [],

    plan:
      null,

    decision:
      null,

    execution:
      null,

    response:
      null,

    outcome:
      null,

    /*
    |--------------------------------------------------------------------------
    | Unified Brain Context
    |--------------------------------------------------------------------------
    */

    memories:
      [],

    graph:
      [],

    graphEdges:
      [],

    timeline:
      [],

    reflections:
      [],

    profile:
      null,

    citations:
      [],

    /*
    |--------------------------------------------------------------------------
    | Goal Intelligence
    |--------------------------------------------------------------------------
    */

    goal:
      null,

    /*
    |--------------------------------------------------------------------------
    | Prediction Intelligence
    |--------------------------------------------------------------------------
    */

    predictions:
      [],

    /*
    |--------------------------------------------------------------------------
    | Runtime Context
    |--------------------------------------------------------------------------
    */

    currentGoal:
      null,

    currentPlanId:
      null,

    currentDecisionId:
      null,

    currentExecutionId:
      null,

    /*
    |--------------------------------------------------------------------------
    | Runtime Status
    |--------------------------------------------------------------------------
    */

    runtimeStatus:
      "in_progress",

    /*
    |--------------------------------------------------------------------------
    | Runtime Diagnostics
    |--------------------------------------------------------------------------
    */

    executedStages:
      [],

    diagnostics:
      [],

    errors:
      [],

    /*
    |--------------------------------------------------------------------------
    | Metadata
    |--------------------------------------------------------------------------
    */

    createdAt:
      now,

    updatedAt:
      now,
  };
}
