import { cn } from "@/lib/utils";

interface Props {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "lg";
}

export function PackCard({ label, selected, disabled, onClick, size = "lg" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative group rounded-3xl overflow-hidden transition-all duration-300",
        "border bg-gradient-to-br from-emerald-900/40 via-slate-900/60 to-black/60",
        "hover:-translate-y-1 hover:shadow-neon disabled:opacity-40 disabled:cursor-not-allowed",
        size === "lg" ? "w-full aspect-[3/4] p-6" : "w-32 aspect-[3/4] p-3",
        selected
          ? "border-neon glow-ring animate-pulse-neon"
          : "border-white/10 hover:border-neon/60",
      )}
    >
      {/* Shine */}
      <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity">
        <div className="absolute inset-x-0 -top-1/2 h-full bg-gradient-to-b from-white/10 via-transparent to-transparent rotate-6" />
      </div>

      {/* Pitch lines pattern */}
      <div className="absolute inset-0 pitch-lines opacity-30 pointer-events-none" />

      <div className="relative flex flex-col items-center justify-between h-full">
        <div className="w-full flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Mystery
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-neon">Squad</span>
        </div>

        {/* Football icon */}
        <div className={cn("relative animate-pack-float", size === "lg" ? "size-24" : "size-12")}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon/30 to-transparent blur-xl" />
          <svg viewBox="0 0 100 100" className="relative w-full h-full text-neon drop-shadow-[0_0_20px_currentColor]">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,25 62,34 57,48 43,48 38,34" fill="currentColor" opacity="0.9" />
            <path d="M50 25 L50 10 M62 34 L75 30 M57 48 L70 58 M43 48 L30 58 M38 34 L25 30"
              stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
          </svg>
        </div>

        <div className="text-center">
          <div className={cn("font-display font-bold text-foreground", size === "lg" ? "text-3xl" : "text-base")}>
            {label}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">11 players hidden</div>
        </div>
      </div>
    </button>
  );
}
