import {
  CognitiveRuntime,
} from "./pipeline";

import {
  runtimeServices,
} from "./runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CognitiveRuntime verification failed: ${message}`
    );
  }
}

function runPipelineRegistrationVerification(): void {
  const runtime =
    new CognitiveRuntime(
      runtimeServices
    );

  const names =
    runtime
      .getStages()
      .map(
        (stage) => stage.name
      );

  const expected = [
    "Input",
    "Intent",
    "LiveKnowledge",
    "MemoryExtraction",
    "TimelineExtraction",
    "Memory",
    "BrainState",
    "Profile",
    "ReasoningGraph",
    "Prediction",
    "PredictionHistory",
    "PredictionMemory",
    "PredictionConsolidation",
    "PredictionConfidence",
    "Skill",
    "Context",
    "Recommendation",
    "Reasoning",
    "Inference",
    "Planning",
    "Decision",
    "Validation",
    "ActionRouting",
    "ActionDispatch",
    "Execution",
    "Response",
    "ResponseValidation",
    "Outcome",
    "Reflection",
    "Autonomy",
  ];

  assert(
    names.length ===
      expected.length,
    "canonical runtime must register the expected number of stages"
  );

  assert(
    names.every(
      (name, index) =>
        name === expected[index]
    ),
    "canonical runtime stage ordering must remain deterministic"
  );

  assert(
    new Set(names).size ===
      names.length,
    "canonical runtime must not contain duplicate stage names"
  );

  assert(
    names.indexOf("Prediction") <
      names.indexOf("PredictionHistory"),
    "prediction history must run after base prediction"
  );

  assert(
    names.indexOf("PredictionHistory") <
      names.indexOf("PredictionMemory"),
    "prediction memory must run after prediction history"
  );

  assert(
    names.indexOf("PredictionMemory") <
      names.indexOf("PredictionConsolidation"),
    "prediction consolidation must run after prediction enrichment"
  );

  assert(
    names.indexOf("PredictionConfidence") <
      names.indexOf("Recommendation"),
    "recommendations must consume normalized prediction confidence"
  );

  assert(
    names.indexOf("Context") <
      names.indexOf("Recommendation"),
    "recommendations must be added after canonical context assembly"
  );

  assert(
    names.indexOf("Recommendation") <
      names.indexOf("Reasoning"),
    "reasoning must consume recommendation intelligence"
  );

  assert(
    names.indexOf("Validation") <
      names.indexOf("ActionRouting"),
    "action routing must run only after validation"
  );

  assert(
    names.indexOf("ActionRouting") <
      names.indexOf("ActionDispatch"),
    "action dispatch must consume the validated action route"
  );

  assert(
    names.indexOf("ActionDispatch") <
      names.indexOf("Execution"),
    "execution must consume the validated dispatch boundary"
  );

  assert(
    names.indexOf("Reflection") <
      names.indexOf("Autonomy"),
    "autonomy evaluation must run after reflection"
  );

  console.log(
    "CognitiveRuntime pipeline verification passed."
  );
}

runPipelineRegistrationVerification();