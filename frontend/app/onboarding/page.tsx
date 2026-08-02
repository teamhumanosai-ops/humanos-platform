"use client";

import { useState } from "react";

import {
  OnboardingFlow,
  OnboardingAnswers,
} from "@/features/onboarding";

import { profileEngine } from "@/brain/profile/profileEngine";

export default function OnboardingPage() {
  const [completed, setCompleted] = useState(false);

  function handleComplete(
    answers: OnboardingAnswers
  ) {
    profileEngine.create({
      identity: {
        fullName: answers.name,
      },

      mission: {
        currentMission: answers.mission,
        biggestGoal: answers.goal,
      },

      personality: {
        communicationStyle:
          answers.communicationStyle,
      },
    });

    setCompleted(true);
  }

  if (completed) {
    const profile = profileEngine.get();

    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold">
            Welcome, {profile?.identity.fullName}! 🎉
          </h1>

          <p className="text-zinc-400">
            Your Human Profile has been created.
          </p>

          <p className="text-zinc-500">
            Dashboard integration comes in the next
            milestone.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <OnboardingFlow
        onComplete={handleComplete}
      />
    </main>
  );
}