import { BaseStage } from "./baseStage";

import { BrainState } from "../../brainState";

import {
  graphQuery,
} from "../../graph";

import {
  loadMemories,
} from "../../memory";

import {
  retrieveKnowledgeResults,
} from "../../knowledge";

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
    /*
    |--------------------------------------------------------------------------
    | Memory
    |--------------------------------------------------------------------------
    */

    state.memories =
      await loadMemories();

    state.memory =
      state.memories.map(
        (memory) =>
          memory.value
      );

    /*
    |--------------------------------------------------------------------------
    | Knowledge
    |--------------------------------------------------------------------------
    |
    | Knowledge retrieval now becomes part of the canonical BrainState.
    | Context no longer needs to independently retrieve knowledge.
    |
    */

    const knowledge =
      await retrieveKnowledgeResults(
        state.userMessage
      );

    state.knowledge =
      knowledge.map(
        (result) => ({
          source:
            result.source,

          text:
            result.text,

          score:
            result.score,
        })
      );

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
    | Profile
    |--------------------------------------------------------------------------
    */

    state.profile =
      profileEngine.get();

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
    | Reflection
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