import type { BrainState } from "../brainState";

function formatSection(
  title: string,
  content: string[]
): string {
  if (content.length === 0) {
    return "";
  }

  return `${title}:\n${content
    .map((item) => `- ${item}`)
    .join("\n")}`;
}

/**
 * Builds the cognitive context from the
 * already-hydrated BrainState.
 *
 * This function intentionally does not
 * retrieve memory, graph, timeline, profile,
 * or reflection data itself.
 *
 * BrainStateStage owns hydration.
 * Context owns composition.
 */
export function buildContext(
  state: BrainState
): string {
  const sections: string[] = [];

  const memories =
    state.memories.map(
      (memory) =>
        `${memory.key}: ${memory.value}`
    );

  const memorySection =
    formatSection(
      "Known facts about the user",
      memories
    );

  if (memorySection) {
    sections.push(
      memorySection
    );
  }

  const timelineSection =
    formatSection(
      "Relevant timeline",
      state.timeline
    );

  if (timelineSection) {
    sections.push(
      timelineSection
    );
  }

  const reflectionSection =
    formatSection(
      "Reflections",
      state.reflections
    );

  if (reflectionSection) {
    sections.push(
      reflectionSection
    );
  }

  const graphSection =
    formatSection(
      "Knowledge Graph",
      state.graph.map(
        (node) =>
          `${node.type}: ${node.label}`
      )
    );

  if (graphSection) {
    sections.push(
      graphSection
    );
  }

  if (state.profile) {
    sections.push(
      `User Profile:\n${JSON.stringify(
        state.profile,
        null,
        2
      )}`
    );
  }

  if (
    state.knowledge.length > 0
  ) {
    sections.push(
      formatSection(
        "Knowledge",
        state.knowledge
      )
    );
  }

  if (
    state.liveKnowledge.length > 0
  ) {
    sections.push(
      formatSection(
        "Live Knowledge",
        state.liveKnowledge
      )
    );
  }

  sections.push(`
Human OS uses its internal cognitive state to answer questions.

Use the available context when relevant.
Prefer known facts over assumptions.
Never invent personal facts.
When current information is required, use live knowledge when available.
`);

  return sections
    .filter(Boolean)
    .join("\n\n");
}