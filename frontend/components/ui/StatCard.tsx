type StatCardProps = {
  number: string;
  label: string;
};

export default function StatCard({
  number,
  label,
}: StatCardProps) {
  return (
    <div
      className="
      rounded-2xl
      bg-white/5
      border border-white/10
      p-5
    "
    >
      <h2 className="text-3xl font-bold text-white">
        {number}
      </h2>

      <p className="text-zinc-400 mt-2">
        {label}
      </p>
    </div>
  );
}