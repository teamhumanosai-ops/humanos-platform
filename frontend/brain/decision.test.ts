import {
  createPlanFromMessage,
} from "./planning";

import {
  createDecisionFromPlan,
} from "./decision";

const plan =
  createPlanFromMessage(
    "I want to build Human OS"
  );

if (plan) {
  const decision =
    createDecisionFromPlan(plan);

  console.log(decision);
}