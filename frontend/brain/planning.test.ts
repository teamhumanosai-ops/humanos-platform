import {
  createPlanFromMessage,
  completePlanMilestone,
} from "./planning";

const plan = createPlanFromMessage(
  "I want to build Human OS"
);

console.log(plan);

if (plan) {
  const updated = completePlanMilestone(
    plan.id,
    "Research"
  );

  console.log(updated);
}