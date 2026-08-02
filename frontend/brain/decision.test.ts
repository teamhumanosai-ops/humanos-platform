import {
  createPlanFromMessage,
} from "./planning";

import {
  getBestDecision,
} from "./decision";

const plan =
  createPlanFromMessage(
    "I want to build Human OS"
  );

if (plan) {
  const decision =
    getBestDecision(plan);

  console.log("Decision");

  console.log(decision);
}