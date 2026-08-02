import AppPage from "@/components/ui/AppPage";

export default function MissionPage() {
  return (
    <AppPage
      title="Mission"
      description="Your mission is the long-term direction that guides your work, learning, and personal growth."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Current Mission
          </h2>

          <p className="mt-3 text-zinc-400">
            Your active mission will appear here and evolve as Human OS learns
            more about your priorities.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Long-Term Goals
          </h2>

          <p className="mt-3 text-zinc-400">
            Human OS will connect your long-term goals with your daily work to
            help you stay aligned.
          </p>
        </div>
      </div>
    </AppPage>
  );
}