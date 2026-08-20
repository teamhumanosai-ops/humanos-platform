import {
  evaluateActions,
} from "./actionEvaluator";

import type {
  Plan,
} from "./planning";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Life-domain decision integration failed: ${message}`
    );
  }
}

const plan: Plan = {
  id: "life-domain-decision-test",
  title: "Work execution",
  goal: "Finish the work project",
  description:
    "Plan for a professional project.\nLife domain context: work, career\nDomain guidance: Employment, career execution, and professional responsibilities.",
  status: "active",
  milestones: [
    "Complete work review",
    "Book personal appointment",
  ],
  completedMilestones: [],
  nextAction: "Book personal appointment",
  priority: 0.8,
  confidence: 0.8,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const evaluations =
  evaluateActions(
    plan
  );

const workEvaluation =
  evaluations.find(
    (item) =>
      item.action ===
      "Complete work review"
  );

const personalEvaluation =
  evaluations.find(
    (item) =>
      item.action ===
      "Book personal appointment"
  );

assert(
  Boolean(workEvaluation),
  "work milestone should be evaluated"
);

assert(
  Boolean(personalEvaluation),
  "non-domain milestone should be evaluated"
);

assert(
  (workEvaluation?.score ?? 0) >
    (personalEvaluation?.score ?? 0),
  "life-domain alignment should improve the domain-relevant action score"
);

assert(
  workEvaluation?.reason.includes(
    "Aligned with the detected life domain"
  ) ?? false,
  "life-domain alignment should be visible in the evaluation reason"
);

console.log(
  "Life-domain decision integration verification passed."
);
