type WidgetProps = {
  title: string;
  children: React.ReactNode;
};

export default function Widget({ title, children }: WidgetProps) {
  return (
    <div
      className="
      rounded-3xl
      border border-white/10
      bg-white/5
      backdrop-blur-xl
      p-6
      transition-all
      duration-300
      hover:border-white/20
      hover:bg-white/10
    "
    >
      <h3 className="text-white text-lg font-semibold mb-5">
        {title}
      </h3>

      {children}
    </div>
  );
}