import AppPage from "@/components/ui/AppPage";

export default function PlannerPage() {
  return (
    <AppPage
      title="Planner"
      description="Plan your day, week, and long-term objectives with the help of Human OS."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Daily Planning
          </h2>

          <p className="mt-3 text-zinc-400">
            Your daily schedule, priorities, and AI recommendations will appear
            here.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Weekly Planning
          </h2>

          <p className="mt-3 text-zinc-400">
            Human OS will help you organize weekly goals, projects, and
            milestones.
          </p>
        </div>
      </div>
    </AppPage>
  );
}