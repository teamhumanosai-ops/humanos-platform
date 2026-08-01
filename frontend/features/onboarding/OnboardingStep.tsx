"use client";

import QuestionCard from "./QuestionCard";

interface OnboardingStepProps {
  title: string;
  description?: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onNext: () => void;
  canContinue: boolean;
}

export default function OnboardingStep({
  title,
  description,
  value,
  placeholder,
  onChange,
  onNext,
  canContinue,
}: OnboardingStepProps) {
  return (
    <QuestionCard
      title={title}
      description={description}
    >
      <div className="space-y-6">
        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 text-lg text-white outline-none transition focus:border-white"
        />

        <button
          onClick={onNext}
          disabled={!canContinue}
          className="rounded-xl bg-white px-8 py-4 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </QuestionCard>
  );
}