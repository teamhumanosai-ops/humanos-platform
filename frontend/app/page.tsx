import Sidebar from "@/components/ui/Sidebar";
import Widget from "@/components/ui/Widget";
import StatCard from "@/components/ui/StatCard";
import SectionTitle from "@/components/ui/SectionTitle";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-black">
      <Sidebar />

      <section className="flex-1 p-12 overflow-y-auto">
        <SectionTitle
          title="Welcome to Human OS"
          subtitle="Your AI operating system for work, life, memory, planning and everything in between."
        />

        <div className="grid grid-cols-3 gap-6 mt-10">
          <StatCard
            number="12"
            label="Tasks Today"
          />

          <StatCard
            number="3"
            label="Meetings"
          />

          <StatCard
            number="87%"
            label="Daily Focus"
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <Widget title="Today's Focus">
            <div className="space-y-3 text-zinc-300">
              <p>✅ Finish Human OS Dashboard</p>
              <p>🧠 Continue AI Memory System</p>
              <p>📞 Investor Follow-up</p>
            </div>
          </Widget>

          <Widget title="AI Assistant">
            <div className="space-y-4">
              <p className="text-zinc-300">
                Good morning, Rutvik.
              </p>

              <p className="text-zinc-400">
                You have 12 tasks today and one investor follow-up.
                I recommend finishing the dashboard before starting new features.
              </p>
            </div>
          </Widget>

          <Widget title="Calendar">
            <div className="space-y-2 text-zinc-300">
              <p>10:00 AM — Team Planning</p>
              <p>2:30 PM — Product Design</p>
              <p>6:00 PM — Development Session</p>
            </div>
          </Widget>

          <Widget title="Recent Activity">
            <div className="space-y-2 text-zinc-300">
              <p>• Dashboard created</p>
              <p>• Sidebar completed</p>
              <p>• Design System initialized</p>
            </div>
          </Widget>
        </div>
      </section>
    </main>
  );
}