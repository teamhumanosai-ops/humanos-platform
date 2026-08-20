"use client";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  mediaName: string | null;
  onMediaSelected: (file: File | null) => void;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  mediaName,
  onMediaSelected,
}: ChatInputProps) {
  return (
    <div className="border-t border-white/10 pt-6">
      <div className="flex items-center gap-4">
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

        <label className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition hover:bg-white/10">
          Attach
          <input
            type="file"
            accept="image/*,audio/*"
            className="hidden"
            onChange={(e) =>
              onMediaSelected(
                e.target.files?.[0] ?? null
              )
            }
          />
        </label>

        <button
          type="button"
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

      {mediaName && (
        <div className="mt-3 flex items-center gap-3 text-sm text-zinc-300">
          <span className="truncate">
            Attached: {mediaName}
          </span>
          <button
            type="button"
            onClick={() => onMediaSelected(null)}
            className="text-zinc-400 transition hover:text-white"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
