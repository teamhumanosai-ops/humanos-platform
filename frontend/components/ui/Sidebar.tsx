type SidebarProps = {
  children?: React.ReactNode;
};

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside
      className="
        w-72
        h-screen
        border-r
        border-white/10
        bg-white/5
        backdrop-blur-2xl
        px-6
        py-8
      "
    >
      <h2 className="text-2xl font-bold text-white">
        Human OS
      </h2>

      <div className="mt-12 space-y-3">

        <div className="rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 cursor-pointer">
          Home
        </div>

        <div className="rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 cursor-pointer">
          Calendar
        </div>

        <div className="rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 cursor-pointer">
          Tasks
        </div>

        <div className="rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 cursor-pointer">
          Notes
        </div>

        <div className="rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 cursor-pointer">
          AI Assistant
        </div>

        <div className="rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 cursor-pointer">
          Settings
        </div>

      </div>

      {children}
    </aside>
  );
}