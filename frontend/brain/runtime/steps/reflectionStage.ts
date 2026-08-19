import {
  BrainState,
} from "../../brainState";

import {
  loadReflections,
  runReflectionEngine,
} from "../../reflection";

import {
  persistRuntimeOutcomeMemory,
} from "../persistOutcomeMemory";

import {
  BaseStage,
} from "./baseStage";

/**
 * ReflectionStage
 *
 * Connects the existing Reflection Engine
 * to the Cognitive Runtime.
 *
 * The Reflection Engine remains responsible
 * for analyzing timeline history and persisting
 * inferred reflections.
 *
 * This stage integrates the persisted reflection
 * knowledge into BrainState and promotes the
 * current terminal execution reflection into the
 * existing durable memory owner.
 */
export class ReflectionStage
  extends BaseStage {
  readonly name =
    "Reflection";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Run the existing reflection engine.
    |--------------------------------------------------------------------------
    */

    await runReflectionEngine();

    /*
    |--------------------------------------------------------------------------
    | Reload persisted reflections so the current
    | BrainState represents the latest durable
    | cognitive knowledge.
    |--------------------------------------------------------------------------
    */

    const reflections =
      await loadReflections();

    state.reflections =
      reflections.map(
        (reflection) =>
          reflection.summary
      );

    /*
    |--------------------------------------------------------------------------
    | Persist the reflection for the current terminal outcome.
    |
    | Reflection remains responsible for learning evidence.
    | Memory remains responsible for durable persistence.
    | The outcome-memory key is execution-scoped so one execution
    | cannot overwrite another execution's learning evidence.
    |--------------------------------------------------------------------------
    */

    if (state.outcome) {
      const runtimeReflection =
        await import(
          "../../reflection/runtime"
        ).then(
          ({
            createRuntimeReflection,
          }) =>
            createRuntimeReflection(
              state
            )
        );

      await persistRuntimeOutcomeMemory(
        state.outcome,
        runtimeReflection
      );
    }

    return state;
  }
}
