import {
  CognitiveRuntime,
} from "./pipeline";

import {
  runtimeServices,
} from "./runtimeServices";

async function run(): Promise<void> {
  const runtime =
    new CognitiveRuntime(
      runtimeServices
    );

  const stages =
    runtime
      .getStages()
      .map(
        (stage) =>
          stage.name
      );

  const intentIndex =
    stages.indexOf("Intent");

  const domainIndex =
    stages.indexOf("LifeDomain");

  if (
    domainIndex !==
    intentIndex + 1
  ) {
    throw new Error(
      "LifeDomain must execute immediately after Intent."
    );
  }

  const snapshot =
    runtime.getStages();

  try {
    (
      snapshot as unknown as {
        push: (value: unknown) => void;
      }
    ).push(
      "InvalidStage"
    );
  } catch {
    // readonly snapshots may reject mutation at runtime.
  }

  if (
    runtime.getStages().some(
      (stage) =>
        stage.name ===
        "InvalidStage"
    )
  ) {
    throw new Error(
      "Runtime stage ownership must not be mutable through getStages()."
    );
  }

  console.log(
    "Life domain runtime integration verification passed."
  );
}

run().catch(
  (error) => {
    throw error;
  }
);
