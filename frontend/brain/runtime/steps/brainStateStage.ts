import { BaseStage } from "./baseStage";
import { BrainState } from "../../brainState";

import { graphQuery } from "../../graph";
import { profileEngine } from "../../profile/profileEngine";
import { buildTimelinePrompt } from "../../timeline";
import { buildReflectionPrompt } from "../../reflection";
import { enrichmentEngine } from "../../enrichment";

export class BrainStateStage extends BaseStage {
  readonly name = "BrainState";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Knowledge Graph
    |--------------------------------------------------------------------------
    */

    state.graph =
      graphQuery.getNodes();

    state.graphEdges =
      graphQuery.getEdges();

    /*
    |--------------------------------------------------------------------------
    | Human Profile
    |--------------------------------------------------------------------------
    */

    state.profile =
      profileEngine.get();

    if (state.profile) {
      const enrichmentSuggestion =
        enrichmentEngine.getNextQuestion(
          state.profile
        );

      console.debug(
        "[Human OS] Next enrichment:",
        enrichmentSuggestion
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Timeline
    |--------------------------------------------------------------------------
    */

    const timeline =
      await buildTimelinePrompt();

    state.timeline =
      timeline
        .split("\n")
        .map(
          (line) =>
            line.trim()
        )
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | Reflections
    |--------------------------------------------------------------------------
    */

    const reflections =
      await buildReflectionPrompt();

    state.reflections =
      reflections
        .split("\n")
        .map(
          (line) =>
            line.trim()
        )
        .filter(Boolean);

    return state;
  }
}