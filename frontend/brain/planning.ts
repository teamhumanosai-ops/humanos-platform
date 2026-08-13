import {
  eq,
} from "drizzle-orm";

import {
  db,
} from "../database/db";

import {
  plans,
} from "../database/schema";

import {
  extractGoal,
} from "./goalExtractor";

import {
  generatePlan,
} from "./planGenerator";

import {
  completeMilestone,
} from "./progressTracker";

export type PlanStatus =
  | "active"
  | "completed"
  | "paused";

export type GoalStatus =
  | "active"
  | "completed"
  | "paused"
  | "blocked";

export type PlanningContext = {
  graphObservations?: string[];

  graphNodes?: Array<{
    id: string;
    label: string;
    type: string;
  }>;

  graphEdges?: Array<{
    from: string;
    to: string;
    type: string;
  }>;

  reasoningObservations?: Array<{
    statement: string;
    confidence: number;
    kind?: string;
  }>;

  timeline?: string[];

  reflections?: string[];

  memories?: string[];
};

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

/*
|--------------------------------------------------------------------------
| Goal Intelligence
|--------------------------------------------------------------------------
*/

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function goalTerms(
  statement: string
): string[] {
  return normalize(
    statement
  )
    .split(/\s+/)
    .map(
      (term) =>
        term.replace(
          /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,
          ""
        )
    )
    .filter(
      (term) =>
        term.length >= 3
    );
}

function calculateProgress(
  plan: Plan
): number {
  if (
    plan.milestones.length === 0
  ) {
    return 100;
  }

  return Math.round(
    (
      plan.completedMilestones.length /
      plan.milestones.length
    ) * 100
  );
}

function findRelevantGraphNodes(
  goal: Goal,
  context: PlanningContext
) {
  const terms =
    goalTerms(
      goal.statement
    );

  return (
    context.graphNodes ?? []
  ).filter(
    (node) => {
      const text =
        normalize(
          `${node.id} ${node.label}`
        );

      return terms.some(
        (term) =>
          text.includes(term)
      );
    }
  );
}

function buildDependencies(
  goal: Goal,
  context: PlanningContext
): string[] {
  const relevantNodes =
    findRelevantGraphNodes(
      goal,
      context
    );

  if (
    relevantNodes.length === 0
  ) {
    return [];
  }

  const relevantIds =
    new Set(
      relevantNodes.map(
        (node) =>
          node.id
      )
    );

  const nodesById =
    new Map(
      (
        context.graphNodes ??
        []
      ).map(
        (node) => [
          node.id,
          node,
        ]
      )
    );

  const dependencies =
    new Set<string>();

  for (
    const edge of
    context.graphEdges ?? []
  ) {
    if (
      edge.type !==
      "depends_on"
    ) {
      continue;
    }

    if (
      !relevantIds.has(
        edge.from
      )
    ) {
      continue;
    }

    const dependency =
      nodesById.get(
        edge.to
      );

    if (
      dependency
    ) {
      dependencies.add(
        dependency.label
      );
    }
  }

  return [
    ...dependencies,
  ].slice(
    0,
    5
  );
}

function containsObstacleSignal(
  value: string
): boolean {
  const text =
    normalize(
      value
    );

  const signals = [
    "blocked",
    "blocker",
    "delay",
    "delayed",
    "cannot",
    "can't",
    "unable",
    "issue",
    "problem",
    "risk",
    "uncertain",
    "uncertainty",
    "waiting",
  ];

  return signals.some(
    (signal) =>
      text.includes(
        signal
      )
  );
}

function buildObstacles(
  context: PlanningContext
): string[] {
  const candidates = [
    ...(context.reasoningObservations ?? [])
      .filter(
        (observation) =>
          observation.kind ===
            "uncertainty" ||
          observation.confidence <
            0.7
      )
      .map(
        (observation) =>
          observation.statement
      ),

    ...(context.timeline ?? [])
      .filter(
        containsObstacleSignal
      ),

    ...(context.reflections ?? [])
      .filter(
        containsObstacleSignal
      ),

    ...(context.memories ?? [])
      .filter(
        containsObstacleSignal
      ),
  ];

  return [
    ...new Set(
      candidates
        .map(
          (value) =>
            value.trim()
        )
        .filter(Boolean)
    ),
  ].slice(
    0,
    5
  );
}

