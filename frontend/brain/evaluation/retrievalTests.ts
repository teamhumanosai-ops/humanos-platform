import { EvaluationCase } from "./retrievalEvaluator";

export const retrievalTests: EvaluationCase[] = [
  {
    name: "Creator",
    query: "Who built Human OS?",
    expected: "Rutvik Joshi",
  },
  {
    name: "Vision",
    query: "What is the vision of Human OS?",
    expected: "AI Operating System",
  },
  {
    name: "Mission",
    query: "What is the mission of Human OS?",
    expected: "replace fragmented productivity apps",
  },
  {
    name: "Platform",
    query: "What is Human OS?",
    expected: "AI Operating System",
  },
];