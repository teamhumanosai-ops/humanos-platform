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
  Recommendation,
} from "./recommendation";

import type {
  CognitiveInference,
} from "./inference";

import type {
  ActionAuthorization,
} from "./actionRouting/authorization";

import type {
  ActionDispatch,
  ActionRoute,
} from "./actionRouting";

import type {
  ContentIntelligence,
} from "./contentIntelligence";

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
  conversation: string;
  messages: ConversationMessage[];
  userMessage: string;
  conversationContinuity: string;

  intent: string | null;
  context: string | null;
  memory: string[];
  knowledge: BrainKnowledge[];
  liveKnowledge: string[];
  reasoning: string | null;
  reasoningObservations: ReasoningObservation[];
  reasoningConfidence: number;
  inferences: CognitiveInference[];
  plan: string | null;
  decision: string | null;
  execution: string | null;
  response: string | null;
  outcome: RuntimeOutcome | null;

  memories: Memory[];
  graph: GraphNode[];
  graphEdges: GraphEdge[];
  timeline: string[];
  reflections: string[];
  profile: HumanProfile | null;
  citations: CitationSource[];
  contentIntelligence: ContentIntelligence | null;

  goal: Goal | null;
  predictions: Prediction[];
  recommendations: Recommendation[];

  actionRoute: ActionRoute | null;
  actionAuthorization: ActionAuthorization | null;
  actionDispatch: ActionDispatch | null;

  currentGoal: string | null;
  currentPlanId: string | null;
  currentDecisionId: string | null;
  currentExecutionId: string | null;

  runtimeStatus: BrainRuntimeStatus;

  executedStages: string[];
  diagnostics: BrainDiagnostic[];
  errors: string[];

  createdAt: Date;
  updatedAt: Date;
};

export function createBrainState(
  conversation: string,
  messages: ConversationMessage[],
  userMessage: string,
  conversationContinuity = ""
): BrainState {
  const now = new Date();

  return {
    conversation,
    messages,
    userMessage,
    conversationContinuity,

    intent: null,
    context: null,
    memory: [],
    knowledge: [],
    liveKnowledge: [],
    reasoning: null,
    reasoningObservations: [],
    reasoningConfidence: 0,
    inferences: [],
    plan: null,
    decision: null,
    execution: null,
    response: null,
    outcome: null,

    memories: [],
    graph: [],
    graphEdges: [],
    timeline: [],
    reflections: [],
    profile: null,
    citations: [],
    contentIntelligence: null,

    goal: null,
    predictions: [],
    recommendations: [],

    actionRoute: null,
    actionAuthorization: null,
    actionDispatch: null,

    currentGoal: null,
    currentPlanId: null,
    currentDecisionId: null,
    currentExecutionId: null,

    runtimeStatus: "in_progress",

    executedStages: [],
    diagnostics: [],
    errors: [],

    createdAt: now,
    updatedAt: now,
  };
}
