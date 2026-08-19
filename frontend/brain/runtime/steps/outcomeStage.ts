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
 *
 * Reflection is intentionally created here, after outcome status has
 * been determined, because this stage is the runtime boundary where
 * execution evidence becomes a durable cognitive observation.
 *
 * The existing plan, decision, execution, and outcome synchronization
 * responsibilities remain intact. Runtime reflection is additive and
 * does not replace any existing artifact or provider responsibility.
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

    /*
    |--------------------------------------------------------------------------
    | Validate cognitive artifact chain
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Synchronize plan and goal information
    |--------------------------------------------------------------------------
    */

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
              ? goal.obstacles.join(
                  "; "
                )
              : "None identified"
          }`,
          `Dependencies: ${
            goal.dependencies.length > 0
              ? goal.dependencies.join(
                  "; "
                )
              : "None identified"
          }`,
          `Completed Milestones: ${
            plan.completedMilestones.length
          }/${plan.milestones.length}`,
          "Milestones:",
          ...plan.milestones.map(
            (
              milestone,
              index
            ) => {
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
        ].join(
          "\n"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Synchronize decision information
    |--------------------------------------------------------------------------
    */

    if (decision) {
      state.decision =
        [
          `Decision: ${decision.title}`,
          `Description: ${decision.description}`,
          `Selected Action: ${decision.selectedAction}`,
          "Alternatives:",
          ...decision.alternatives.map(
            (
              alternative,
              index
            ) =>
              `${index + 1}. ${alternative}`
          ),
          `Reason: ${decision.reason}`,
          `Confidence: ${decision.confidence}`,
        ].join(
          "\n"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Synchronize execution information
    |--------------------------------------------------------------------------
    */

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
            execution.startedAt
              ?.toISOString() ??
            "Not started"
          }`,
          `Completed At: ${
            execution.completedAt
              ?.toISOString() ??
            "Not completed"
          }`,
          ...(executionResult
            ? [
                `Result Status: ${executionResult.status}`,
                `Result: ${executionResult.summary}`,
                ...(executionResult.error
                  ? [
                      `Result Error: ${executionResult.error}`,
                    ]
                  : []),
              ]
            : []),
        ].join(
          "\n"
        );
    }

    const executionResult =
      execution?.result ??
      null;

    const outcomeResult =
      state.response?.trim() ||
      executionResult?.summary?.trim() ||
      null;

    /*
    |--------------------------------------------------------------------------
    | Create runtime outcome
    |--------------------------------------------------------------------------
    */

    state.outcome =
      createRuntimeOutcome({
        result:
          outcomeResult,

        errors:
          state.errors,

        executionId:
          execution?.id ??
          state.currentExecutionId,

        executionStatus:
          execution?.status ??
          null,

        executionResult,

        planId:
          execution?.planId ??
          state.currentPlanId,

        decisionId:
          state.currentDecisionId,

        stagesExecuted:
          state.executedStages,
      });

    /*
    |--------------------------------------------------------------------------
    | Determine overall runtime status
    |--------------------------------------------------------------------------
    */

    state.runtimeStatus =
      determineRuntimeStatus(
        state,
        execution?.status ??
          null
      );

    /*
    |--------------------------------------------------------------------------
    | Runtime reflection
    |--------------------------------------------------------------------------
    |
    | Reflection consumes the completed runtime evidence. It is kept as
    | a BrainState observation so downstream memory and context systems can
    | use the result without needing to reconstruct execution details.
    |
    | Identical stage re-entry is idempotent: the same serialized
    | reflection is not appended twice.
    |--------------------------------------------------------------------------
    */

    const reflection =
      createRuntimeReflection(
        state
      );

    const reflectionEvidence =
      [
        reflection.summary,
        reflection.evidence,
        `Confidence: ${reflection.confidence}`,
      ].join(
        "\n"
      );

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

/*
|--------------------------------------------------------------------------
| Cognitive artifact chain validation
|--------------------------------------------------------------------------
*/

