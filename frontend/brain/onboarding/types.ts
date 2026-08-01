export interface OnboardingStep {
  id: string;

  title: string;

  description: string;
}

export interface OnboardingState {
  currentStep: number;

  answers: Record<string, string>;
}