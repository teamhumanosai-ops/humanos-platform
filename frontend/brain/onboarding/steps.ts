import { OnboardingStep } from "./types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    description:
      "Let's begin your Human OS journey.",
  },

  {
    id: "name",
    title: "Your Name",
    description:
      "What should I call you?",
  },

  {
    id: "mission",
    title: "Current Mission",
    description:
      "What are you building right now?",
  },

  {
    id: "goal",
    title: "Biggest Goal",
    description:
      "What's your biggest goal this year?",
  },

  {
    id: "communication",
    title: "Communication Style",
    description:
      "How would you like me to communicate with you?",
  },

  {
    id: "complete",
    title: "Complete",
    description:
      "Your Human OS profile is ready.",
  },
];