import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getGateway } from "./ai-gateway.server";
import type { Player } from "@/data/players";

const MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"


// Loose validator: we only need the fields we format into the prompt.
// Using `passthrough` and casting to Player subset for formatting.
const PlayerSchema = z
  .object({
    name: z.string(),
    position: z.string(),
    nationality: z.string(),
    clubs: z.array(z.string()),
    leagues: z.array(z.string()).optional(),
    era: z.string(),
    active: z.boolean().optional(),
    foot: z.string(),
    height: z.number().optional(),
    rating: z.number(),
    tier: z.string().optional(),
    ballonDor: z.boolean(),
    worldCup: z.boolean(),
    championsLeague: z.boolean(),
    leagueTitles: z.number(),
    careerGoals: z.number(),
    caps: z.number().optional(),
    legendary: z.boolean(),
    captain: z.boolean().optional(),
    versatility: z.number().optional(),
    speed: z.number().optional(),
    physicality: z.number().optional(),
    passing: z.number().optional(),
    shooting: z.number().optional(),
    defending: z.number().optional(),
    dribbling: z.number().optional(),
  })
  .passthrough();

type SquadInput = Partial<Player> & Pick<Player, "name" | "position" | "nationality" | "era" | "rating">;

function fmt(p: SquadInput, i: number) {
  const l = p.leagues?.join(",") ?? "";
  const c = p.clubs?.join(",") ?? "";
  const attrs = `spd:${p.speed ?? "?"} phy:${p.physicality ?? "?"} pas:${p.passing ?? "?"} sho:${p.shooting ?? "?"} def:${p.defending ?? "?"} dri:${p.dribbling ?? "?"}`;
  return (
    `${i + 1}. ${p.name} — pos:${p.position} nat:${p.nationality} era:${p.era} ` +
    `active:${p.active ?? "?"} foot:${p.foot ?? "?"} height:${p.height ?? "?"}cm ` +
    `rating:${p.rating} tier:${p.tier ?? "?"} ` +
    `BdOr:${p.ballonDor} WC:${p.worldCup} UCL:${p.championsLeague} ` +
    `leagueTitles:${p.leagueTitles} goals:${p.careerGoals} caps:${p.caps ?? "?"} ` +
    `legend:${p.legendary} captain:${p.captain ?? false} ` +
    `clubs:[${c}] leagues:[${l}] ${attrs}`
  );
}

function formatSquad(players: SquadInput[]) {
  return players.map(fmt).join("\n");
}

const LOCALE_INSTRUCTION: Record<"en" | "ar", string> = {
  en: "Respond in English.",
  ar: "أجب باللغة العربية فقط. استخدم مفردات عربية طبيعية.",
};

// ---------- Referee ----------
export const askReferee = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        players: z.array(PlayerSchema),
        question: z.string().min(3).max(400),
        locale: z.enum(["en", "ar"]).default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const squad = formatSquad(data.players as SquadInput[]);

    const system = `You are the AI Referee for a football deduction game. You are shown a HIDDEN squad and asked a yes/no question about it. Answer STRICTLY from the attributes provided.

RULES:
- NEVER reveal player names, clubs, or nationalities in your reason.
- Use ALL attributes: rating, position, nationality, era, active/retired, foot, height, honours (Ballon d'Or, WC, UCL, league titles, caps, goals), tier, playing stats (speed/passing/shooting/defending/dribbling), captain, legendary.
- Verdict labels: "Yes" (clear yes), "No" (clear no), "Probably" (partially/ambiguous), "Cannot be determined" (attributes don't cover it).
- Do NOT default to "Yes". Be honest — most questions should get a mix across many games.
- Reason: max 14 words, generic, no names. E.g. "Yes, one midfielder fits." / "No, none of the eleven qualify." / "Probably, two players are close." / "Cannot be determined from attributes."
- ${LOCALE_INSTRUCTION[data.locale]}

Format your response as EXACTLY two lines:
VERDICT: <Yes|No|Probably|Cannot be determined>
REASON: <short generic reason without names>`;

   let text = "";

try {
  const result = await generateText({
    model: gateway(MODEL),
    system,
    prompt: `SQUAD (hidden):\n${squad}\n\nQUESTION: ${data.question}`,
  });

  text = result.text;
  console.log("AI RESPONSE:", text);

} catch (err) {
  console.error("FULL AI ERROR:", err);
  throw err;
}
    const verdictMatch = text.match(/VERDICT:\s*(Yes|No|Probably|Cannot be determined)/i);
    const reasonMatch = text.match(/REASON:\s*(.+)/i);
    const verdictEn = (verdictMatch?.[1] ?? "Cannot be determined") as
      | "Yes"
      | "No"
      | "Probably"
      | "Cannot be determined";
    // Verdict is machine-readable; localised label is applied client-side.
    return { verdict: verdictEn, reason: reasonMatch?.[1]?.trim() ?? "" };
  });

// ---------- Match Simulator ----------
export const simulateMatch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        teamA: z.array(PlayerSchema),
        teamB: z.array(PlayerSchema),
        nameA: z.string().default("Team A"),
        nameB: z.string().default("Team B"),
        locale: z.enum(["en", "ar"]).default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();

    const system = `You are an elite AI football analyst simulating a match between two hypothetical squads assembled from different eras and abilities.

Weigh: team average rating, position balance, chemistry, era compatibility, honours, playing style. Do NOT assume equality — one side may clearly be stronger.

Return your analysis in this EXACT format (no markdown):

WIN_A: <integer 0-100>
WIN_B: <integer 0-100>
DRAW: <integer 0-100>
SCORE: <e.g. 3-2>
MVP: <a player name from either squad>
WINNER: <"${data.nameA}" | "${data.nameB}" | "Draw">
SUMMARY: <2-3 sentences on how the match unfolds>
TACTICS: <2-3 sentences on tactical explanation and key matchups>

WIN_A + WIN_B + DRAW must sum to 100.
${LOCALE_INSTRUCTION[data.locale]} Keep KEY labels in English; only SUMMARY, TACTICS, WINNER-name text may be translated.`;

    const prompt = `${data.nameA}:\n${formatSquad(data.teamA as SquadInput[])}\n\n${data.nameB}:\n${formatSquad(data.teamB as SquadInput[])}`;

    const { text } = await generateText({ model: gateway(MODEL), system, prompt });

    const get = (key: string) => {
      const m = text.match(new RegExp(`${key}:\\s*(.+?)(?:\\n|$)`, "i"));
      return m?.[1]?.trim() ?? "";
    };

    const winA = parseInt(get("WIN_A")) || 50;
    const winB = parseInt(get("WIN_B")) || 40;
    const draw = parseInt(get("DRAW")) || 10;

    return {
      winA,
      winB,
      draw,
      score: get("SCORE") || "2-1",
      mvp: get("MVP") || "—",
      winner: get("WINNER") || data.nameA,
      summary: get("SUMMARY") || "A close match with quality on both sides.",
      tactics: get("TACTICS") || "Balanced tactical battle across the pitch.",
    };
  });
