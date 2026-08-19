import {
  createBrainState,
} from "../../brainState";

import {
  saveDecision,
} from "../../decision";

import {
  createPlanFromMessage,
} from "../../planning";

import {
  clearExecutions,
  getAllExecutions,
} from "../../execution";

import {
  registerActionTool,
  clearActionTools,
} from "../../actionRouting";

import {
  ExecutionStage,
} from "./executionStage";

import type {
  RuntimeServices,
} from "../runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 end-to-end execution verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: `Search result for ${query}`,
    results: [],
    searchedAt: new Date().toISOString(),
  }),
  aiService: {} as RuntimeServices["aiService"],
} as RuntimeServices;

clearExecutions();
clearActionTools();

registerActionTool({
  id: "task-create",
  async execute(action) {
    return {
      summary:
        `Created task: ${action}`,
      metadata: {
        toolId:
          "task-create",
      },
    };
  },
});

const state =
  createBrainState(
    "conversation",
    [],
    "Create a task"
  );

const plan =
  createPlanFromMessage(
    "Create a task"
  );

const decision = {
  id: "decision-tool-execution",
  title: "Create task",
  description: "Execute the requested task creation.",
  selectedAction: "task-create:Buy groceries",
  alternatives: [],
  reason: "Explicit execution test.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(decision);

state.currentPlanId =
  plan.id;
state.currentGoal =
  plan.goal;
state.currentDecisionId =
  decision.id;
state.actionRoute = {
  id: "route-tool-execution",
  kind: "tool",
  action: decision.selectedAction,
  target: "tool",
  confidence: 0.95,
  executable: true,
};

await new ExecutionStage(
  services
).execute(state);

assert(
  state.errors.length === 0,
  "registered tools must execute without errors"
);

assert(
  state.execution?.includes(
    "Status: completed"
  ) === true,
  "successful tool execution must complete"
);

assert(
  state.execution?.includes(
    "Created task: Buy groceries"
  ) === true,
  "tool result must propagate into execution state"
);

const executions =
  getAllExecutions();

assert(
  executions[0]?.result?.status ===
    "completed",
  "normalized execution result must persist completion"
);

assert(
  executions[0]?.result?.metadata.toolId ===
    "task-create",
  "normalized execution metadata must persist tool identity"
);

clearActionTools();
clearExecutions();
