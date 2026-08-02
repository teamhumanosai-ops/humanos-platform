import Link from "next/link";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Chat",
    href: "/chat",
    icon: "💬",
  },
  {
    name: "Memory",
    href: "/memory",
    icon: "🧠",
  },
  {
    name: "Mission",
    href: "/mission",
    icon: "🎯",
  },
  {
    name: "Notes",
    href: "/notes",
    icon: "📝",
  },
  {
    name: "Planner",
    href: "/planner",
    icon: "📅",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "⚙️",
  },
];

export default function Sidebar() {
  return (
    <aside
      className="
        w-72
        min-h-screen
        border-r
        border-white/10
        bg-zinc-950
        px-6
        py-8
      "
    >
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">
          Human OS
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Your AI Operating System
        </p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-zinc-300
              transition-colors
              hover:bg-white/10
              hover:text-white
            "
          >
            <span>{item.icon}</span>

            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}