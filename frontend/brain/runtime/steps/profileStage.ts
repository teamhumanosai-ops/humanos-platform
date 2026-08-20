import {
  BrainState,
} from "../../brainState";

import {
  profileEngine,
} from "../../profile/profileEngine";

import {
  BaseStage,
} from "./baseStage";

/**
 * ProfileStage
 *
 * Hydrates the persisted Human Profile into BrainState before
 * downstream context construction and reasoning execute.
 *
 * Profile persistence is server-side, so this stage belongs to the
 * server-owned cognitive runtime and must not be imported by client
 * components.
 */
export class ProfileStage
  extends BaseStage {
  readonly name =
    "Profile";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.profile =
      profileEngine.get();

    return state;
  }
}
