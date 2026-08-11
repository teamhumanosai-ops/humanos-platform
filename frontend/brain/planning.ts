import { extractGoal } from "./goalExtractor";
import { generatePlan } from "./planGenerator";
import { completeMilestone } from "./progressTracker";

export type PlanStatus =
  | "active"
  | "completed"
  | "paused";

export type GoalStatus =
  | "active"
  | "completed"
  | "paused"
  | "blocked";

export type Goal = {
  id: string;

  statement: string;

  status: GoalStatus;

  progress: number;

  priority: number;

  confidence: number;

  nextAction: string;

  obstacles: string[];

  dependencies: string[];

  createdAt: Date;

  updatedAt: Date;
};

export type Plan = {
  id: string;

  title: string;

  goal: string;

  description: string;

  status: PlanStatus;

  milestones: string[];

  completedMilestones: string[];

  nextAction: string;

  priority: number;

  confidence: number;

  createdAt: Date;

  updatedAt: Date;
};

const planStore =
  new Map<string, Plan>();

/*
|--------------------------------------------------------------------------
| Goal Intelligence
|--------------------------------------------------------------------------
*/

export function createGoalFromPlan(
  plan: Plan
): Goal {
  const progress =
    plan.milestones.length === 0
      ? 100
      : Math.round(
          (
            plan.completedMilestones.length /
            plan.milestones.length
          ) *
          100
        );

  const status: GoalStatus =
    plan.status === "completed"
      ? "completed"
      : "active";

  return {
    id: plan.id,

    statement:
      plan.goal,

    status,

    progress,

    priority:
      plan.priority,

    confidence:
      plan.confidence,

    nextAction:
      plan.nextAction,

    obstacles: [],

    dependencies: [],

    createdAt:
      plan.createdAt,

    updatedAt:
      plan.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| Query API
|--------------------------------------------------------------------------
*/

export function getAllPlans(): Plan[] {
  return Array.from(
    planStore.values()
  );
}

export function getPlan(
  id: string
): Plan | undefined {
  return planStore.get(id);
}

/*
|--------------------------------------------------------------------------
| Mutation API
|--------------------------------------------------------------------------
*/

export function createPlanFromMessage(
  message: string
): Plan | null {
  const goal =
    extractGoal(message);

  if (!goal) {
    return null;
  }

  const plan =
    generatePlan(goal);

  savePlan(plan);

  return plan;
}

export function savePlan(
  plan: Plan
): void {
  plan.updatedAt =
    new Date();

  planStore.set(
    plan.id,
    plan
  );
}

export function updatePlan(
  plan: Plan
): void {
  savePlan(plan);
}

export function deletePlan(
  id: string
): void {
  planStore.delete(id);
}

export function clearPlans(): void {
  planStore.clear();
}

/*
|--------------------------------------------------------------------------
| Planning Operations
|--------------------------------------------------------------------------
*/

export function completePlanMilestone(
  planId: string,
  milestone: string
): Plan | null {
  const plan =
    getPlan(planId);

  if (!plan) {
    return null;
  }

  const updated =
    completeMilestone(
      plan,
      milestone
    );

  savePlan(updated);

  return updated;
}