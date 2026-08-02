import { extractGoal } from "./goalExtractor";
import { generatePlan } from "./planGenerator";
import { completeMilestone } from "./progressTracker";

export type Plan = {
  id: string;

  title: string;

  goal: string;

  description: string;

  status: "active" | "completed" | "paused";

  milestones: string[];

  completedMilestones: string[];

  nextAction: string;

  priority: number;

  confidence: number;

  createdAt: Date;

  updatedAt: Date;
};

const planStore = new Map<string, Plan>();

export function getPlans(): Plan[] {
  return Array.from(planStore.values());
}

export function getPlan(id: string): Plan | undefined {
  return planStore.get(id);
}

export function savePlan(plan: Plan): void {
  planStore.set(plan.id, plan);
}

export function deletePlan(id: string): void {
  planStore.delete(id);
}

export function clearPlans(): void {
  planStore.clear();
}

export function createPlanFromMessage(
  message: string
): Plan | null {
  const goal = extractGoal(message);

  if (!goal) {
    return null;
  }

  const plan = generatePlan(goal);

  savePlan(plan);

  return plan;
}

export function completePlanMilestone(
  planId: string,
  milestone: string
): Plan | null {
  const plan = getPlan(planId);

  if (!plan) {
    return null;
  }

  const updated = completeMilestone(
    plan,
    milestone
  );

  savePlan(updated);

  return updated;
}