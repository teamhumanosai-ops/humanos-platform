type GlassCardProps = {
  children: React.ReactNode;
};

export default function GlassCard({ children }: GlassCardProps) {
  return (
    <div
      className="
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-2xl
        shadow-2xl
        shadow-black/40
        p-10
        transition-all
        duration-300
        hover:border-white/20
        hover:bg-white/10
      "
    >
      {children}
    </div>
  );
}