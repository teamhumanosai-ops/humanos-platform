import {
  BrainState,
  BrainRuntimeStatus,
} from "../../brainState";

import {
  getDecision,
} from "../../decision";

import {
  getExecution,
  ExecutionStatus,
} from "../../execution";

import {
  createGoalFromPlan,
  enrichGoalFromContext,
  getPlan,
} from "../../planning";

import {
  createRuntimeOutcome,
} from "../outcome";

import {
  createRuntimeReflection,
} from "../../reflection";

import {
  BaseStage,
} from "./baseStage";

/**
 * OutcomeStage
 *
 * Finalizes the cognitive runtime by synchronizing:
 *
 * - Plan state
 * - Goal state
 * - Decision state
 * - Execution state
 * - Execution result
 * - Runtime outcome
 * - Runtime reflection
 * - Overall runtime status
 *
 * The stage also validates that the runtime identifiers
 * resolve to a coherent cognitive artifact chain using
 * relationships that actually exist in the current models.
 */
export class OutcomeStage
  extends BaseStage {
  readonly name =
    "Outcome";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const execution =
      state.currentExecutionId
        ? getExecution(
            state.currentExecutionId
          )
        : undefined;

    const decision =
      state.currentDecisionId
        ? getDecision(
            state.currentDecisionId
          )
        : undefined;

    const plan =
      state.currentPlanId
        ? getPlan(
            state.currentPlanId
          )
        : undefined;

    const chainErrors =
      validateArtifactChain(
        state,
        plan,
        decision,
        execution
      );

    if (
      chainErrors.length > 0
    ) {
      state.errors.push(
        ...chainErrors
      );
    }

    if (plan) {
      const initialGoal =
        createGoalFromPlan(
          plan
        );

      const goal =
        enrichGoalFromContext(
          initialGoal,
          {
            graphNodes:
              state.graph,
            graphEdges:
              state.graphEdges,
            reasoningObservations:
              state.reasoningObservations,
            timeline:
              state.timeline,
            reflections:
              state.reflections,
            memories:
              state.memory,
          }
        );

      if (
        execution?.status ===
        "blocked"
      ) {
        goal.status =
          "blocked";
      }

      state.goal =
        goal;

      state.currentGoal =
        goal.statement;

      state.plan =
        [
          `Plan: ${plan.title}`,
          `Goal: ${goal.statement}`,
          `Goal Status: ${goal.status}`,
          `Progress: ${goal.progress}%`,
          `Description: ${plan.description}`,
          `Status: ${plan.status}`,
          `Next Action: ${goal.nextAction}`,
          `Priority: ${goal.priority}`,
          `Confidence: ${goal.confidence}`,
          `Obstacles: ${
            goal.obstacles.length > 0
              ? goal.obstacles.join("; ")
              : "None identified"
          }`,
          `Dependencies: ${
            goal.dependencies.length > 0
              ? goal.dependencies.join("; ")
              : "None identified"
          }`,
          `Completed Milestones: ${
            plan.completedMilestones.length
          }/${plan.milestones.length}`,
          "Milestones:",
          ...plan.milestones.map(
            (milestone, index) => {
              const completed =
                plan.completedMilestones.includes(
                  milestone
                );

              return `${index + 1}. ${
                completed
                  ? "[completed]"
                  : "[pending]"
              } ${milestone}`;
            }
          ),
        ].join("\n");
    }

    if (decision) {
      state.decision =
        [
          `Decision: ${decision.title}`,
          `Description: ${decision.description}`,
          `Selected Action: ${decision.selectedAction}`,
          "Alternatives:",
          ...decision.alternatives.map(
            (alternative, index) =>
              `${index + 1}. ${alternative}`
          ),
          `Reason: ${decision.reason}`,
          `Confidence: ${decision.confidence}`,
        ].join("\n");
    }

    if (execution) {
      const executionResult =
        execution.result;

      state.execution =
        [
          `Execution: ${execution.title}`,
          `Action: ${execution.action}`,
          `Status: ${execution.status}`,
          `Plan ID: ${execution.planId}`,
          `Execution ID: ${execution.id}`,
          `Started At: ${
            execution.startedAt?.toISOString() ??
            "Not started"
          }`,
          `Completed At: ${
            execution.completedAt?.toISOString() ??
            "Not completed"
          }`,
          ...(executionResult
            ? [
                `Result Status: ${executionResult.status}`,
                `Result: ${executionResult.summary}`,
                ...(executionResult.error
                  ? [`Result Error: ${executionResult.error}`]
                  : []),
              ]
            : []),
        ].join("\n");
    }

    const executionResult =
      execution?.result ?? null;

    const outcomeResult =
      state.response?.trim() ||
      executionResult?.summary?.trim() ||
      null;

    state.outcome =
      createRuntimeOutcome({
        result: outcomeResult,
        errors: state.errors,
        executionId:
          execution?.id ?? state.currentExecutionId,
        executionStatus:
          execution?.status ?? null,
        executionResult,
        planId:
          execution?.planId ?? state.currentPlanId,
        decisionId:
          state.currentDecisionId,
        stagesExecuted:
          state.executedStages,
      });

    state.runtimeStatus =
      determineRuntimeStatus(
        state,
        execution?.status ?? null
      );

    const reflection =
      createRuntimeReflection(state);

    const reflectionEvidence =
      [
        reflection.summary,
        reflection.evidence,
        `Confidence: ${reflection.confidence}`,
      ].join("\n");

    if (
      !state.reflections.includes(
        reflectionEvidence
      )
    ) {
      state.reflections.push(
        reflectionEvidence
      );
    }

    return state;
  }
}

function validateArtifactChain(
  state: BrainState,
  plan: ReturnType<typeof getPlan>,
  decision: ReturnType<typeof getDecision>,
  execution: ReturnType<typeof getExecution>
): string[] {
  const errors: string[] = [];

  if (state.currentPlanId && !plan) {
    errors.push(
      `Outcome: plan ${state.currentPlanId} could not be resolved.`
    );
  }

  if (state.currentDecisionId && !decision) {
    errors.push(
      `Outcome: decision ${state.currentDecisionId} could not be resolved.`
    );
  }

  if (state.currentExecutionId && !execution) {
    errors.push(
      `Outcome: execution ${state.currentExecutionId} could not be resolved.`
    );
  }

  if (
    execution &&
    state.currentPlanId &&
    execution.planId !== state.currentPlanId
  ) {
    errors.push(
      `Outcome: execution ${execution.id} does not belong to plan ${state.currentPlanId}.`
    );
  }

  return [...new Set(errors)];
}

function determineRuntimeStatus(
  state: BrainState,
  executionStatus: ExecutionStatus | null
): BrainRuntimeStatus {
  if (state.errors.length > 0) {
    return "failed";
  }

  if (executionStatus === "blocked") {
    return "blocked";
  }

  if (
    executionStatus === "pending" ||
    executionStatus === "in_progress"
  ) {
    return "in_progress";
  }

  if (executionStatus === "completed") {
    return "completed";
  }

  if (state.response?.trim()) {
    return "completed";
  }

  return "in_progress";
}
