export function extractGoal(
  message: string
): string | null {
  const patterns = [
    /i want to (.+)/i,
    /i need to (.+)/i,
    /my goal is (.+)/i,
    /help me (.+)/i,
    /i'm trying to (.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}