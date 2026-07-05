/**
 * Portrait layer.
 *
 * Single seam for player portraits. Today: use `player.portraitUrl` if set,
 * otherwise a deterministic DiceBear avatar seeded by player id (licensing-safe).
 * Tomorrow: swap the fallback (or add a Supabase-hosted portrait bucket lookup)
 * without touching UI components.
 */

import type { Player } from "@/data/players";

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/initials/svg";

export function getPortraitUrl(player: Pick<Player, "id" | "name" | "portraitUrl">): string {
  if (player.portraitUrl) return player.portraitUrl;
  const initials = encodeURIComponent(player.name);
  const seed = encodeURIComponent(player.id);
  // Blue palette to match the football theme.
  return `${DICEBEAR_BASE}?seed=${seed}&backgroundColor=1e3a8a,1e40af,1d4ed8,2563eb,3b82f6&fontFamily=Inter&fontWeight=600&chars=2&scale=90&text=${initials}`;
}

export function getInitials(name: string): string {
  const parts = name.replace(/\(.+?\)/g, "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
