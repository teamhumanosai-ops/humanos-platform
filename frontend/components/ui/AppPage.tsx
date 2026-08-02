type AppPageProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function AppPage({
  title,
  description,
  children,
}: AppPageProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-2 text-zinc-400">
          {description}
        </p>
      </header>

      <section
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-6
        "
      >
        {children ? (
          children
        ) : (
          <p className="text-zinc-400">
            This section will become fully
            functional in a future milestone.
          </p>
        )}
      </section>
    </div>
  );
}