export type TimelineCategory =
  | "Career"
  | "Startup"
  | "Project"
  | "Achievement"
  | "Education"
  | "Finance"
  | "Health"
  | "Relationship"
  | "Travel"
  | "Personal";

export interface TimelineEvent {
  id?: number;

  timestamp: string;

  title: string;

  description: string;

  category: TimelineCategory;

  confidence: number;

  source: string;

  createdAt: string;
}