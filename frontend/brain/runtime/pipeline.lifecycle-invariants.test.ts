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
      `Runtime lifecycle verification failed: ${message}`
    );
  }
}

const runtime =
  new CognitiveRuntime(
    {} as never
  );

const stages =
  (
    runtime as unknown as {
      stages: Stage[];
    }
  ).stages;

const stageNames =
  stages.map(
    (stage) =>
      stage.name
  );

assert(
  stageNames.length > 0,
  "the canonical runtime must register stages"
);

assert(
  new Set(
    stageNames
  ).size ===
    stageNames.length,
  "canonical runtime stage names must be unique"
);

const reflectionIndex =
  stageNames.indexOf(
    "Reflection"
  );
const autonomyIndex =
  stageNames.indexOf(
    "Autonomy"
  );
const outcomeIndex =
  stageNames.indexOf(
    "Outcome"
  );

assert(
  reflectionIndex >= 0,
  "Reflection must be registered"
);
assert(
  autonomyIndex >= 0,
  "Autonomy must be registered"
);
assert(
  outcomeIndex >= 0,
  "Outcome must be registered"
);
assert(
  reflectionIndex <
    autonomyIndex,
  "Reflection must precede Autonomy"
);
assert(
  autonomyIndex <
    outcomeIndex,
  "Autonomy must precede terminal Outcome"
);
assert(
  outcomeIndex ===
    stageNames.length - 1,
  "Outcome must remain the final registered stage"
);

console.log(
  "Runtime lifecycle verification passed."
);
