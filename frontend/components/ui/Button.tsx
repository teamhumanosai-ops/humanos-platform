type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button
      className="
        px-6
        py-3
        rounded-2xl
        bg-[var(--primary)]
        text-white
        font-medium
        transition-all
        duration-300
        hover:bg-[var(--primary-hover)]
        hover:scale-105
      "
    >
      {children}
    </button>
  );
}