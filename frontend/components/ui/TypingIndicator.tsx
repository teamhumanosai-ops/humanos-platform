export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          px-6
          py-5
        "
      >
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"></span>

          <span
            className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>

          <span
            className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}