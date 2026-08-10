import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

/**
 * ResponseValidationStage
 *
 * Performs deterministic validation of the generated
 * response before the runtime finalizes the outcome.
 *
 * This stage does not attempt to judge whether the
 * model's answer is factually correct. Its purpose is
 * to detect structural response failures that the
 * runtime can identify deterministically.
 */
export class ResponseValidationStage
  extends BaseStage {
  readonly name =
    "ResponseValidation";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (!state.response) {
      state.errors.push(
        "ResponseValidation: no response was generated."
      );

      return state;
    }

    const response =
      state.response.trim();

    if (response.length === 0) {
      state.errors.push(
        "ResponseValidation: generated response is empty."
      );

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Current-information validation
    |--------------------------------------------------------------------------
    |
    | If live evidence was retrieved, the response should
    | not claim that no information was found.
    |
    */

    if (
      state.liveKnowledge.length > 0 &&
      this.isUnsupportedNoInformationResponse(
        response
      )
    ) {
      state.errors.push(
        "ResponseValidation: response contradicts available live evidence."
      );
    }

    return state;
  }

  private isUnsupportedNoInformationResponse(
    response: string
  ): boolean {
    const normalized =
      response.toLowerCase();

    const indicators = [
      "i don't have access to current information",
      "i do not have access to current information",
      "i can't access the web",
      "i cannot access the web",
      "i don't have access to the web",
      "i do not have access to the web",
      "i cannot browse the web",
      "i can't browse the web",
    ];

    return indicators.some(
      (indicator) =>
        normalized.includes(
          indicator
        )
    );
  }
}