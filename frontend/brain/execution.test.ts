import {
  createPlanFromMessage,
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
      decision
    );

  console.log("Created");

  console.log(execution);

  const started =
    startExecution(execution.id);

  console.log("Started");

  console.log(started);

  const completed =
    completeExecution(execution.id);

  console.log("Completed");

  console.log(completed);
}