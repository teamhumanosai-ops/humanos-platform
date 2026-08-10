import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createPlanFromMessage,
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
 * Responsibilities:
 * - Determine whether the current request
 *   requires planning
 * - Create a plan using the existing
 *   Planning Engine
 * - Store the resulting plan in BrainState
 * - Preserve relevant reasoning and graph
 *   context in the runtime plan description
 *
 * The Planning Engine remains responsible
 * for plan generation.
 *
 * BrainState remains the shared runtime
 * artifact.
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

    if (state.response) {
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
    | Use the existing Planning Engine.
    |--------------------------------------------------------------------------
    */

    const plan =
      createPlanFromMessage(
        state.userMessage
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
    | Build graph-aware planning context.
    |--------------------------------------------------------------------------
    |
    | BrainState.reasoning is nullable in the
    | current architecture, so only consume it
    | when a reasoning result exists.
    |
    */

    const graphContext =
      state.graph.length > 0 ||
      state.graphEdges.length > 0
        ? [
            "Knowledge graph context is available.",

            `Graph entities: ${state.graph.length}.`,

            `Graph relationships: ${state.graphEdges.length}.`,
          ].join(" ")
        : "";

    const reasoningContext =
      state.reasoning?.trim() ?? "";

    const descriptionParts = [
      plan.description,
    ];

    if (
      reasoningContext
    ) {
      descriptionParts.push(
        `Reasoning context: ${reasoningContext}`
      );
    }

    if (
      graphContext
    ) {
      descriptionParts.push(
        graphContext
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Store human-readable plan state.
    |--------------------------------------------------------------------------
    */

    state.plan =
      [
        `Plan: ${plan.title}`,

        `Goal: ${plan.goal}`,

        `Description: ${descriptionParts.join(
          "\n"
        )}`,

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