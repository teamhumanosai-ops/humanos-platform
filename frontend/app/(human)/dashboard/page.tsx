import AppPage from "@/components/ui/AppPage";

export default function DashboardPage() {
  return (
    <AppPage
      title="Dashboard"
      description="Welcome to your Human OS dashboard. This is your central workspace where you'll see your daily focus, AI insights, tasks, calendar, and overall progress."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Today&apos;s Focus
          </h2>

          <p className="mt-3 text-zinc-400">
            Your personalized daily mission and priorities will appear here.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            AI Insights
          </h2>

          <p className="mt-3 text-zinc-400">
            Human OS will surface recommendations, reminders, and opportunities
            based on your Digital DNA.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Upcoming Tasks
          </h2>

          <p className="mt-3 text-zinc-400">
            Your task manager will be integrated in a future milestone.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Calendar
          </h2>

          <p className="mt-3 text-zinc-400">
            Upcoming meetings and events will be displayed here.
          </p>
        </div>
      </div>
    </AppPage>
  );
}