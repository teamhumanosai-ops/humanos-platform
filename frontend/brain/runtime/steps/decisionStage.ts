import {
  BrainState,
} from "../../brainState";

import {
  getBestDecision,
} from "../../decision";

import {
  getPlan,
} from "../../planning";

import {
  getLifeDomain,
} from "../../lifeDomains";

import {
  BaseStage,
} from "./baseStage";

const MAX_INFERENCE_EVIDENCE =
  5;

export function formatInferenceEvidence(
  state: BrainState
): string[] {
  return state.inferences
    .slice(
      0,
      MAX_INFERENCE_EVIDENCE
    )
    .map(
      (
        inference,
        index
      ) => {
        const sources =
          [
            ...new Set(
              inference.evidence.map(
                (
                  evidence
                ) =>
                  evidence.source
              )
            ),
          ];

        return `${index + 1}. [${inference.kind}] ${inference.statement} (confidence ${inference.confidence.toFixed(
          2
        )}; sources ${sources.join(
          ", "
        ) || "none"})`;
      }
    );
}

function applyLifeDomainDecisionContext(
  state: BrainState,
  plan: Awaited<ReturnType<typeof getPlan>>
) {
  if (
    !plan ||
    state.primaryLifeDomain ===
      "general"
  ) {
    return plan;
  }

  const domain =
    getLifeDomain(
      state.primaryLifeDomain
    );

  const domainContext =
    `Life domain context: ${domain.id}, ${domain.label}`;

  return {
    ...plan,

    description:
      [
        plan.description,

        domainContext,

        `Domain guidance: ${domain.description}`,
      ].join("\n"),
  };
}

/**
 * DecisionStage
 *
 * Integrates the existing Decision Engine
 * into the Cognitive Runtime.
 *
 * The Decision Engine remains authoritative
 * for selecting the action.
 *
 * BrainState reasoning and inference evidence
 * is preserved alongside the resulting decision
 * so later runtime stages can understand the
 * cognitive evidence that preceded the decision.
 */
export class DecisionStage
  extends BaseStage {
  readonly name =
    "Decision";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | A local skill response does not require
    | decision generation.
    |--------------------------------------------------------------------------
    */

    if (
      state.response
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Decision requires an active plan.
    |--------------------------------------------------------------------------
    */

    if (
      !state.currentPlanId
    ) {
      return state;
    }

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!plan) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Existing Decision Engine
    |--------------------------------------------------------------------------
    |
    | The engine remains responsible for selecting
    | the best action from the current plan. Life
    | domain context is applied to a request-scoped
    | plan copy so persisted plan data is unchanged.
    |--------------------------------------------------------------------------
    */

    const decisionPlan =
      applyLifeDomainDecisionContext(
        state,
        plan
      );

    const decision =
      getBestDecision(
        decisionPlan
      );

    state.currentDecisionId =
      decision.id;

    /*
    |--------------------------------------------------------------------------
    | Structured reasoning evidence
    |--------------------------------------------------------------------------
    |
    | Preserve the reasoning signals that were
    | available before the decision was created.
    |
    */

    const reasoningEvidence =
      state.reasoningObservations
        .map(
          (
            observation,
            index
          ) =>
            `${index + 1}. [${
              observation.source
            }] ${
              observation.statement
            } (confidence ${
              observation.confidence.toFixed(
                2
              )
            })`
        );

    const inferenceEvidence =
      formatInferenceEvidence(
        state
      );

    /*
    |--------------------------------------------------------------------------
    | Decision artifact
    |--------------------------------------------------------------------------
    */

    state.decision =
      [
        `Decision: ${decision.title}`,

        `Description: ${decision.description}`,

        `Selected Action: ${decision.selectedAction}`,

        "Alternatives:",

        ...decision.alternatives.map(
          (
            alternative,
            index
          ) =>
            `${index + 1}. ${alternative}`
        ),

        `Reason: ${decision.reason}`,

        `Confidence: ${decision.confidence}`,

        ...(state.primaryLifeDomain !==
          "general"
          ? [
              "",

              `Life Domain: ${getLifeDomain(
                state.primaryLifeDomain
              ).label}`,
            ]
          : []),

        ...(reasoningEvidence.length > 0
          ? [
              "",

              "Reasoning Evidence:",

              ...reasoningEvidence,
            ]
          : []),

        ...(inferenceEvidence.length > 0
          ? [
              "",

              "Inference Evidence:",

              ...inferenceEvidence,
            ]
          : []),

        ...(state.reasoningConfidence > 0
          ? [
              "",

              `Overall Reasoning Confidence: ${state.reasoningConfidence.toFixed(
                2
              )}`,
            ]
          : []),
      ].join("\n");

    return state;
  }
}
