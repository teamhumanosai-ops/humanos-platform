import {
  createBrainState,
} from "../../brainState";

import {
  isActionAuthorized,
  evaluateActionAuthorization,
} from "../../actionRouting/authorization";

import {
  ActionDispatchStage,
} from "./actionDispatchStage";

import {
  ExecutionStage,
} from "./executionStage";

import {
  clearExecutions,
} from "../../execution";

import {
  createPlanFromMessage,
} from "../../planning";

import {
  saveDecision,
} from "../../decision";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization integrity verification failed: ${message}`
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
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    text: "Fetched source content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    markdown: "Fetched source content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  aiService: {} as never,
};

clearExecutions();

const tamperedState =
  createBrainState(
    "conversation",
    [],
    "Create a task"
  );

tamperedState.actionRoute = {
  id: "route-integrity-tool",
  kind: "tool",
  action: "task-create:Buy groceries",
  target: "tool",
  confidence: 0.95,
  executable: true,
};

const dispatchStage =
  new ActionDispatchStage();

await dispatchStage.execute(
  tamperedState
);

assert(
  tamperedState.actionAuthorization?.status ===
    "requires_confirmation",
  "tool authorization must initially require explicit confirmation"
);

assert(
  isActionAuthorized(
    tamperedState
  ) === false,
  "authorization helper must reject an unconfirmed tool route"
);

tamperedState.actionAuthorization = {
  ...tamperedState.actionAuthorization!,
  status: "allowed",
  reason: "tampered fixture",
};

assert(
  isActionAuthorized(
    tamperedState
  ) === false,
  "mutating the public authorization status must not manufacture consent"
);

const plan =
  createPlanFromMessage(
    "Search the latest status"
  ) ??
  createPlanFromMessage(
    "Build the latest status search"
  );

assert(
  plan !== null,
  "authorization integrity fixture must create a valid plan"
);

const decision = {
  id: "decision-integrity-execution",
  title: "Search status",
  description: "Verify execution authorization provenance.",
  selectedAction: "Search the latest status",
  alternatives: [],
  reason: "ATR authorization integrity regression coverage.",
  confidence: 0.95,
  createdAt: new Date(),
};

saveDecision(
  decision
);

const executionState =
  createBrainState(
    "conversation",
    [],
    "Search the latest status"
  );

executionState.currentPlanId =
  plan!.id;
executionState.currentGoal =
  plan!.goal;
executionState.currentDecisionId =
  decision.id;
executionState.actionRoute = {
  id: "route-integrity-execution",
  kind: "provider",
  action: decision.selectedAction,
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

await new ActionDispatchStage().execute(
  executionState
);

assert(
  executionState.actionAuthorization?.status ===
    "allowed",
  "read-only provider route must receive allowed authorization"
);

assert(
  executionState.actionDispatch !== null,
  "authorized provider route must receive dispatch"
);

executionState.actionAuthorization = {
  ...executionState.actionAuthorization!,
  routeId: "tampered-route",
};

await new ExecutionStage(
  services as never
).execute(executionState);

assert(
  executionState.errors.some(
    (error) =>
      error.includes(
        "authorization binding does not match"
      ) ||
      error.includes(
        "stored authorization is stale"
      ) ||
      error.includes(
        "dispatch authorization provenance does not match"
      ),
  "execution must reject authorization bound to a different route"
);

assert(
  executionState.runtimeStatus ===
    "blocked",
  "authorization provenance mismatch must block execution"
);

const actionTamperedState =
  createBrainState(
    "conversation",
    [],
    "Search the latest status"
  );

actionTamperedState.currentPlanId =
  plan!.id;
actionTamperedState.currentGoal =
  plan!.goal;
actionTamperedState.currentDecisionId =
  decision.id;
actionTamperedState.actionRoute = {
  id: "route-action-integrity",
  kind: "provider",
  action: decision.selectedAction,
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

await new ActionDispatchStage().execute(
  actionTamperedState
);

assert(
  actionTamperedState.actionAuthorization?.status ===
    "allowed",
  "fresh provider authorization must be allowed before action-binding tampering"
);

assert(
  actionTamperedState.actionDispatch !== null,
  "fresh authorized provider route must produce a dispatch"
);

actionTamperedState.actionAuthorization = {
  ...actionTamperedState.actionAuthorization!,
  action: "Tampered authorization action",
};

await new ExecutionStage(
  services as never
).execute(actionTamperedState);

assert(
  actionTamperedState.errors.some(
    (error) =>
      error.includes(
        "stored authorization is stale"
      ) ||
      error.includes(
        "authorization binding does not match"
      ) ||
      error.includes(
        "dispatch authorization provenance does not match"
      ),
  "execution must reject authorization whose exact action binding was tampered"
);

assert(
  actionTamperedState.runtimeStatus ===
    "blocked",
  "authorization action mismatch must block execution"
);

assert(
  evaluateActionAuthorization(
    actionTamperedState
  ).action ===
    decision.selectedAction,
  "current authorization must continue to derive the exact action from the validated route"
);

clearExecutions();

console.log(
  "ATR authorization integrity verification passed."
);
