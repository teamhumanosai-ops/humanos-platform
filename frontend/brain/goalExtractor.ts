const DIRECT_GOAL_PATTERNS = [
  /i want to (.+)/i,
  /i need to (.+)/i,
  /my goal is (.+)/i,
  /help me (.+)/i,
  /i'm trying to (.+)/i,
  /im trying to (.+)/i,
  /i would like to (.+)/i,
  /i'd like to (.+)/i,
  /i plan to (.+)/i,
  /i am planning to (.+)/i,
];

const ACTION_PATTERNS = [
  /^(finish|complete|do|buy|prepare|organize|organise|handle|review|update|fix|clean|call|send|pay|book|schedule|build|create|develop|launch|write|read|study|learn|practice|research|design|implement|install|set up|setup|execute)\b\s+(.+)/i,
];

const INFORMATION_PATTERNS = [
  /^show me\b/i,
  /^list\b/i,
  /^what are\b/i,
  /^what is\b/i,
  /^what's\b/i,
  /^tell me\b/i,
  /^where are\b/i,
  /^which\b/i,
  /^do i have\b/i,
  /^how many\b/i,
];

export function extractGoal(
  message: string
): string | null {
  const text =
    message
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  if (!text) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Explicit informational requests are never goals.
  |--------------------------------------------------------------------------
  */

  if (
    INFORMATION_PATTERNS.some(
      (pattern) =>
        pattern.test(text)
    )
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Explicit goal language
  |--------------------------------------------------------------------------
  */

  for (
    const pattern of
    DIRECT_GOAL_PATTERNS
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      const goal =
        match[1].trim();

      if (
        goal.length > 0
      ) {
        return goal;
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Generic actionable requests
  |--------------------------------------------------------------------------
  |
  | This allows task-style language to become goals
  | without requiring the user to say "I want to".
  |
  | Examples:
  |
  | "Finish the Human OS planner"
  | "Buy groceries"
  | "Review my finances"
  | "Study machine learning"
  | "Book a dentist appointment"
  |
  */

  for (
    const pattern of
    ACTION_PATTERNS
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      match?.[2]
    ) {
      const action =
        match[1].trim();

      const target =
        match[2].trim();

      if (
        target.length > 0
      ) {
        return `${action} ${target}`;
      }
    }
  }

  return null;
}