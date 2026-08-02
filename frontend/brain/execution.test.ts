import {
  createPlanFromMessage,
} from "./planning";

import {
  getBestDecision,
} from "./decision";

import {
  createExecutionFromDecision,
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
      decision
    );

  console.log(execution);
}