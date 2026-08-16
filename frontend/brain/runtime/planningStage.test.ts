import {
  createBrainState,
} from "../brainState";

import {
  Intent,
} from "../intent";

import {
  PlanningStage,
} from "./steps/planningStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `BRA-003.4 verification failed: ${message}`
    );
  }
}

async function verifyNormalConversation(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Hello Human OS"
    );

  state.intent =
    Intent.GENERAL_CHAT;

  await new PlanningStage().execute(
    state
  );

  assert(
    state.plan === null,
    "normal conversation must not create a plan"
  );

  assert(
    state.currentGoal === null,
    "normal conversation must not create a current goal"
  );

  assert(
    state.currentPlanId === null,
    "normal conversation must not create a plan id"
  );
}

async function verifyPlanningRequest(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "I want to build Human OS"
    );

  state.intent =
    Intent.PLANNING;

  await new PlanningStage().execute(
    state
  );

  assert(
    state.plan !== null,
    "planning request must create a plan"
  );

  assert(
    state.currentGoal !== null,
    "planning request must create a current goal"
  );

  assert(
    state.currentPlanId !== null,
    "planning request must create a plan id"
  );
}

async function verifyActionableTask(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "I need to finish the Human OS planner"
    );

  state.intent =
    Intent.TASK_MANAGEMENT;

  await new PlanningStage().execute(
    state
  );

  assert(
    state.plan !== null,
    "actionable task-management request must create a plan"
  );

  assert(
    state.currentGoal !== null,
    "actionable task-management request must create a goal"
  );

  assert(
    state.currentPlanId !== null,
    "actionable task-management request must create a plan id"
  );
}

async function verifyInformationalTask(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Show me my tasks"
    );

  state.intent =
    Intent.TASK_MANAGEMENT;

  await new PlanningStage().execute(
    state
  );

  assert(
    state.plan === null,
    "informational task query must not fabricate a plan"
  );

  assert(
    state.currentGoal === null,
    "informational task query must not fabricate a goal"
  );

  assert(
    state.currentPlanId === null,
    "informational task query must not fabricate a plan id"
  );
}

async function verifyStartupPlanning(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Plan my startup"
    );

  state.intent =
    Intent.STARTUP_PLANNING;

  await new PlanningStage().execute(
    state
  );

  assert(
    state.plan !== null,
    "startup planning request must create a plan"
  );

  assert(
    state.currentGoal !== null,
    "startup planning request must create a goal"
  );
}

async function verifyExistingResponseIsRespected(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "I want to build Human OS"
    );

  state.intent =
    Intent.PLANNING;

  state.response =
    "The request has already been handled.";

  await new PlanningStage().execute(
    state
  );

  assert(
    state.plan === null,
    "PlanningStage must not create a plan after a response already exists"
  );
}

async function runBRA0034Verification(): Promise<void> {
  await verifyNormalConversation();

  await verifyPlanningRequest();

  await verifyActionableTask();

  await verifyInformationalTask();

  await verifyStartupPlanning();

  await verifyExistingResponseIsRespected();

  console.log(
    "BRA-003.4 verification passed."
  );
}

void runBRA0034Verification();