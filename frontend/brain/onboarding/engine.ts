import { ONBOARDING_STEPS } from "./steps";
import { OnboardingState } from "./types";

export class OnboardingEngine {
  private state: OnboardingState = {
    currentStep: 0,
    answers: {},
  };

  getState(): OnboardingState {
    return this.state;
  }

  getCurrentStep() {
    return ONBOARDING_STEPS[this.state.currentStep];
  }

  next(): void {
    if (this.state.currentStep < ONBOARDING_STEPS.length - 1) {
      this.state.currentStep++;
    }
  }

  previous(): void {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
    }
  }

  saveAnswer(stepId: string, answer: string): void {
    this.state.answers[stepId] = answer;
  }

  reset(): void {
    this.state = {
      currentStep: 0,
      answers: {},
    };
  }

  isComplete(): boolean {
    return (
      this.state.currentStep ===
      ONBOARDING_STEPS.length - 1
    );
  }
}

export const onboardingEngine =
  new OnboardingEngine();