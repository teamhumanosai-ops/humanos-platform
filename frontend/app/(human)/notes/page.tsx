import AppPage from "@/components/ui/AppPage";

export default function NotesPage() {
  return (
    <AppPage
      title="Notes"
      description="Capture ideas, meeting notes, research, and important information in one place."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Quick Notes
          </h2>

          <p className="mt-3 text-zinc-400">
            Create and organize your personal notes. Human OS will eventually
            help categorize, summarize, and connect them with your projects.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            AI Knowledge
          </h2>

          <p className="mt-3 text-zinc-400">
            Future milestones will allow Human OS to search, reference, and
            intelligently use your notes during conversations.
          </p>
        </div>
      </div>
    </AppPage>
  );
}