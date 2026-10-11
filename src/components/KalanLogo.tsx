type Tone = "light" | "dark";

const TONES: Record<Tone, string[]> = {
  light: [
    "text-kalan-green",
    "text-kalan-red",
    "text-kalan-green",
    "text-kalan-yellow",
    "text-kalan-green",
  ],
  dark: ["text-white", "text-red-300", "text-white", "text-yellow-300", "text-white"],
};

export function KalanWordmark({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: Tone;
}) {
  const colors = TONES[tone];
  const letters = ["K", "A", "L", "A", "N"];
  return (
    <span className={`font-extrabold tracking-wide ${className}`}>
      {letters.map((letter, i) => (
        <span key={i} className={colors[i]}>
          {letter}
        </span>
      ))}
    </span>
  );
}

export function KalanMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="48" fill="#1A5C2A" />
      <path
        d="M34 28 L34 72 L44 72 L44 55 L60 72 L73 72 L53 50 L72 28 L59 28 L44 46 L44 28 Z"
        fill="#fff"
      />
      <path d="M58 32 Q72 26 77 17 Q79 30 67 39 Z" fill="#C62828" />
      <path d="M60 42 Q76 38 83 29 Q83 44 69 50 Z" fill="#F9A825" />
    </svg>
  );
}