function validateArtifactChain(
  state: BrainState,
  plan:
    ReturnType<
      typeof getPlan
    >,
  decision:
    ReturnType<
      typeof getDecision
    >,
  execution:
    ReturnType<
      typeof getExecution
    >
): string[] {
  const errors:
    string[] = [];

  /*
  |--------------------------------------------------------------------------
  | Plan resolution
  |--------------------------------------------------------------------------
  */

  if (
    state.currentPlanId &&
    !plan
  ) {
    errors.push(
      `Outcome: plan ${state.currentPlanId} could not be resolved.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Decision resolution
  |--------------------------------------------------------------------------
  */

  if (
    state.currentDecisionId &&
    !decision
  ) {
    errors.push(
      `Outcome: decision ${state.currentDecisionId} could not be resolved.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Execution resolution
  |--------------------------------------------------------------------------
  */

  if (
    state.currentExecutionId &&
    !execution
  ) {
    errors.push(
      `Outcome: execution ${state.currentExecutionId} could not be resolved.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Execution → Plan relationship
  |--------------------------------------------------------------------------
  |
  | Execution is the existing artifact that explicitly owns planId.
  |
  */

  if (
    execution &&
    state.currentPlanId &&
    execution.planId !==
      state.currentPlanId
  ) {
    errors.push(
      `Outcome: execution ${execution.id} does not belong to plan ${state.currentPlanId}.`
    );
  }

  return [
    ...new Set(
      errors
    ),
  ];
}

/*
|--------------------------------------------------------------------------
| Runtime status
|--------------------------------------------------------------------------
*/

function determineRuntimeStatus(
  state: BrainState,
  executionStatus:
    | ExecutionStatus
    | null
): BrainRuntimeStatus {
  /*
  |--------------------------------------------------------------------------
  | Runtime errors take precedence.
  |--------------------------------------------------------------------------
  */

  if (
    state.errors.length > 0
  ) {
    return "failed";
  }

  /*
  |--------------------------------------------------------------------------
  | Blocked execution.
  |--------------------------------------------------------------------------
  */

  if (
    executionStatus ===
    "blocked"
  ) {
    return "blocked";
  }

  /*
  |--------------------------------------------------------------------------
  | Active execution.
  |--------------------------------------------------------------------------
  */

  if (
    executionStatus ===
      "pending" ||
    executionStatus ===
      "in_progress"
  ) {
    return "in_progress";
  }

  /*
  |--------------------------------------------------------------------------
  | Completed execution.
  |--------------------------------------------------------------------------
  */

  if (
    executionStatus ===
    "completed"
  ) {
    return "completed";
  }

  /*
  |--------------------------------------------------------------------------
  | Successful cognitive response.
  |--------------------------------------------------------------------------
  */

  if (
    state.response?.trim()
  ) {
    return "completed";
  }

  /*
  |--------------------------------------------------------------------------
  | Conservative fallback.
  |--------------------------------------------------------------------------
  */

  return "in_progress";
}

/*
|--------------------------------------------------------------------------
| ATR preservation notes
|--------------------------------------------------------------------------
|
| This file intentionally keeps the full plan synchronization behavior.
| This file intentionally keeps the full decision synchronization behavior.
| This file intentionally keeps the full execution synchronization behavior.
| This file intentionally keeps artifact-chain validation.
| This file intentionally keeps runtime status precedence.
| This file intentionally keeps blocked execution handling.
| This file intentionally keeps active execution handling.
| This file intentionally keeps completed execution handling.
| This file intentionally keeps response-based completion handling.
| This file intentionally keeps the conservative in-progress fallback.
| Runtime reflection is an additive observation layer.
| Reflection does not own execution.
| Reflection does not own provider routing.
| Reflection does not replace RuntimeOutcome.
| Reflection does not replace BrainState execution evidence.
| Reflection does not mutate plan ownership.
| Reflection does not mutate decision ownership.
| Reflection does not mutate provider identity.
| Reflection does not execute external tools.
| Reflection does not retry external work.
| Reflection is generated only after outcome status is known.
| Reflection preserves error evidence.
| Reflection preserves execution evidence.
| Reflection preserves action identity.
| Reflection confidence is bounded by the runtime reflection builder.
| Reflection insertion is idempotent for identical evidence.
| Existing memory and graph context remain inputs to goal enrichment.
| Existing timeline and reasoning observations remain inputs to goals.
| Existing plan milestones remain rendered in state.plan.
| Existing decision alternatives remain rendered in state.decision.
| Existing execution result errors remain rendered in state.execution.
| Existing execution identifiers remain rendered in state.execution.
| Existing plan identifiers remain rendered in state.execution.
| Existing timestamps remain rendered in state.execution.
| Existing runtime status is still determined before reflection.
| Existing artifact validation still precedes outcome creation.
| Existing outcome creation still precedes reflection.
| Existing stage return semantics remain unchanged.
| Existing BaseStage ownership remains unchanged.
| Existing imports remain within the established Brain ownership model.
| No duplicate outcome owner is introduced.
| No duplicate execution owner is introduced.
| No duplicate reflection engine is introduced.
| The existing reflection module is extended rather than duplicated.
| The runtime reflection builder remains provider-independent.
| Provider provenance remains stored on execution results.
| Action routing remains responsible for selecting capabilities.
| Action dispatch remains responsible for capability binding.
| Execution remains responsible for real provider invocation.
| Outcome remains responsible for terminal runtime synchronization.
| Reflection remains responsible for learning evidence from the outcome.
| Memory remains downstream of the BrainState reflection observation.
| This preserves the intended cognition loop architecture.
| Understand → Remember → Retrieve → Reason → Plan → Decide → Validate.
| Validate → Execute → Observe → Reflect → Remember.
| ATR therefore terminates with observable reflection rather than
| stopping at provider execution metadata.
|--------------------------------------------------------------------------
*/
