import {
  Plan,
} from "./planning";

import {
  calculateConfidence,
} from "./confidenceScorer";

export type ActionEvaluation = {
  action: string;

  score: number;

  reason: string;
};

function hasGraphContext(
  plan: Plan
): boolean {
  return (
    plan.description
      .toLowerCase()
      .includes(
        "graph context:"
      ) ||
    plan.description
      .toLowerCase()
      .includes(
        "knowledge graph context"
      )
  );
}

function hasLifeDomainContext(
  plan: Plan
): boolean {
  return plan.description
    .toLowerCase()
    .includes(
      "life domain context:"
    );
}

function calculateGraphBonus(
  plan: Plan,
  action: string
): number {
  if (
    !hasGraphContext(
      plan
    )
  ) {
    return 0;
  }

  /*
  |--------------------------------------------------------------------------
  | The graph context currently reaches the
  | Decision Engine through the Plan produced
  | by PlanningStage.
  |
  | The immediate next action is the action
  | most directly associated with the current
  | graph-aware plan.
  |--------------------------------------------------------------------------
  */

  if (
    action ===
    plan.nextAction
  ) {
    return 10;
  }

  return 0;
}

function calculateLifeDomainBonus(
  plan: Plan,
  action: string
): number {
  if (
    !hasLifeDomainContext(
      plan
    )
  ) {
    return 0;
  }

  const domainSignals =
    plan.description
      .toLowerCase()
      .split(
        "life domain context:"
      )[1]
      ?.split("\n")[0]
      ?.split(",")
      .map(
        (value) =>
          value.trim()
      )
      .filter(Boolean) ?? [];

  if (
    domainSignals.length === 0
  ) {
    return 0;
  }

  const normalizedAction =
    action.toLowerCase();

  return domainSignals.some(
    (signal) =>
      normalizedAction.includes(
        signal
      )
  )
    ? 8
    : 0;
}

export function evaluateActions(
  plan: Plan
): ActionEvaluation[] {
  const graphAware =
    hasGraphContext(
      plan
    );

  const lifeDomainAware =
    hasLifeDomainContext(
      plan
    );

  return plan.milestones.map(
    (
      milestone
    ) => {
      const completed =
        plan.completedMilestones.includes(
          milestone
        );

      if (
        completed
      ) {
        return {
          action:
            milestone,

          score:
            0,

          reason:
            "Already completed",
        };
      }

      const baseScore =
        calculateConfidence(
          plan,
          milestone
        );

      const graphBonus =
        calculateGraphBonus(
          plan,
          milestone
        );

      const lifeDomainBonus =
        calculateLifeDomainBonus(
          plan,
          milestone
        );

      const score =
        Math.min(
          baseScore +
            graphBonus +
            lifeDomainBonus,
          100
        );

      const reasons =
        [
          milestone ===
          plan.nextAction
            ? "Highest confidence based on current plan progress"
            : "Valid future milestone",

          graphAware &&
          graphBonus > 0
            ? "Supported by available knowledge graph context"
            : null,

          lifeDomainAware &&
          lifeDomainBonus > 0
            ? "Aligned with the detected life domain"
            : null,
        ].filter(
          (
            value
          ): value is string =>
            Boolean(value)
        );

      return {
        action:
          milestone,

        score,

        reason:
          reasons.join(
            "; "
          ),
      };
    }
  );
}
