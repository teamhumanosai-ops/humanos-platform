"use client";

import { ReactNode } from "react";

interface QuestionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function QuestionCard({
  title,
  description,
  children,
}: QuestionCardProps) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-zinc-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}