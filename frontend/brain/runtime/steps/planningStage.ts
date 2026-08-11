import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createPlanFromMessageWithContext,
  createGoalFromPlan,
  enrichGoalFromContext,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

export class PlanningStage
  extends BaseStage {
  readonly name =
    "Planning";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.response
    ) {
      return state;
    }

    if (
      state.intent !==
      Intent.STARTUP_PLANNING
    ) {
      return state;
    }

    const graphObservations:
      string[] = [];

    if (
      state.graph.length > 0
    ) {
      graphObservations.push(
        `The knowledge graph contains ${state.graph.length} relevant entities.`
      );
    }

    if (
      state.graphEdges.length > 0
    ) {
      graphObservations.push(
        `The knowledge graph contains ${state.graphEdges.length} relevant relationships.`
      );
    }

    for (
      const observation of
      state.reasoningObservations
    ) {
      graphObservations.push(
        `Reasoning evidence (${observation.source}, confidence ${observation.confidence.toFixed(
          2
        )}): ${observation.statement}`
      );
    }

    if (
      state.reasoningConfidence > 0
    ) {
      graphObservations.push(
        `Overall reasoning confidence: ${state.reasoningConfidence.toFixed(
          2
        )}.`
      );
    }

    const reasoning =
      state.reasoning?.trim();

    if (
      reasoning &&
      state.reasoningObservations.length ===
        0
    ) {
      graphObservations.push(
        `Reasoning context: ${reasoning}`
      );
    }

    const plan =
      createPlanFromMessageWithContext(
        state.userMessage,
        {
          graphObservations,

          graphNodes:
            state.graph.map(
              (node) => ({
                id:
                  node.id,

                label:
                  node.label,

                type:
                  node.type,
              })
            ),

          graphEdges:
            state.graphEdges.map(
              (edge) => ({
                from:
                  edge.from,

                to:
                  edge.to,

                type:
                  edge.type,
              })
            ),

          reasoningObservations:
            state.reasoningObservations,

          timeline:
            state.timeline,

          reflections:
            state.reflections,

          memories:
            state.memories.map(
              (memory) =>
                memory.value
            ),
        }
      );

    if (!plan) {
      return state;
    }

    const initialGoal =
      createGoalFromPlan(
        plan
      );

    const goal =
      enrichGoalFromContext(
        initialGoal,
        {
          graphObservations,

          graphNodes:
            state.graph.map(
              (node) => ({
                id:
                  node.id,

                label:
                  node.label,

                type:
                  node.type,
              })
            ),

          graphEdges:
            state.graphEdges.map(
              (edge) => ({
                from:
                  edge.from,

                to:
                  edge.to,

                type:
                  edge.type,
              })
            ),

          reasoningObservations:
            state.reasoningObservations,

          timeline:
            state.timeline,

          reflections:
            state.reflections,

          memories:
            state.memories.map(
              (memory) =>
                memory.value
            ),
        }
      );

    state.goal =
      goal;

    state.currentGoal =
      goal.statement;

    state.currentPlanId =
      plan.id;

    state.plan =
      [
        `Plan: ${plan.title}`,

        `Goal: ${goal.statement}`,

        `Goal Status: ${goal.status}`,

        `Progress: ${goal.progress}%`,

        `Description: ${plan.description}`,

        `Next Action: ${goal.nextAction}`,

        `Priority: ${goal.priority}`,

        `Confidence: ${goal.confidence}`,

        `Obstacles: ${
          goal.obstacles.length > 0
            ? goal.obstacles.join(
                "; "
              )
            : "None identified"
        }`,

        `Dependencies: ${
          goal.dependencies.length > 0
            ? goal.dependencies.join(
                "; "
              )
            : "None identified"
        }`,

        "Milestones:",

        ...plan.milestones.map(
          (
            milestone,
            index
          ) =>
            `${index + 1}. ${milestone}`
        ),
      ].join("\n");

    return state;
  }
}