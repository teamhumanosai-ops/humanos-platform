import {
  createBrainState,
} from "../../brainState";

import {
  LifeDomainStage,
} from "./lifeDomainStage";

async function run(): Promise<void> {
  const state =
    createBrainState(
      "domain-test",
      [
        {
          role: "user",
          message:
            "Help me compare flight and hotel options for my vacation.",
        },
      ],
      "Help me compare flight and hotel options for my vacation."
    );

  const next =
    await new LifeDomainStage().execute(
      state
    );

  if (
    next.primaryLifeDomain !==
    "travel"
  ) {
    throw new Error(
      `Expected travel domain, received ${next.primaryLifeDomain}.`
    );
  }

  if (
    !next.lifeDomains.some(
      (match) =>
        match.domain === "travel"
    )
  ) {
    throw new Error(
      "Expected travel domain match to be stored in BrainState."
    );
  }

  console.log(
    "Life domain stage verification passed."
  );
}

run().catch(
  (error) => {
    throw error;
  }
);
