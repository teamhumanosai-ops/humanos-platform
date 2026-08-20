import {
  createBrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  clearPlans,
  getPlan,
} from "../../planning";

import {
  PlanningStage,
} from "./planningStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CI-005 planning context verification failed: ${message}`
    );
  }
}

async function runVerification(): Promise<void> {
  clearPlans();

  const now =
    new Date().toISOString();

  const state =
    createBrainState(
      "conversation",
      [],
      "I need to finish the runtime validation."
    );

  state.intent =
    Intent.PLANNING;

  state.primaryLifeDomain =
    "work";

  state.graph = [
    {
      id: "runtime",
      label: "Runtime",
      type: "entity",
      properties: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "validation",
      label: "Validation",
      type: "entity",
      properties: {},
      createdAt: now,
      updatedAt: now,
    },
  ];

  state.graphEdges = [
    {
      id: "runtime-validation",
      from: "runtime",
      to: "validation",
      type: "depends_on",
      weight: 0.9,
      properties: {},
      createdAt: now,
    },
  ];

  state.reasoningObservations = [
    {
      source: "timeline",
      statement:
        "Runtime validation is the next planned step.",
      confidence: 0.92,
      relevance: 0.95,
      kind: "known_fact",
    },
  ];

  state.timeline = [
    "Runtime implementation was completed before validation.",
  ];

  state.reflections = [
    "Previous validation required careful follow-up.",
  ];

  state.memories = [
    {
      key: "workflow",
      value: "Validate implementation before release.",
      importance: 0.8,
      confidence: 0.9,
      updatedAt: now,
      kind: "long_term",
    },
  ];

  const result =
    await new PlanningStage().execute(
      state
    );

  assert(
    Boolean(
      result.currentPlanId
    ),
    "planning stage must persist and reference the generated plan"
  );

  assert(
    Boolean(
      result.goal
    ),
    "planning stage must create the canonical goal artifact"
  );

  assert(
    result.currentGoal ===
      result.goal?.statement,
    "currentGoal must remain synchronized with Goal Intelligence"
  );

  assert(
    result.plan?.includes(
      "Use relevant knowledge graph relationships to guide execution."
    ) === true,
    "graph context must influence the generated plan"
  );

  assert(
    result.plan?.includes(
      "Life domain context: work, Work"
    ) === true,
    "life domain context must influence the generated plan"
  );

  assert(
    result.plan?.includes(
      "Domain guidance:"
    ) === true,
    "life domain guidance must be preserved in the generated plan"
  );

  const persistedPlan =
    result.currentPlanId
      ? getPlan(
          result.currentPlanId
        )
      : undefined;

  assert(
    persistedPlan?.description.includes(
      "Life domain context: work, Work"
    ) === true,
    "life domain context must remain on the persisted plan artifact"
  );

  assert(
    result.goal?.dependencies.includes(
      "Validation"
    ) === true,
    "goal dependencies must be derived from graph relationships"
  );

  assert(
    result.goal?.obstacles.includes(
      "Previous validation required careful follow-up."
    ) === true,
    "goal obstacles must preserve relevant reflection evidence"
  );

  assert(
    result.response === null,
    "planning requests must remain available to downstream response generation"
  );

  clearPlans();

  console.log(
    "CI-005 planning context verification passed."
  );
}

void runVerification();
