import { Plan } from "./planning";

export function completeMilestone(
  plan: Plan,
  milestone: string
): Plan {
  if (
    !plan.milestones.includes(milestone) ||
    plan.completedMilestones.includes(milestone)
  ) {
    return plan;
  }

  const completedMilestones = [
    ...plan.completedMilestones,
    milestone,
  ];

  const remaining = plan.milestones.filter(
    (m) => !completedMilestones.includes(m)
  );

  return {
    ...plan,

    completedMilestones,

    nextAction:
      remaining[0] ?? "Plan Complete",

    status:
      remaining.length === 0
        ? "completed"
        : "active",

    updatedAt: new Date(),
  };
}

export function getProgress(
  plan: Plan
): number {
  if (plan.milestones.length === 0) {
    return 100;
  }

  return Math.round(
    (plan.completedMilestones.length /
      plan.milestones.length) *
      100
  );
}