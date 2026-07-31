import { IDENTITY } from "./identity";
import { PERSONALITY } from "./personality";
import { RULES } from "./rules";

export const SYSTEM_PROMPT = `
${IDENTITY}

${PERSONALITY}

${RULES}
`;