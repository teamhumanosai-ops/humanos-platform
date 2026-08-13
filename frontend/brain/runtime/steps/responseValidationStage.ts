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
 * model's answer is factually correct.
 *
 * Its purpose is to detect structural response failures
 * that the runtime can identify deterministically,
 * including evidence-grounding failures.
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

    /*
    |--------------------------------------------------------------------------
    | Citation validation
    |--------------------------------------------------------------------------
    |
    | When citation sources exist, every citation marker
    | used by the response must correspond to an actual
    | citation supplied by the runtime.
    |
    | This prevents the model from inventing citation
    | numbers such as [7] when only [1] and [2] exist.
    |
    */

    if (
      state.citations.length > 0
    ) {
      const citationMarkers =
        this.extractCitationMarkers(
          response
        );

      const validCitationIndexes =
        new Set(
          state.citations.map(
            (citation) =>
              citation.index
          )
        );

      const invalidMarkers =
        citationMarkers.filter(
          (index) =>
            !validCitationIndexes.has(
              index
            )
        );

      for (
        const index of
        new Set(invalidMarkers)
      ) {
        state.errors.push(
          `ResponseValidation: response contains unsupported citation marker [${index}].`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Evidence usage
      |--------------------------------------------------------------------------
      |
      | For live/current-information responses, the
      | presence of retrieved citation evidence should
      | normally result in at least one valid citation
      | marker in the generated response.
      |
      | We intentionally do not require citations for
      | every sentence because deterministic validation
      | cannot safely determine which individual claims
      | require which source.
      |
      */

      if (
        state.liveKnowledge.length > 0 &&
        citationMarkers.length === 0
      ) {
        state.errors.push(
          "ResponseValidation: live evidence is available but the response contains no citation markers."
        );
      }
    }

    return state;
  }

  private extractCitationMarkers(
    response: string
  ): number[] {
    const markers: number[] = [];

    const pattern =
      /\[(\d+)\]/g;

    let match =
      pattern.exec(
        response
      );

    while (
      match
    ) {
      markers.push(
        Number(
          match[1]
        )
      );

      match =
        pattern.exec(
          response
        );
    }

    return markers;
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