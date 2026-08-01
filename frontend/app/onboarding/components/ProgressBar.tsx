type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({
  current,
  total,
}: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm text-gray-400">
        <span>Getting to know you</span>
        <span>
          {current} / {total}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-zinc-800">
        <div
          className="h-2 rounded-full bg-white transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}