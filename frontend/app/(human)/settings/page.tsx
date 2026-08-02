import AppPage from "@/components/ui/AppPage";

export default function SettingsPage() {
  return (
    <AppPage
      title="Settings"
      description="Configure your Human OS experience, AI behavior, and personal preferences."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            AI Preferences
          </h2>

          <p className="mt-3 text-zinc-400">
            Configure how Human OS communicates with you and personalizes its
            responses.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Profile
          </h2>

          <p className="mt-3 text-zinc-400">
            View and manage your Digital DNA, onboarding information, and
            profile settings.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Future Integrations
          </h2>

          <p className="mt-3 text-zinc-400">
            Google Calendar, Gmail, GitHub, Slack, Notion, and other
            integrations will be managed here in future milestones.
          </p>
        </div>
      </div>
    </AppPage>
  );
}