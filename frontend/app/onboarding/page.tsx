"use client";

import {
  useState,
} from "react";

import {
  OnboardingFlow,
  OnboardingAnswers,
} from "@/features/onboarding";

import {
  HumanProfile,
} from "@/brain/profile/types";

export default function OnboardingPage() {
  const [completed, setCompleted] =
    useState(false);

  const [profile, setProfile] =
    useState<HumanProfile | null>(
      null
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  async function handleComplete(
    answers: OnboardingAnswers
  ) {
    setSaving(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/profile",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              identity: {
                fullName:
                  answers.name,
              },

              mission: {
                currentMission:
                  answers.mission,
                biggestGoal:
                  answers.goal,
              },

              personality: {
                communicationStyle:
                  answers.communicationStyle,
              },
            }),
          }
        );

      if (!response.ok) {
        const payload =
          (await response
            .json()
            .catch(() => null)) as {
            error?: string;
          } | null;

        throw new Error(
          payload?.error ??
            "Unable to save your Human Profile."
        );
      }

      const savedProfile =
        (await response.json()) as HumanProfile;

      setProfile(
        savedProfile
      );

      setCompleted(true);
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your Human Profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (completed && profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold">
            Welcome, {profile.identity.fullName}! 🎉
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
      <div className="w-full space-y-6">
        {error ? (
          <p
            role="alert"
            className="text-center text-sm text-red-400"
          >
            {error}
          </p>
        ) : null}

        <OnboardingFlow
          onComplete={handleComplete}
        />

        {saving ? (
          <p className="text-center text-sm text-zinc-500">
            Saving your Human Profile...
          </p>
        ) : null}
      </div>
    </main>
  );
}
