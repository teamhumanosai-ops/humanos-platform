import { ReactNode } from "react";

import Sidebar from "@/components/ui/Sidebar";

type HumanLayoutProps = {
  children: ReactNode;
};

export default function HumanLayout({
  children,
}: HumanLayoutProps) {
  return (
    <main className="flex min-h-screen bg-black">
      <Sidebar />

      <section className="flex-1 overflow-y-auto p-8">
        {children}
      </section>
    </main>
  );
}