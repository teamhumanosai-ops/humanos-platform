import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const frontendRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ".."
);

const tests = [
  "brain/actionRouting/execution.test.ts",
  "brain/actionRouting/authorization.test.ts",
  "brain/actionRouting/authorization.regression.test.ts",
  "brain/actionRouting/authorizationConfirmationBinding.test.ts",
  "brain/actionRouting/authorizationConfirmationBoundary.test.ts",
  "brain/actionRouting/authorizedDispatch.integration.test.ts",
  "brain/actionRouting/integrationExecution.test.ts",
  "brain/actionRouting/capabilities.test.ts",
  "brain/intent/detector.test.ts",
  "brain/runtime/steps/actionAuthorizationIntegrity.test.ts",
  "brain/runtime/steps/actionExecution.integration.test.ts",
  "brain/runtime/steps/liveKnowledgeStage.test.ts",
  "brain/websearch/search.test.ts",
  "brain/runtime/runtimeServices.test.ts",
  "brain/memory/semantic.test.ts",
  "brain/knowledge/search.test.ts",
  "brain/knowledge/retrievalPipeline.test.ts",
  "brain/knowledge/vectorStore.test.ts",
  "brain/runtime/steps/knowledgeRetrievalStage.test.ts",
  "brain/core/multimodalContracts.test.ts",
  "brain/core/multimodalRuntime.test.ts",
  "brain/core/multimodalRuntime.integration.test.ts",
  "brain/core/voiceInput.test.ts",
  "brain/core/voiceInput.browserBoundary.test.ts",
  "brain/runtime/pipeline.stageBoundary.test.ts",
  "brain/runtime/pipeline.test.ts",
];

for (const test of tests) {
  console.log(`\n=== ${test} ===`);

  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "./scripts/test-loader.mjs",
      test,
    ],
    {
      cwd: frontendRoot,
      stdio: "inherit",
      shell: false,
    }
  );

  if (result.error) {
    console.error(`Failed to start test: ${test}`);
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`\nFAILED: ${test}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll Brain/runtime/provider regression tests passed.");
