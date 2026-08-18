import {
  BrainState,
} from "../../brainState";

import {
  recommend,
} from "../../recommendation";

import {
  BaseStage,
} from "./baseStage";

/**
 * RecommendationStage
 *
 * Converts high-confidence predictions, active goal state,
 * and graph dependencies into ranked recommendations.
 *
 * Recommendations remain advisory. They do not execute actions
 * and do not replace planning or decision stages.
 */
export class RecommendationStage
  extends BaseStage {
  readonly name =
    "Recommendation";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.recommendations =
      recommend(
        state
      );

    if (
      state.response ||
      state.recommendations.length ===
        0
    ) {
      return state;
    }

    const recommendationContext =
      [
        "",
        "RECOMMENDATIONS:",
        "",
        ...state.recommendations.map(
          (
            recommendation,
            index
          ) =>
            `${index + 1}. ${recommendation.statement} [${recommendation.kind}] Priority: ${recommendation.priority.toFixed(2)} Confidence: ${recommendation.confidence.toFixed(2)}\n   Rationale: ${recommendation.rationale}`
        ),
        "",
        "Recommendations are advisory suggestions derived from BrainState evidence.",
        "Do not present them as established facts or claim that an action was executed unless execution actually occurred.",
      ].join(
        "\n"
      );

    state.context =
      `${state.context ?? ""}${recommendationContext}`;

    return state;
  }
}
