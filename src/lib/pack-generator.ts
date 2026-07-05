import { PLAYERS, type Player, type Position } from "@/data/players";

export interface Pack {
  id: string;
  label: string;
  players: Player[];
}

const REQUIRED: Record<Position, number> = { GK: 1, DEF: 4, MID: 3, FWD: 3 };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple seeded RNG
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate 6 unique packs (3 per player) from the pool, ensuring no player repeats. */
export function generateGamePacks(seed = Date.now()): { p1: Pack[]; p2: Pack[] } {
  const rng = mulberry32(seed);
  const positions: Position[] = ["GK", "DEF", "MID", "FWD"];
  const pools: Record<Position, Player[]> = {
    GK: shuffle(PLAYERS.filter((p) => p.position === "GK"), rng),
    DEF: shuffle(PLAYERS.filter((p) => p.position === "DEF"), rng),
    MID: shuffle(PLAYERS.filter((p) => p.position === "MID"), rng),
    FWD: shuffle(PLAYERS.filter((p) => p.position === "FWD"), rng),
  };

  const packs: Pack[] = [];
  const labels = ["A", "B", "C", "D", "E", "F"];
  for (let i = 0; i < 6; i++) {
    const players: Player[] = [];
    for (const pos of positions) {
      const need = REQUIRED[pos];
      const drawn = pools[pos].splice(0, need);
      if (drawn.length < need) {
        throw new Error(`Not enough ${pos} players in pool`);
      }
      players.push(...drawn);
    }
    packs.push({ id: `pack-${i}`, label: `Pack ${labels[i]}`, players });
  }

  return {
    p1: packs.slice(0, 3).map((p, i) => ({ ...p, label: `Pack ${labels[i]}` })),
    p2: packs.slice(3, 6).map((p, i) => ({ ...p, label: `Pack ${labels[i]}` })),
  };
}