export function createGoalFromPlan(
  plan: Plan
): Goal {
  return {
    id:
      plan.id,

    statement:
      plan.goal,

    status:
      plan.status ===
      "completed"
        ? "completed"
        : "active",

    progress:
      calculateProgress(
        plan
      ),

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

export function enrichGoalFromContext(
  goal: Goal,
  context: PlanningContext
): Goal {
  const obstacles =
    buildObstacles(
      context
    );

  const dependencies =
    buildDependencies(
      goal,
      context
    );

  const progress =
    goal.progress;

  let status:
    GoalStatus =
    "active";

  if (
    progress >= 100
  ) {
    status =
      "completed";
  } else if (
    obstacles.length > 0
  ) {
    status =
      "blocked";
  }

  return {
    ...goal,

    status,

    progress,

    obstacles,

    dependencies,

    updatedAt:
      new Date(),
  };
}

/*
|--------------------------------------------------------------------------
| Persistence
|--------------------------------------------------------------------------
*/

function serializePlan(
  plan: Plan
) {
  return {
    id:
      plan.id,

    title:
      plan.title,

    goal:
      plan.goal,

    description:
      plan.description,

    status:
      plan.status,

    milestones:
      JSON.stringify(
        plan.milestones
      ),

    completedMilestones:
      JSON.stringify(
        plan.completedMilestones
      ),

    nextAction:
      plan.nextAction,

    priority:
      plan.priority,

    confidence:
      plan.confidence,

    createdAt:
      plan.createdAt.toISOString(),

    updatedAt:
      plan.updatedAt.toISOString(),
  };
}

function deserializePlan(
  row: typeof plans.$inferSelect
): Plan {
  return {
    id:
      row.id,

    title:
      row.title,

    goal:
      row.goal,

    description:
      row.description,

    status:
      row.status as PlanStatus,

    milestones:
      JSON.parse(
        row.milestones
      ) as string[],

    completedMilestones:
      JSON.parse(
        row.completedMilestones
      ) as string[],

    nextAction:
      row.nextAction,

    priority:
      row.priority,

    confidence:
      row.confidence,

    createdAt:
      new Date(
        row.createdAt
      ),

    updatedAt:
      new Date(
        row.updatedAt
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Query API
|--------------------------------------------------------------------------
*/

export function getAllPlans(): Plan[] {
  return db
    .select()
    .from(plans)
    .all()
    .map(
      deserializePlan
    );
}

export function getPlan(
  id: string
): Plan | undefined {
  const row =
    db
      .select()
      .from(plans)
      .where(
        eq(
          plans.id,
          id
        )
      )
      .get();

  if (!row) {
    return undefined;
  }

  return deserializePlan(
    row
  );
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
    extractGoal(
      message
    );

  if (!goal) {
    return null;
  }

  const plan =
    generatePlan(
      goal
    );

  const graphObservations =
    context.graphObservations
      ?.filter(
        (observation) =>
          observation.trim().length > 0
      )
      .slice(
        0,
        3
      ) ?? [];

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
      ].join(
        "\n"
      );

    plan.nextAction =
      graphMilestone;
  }

  savePlan(
    plan
  );

  return plan;
}

export function savePlan(
  plan: Plan
): void {
  const updatedPlan: Plan = {
    ...plan,

    updatedAt:
      new Date(),
  };

  const row =
    serializePlan(
      updatedPlan
    );

  db
    .insert(plans)
    .values(row)
    .onConflictDoUpdate({
      target:
        plans.id,

      set: {
        title:
          row.title,

        goal:
          row.goal,

        description:
          row.description,

        status:
          row.status,

        milestones:
          row.milestones,

        completedMilestones:
          row.completedMilestones,

        nextAction:
          row.nextAction,

        priority:
          row.priority,

        confidence:
          row.confidence,

        updatedAt:
          row.updatedAt,
      },
    })
    .run();
}

export function updatePlan(
  plan: Plan
): void {
  savePlan(
    plan
  );
}

export function deletePlan(
  id: string
): void {
  db
    .delete(
      plans
    )
    .where(
      eq(
        plans.id,
        id
      )
    )
    .run();
}

export function clearPlans(): void {
  db
    .delete(
      plans
    )
    .run();
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
    getPlan(
      planId
    );

  if (!plan) {
    return null;
  }

  const updated =
    completeMilestone(
      plan,
      milestone
    );

  savePlan(
    updated
  );

  return updated;
}