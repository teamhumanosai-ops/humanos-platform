"use client";

import { useMemo, useState } from "react";

import OnboardingStep from "./OnboardingStep";

export interface OnboardingAnswers {
  name: string;
  mission: string;
  goal: string;
  communicationStyle: string;
}

interface OnboardingFlowProps {
  onComplete: (answers: OnboardingAnswers) => void;
}

const STEPS = [
  {
    key: "name",
    title: "What's your name?",
    description: "I'd like to know what to call you.",
    placeholder: "Enter your name...",
  },
  {
    key: "mission",
    title: "What are you building?",
    description: "Tell me your current mission.",
    placeholder: "Human OS",
  },
  {
    key: "goal",
    title: "What's your biggest goal this year?",
    description: "Dream big.",
    placeholder: "Build the world's first AI Operating System",
  },
  {
    key: "communicationStyle",
    title: "How should I communicate with you?",
    description: "Examples: Direct, Friendly, Coach, Mentor",
    placeholder: "Direct",
  },
] as const;

export default function OnboardingFlow({
  onComplete,
}: OnboardingFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: "",
    mission: "",
    goal: "",
    communicationStyle: "",
  });

  const step = STEPS[stepIndex];

  const value = useMemo(() => {
    return answers[step.key];
  }, [answers, step]);

  function update(value: string) {
    setAnswers((previous) => ({
      ...previous,
      [step.key]: value,
    }));
  }

  function next() {
    if (stepIndex === STEPS.length - 1) {
      onComplete(answers);
      return;
    }

    setStepIndex((previous) => previous + 1);
  }

  return (
    <OnboardingStep
      title={step.title}
      description={step.description}
      placeholder={step.placeholder}
      value={value}
      onChange={update}
      onNext={next}
      canContinue={value.trim().length > 0}
    />
  );
}