import {
  BrainState,
} from "../../brainState";

import {
  getDecision,
} from "../../decision";

import {
  createExecutionFromDecision,
  startExecution,
} from "../../execution";

import {
  getPlan,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

/**
 * ExecutionStage
 *
 * Integrates the existing Execution Engine
 * into the Cognitive Runtime.
 *
 * Execution remains authoritative through
 * the existing Execution Engine lifecycle.
 *
 * Structured reasoning evidence is preserved
 * in the BrainState execution artifact so the
 * cognitive chain remains traceable.
 */
export class ExecutionStage
  extends BaseStage {
  readonly name =
    "Execution";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Do not execute after an earlier runtime error.
    |--------------------------------------------------------------------------
    */

    if (
      state.errors.length > 0
    ) {
      state.execution =
        [
          "Execution blocked.",

          "Reason:",

          ...state.errors,
        ].join("\n");

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Do not execute when a response already exists.
    |--------------------------------------------------------------------------
    */

    if (
      state.response
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Execution requires an active decision
    | and plan.
    |--------------------------------------------------------------------------
    */

    if (
      !state.currentDecisionId ||
      !state.currentPlanId
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Load decision.
    |--------------------------------------------------------------------------
    */

    const decision =
      getDecision(
        state.currentDecisionId
      );

    if (!decision) {
      state.errors.push(
        "Execution: active decision could not be found."
      );

      state.execution =
        "Execution blocked.";

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Load plan.
    |--------------------------------------------------------------------------
    */

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!plan) {
      state.errors.push(
        "Execution: active plan could not be found."
      );

      state.execution =
        "Execution blocked.";

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Create execution through the existing
    | Execution Engine.
    |--------------------------------------------------------------------------
    */

    const execution =
      createExecutionFromDecision(
        decision,
        plan.id
      );

    /*
    |--------------------------------------------------------------------------
    | Start execution lifecycle.
    |--------------------------------------------------------------------------
    */

    const startedExecution =
      startExecution(
        execution.id
      );

    if (
      !startedExecution
    ) {
      state.errors.push(
        "Execution: unable to start execution."
      );

      state.execution =
        "Execution blocked.";

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Store execution identity in BrainState.
    |--------------------------------------------------------------------------
    */

    state.currentExecutionId =
      startedExecution.id;

    /*
    |--------------------------------------------------------------------------
    | Preserve structured reasoning evidence.
    |--------------------------------------------------------------------------
    */

    const reasoningEvidence =
      state.reasoningObservations.map(
        (
          observation,
          index
        ) =>
          `${index + 1}. [${
            observation.source
          }] ${
            observation.statement
          } (confidence ${
            observation.confidence.toFixed(
              2
            )
          })`
      );

    /*
    |--------------------------------------------------------------------------
    | Store execution artifact.
    |--------------------------------------------------------------------------
    */

    state.execution =
      [
        `Execution: ${startedExecution.title}`,

        `Action: ${startedExecution.action}`,

        `Status: ${startedExecution.status}`,

        `Plan ID: ${startedExecution.planId}`,

        `Execution ID: ${startedExecution.id}`,

        `Started At: ${
          startedExecution.startedAt
            ?.toISOString() ??
          "Unknown"
        }`,

        ...(reasoningEvidence.length > 0
          ? [
              "",

              "Reasoning Evidence:",

              ...reasoningEvidence,
            ]
          : []),

        ...(state.reasoningConfidence > 0
          ? [
              "",

              `Overall Reasoning Confidence: ${state.reasoningConfidence.toFixed(
                2
              )}`,
            ]
          : []),
      ].join("\n");

    return state;
  }
}