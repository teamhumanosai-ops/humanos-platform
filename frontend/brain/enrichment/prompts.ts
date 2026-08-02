import { EnrichmentField } from "./rules";

export const enrichmentPrompts: Record<
  EnrichmentField,
  string
> = {
  "identity.preferredName":
    "What would you like me to call you?",

  "identity.country":
    "Which country do you currently live in?",

  "identity.timezone":
    "What's your current time zone?",

  "identity.age":
    "Would you like to share your age? It's completely optional.",

  "mission.lifeMission":
    "What do you ultimately want your life to be about?",

  "mission.currentMission":
    "What are you focused on right now?",

  "mission.biggestGoal":
    "What's the biggest goal you're currently working toward?",

  "mission.currentProject":
    "What project are you spending most of your time on these days?",

  "personality.communicationStyle":
    "How do you prefer me to communicate with you?",

  "personality.learningStyle":
    "Do you learn best by reading, watching videos, or building things?",

  "personality.decisionStyle":
    "When making decisions, do you rely more on logic, intuition, or a mix of both?",

  "productivity.bestWorkingHours":
    "When are you usually at your most productive?",

  "productivity.biggestDistraction":
    "What's the biggest thing that distracts you from your work?",

  "productivity.planningStyle":
    "Do you prefer planning your day, your week, or just going with the flow?",

  "interests.favoriteTopics":
    "What topics could you happily talk about for hours?",

  "interests.favoriteBooks":
    "Are there any books that have had a big impact on you?",

  "interests.favoriteCreators":
    "Whose content do you enjoy following the most?"
};