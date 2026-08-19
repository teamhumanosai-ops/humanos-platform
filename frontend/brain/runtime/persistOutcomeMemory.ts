import { saveMemory } from "../memory";
import type { RuntimeReflection } from "../reflection";
import type { RuntimeOutcome } from "./outcome";
import {
  buildRuntimeOutcomeMemory,
} from "./outcomeMemory";

export async function persistRuntimeOutcomeMemory(
  outcome: RuntimeOutcome,
  reflection: RuntimeReflection
): Promise<boolean> {
  const memory =
    buildRuntimeOutcomeMemory(
      outcome,
      reflection
    );

  if (!memory) {
    return false;
  }

  await saveMemory(
    memory.key,
    memory.value,
    memory.confidence
  );

  return true;
}
