import type {
  CitationSource,
} from "./websearch/citations";

export type ConversationMessage = {
  role: "user" | "assistant";
  message: string;
};

export type BrainState = {
  conversation: string;

  messages: ConversationMessage[];

  userMessage: string;

  intent: string | null;

  context: string | null;

  memory: string[];

  knowledge: string[];

  liveKnowledge: string[];

  citations: CitationSource[];

  reasoning: string | null;

  plan: string | null;

  decision: string | null;

  response: string | null;

  memories: import("./memory").Memory[];

  graph: import("./graph").GraphNode[];

  graphEdges: import("./graph").GraphEdge[];

  timeline: string[];

  reflections: string[];

  profile: import("./profile/types").HumanProfile | null;

  currentGoal: string | null;

  currentPlanId: string | null;

  currentDecisionId: string | null;

  currentExecutionId: string | null;

  executedStages: string[];

  diagnostics: {
    stage: string;
    startedAt: Date;
    completedAt: Date;
    durationMs: number;
    success: boolean;
    error: string | null;
  }[];

  errors: string[];

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

    liveKnowledge: [],

    citations: [],

    reasoning: null,

    plan: null,

    decision: null,

    response: null,

    memories: [],

    graph: [],

    graphEdges: [],

    timeline: [],

    reflections: [],

    profile: null,

    currentGoal: null,

    currentPlanId: null,

    currentDecisionId: null,

    currentExecutionId: null,

    executedStages: [],

    diagnostics: [],

    errors: [],

    createdAt: now,

    updatedAt: now,
  };
}