import Button from "@/components/ui/Button";

export default function AIHero() {
  return (
    <div
      className="
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        p-10
        mb-10
      "
    >
      <p className="text-zinc-400 text-lg">
        Good Morning 👋
      </p>

      <h1 className="mt-3 text-5xl font-bold text-white">
        How can I help you today?
      </h1>

      <p className="mt-6 max-w-2xl text-zinc-400 text-lg leading-8">
        You have 12 tasks, 3 meetings and one investor
        follow-up today. I can organize your schedule,
        prioritize your work and help you stay focused.
      </p>

      <div className="flex gap-4 mt-10">
        <Button>Plan My Day</Button>
        <Button>Ask AI</Button>
        <Button>Open Memory</Button>
      </div>
    </div>
  );
}