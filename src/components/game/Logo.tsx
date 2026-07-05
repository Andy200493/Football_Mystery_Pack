import { useT } from "@/lib/i18n/context";

export function Logo({ className = "" }: { className?: string }) {
  const t = useT();
  const brand = t("brand.name");
  // Split at last space for two-tone brand rendering (works for EN & AR).
  const words = brand.split(" ");
  const first = words.slice(0, words.length - 1).join(" ");
  const last = words[words.length - 1];
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative size-8">
        <div className="absolute inset-0 rounded-full bg-neon/30 blur-md" />
        <svg viewBox="0 0 100 100" className="relative w-full h-full text-neon">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
          <polygon points="50,28 64,38 58,54 42,54 36,38" fill="currentColor" />
        </svg>
      </div>
      <div className="font-display font-bold tracking-tight">
        <span className="text-foreground">{first}</span>{" "}
        <span className="text-neon">{last}</span>
      </div>
    </div>
  );
}
