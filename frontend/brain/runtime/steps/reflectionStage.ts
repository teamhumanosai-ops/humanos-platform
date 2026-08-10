import {
  BrainState,
} from "../../brainState";

import {
  loadReflections,
  runReflectionEngine,
} from "../../reflection";

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
 * This stage only integrates that capability
 * into the runtime BrainState.
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

    return state;
  }
}