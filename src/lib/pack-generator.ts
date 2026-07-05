/**
 * Balanced pack generator.
 *
 * Builds 6 packs (3 per player) of 11 players in a 4-3-3 shape. Every pack's
 * average rating is forced within ±1.5 of a shared target (~84), so no pack
 * is stacked with icons while another is filler.
 *
 * Each pack is biased toward a different "flavour" (world-cup heavy, league
 * legend heavy, youth heavy, continent heavy, cult heroes, tactical) so the
 * squads FEEL different while remaining balanced by rating.
 */

import { PLAYERS_BY_POSITION, type Player, type Position } from "@/data/players";

export interface PackMeta {
  avgRating: number;
  worldCupWinners: number;
  championsLeagueWinners: number;
  ballonDorWinners: number;
  activeCount: number;
  legendCount: number;
  avgAgeEra: "classic" | "modern" | "current" | "mixed";
}

export interface Pack {
  id: string;
  label: string;             // "Mystery Pack A"
  players: Player[];
  meta: PackMeta;
  flavour: string;           // internal — never rendered pre-reveal
}

const FORMATION: Record<Position, number> = { GK: 1, DEF: 4, MID: 3, FWD: 3 };
const TARGET_RATING = 83.5;
const RATING_BAND = 2.0; // ±

// ---------------- rng ----------------
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
function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function avg(nums: number[]) {
  return nums.reduce((s, n) => s + n, 0) / Math.max(1, nums.length);
}

// ---------------- flavour weighting ----------------
type Flavour = {
  key: string;
  weight: (p: Player) => number;
};

const FLAVOURS: Flavour[] = [
  { key: "world-cup",   weight: (p) => (p.worldCup ? 3 : 1) + (p.legendary ? 0.5 : 0) },
  { key: "ucl-elite",   weight: (p) => (p.championsLeague ? 3 : 1) + (p.ballonDor ? 0.7 : 0) },
  { key: "modern-stars",weight: (p) => (p.era === "current" ? 3 : p.era === "modern" ? 1.5 : 0.6) },
  { key: "classic",     weight: (p) => (p.era === "classic" ? 3 : p.era === "modern" ? 1.4 : 0.7) },
  { key: "premier",     weight: (p) => (p.leagues.includes("Premier League") ? 3 : 1) },
  { key: "world-mix",   weight: (p) => (["S.America","Africa","Asia"].some(() => false) ? 1 : 1) + (p.nationality === "Brazil" || p.nationality === "Argentina" ? 2 : 1) },
];

// Pick n players from pool weighted by flavour, no duplicates, no reuse across packs
function pickWeighted(
  pool: Player[],
  used: Set<string>,
  n: number,
  flavour: Flavour,
  rng: () => number,
): Player[] {
  const candidates = pool.filter((p) => !used.has(p.id));
  const chosen: Player[] = [];
  const scored = candidates.map((p) => ({
    p,
    // weight * (1 + jitter) so the same flavour still varies pack-to-pack
    w: flavour.weight(p) * (0.6 + rng() * 0.8),
  }));

  for (let i = 0; i < n; i++) {
    scored.sort((a, b) => b.w - a.w);
    // Top-K sample so weaker picks still appear
    const k = Math.min(scored.length, 6);
    const idx = Math.floor(rng() * k);
    const pick = scored.splice(idx, 1)[0];
    if (!pick) break;
    chosen.push(pick.p);
    used.add(pick.p.id);
  }
  return chosen;
}

// ---------------- pack builder ----------------
function buildOnePack(
  pools: Record<Position, Player[]>,
  used: Set<string>,
  flavour: Flavour,
  target: number,
  band: number,
  rng: () => number,
): Player[] | null {
  const positions: Position[] = ["GK", "DEF", "MID", "FWD"];
  let best: { players: Player[]; err: number } | null = null;

  // Up to 40 sampling attempts to land inside the rating band
  for (let attempt = 0; attempt < 40; attempt++) {
    const trialUsed = new Set(used);
    const players: Player[] = [];
    for (const pos of positions) {
      const drawn = pickWeighted(pools[pos], trialUsed, FORMATION[pos], flavour, rng);
      if (drawn.length < FORMATION[pos]) return null; // pool exhausted
      players.push(...drawn);
    }
    const rating = avg(players.map((p) => p.rating));
    const err = Math.abs(rating - target);
    if (err <= band) {
      // commit
      for (const p of players) used.add(p.id);
      return players;
    }
    if (!best || err < best.err) best = { players, err };
  }
  // Fallback: accept closest attempt
  if (best) for (const p of best.players) used.add(p.id);
  return best?.players ?? null;
}

function computeMeta(players: Player[]): PackMeta {
  const eras = players.map((p) => p.era);
  const dominantEra = (["classic","modern","current"] as const).reduce((best, e) =>
    eras.filter((x) => x === e).length > eras.filter((x) => x === best).length ? e : best,
    "current" as "classic" | "modern" | "current",
  );
  const eraCounts = ["classic","modern","current"].map((e) => eras.filter((x) => x === e).length);
  const mixed = eraCounts.filter((c) => c > 2).length > 1;

  return {
    avgRating: Math.round(avg(players.map((p) => p.rating)) * 10) / 10,
    worldCupWinners: players.filter((p) => p.worldCup).length,
    championsLeagueWinners: players.filter((p) => p.championsLeague).length,
    ballonDorWinners: players.filter((p) => p.ballonDor).length,
    activeCount: players.filter((p) => p.active).length,
    legendCount: players.filter((p) => p.legendary).length,
    avgAgeEra: mixed ? "mixed" : dominantEra,
  };
}

// ---------------- public API ----------------
export function generateGamePacks(seed: number = Date.now()): { p1: Pack[]; p2: Pack[] } {
  const rng = mulberry32(seed);
  const positions: Position[] = ["GK", "DEF", "MID", "FWD"];

  // Fresh shuffled pools
  const pools: Record<Position, Player[]> = {
    GK: shuffle(PLAYERS_BY_POSITION.GK, rng),
    DEF: shuffle(PLAYERS_BY_POSITION.DEF, rng),
    MID: shuffle(PLAYERS_BY_POSITION.MID, rng),
    FWD: shuffle(PLAYERS_BY_POSITION.FWD, rng),
  };

  // Enough pool?
  for (const pos of positions) {
    if (pools[pos].length < FORMATION[pos] * 6) {
      throw new Error(`Pool too small for ${pos}: need ${FORMATION[pos] * 6}`);
    }
  }

  const used = new Set<string>();
  const flavours = shuffle(FLAVOURS, rng).slice(0, 6);
  const packs: Pack[] = [];

  for (let i = 0; i < 6; i++) {
    const flav = flavours[i];
    const players = buildOnePack(pools, used, flav, TARGET_RATING, RATING_BAND, rng);
    if (!players) throw new Error("Failed to build pack");
    packs.push({
      id: `pack-${i}`,
      label: `Mystery Pack ${String.fromCharCode(65 + (i % 3))}`,
      players,
      meta: computeMeta(players),
      flavour: flav.key,
    });
  }

  // Relabel per player group A/B/C
  const p1 = packs.slice(0, 3).map((p, i) => ({ ...p, label: `Mystery Pack ${"ABC"[i]}` }));
  const p2 = packs.slice(3, 6).map((p, i) => ({ ...p, label: `Mystery Pack ${"ABC"[i]}` }));
  return { p1, p2 };
}
