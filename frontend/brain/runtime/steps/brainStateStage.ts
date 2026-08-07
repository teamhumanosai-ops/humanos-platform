import { BaseStage } from "./baseStage";
import { BrainState } from "../../brainState";

import { loadMemories } from "../../memory";
import { graphQuery } from "../../graph";
import { profileEngine } from "../../profile/profileEngine";
import { buildTimelinePrompt } from "../../timeline";
import { buildReflectionPrompt } from "../../reflection";

export class BrainStateStage extends BaseStage {
  readonly name = "BrainState";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.memories =
      await loadMemories();

    state.graph =
      graphQuery.getNodes();

    state.profile =
      profileEngine.get();

    const timeline =
      await buildTimelinePrompt();

    state.timeline =
      timeline
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const reflections =
      await buildReflectionPrompt();

    state.reflections =
      reflections
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    return state;
  }
}