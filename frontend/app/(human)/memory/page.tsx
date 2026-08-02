"use client";

import { useEffect, useState } from "react";

import AppPage from "@/components/ui/AppPage";

type Memory = {
  key: string;
  value: string;
  confidence: number;
  updatedAt: string;
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    async function loadMemory() {
      const response = await fetch("/api/memory");

      const data = await response.json();

      setMemories(data);
    }

    loadMemory();
  }, []);

  return (
    <AppPage
      title="Memory"
      description="Human OS remembers important information to personalize every conversation and continuously build your Digital DNA."
    >
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-white">
          Stored Memories
        </h2>

        {memories.length === 0 ? (
          <p className="mt-4 text-zinc-400">
            No memories stored yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {memories.map((memory) => (
              <div
                key={memory.key}
                className="rounded-lg border border-white/10 bg-zinc-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    {memory.key}
                  </h3>

                  <span className="text-xs text-zinc-400">
                    Confidence: {memory.confidence}
                  </span>
                </div>

                <p className="mt-2 text-zinc-300">
                  {memory.value}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  Updated:{" "}
                  {new Date(
                    memory.updatedAt
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppPage>
  );
}