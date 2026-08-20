export { executeRuntime } from "./execute";

export {
  executeCognitiveRequest,
  UCI_PROTOCOL_VERSION,
} from "./uci";

export type {
  CognitiveRequest,
  CognitiveResponse,
} from "./uci";

export { CognitiveRuntime } from "./pipeline";

export { createRuntimeBrainState } from "./createBrainState";

export {
  summarizeRuntimeDiagnostics,
} from "./diagnosticsSummary";

export {
  assertRuntimeStateIntegrity,
} from "./runtimeStateIntegrity";

export {
  createRuntimeOutcome,
} from "./outcome";

export type {
  RuntimeOutcome,
  RuntimeOutcomeStatus,
} from "./outcome";

export * from "./steps/reasoningGraphStage";

export * from "./steps/autonomyStage";

export {
  LIFE_DOMAINS,
  getLifeDomain,
  resolveLifeDomains,
} from "../lifeDomains";

export type {
  LifeDomain,
  LifeDomainId,
  LifeDomainMatch,
} from "../lifeDomains";

export {
  LifeDomainStage,
} from "./steps/lifeDomainStage";
