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
      `ATR-002 end-to-end execution verification failed: ${message}`
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
  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test source",
    text: "Fetched source content",
    status: 200,
    contentType: "text/html",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl execution source",
    markdown: "Firecrawl fetched source content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
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

const contentState =
  createBrainState(
    "conversation",
    [],
    "Open the source page"
  );

const contentPlan =
  createPlanFromMessage(
    "Open the source page"
  );

const contentDecision = {
  id: "decision-web-content-execution",
  title: "Open source page",
  description: "Fetch the requested source page.",
  selectedAction: "Open https://example.com/source",
  alternatives: [],
  reason: "Explicit web-content execution test.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(
  contentDecision
);

contentState.currentPlanId =
  contentPlan.id;
contentState.currentGoal =
  contentPlan.goal;
contentState.currentDecisionId =
  contentDecision.id;
contentState.actionRoute = {
  id: "route-web-content-execution",
  kind: "provider",
  action:
    contentDecision.selectedAction,
  target: "web-content",
  confidence: 0.95,
  executable: true,
};

await new ExecutionStage(
  services
).execute(contentState);

assert(
  contentState.errors.length === 0,
  "web-content provider execution must complete without errors"
);

assert(
  contentState.execution?.includes(
    "Firecrawl fetched source content"
  ) === true,
  "Firecrawl content result must propagate into execution state"
);

const contentExecution =
  getAllExecutions().find(
    (execution) =>
      execution.id ===
      contentState.currentExecutionId
  );

assert(
  contentExecution?.result?.status ===
    "completed",
  "web-content execution must persist completion"
);

assert(
  contentExecution?.result?.metadata.provider ===
    "firecrawl",
  "web-content execution must persist its provider identity"
);

registerActionTool({
  id: "failing-tool",
  async execute() {
    throw new Error(
      "intentional tool failure"
    );
  },
});

const failedState =
  createBrainState(
    "conversation",
    [],
    "Run failing tool"
  );

const failedDecision = {
  id: "decision-tool-failure",
  title: "Run failing tool",
  description: "Verify execution failure propagation.",
  selectedAction: "failing-tool:trigger failure",
  alternatives: [],
  reason: "Explicit failure test.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(
  failedDecision
);

failedState.currentPlanId =
  plan.id;
failedState.currentGoal =
  plan.goal;
failedState.currentDecisionId =
  failedDecision.id;
failedState.actionRoute = {
  id: "route-tool-failure",
  kind: "tool",
  action:
    failedDecision.selectedAction,
  target: "tool",
  confidence: 0.95,
  executable: true,
};

await new ExecutionStage(
  services
).execute(failedState);

assert(
  failedState.errors.some(
    (error) =>
      error.includes(
        "intentional tool failure"
      )
  ),
  "tool failures must propagate into BrainState errors"
);

const failedExecution =
  getAllExecutions().find(
    (execution) =>
      execution.id ===
      failedState.currentExecutionId
  );

assert(
  failedExecution?.status ===
    "blocked",
  "failed tool execution must be blocked"
);

assert(
  failedExecution?.result?.status ===
    "blocked",
  "blocked execution must persist a normalized result"
);

assert(
  failedExecution?.result?.error ===
    "intentional tool failure",
  "execution result must preserve the failure reason"
);

clearActionTools();
clearExecutions();
