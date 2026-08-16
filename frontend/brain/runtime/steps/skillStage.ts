import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

import {
  executeSkills,
} from "../../router";

import {
  formatResponse,
} from "../../formatter";

/**
 * SkillStage
 *
 * Executes local skills according to the
 * current cognitive intent.
 *
 * Memory remains available through the
 * existing memory skill, while note handling
 * is explicitly gated by NOTE_TAKING.
 *
 * If a skill produces a local response,
 * it is stored in BrainState.response so
 * downstream response generation can skip
 * the AI call.
 */
export class SkillStage
  extends BaseStage {
  readonly name =
    "Skill";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.response
    ) {
      return state;
    }

    const localResponse =
      await executeSkills(
        state.userMessage,
        state.intent
      );

    if (
      localResponse
    ) {
      state.response =
        formatResponse(
          localResponse
        );
    }

    return state;
  }
}