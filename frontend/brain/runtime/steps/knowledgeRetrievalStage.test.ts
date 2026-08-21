import {
  CognitiveRuntime,
} from "../pipeline";

import {
  runtimeServices,
} from "../runtimeServices";

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

const knowledgeIndex =
  stages.indexOf(
    "KnowledgeRetrieval"
  );
const memoryExtractionIndex =
  stages.indexOf(
    "MemoryExtraction"
  );
const outcomeIndex =
  stages.indexOf(
    "Outcome"
  );

if (
  knowledgeIndex < 0 ||
  memoryExtractionIndex < 0 ||
  outcomeIndex < 0
) {
  throw new Error(
    "Knowledge retrieval regression: canonical runtime stages are incomplete."
  );
}

if (
  knowledgeIndex >=
  memoryExtractionIndex
) {
  throw new Error(
    "Knowledge retrieval regression: knowledge retrieval must precede memory extraction."
  );
}

if (
  outcomeIndex !==
  stages.length - 1
) {
  throw new Error(
    "Knowledge retrieval regression: Outcome must remain terminal."
  );
}

console.log(
  "Knowledge retrieval runtime integration verification passed."
);
