import {
  BrainState,
} from "../../brainState";

import {
  resolveLifeDomains,
} from "../../lifeDomains";

import {
  BaseStage,
} from "./baseStage";

export class LifeDomainStage
  extends BaseStage {
  readonly name = "LifeDomain";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const source = [
      state.userMessage,
      state.intent ?? "",
      state.context ?? "",
    ].join(" ");

    state.lifeDomains =
      resolveLifeDomains(
        source
      );

    state.primaryLifeDomain =
      state.lifeDomains[0]?.domain ??
      "general";

    return state;
  }
}
