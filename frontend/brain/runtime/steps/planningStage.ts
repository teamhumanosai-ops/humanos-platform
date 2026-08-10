import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createPlanFromMessageWithContext,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

/**
 * PlanningStage
 *
 * Integrates the existing Planning Engine
 * into the Cognitive Runtime.
 *
 * The Runtime supplies relevant cognitive
 * context while the Planning Engine remains
 * responsible for generating the plan.
 */
export class PlanningStage
  extends BaseStage {
  readonly name =
    "Planning";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Do not create a plan when a local skill
    | has already produced the response.
    |--------------------------------------------------------------------------
    */

    if (
      state.response
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Planning currently applies to startup
    | planning intent.
    |--------------------------------------------------------------------------
    */

    if (
      state.intent !==
      Intent.STARTUP_PLANNING
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Build planning evidence from the
    | canonical BrainState.
    |--------------------------------------------------------------------------
    */

    const graphObservations:
      string[] = [];

    if (
      state.graph.length > 0
    ) {
      graphObservations.push(
        `The knowledge graph contains ${state.graph.length} relevant entities.`
      );
    }

    if (
      state.graphEdges.length > 0
    ) {
      graphObservations.push(
        `The knowledge graph contains ${state.graphEdges.length} relevant relationships.`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Structured reasoning evidence
    |--------------------------------------------------------------------------
    |
    | Planning consumes the machine-readable
    | reasoning observations instead of relying
    | only on the formatted reasoning string.
    |
    */

    for (
      const observation of
        state.reasoningObservations
    ) {
      graphObservations.push(
        `Reasoning evidence (${observation.source}, confidence ${observation.confidence.toFixed(
          2
        )}): ${observation.statement}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve the aggregate reasoning confidence.
    |--------------------------------------------------------------------------
    */

    if (
      state.reasoningConfidence > 0
    ) {
      graphObservations.push(
        `Overall reasoning confidence: ${state.reasoningConfidence.toFixed(
          2
        )}.`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Backward-compatible reasoning fallback.
    |--------------------------------------------------------------------------
    |
    | Existing BrainState consumers may still
    | provide only the formatted reasoning text.
    |
    */

    if (
      state.reasoningObservations.length ===
        0
    ) {
      const reasoning =
        state.reasoning?.trim();

      if (
        reasoning
      ) {
        graphObservations.push(
          `Reasoning context: ${reasoning}`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Create the plan through the existing
    | Planning Engine with cognitive context.
    |--------------------------------------------------------------------------
    */

    const plan =
      createPlanFromMessageWithContext(
        state.userMessage,
        {
          graphObservations,
        }
      );

    if (!plan) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Store runtime plan identity.
    |--------------------------------------------------------------------------
    */

    state.currentGoal =
      plan.goal;

    state.currentPlanId =
      plan.id;

    /*
    |--------------------------------------------------------------------------
    | Store human-readable plan state.
    |--------------------------------------------------------------------------
    */

    state.plan =
      [
        `Plan: ${plan.title}`,

        `Goal: ${plan.goal}`,

        `Description: ${plan.description}`,

        `Next Action: ${plan.nextAction}`,

        `Priority: ${plan.priority}`,

        `Confidence: ${plan.confidence}`,

        "Milestones:",

        ...plan.milestones.map(
          (
            milestone,
            index
          ) =>
            `${index + 1}. ${milestone}`
        ),
      ].join("\n");

    return state;
  }
}