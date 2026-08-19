import type { BrainState } from "../brainState";

import {
  evaluateActionAuthorization,
} from "./authorization";

import {
  createActionDispatch,
} from "./execution";

import type {
  ActionAuthorization,
} from "./authorization";

import type {
  ActionDispatch,
} from "./execution";

export type AuthorizedActionDispatch = {
  authorization: ActionAuthorization;
  dispatch: ActionDispatch | null;
};

/**
 * Single safety boundary for turning a BrainState action route into a dispatch.
 *
 * Authorization is evaluated against the exact route currently held by state.
 * No dispatch is produced for blocked or confirmation-required actions.
 */
export function authorizeAndCreateActionDispatch(
  state: BrainState
): AuthorizedActionDispatch {
  const authorization =
    evaluateActionAuthorization(
      state
    );

  if (
    authorization.status !==
    "allowed"
  ) {
    return {
      authorization,
      dispatch: null,
    };
  }

  if (
    !state.actionRoute ||
    authorization.routeId !==
      state.actionRoute.id ||
    authorization.target !==
      state.actionRoute.target
  ) {
    return {
      authorization: {
        ...authorization,
        status: "blocked",
        reason:
          "Authorization binding no longer matches the current action route.",
      },
      dispatch: null,
    };
  }

  const dispatch =
    createActionDispatch(
      state.actionRoute,
      authorization.policyVersion
    );

  if (!dispatch) {
    return {
      authorization: {
        ...authorization,
        status: "blocked",
        reason:
          "The authorized action route could not produce a safe dispatch descriptor.",
      },
      dispatch: null,
    };
  }

  if (
    dispatch.authorizationStatus !==
      authorization.status ||
    dispatch.authorizationPolicyVersion !==
      authorization.policyVersion ||
    dispatch.authorizationRouteId !==
      authorization.routeId ||
    dispatch.routeId !==
      state.actionRoute.id ||
    dispatch.target !==
      authorization.target
  ) {
    return {
      authorization: {
        ...authorization,
        status: "blocked",
        reason:
          "The generated dispatch failed authorization provenance validation.",
      },
      dispatch: null,
    };
  }

  return {
    authorization,
    dispatch,
  };
}
