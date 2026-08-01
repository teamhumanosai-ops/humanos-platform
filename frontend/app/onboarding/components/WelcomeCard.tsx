type WelcomeCardProps = {
  onBegin: () => void;
};

export default function WelcomeCard({
  onBegin,
}: WelcomeCardProps) {
  return (
    <section className="space-y-8 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold">
          Welcome to Human OS
        </h1>

        <p className="text-xl text-gray-300">
          Before we begin...
        </p>

        <p className="text-gray-400 leading-8">
          {"I'd like to understand you."}

          <br />

          The better I know you,

          <br />

          the better I can help you

          <br />

          for years to come.
        </p>
      </div>

      <button
        onClick={onBegin}
        className="rounded-xl bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
      >
        Begin
      </button>
    </section>
  );
}