export type Plan = {
  id: string;

  title: string;

  goal: string;

  description: string;

  status: "active" | "completed" | "paused";

  milestones: string[];

  completedMilestones: string[];

  nextAction: string;

  priority: number;

  confidence: number;

  createdAt: Date;

  updatedAt: Date;
};