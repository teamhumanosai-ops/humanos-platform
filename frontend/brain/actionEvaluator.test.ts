import {
  createPlanFromMessage,
} from "./planning";

import {
  evaluateActions,
} from "./actionEvaluator";

const plan =
  createPlanFromMessage(
    "I want to build Human OS"
  );

if (plan) {
  console.log(
    evaluateActions(plan)
  );
}