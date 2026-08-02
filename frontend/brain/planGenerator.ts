import { Plan } from "./planning";

export function generatePlan(
  goal: string
): Plan {
  const now = new Date();

  return {
    id: crypto.randomUUID(),

    title: goal,

    goal,

    description: `Plan for ${goal}`,

    status: "active",

    milestones: [
      "Research",
      "Create roadmap",
      "Execute plan",
      "Review progress",
    ],

    completedMilestones: [],

    nextAction: "Research",

    priority: 1,

    confidence: 0.9,

    createdAt: now,

    updatedAt: now,
  };
}