import { extractGoal } from "./goalExtractor";
import { generatePlan } from "./planGenerator";
import { completeMilestone } from "./progressTracker";

export type PlanStatus =
  | "active"
  | "completed"
  | "paused";

export type PlanningContext = {
  graphObservations?: string[];
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
  return createPlanFromMessageWithContext(
    message
  );
}

export function createPlanFromMessageWithContext(
  message: string,
  context: PlanningContext = {}
): Plan | null {
  const goal =
    extractGoal(message);

  if (!goal) {
    return null;
  }

  const plan =
    generatePlan(goal);

  const graphObservations =
    context.graphObservations
      ?.filter(
        (observation) =>
          observation.trim().length > 0
      )
      .slice(0, 3) ?? [];

  if (
    graphObservations.length > 0
  ) {
    const graphMilestone =
      "Use relevant knowledge graph relationships to guide execution.";

    if (
      !plan.milestones.includes(
        graphMilestone
      )
    ) {
      plan.milestones = [
        graphMilestone,
        ...plan.milestones,
      ];
    }

    plan.description =
      [
        plan.description,

        "Graph context:",
        ...graphObservations.map(
          (observation) =>
            `- ${observation}`
        ),
      ].join("\n");

    plan.nextAction =
      graphMilestone;
  }

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