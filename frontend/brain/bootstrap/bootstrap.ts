import { initializeKnowledge } from "../knowledge";

let initialized = false;

export async function initializeBrain(): Promise<void> {
  if (initialized) {
    return;
  }

  initialized = true;

  await initializeKnowledge();

  console.log("🧠 Human OS Brain initialized.");
}