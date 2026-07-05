import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getGateway } from "./ai-gateway.server";
import type { Player } from "@/data/players";

const MODEL = "google/gemini-3-flash-preview";

const PlayerSchema = z.object({
  name: z.string(),
  position: z.string(),
  nationality: z.string(),
  clubs: z.array(z.string()),
  era: z.string(),
  ballonDor: z.boolean(),
  worldCup: z.boolean(),
  championsLeague: z.boolean(),
  leagueTitles: z.number(),
  careerGoals: z.number(),
  retired: z.boolean(),
  rating: z.number(),
  foot: z.string(),
  style: z.string(),
  legendary: z.boolean(),
}).passthrough();

type SquadInput = Omit<Player, "id"> & { id?: string };
function formatSquad(players: SquadInput[]) {
  return players
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.position} | ${p.nationality} | era:${p.era} | clubs:[${p.clubs.join(", ")}] | BdOr:${p.ballonDor} | WC:${p.worldCup} | UCL:${p.championsLeague} | leagues:${p.leagueTitles} | goals:${p.careerGoals} | retired:${p.retired} | rating:${p.rating} | foot:${p.foot} | style:${p.style} | legendary:${p.legendary}`
    )
    .join("\n");
}

// ---------- Referee ----------
export const askReferee = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        players: z.array(PlayerSchema),
        question: z.string().min(3).max(400),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const squad = formatSquad(data.players as SquadInput[]);

    const system = `You are the AI Referee for a football mystery pack game.
You will be shown a HIDDEN football squad and a yes/no question about it.
Your job: answer the question based ONLY on the squad attributes provided.

CRITICAL RULES:
- NEVER reveal any player names, nationalities, clubs, or specific identifying details.
- Answer with exactly ONE of these labels: "Yes", "No", "Probably", "Cannot be determined".
- Then give a very short (max 12 words) justification WITHOUT identifying anyone.
- Bad: "Yes, because Messi is in the squad." Good: "Yes, one of the forwards fits that description."
- If the question is impossible to judge from the attributes given, answer "Cannot be determined".
- If it's mostly true but ambiguous, answer "Probably".

Format your response as exactly two lines:
VERDICT: <Yes|No|Probably|Cannot be determined>
REASON: <short generic reason without names>`;

    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt: `SQUAD (hidden from players):\n${squad}\n\nQUESTION: ${data.question}`,
    });

    // Parse verdict + reason
    const verdictMatch = text.match(/VERDICT:\s*(Yes|No|Probably|Cannot be determined)/i);
    const reasonMatch = text.match(/REASON:\s*(.+)/i);
    const verdict = (verdictMatch?.[1] ?? "Cannot be determined") as
      | "Yes"
      | "No"
      | "Probably"
      | "Cannot be determined";
    const reason = reasonMatch?.[1]?.trim() ?? "";

    return { verdict, reason };
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
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const gateway = getGateway();

    const system = `You are an elite AI football analyst simulating a match between two hypothetical squads from different eras.
Analyze: player quality, team chemistry, position balance, era differences, tactical compatibility, overall strength.

Return your analysis in this EXACT format (no markdown, no code blocks):

WIN_A: <integer 0-100>
WIN_B: <integer 0-100>
DRAW: <integer 0-100>
SCORE: <e.g. 3-2>
MVP: <player name from either squad>
WINNER: <"${data.nameA}" | "${data.nameB}" | "Draw">
SUMMARY: <2-3 sentences describing how the match unfolds>
TACTICS: <2-3 sentences on tactical explanation and key matchups>

WIN_A + WIN_B + DRAW must sum to 100.`;

    const prompt = `${data.nameA}:\n${formatSquad(data.teamA as SquadInput[])}\n\n${data.nameB}:\n${formatSquad(data.teamB as SquadInput[])}`;

    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt,
    });

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
      mvp: get("MVP") || "Unknown",
      winner: get("WINNER") || data.nameA,
      summary: get("SUMMARY") || "A close match with quality on both sides.",
      tactics: get("TACTICS") || "Balanced tactical battle across the pitch.",
    };
  });
