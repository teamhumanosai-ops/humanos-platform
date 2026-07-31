"use client";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
}: ChatInputProps) {
  return (
    <div className="flex items-center gap-4 border-t border-white/10 pt-6">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
        placeholder="Type a message..."
        className="
          flex-1
          rounded-2xl
          border
          border-white/10
          bg-white/5
          px-5
          py-4
          text-white
          placeholder:text-zinc-500
          outline-none
          focus:border-(--primary)
        "
      />

      <button
        onClick={onSend}
        className="
          rounded-2xl
          bg-(--primary)
          px-6
          py-4
          font-medium
          text-white
          transition-all
          duration-300
          hover:bg-(--primary-hover)
        "
      >
        Send
      </button>
    </div>
  );
}