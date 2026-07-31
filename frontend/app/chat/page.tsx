import Sidebar from "@/components/ui/Sidebar";
import ChatWindow from "@/components/ui/ChatWindow";

export default function ChatPage() {
  return (
    <main className="flex min-h-screen bg-black">
      <Sidebar />

      <section className="flex-1 p-10">
        <div className="max-w-6xl mx-auto">
          <ChatWindow />
        </div>
      </section>
    </main>
  );
}