type TypographyProps = {
  children: React.ReactNode;
};

export function Display({ children }: TypographyProps) {
  return (
    <h1 className="text-7xl font-bold tracking-tight text-white">
      {children}
    </h1>
  );
}

export function Heading({ children }: TypographyProps) {
  return (
    <h2 className="text-4xl font-semibold tracking-tight text-white">
      {children}
    </h2>
  );
}

export function Body({ children }: TypographyProps) {
  return (
    <p className="text-lg text-zinc-400 leading-relaxed">
      {children}
    </p>
  );
}

export function Caption({ children }: TypographyProps) {
  return (
    <span className="text-sm text-zinc-500">
      {children}
    </span>
  );
}