type ChatMessageProps = {
  role: "user" | "assistant";
  message: string;
};

export default function ChatMessage({
  role,
  message,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[75%]
          rounded-3xl
          px-5
          py-4
          text-base
          leading-7
          transition-all
          duration-300

          ${
            isUser
              ? "bg-[var(--primary)] text-white"
              : "bg-white/5 border border-white/10 text-white"
          }
        `}
      >
        {message}
      </div>
    </div>
  );
}