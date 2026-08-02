import {
  createPlanFromMessage,
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

  console.log("Initial Plan");

  console.log(getPlan(plan.id));

  startExecution(execution.id);

  completeExecution(execution.id);

  console.log("Updated Plan");

  console.log(getPlan(plan.id));
}