"use client";

import { useState } from "react";

import ProgressBar from "./components/ProgressBar";
import WelcomeCard from "./components/WelcomeCard";

export default function OnboardingPage() {
  const [started, setStarted] = useState(false);

  const [name, setName] = useState("");

  if (!started) {
    return (
      <div className="space-y-12">
        <ProgressBar
          current={1}
          total={5}
        />

        <WelcomeCard
          onBegin={() => setStarted(true)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <ProgressBar
        current={2}
        total={5}
      />

      <div className="space-y-6">
        <h1 className="text-4xl font-bold">
          What should I call you?
        </h1>

        <p className="text-gray-400">
          This helps Human OS personalize every future
          conversation.
        </p>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Enter your name..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none focus:border-white"
        />

        <button
          disabled={!name.trim()}
          className="rounded-xl bg-white px-8 py-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}