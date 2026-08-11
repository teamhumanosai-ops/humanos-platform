import { BaseStage } from "./baseStage";

import {
  BrainState,
} from "../../brainState";

import {
  graphQuery,
} from "../../graph";

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

import {
  enrichmentEngine,
} from "../../enrichment";

export class BrainStateStage
  extends BaseStage {
  readonly name =
    "BrainState";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Knowledge Retrieval
    |--------------------------------------------------------------------------
    |
    | Knowledge retrieval remains responsible for
    | searching the knowledge base. BrainState stores
    | the structured retrieval results for downstream
    | cognitive stages.
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
    | Reasoning Graph
    |--------------------------------------------------------------------------
    |
    | The Knowledge Graph is now part of the
    | canonical BrainState runtime artifact.
    |
    | GraphQuery remains responsible for graph
    | traversal and relationship semantics.
    | BrainState owns the runtime representation.
    |
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