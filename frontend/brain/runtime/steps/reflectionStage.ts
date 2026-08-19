import {
  BrainState,
} from "../../brainState";

import {
  loadReflections,
  runReflectionEngine,
  buildRuntimeReflectionMemory,
} from "../../reflection";

import {
  saveMemory,
} from "../../memory/store";

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
 * latest reflection evidence into the existing
 * durable memory owner.
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
    | Promote reflection knowledge into the
    | existing durable memory owner.
    |
    | Reflection remains responsible for inference.
    | Memory remains responsible for persistence.
    | This stage only bridges the two existing owners.
    |--------------------------------------------------------------------------
    */

    const latestReflection =
      reflections[
        reflections.length - 1
      ];

    if (latestReflection) {
      const memoryKey =
        state.currentExecutionId
          ? `runtime-reflection:${state.currentExecutionId}`
          : "runtime-reflection:latest";

      const memoryValue =
        buildRuntimeReflectionMemory(
          latestReflection
        );

      if (memoryValue) {
        await saveMemory(
          memoryKey,
          memoryValue,
          0.85
        );
      }
    }

    return state;
  }
}
