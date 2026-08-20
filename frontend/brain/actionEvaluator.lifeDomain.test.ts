import { evaluateActions } from "./actionEvaluator";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Life Domain action evaluation failed: ${message}`);
  }
}

const domainAwarePlan = {
  id: "life-domain-test",
  title: "Study plan",
  goal: "Prepare for an exam",
  description:
    "Life domain context: learning, Learning\nDomain guidance: Learning and education.",
  nextAction: "Complete learning review",
  priority: 8,
  confidence: 0.9,
  milestones: [
    "Complete learning review",
    "Schedule exam practice",
  ],
  completedMilestones: [],
  status: "active" as const,
};

const evaluations = evaluateActions(domainAwarePlan);
const aligned = evaluations.find(
  (evaluation) => evaluation.action === "Complete learning review"
);
const other = evaluations.find(
  (evaluation) => evaluation.action === "Schedule exam practice"
);

assert(
  Boolean(aligned),
  "domain-aware plan must evaluate its current action"
);
assert(
  Boolean(other),
  "domain-aware plan must preserve evaluation of other milestones"
);
assert(
  (aligned?.score ?? 0) > (other?.score ?? 0),
  "the life-domain-aligned current action must receive the stronger score"
);
assert(
  aligned?.reason.includes("Aligned with the detected life domain") ?? false,
  "the evaluation reason must expose the life-domain alignment"
);

console.log("Life Domain action evaluation verification passed.");
