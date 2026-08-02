import {
  createPlanFromMessage,
} from "./planning";

import {
  calculateConfidence,
} from "./confidenceScorer";

const plan =
  createPlanFromMessage(
    "I want to build Human OS"
  );

if (plan) {
  for (const action of plan.milestones) {
    console.log(
      action,
      calculateConfidence(
        plan,
        action
      )
    );
  }
}