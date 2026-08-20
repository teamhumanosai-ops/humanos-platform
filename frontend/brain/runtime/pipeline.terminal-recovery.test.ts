import {
  BrainState,
} from "../brainState";

import {
  CognitiveRuntime,
} from "./pipeline";

import {
  Stage,
} from "./steps/stage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime terminal-recovery verification failed: ${message}`
    );
  }
}

function createState(): BrainState {
  return {
    userMessage:
      "terminal recovery test",
    diagnostics: [],
    executedStages: [],
    errors: [],
    outcome:
      null,
  } as unknown as BrainState;
}

async function verifyRecovery(
  methodName:
    "recoverTerminalOutcome" | "ensureTerminalOutcome"
): Promise<void> {
  const runtime =
    new CognitiveRuntime(
      {} as never
    );

  const input =
    createState();

  const boundaryState =
    createState();

  let boundaryCalls =
    0;

  let boundaryStage:
    Stage | undefined;

  const runtimeWithPrivateAccess =
    runtime as unknown as {
      stages: Stage[];
      executeStage: (
        stage: Stage,
        state: BrainState
      ) => Promise<{
        state: BrainState;
        halted: boolean;
      }>;
      [key: string]: unknown;
    };

  boundaryStage =
    runtimeWithPrivateAccess.stages.find(
      (stage) =>
        stage.name ===
        "Outcome"
    );

  assert(
    Boolean(boundaryStage),
    `${methodName} must resolve the canonical Outcome stage`
  );

  runtimeWithPrivateAccess.executeStage =
    async (
      stage: Stage,
      state: BrainState
    ) => {
      boundaryCalls += 1;
      boundaryStage = stage;

      assert(
        state === input,
        `${methodName} must pass the current BrainState to executeStage`
      );

      return {
        state:
          boundaryState,
        halted:
          false,
      };
    };

  const result =
    await (
      runtimeWithPrivateAccess[
        methodName
      ] as (
        state: BrainState
      ) => Promise<BrainState>
    ).call(
      runtime,
      input
    );

  assert(
    boundaryCalls === 1,
    `${methodName} must execute terminal Outcome through exactly one canonical boundary call`
  );
  assert(
    boundaryStage?.name ===
      "Outcome",
    `${methodName} must execute the canonical Outcome stage`
  );
  assert(
    result === boundaryState,
    `${methodName} must return the state produced by executeStage`
  );
}

await verifyRecovery(
  "recoverTerminalOutcome"
);

await verifyRecovery(
  "ensureTerminalOutcome"
);

console.log(
  "Runtime terminal-recovery verification passed."
);
