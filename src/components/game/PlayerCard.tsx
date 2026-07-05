import type { Player } from "@/data/players";
import { getPortraitUrl, getInitials } from "@/lib/portraits";
import { useT } from "@/lib/i18n/context";

const POSITION_ACCENT: Record<Player["position"], string> = {
  GK:  "from-sky-500/25 to-sky-800/10 border-sky-400/40",
  DEF: "from-blue-500/25 to-blue-800/10 border-blue-400/40",
  MID: "from-indigo-500/25 to-indigo-800/10 border-indigo-400/40",
  FWD: "from-cyan-500/25 to-cyan-800/10 border-cyan-400/40",
};

export function PlayerCard({ player, delayMs = 0 }: { player: Player; delayMs?: number }) {
  const t = useT();
  const portrait = getPortraitUrl(player);
  return (
    <div
      className={`relative rounded-2xl p-3 border bg-gradient-to-br ${POSITION_ACCENT[player.position]} backdrop-blur-md animate-fade-up shadow-card`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="relative size-14 rounded-xl overflow-hidden bg-neon/10 border border-neon/30 flex items-center justify-center shrink-0">
          <img
            src={portrait}
            alt={player.name}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="text-xs font-display font-bold text-neon">{getInitials(player.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                {t(`pc.pos.${player.position}`)}
              </div>
              <div className="font-display text-base leading-tight font-semibold text-foreground truncate">
                {player.name}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {player.nationality} · {player.clubs[0] ?? "—"}
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-neon shrink-0">{player.rating}</div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
            {player.ballonDor && <Badge>{t("pc.badge.bd")}</Badge>}
            {player.worldCup && <Badge>{t("pc.badge.wc")}</Badge>}
            {player.championsLeague && <Badge>{t("pc.badge.ucl")}</Badge>}
            {player.legendary && <Badge>{t("pc.badge.leg")}</Badge>}
            {player.captain && <Badge>{t("pc.badge.cap")}</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-neon/15 border border-neon/40 text-neon px-2 py-0.5">
      {children}
    </span>
  );
}
