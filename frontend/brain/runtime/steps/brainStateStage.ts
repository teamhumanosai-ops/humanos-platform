import { BaseStage } from "./baseStage";

import { BrainState } from "../../brainState";

import {
  graphQuery,
} from "../../graph";

import { loadMemories } from "../../memory";

import {
  profileEngine,
} from "../../profile/profileEngine";

import {
  buildTimelinePrompt,
} from "../../timeline";

import {
  buildReflectionPrompt,
} from "../../reflection";

export class BrainStateStage
  extends BaseStage {
  readonly name = "BrainState";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.memories =
      await loadMemories();

    state.graph =
      graphQuery.getNodes();

    state.graphEdges =
      graphQuery.getEdges();

    state.profile =
      profileEngine.get();

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