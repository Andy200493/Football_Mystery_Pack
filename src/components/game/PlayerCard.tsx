import type { Player } from "@/data/players";

const POSITION_ACCENT: Record<Player["position"], string> = {
  GK: "from-amber-400/30 to-amber-600/10 border-amber-400/40 text-amber-200",
  DEF: "from-sky-400/30 to-sky-600/10 border-sky-400/40 text-sky-200",
  MID: "from-emerald-400/30 to-emerald-600/10 border-emerald-400/40 text-emerald-200",
  FWD: "from-rose-400/30 to-rose-600/10 border-rose-400/40 text-rose-200",
};

const POSITION_LABEL: Record<Player["position"], string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

export function PlayerCard({ player, delayMs = 0 }: { player: Player; delayMs?: number }) {
  return (
    <div
      className={`relative rounded-2xl p-4 border bg-gradient-to-br ${POSITION_ACCENT[player.position]} backdrop-blur-md animate-fade-up shadow-card`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest opacity-80">
            {POSITION_LABEL[player.position]}
          </div>
          <div className="font-display text-lg leading-tight font-semibold text-foreground">
            {player.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{player.nationality}</div>
        </div>
        <div className="font-display text-2xl font-bold text-neon">{player.rating}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
        {player.ballonDor && (
          <span className="rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-200 px-2 py-0.5">
            Ballon d'Or
          </span>
        )}
        {player.worldCup && (
          <span className="rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-200 px-2 py-0.5">
            World Cup
          </span>
        )}
        {player.championsLeague && (
          <span className="rounded-full bg-indigo-400/15 border border-indigo-400/40 text-indigo-200 px-2 py-0.5">
            UCL
          </span>
        )}
        {player.legendary && (
          <span className="rounded-full bg-fuchsia-400/15 border border-fuchsia-400/40 text-fuchsia-200 px-2 py-0.5">
            Legend
          </span>
        )}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground italic">{player.style}</div>
    </div>
  );
}
