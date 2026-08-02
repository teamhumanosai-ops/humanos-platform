import {
  createPlanFromMessage,
  completePlanMilestone,
  getPlan,
} from "./planning";

import {
  getBestDecision,
} from "./decision";

import {
  createExecutionFromDecision,
  startExecution,
  completeExecution,
} from "./execution";

const plan =
  createPlanFromMessage(
    "I want to build Human OS"
  );

if (plan) {
  const decision =
    getBestDecision(plan);

  const execution =
    createExecutionFromDecision(
      decision,
      plan.id
    );

  startExecution(execution.id);

  completeExecution(execution.id);

  completePlanMilestone(
    plan.id,
    execution.action
  );

  console.log(
    getPlan(plan.id)
  );
}