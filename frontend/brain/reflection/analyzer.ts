import type { TimelineEvent } from "../timeline";
import type { Reflection } from "./types";

export function analyzeTimeline(
  events: TimelineEvent[]
): Reflection[] {
  const reflections: Reflection[] = [];

  const hasStartup = events.some(
    (event) => event.category === "Startup"
  );

  const achievements = events.filter(
    (event) => event.category === "Achievement"
  );

  if (hasStartup && achievements.length >= 1) {
    reflections.push({
      summary:
        "You are actively building projects and successfully completing important milestones.",

      evidence: events
        .filter(
          (event) =>
            event.category === "Startup" ||
            event.category === "Achievement"
        )
        .map((event) => event.title)
        .join(", "),

      confidence: 95,

      createdAt: new Date().toISOString(),
    });
  }

  return reflections;
}