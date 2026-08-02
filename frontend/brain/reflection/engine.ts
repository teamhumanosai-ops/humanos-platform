import { loadTimelineEvents } from "../timeline";

import { analyzeTimeline } from "./analyzer";
import { saveReflection, loadReflections } from "./store";
import { buildReflectionPrompt } from "./prompt";

export async function runReflectionEngine(): Promise<void> {
  const events = await loadTimelineEvents();

  const reflections = analyzeTimeline(events);

  for (const reflection of reflections) {
    await saveReflection(reflection);
  }
}

export {
  loadReflections,
  buildReflectionPrompt,
};