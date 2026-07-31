import { memorySkill } from "../skills";

export function executeSkills(message: string): string | null {
  const memoryResult = memorySkill(message);

  if (memoryResult) {
    return memoryResult;
  }

  return null;
}