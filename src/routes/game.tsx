import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useReducer, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { PackCard } from "@/components/game/PackCard";
import { PlayerCard } from "@/components/game/PlayerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateGamePacks, type Pack } from "@/lib/pack-generator";
import { askReferee, simulateMatch } from "@/lib/game-ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Play — Football Mystery Pack" },
      { name: "description", content: "Play a Football Mystery Pack duel with AI referee and match analyst." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GamePage,
});

// ---------------- State ----------------

type Phase =
  | { kind: "intro" }
  | { kind: "pass"; to: 1 | 2; next: Phase }
  | { kind: "reviewPacks"; player: 1 | 2 }
  | { kind: "question" }
  | { kind: "choose"; player: 1 | 2 }
  | { kind: "reveal" }
  | { kind: "result" };

interface QALog {
  round: number;
  askedBy: 1 | 2;
  targetPlayer: 1 | 2;
  targetPackLabel: string;
  question: string;
  verdict: string;
  reason: string;
}

interface State {
  p1Name: string;
  p2Name: string;
  packs1: Pack[];
  packs2: Pack[];
  turn: 1 | 2;
  round: number;
  qas: QALog[];
  choice1: string | null;
  choice2: string | null;
  matchResult: MatchResult | null;
  phase: Phase;
}

interface MatchResult {
  winA: number;
  winB: number;
  draw: number;
  score: string;
  mvp: string;
  winner: string;
  summary: string;
  tactics: string;
}

type Action =
  | { type: "start"; p1: string; p2: string }
  | { type: "setPhase"; phase: Phase }
  | { type: "addQA"; qa: QALog }
  | { type: "endTurn" }
  | { type: "chooseP1"; packId: string }
  | { type: "chooseP2"; packId: string }
  | { type: "setResult"; r: MatchResult }
  | { type: "restart" };

function initState(): State {
  const packs = generateGamePacks();
  return {
    p1Name: "",
    p2Name: "",
    packs1: packs.p1,
    packs2: packs.p2,
    turn: 1,
    round: 1,
    qas: [],
    choice1: null,
    choice2: null,
    matchResult: null,
    phase: { kind: "intro" },
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return {
        ...state,
        p1Name: action.p1 || "Player 1",
        p2Name: action.p2 || "Player 2",
        phase: { kind: "pass", to: 1, next: { kind: "reviewPacks", player: 1 } },
      };
    case "setPhase":
      return { ...state, phase: action.phase };
    case "addQA":
      return { ...state, qas: [action.qa, ...state.qas] };
    case "endTurn": {
      const nextTurn = state.turn === 1 ? 2 : 1;
      const nextRound = state.turn === 2 ? state.round + 1 : state.round;
      return { ...state, turn: nextTurn, round: nextRound };
    }
    case "chooseP1":
      return { ...state, choice1: action.packId };
    case "chooseP2":
      return { ...state, choice2: action.packId };
    case "setResult":
      return { ...state, matchResult: action.r, phase: { kind: "result" } };
    case "restart":
      return initState();
  }
}

// ---------------- Page ----------------

function GamePage() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-6xl px-6 pt-6 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        {state.phase.kind !== "intro" && (
          <button
            onClick={() => dispatch({ type: "restart" })}
            className="text-xs text-muted-foreground hover:text-neon uppercase tracking-widest"
          >
            Restart
          </button>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {state.phase.kind === "intro" && <IntroPhase dispatch={dispatch} />}
        {state.phase.kind === "pass" && <PassPhase state={state} dispatch={dispatch} />}
        {state.phase.kind === "reviewPacks" && <ReviewPacksPhase state={state} dispatch={dispatch} />}
        {state.phase.kind === "question" && <QuestionPhase state={state} dispatch={dispatch} />}
        {state.phase.kind === "choose" && <ChoosePhase state={state} dispatch={dispatch} />}
        {state.phase.kind === "reveal" && <RevealPhase state={state} dispatch={dispatch} />}
        {state.phase.kind === "result" && <ResultPhase state={state} dispatch={dispatch} />}
      </main>
    </div>
  );
}

// ---------------- Phases ----------------

function IntroPhase({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  return (
    <div className="max-w-lg mx-auto glass-strong rounded-3xl p-8 animate-fade-up">
      <h1 className="text-3xl font-display font-bold">New match</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Two players share one device. You'll pass it between turns — no peeking.
      </p>
      <div className="mt-8 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Player 1</label>
          <Input
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            placeholder="e.g. Alex"
            className="mt-1 bg-input/40 border-white/10 focus-visible:ring-neon"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Player 2</label>
          <Input
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            placeholder="e.g. Sam"
            className="mt-1 bg-input/40 border-white/10 focus-visible:ring-neon"
          />
        </div>
      </div>
      <Button
        onClick={() => dispatch({ type: "start", p1, p2 })}
        size="lg"
        className="mt-8 w-full bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon"
      >
        Deal the packs
      </Button>
    </div>
  );
}

function PassPhase({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const name = state.phase.kind === "pass" && state.phase.to === 1 ? state.p1Name : state.p2Name;
  const next = state.phase.kind === "pass" ? state.phase.next : { kind: "intro" as const };
  return (
    <div className="max-w-lg mx-auto text-center py-16 animate-fade-up">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Pass the device</div>
      <h2 className="mt-4 text-5xl font-display font-bold text-neon">{name}</h2>
      <p className="mt-4 text-muted-foreground">
        Others in the room: look away. The screen is about to reveal information only for {name}.
      </p>
      <Button
        onClick={() => dispatch({ type: "setPhase", phase: next })}
        size="lg"
        className="mt-10 bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon px-8"
      >
        I'm {name} — continue
      </Button>
    </div>
  );
}

function ReviewPacksPhase({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  if (state.phase.kind !== "reviewPacks") return null;
  const p = state.phase.player;
  const packs = p === 1 ? state.packs1 : state.packs2;
  const name = p === 1 ? state.p1Name : state.p2Name;
  const [expanded, setExpanded] = useState<string | null>(null);

  const nextPhase: Phase =
    p === 1
      ? { kind: "pass", to: 2, next: { kind: "reviewPacks", player: 2 } }
      : { kind: "question" };

  return (
    <div className="animate-fade-up">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your squads</div>
        <h2 className="mt-2 text-3xl font-display font-bold">
          {name}, review your <span className="text-neon">3 mystery packs</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Only you can see these. Tap a pack to inspect its 11 players — you'll need this intel later.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div key={pack.id} className="space-y-4">
            <PackCard
              label={pack.label}
              selected={expanded === pack.id}
              onClick={() => setExpanded((e) => (e === pack.id ? null : pack.id))}
            />
            {expanded === pack.id && (
              <div className="glass rounded-2xl p-3 space-y-2 max-h-[480px] overflow-y-auto">
                {pack.players.map((pl, i) => (
                  <PlayerCard key={pl.id} player={pl} delayMs={i * 30} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          onClick={() => dispatch({ type: "setPhase", phase: nextPhase })}
          size="lg"
          className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon px-8"
        >
          {p === 1 ? "Done — pass to " + state.p2Name : "Start asking questions"}
        </Button>
      </div>
    </div>
  );
}

const SUGGESTED = [
  "Does this pack contain a Ballon d'Or winner?",
  "Does this pack contain a World Cup winner?",
  "Does this pack include a player who played for Barcelona?",
  "Does this pack contain a player from Brazil?",
  "Does this pack contain a Champions League winner?",
  "Does this pack include a Premier League legend?",
  "Does this pack include a retired player?",
  "Does this pack contain someone who scored over 500 career goals?",
  "Does this pack include a defender who won the Champions League?",
];

function QuestionPhase({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const askerName = state.turn === 1 ? state.p1Name : state.p2Name;
  const opponentName = state.turn === 1 ? state.p2Name : state.p1Name;
  const opponentPacks = state.turn === 1 ? state.packs2 : state.packs1;

  const [selectedPack, setSelectedPack] = useState<string>(opponentPacks[0].id);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askReferee);

  const roundsPlayed = state.qas.length;
  const canEndPhase = roundsPlayed >= 4; // at least a couple of Qs each

  async function submit() {
    if (!question.trim()) return;
    const pack = opponentPacks.find((p) => p.id === selectedPack)!;
    setLoading(true);
    try {
      const result = await ask({ data: { players: pack.players, question: question.trim() } });
      dispatch({
        type: "addQA",
        qa: {
          round: state.round,
          askedBy: state.turn,
          targetPlayer: state.turn === 1 ? 2 : 1,
          targetPackLabel: pack.label,
          question: question.trim(),
          verdict: result.verdict,
          reason: result.reason,
        },
      });
      dispatch({ type: "endTurn" });
      setQuestion("");
    } catch (e) {
      console.error(e);
      toast.error("The referee couldn't answer. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function goToChoose() {
    dispatch({
      type: "setPhase",
      phase: { kind: "pass", to: 1, next: { kind: "choose", player: 1 } },
    });
  }

  return (
    <div className="animate-fade-up grid md:grid-cols-[1fr_360px] gap-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Round {state.round} · Question phase
            </div>
            <h2 className="text-2xl font-display font-bold mt-1">
              <span className="text-neon">{askerName}</span>, ask about {opponentName}'s pack
            </h2>
          </div>
          <Button
            onClick={goToChoose}
            variant="outline"
            disabled={!canEndPhase}
            className="glass border-white/10 hover:border-neon/60 hover:bg-white/5 disabled:opacity-40"
          >
            End questioning →
          </Button>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Target pack
          </div>
          <div className="flex gap-3">
            {opponentPacks.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPack(p.id)}
                className={`glass rounded-xl px-4 py-3 border transition-all ${
                  selectedPack === p.id
                    ? "border-neon text-neon shadow-neon"
                    : "border-white/10 text-muted-foreground hover:border-neon/40"
                }`}
              >
                <div className="font-display font-semibold">{p.label}</div>
                <div className="text-[10px] uppercase tracking-widest">of {opponentName}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Ask the AI referee
          </div>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Does this pack contain a World Cup winner?"
              className="bg-input/40 border-white/10 focus-visible:ring-neon"
              onKeyDown={(e) => e.key === "Enter" && !loading && submit()}
            />
            <Button
              onClick={submit}
              disabled={loading || !question.trim()}
              className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon"
            >
              {loading ? "Thinking…" : "Ask"}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="text-[11px] rounded-full glass border border-white/10 hover:border-neon/60 hover:text-neon px-3 py-1 text-muted-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="glass rounded-2xl p-5 h-fit">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Referee log</div>
        <div className="mt-3 space-y-3 max-h-[520px] overflow-y-auto">
          {state.qas.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No questions yet. Ask the first.</p>
          )}
          {state.qas.map((qa, i) => (
            <div key={i} className="border-l-2 border-neon/40 pl-3 animate-fade-up">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                R{qa.round} · {qa.askedBy === 1 ? state.p1Name : state.p2Name} → {qa.targetPackLabel} of{" "}
                {qa.targetPlayer === 1 ? state.p1Name : state.p2Name}
              </div>
              <div className="text-sm mt-1">{qa.question}</div>
              <div
                className={`mt-1 text-sm font-semibold ${
                  qa.verdict === "Yes"
                    ? "text-neon"
                    : qa.verdict === "No"
                      ? "text-rose-300"
                      : "text-amber-200"
                }`}
              >
                {qa.verdict}
                <span className="ml-2 text-xs text-muted-foreground font-normal italic">
                  {qa.reason}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function ChoosePhase({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  if (state.phase.kind !== "choose") return null;
  const p = state.phase.player;
  const packs = p === 1 ? state.packs1 : state.packs2;
  const name = p === 1 ? state.p1Name : state.p2Name;
  const chosen = p === 1 ? state.choice1 : state.choice2;
  const [expanded, setExpanded] = useState<string | null>(null);

  function pick(id: string) {
    if (p === 1) dispatch({ type: "chooseP1", packId: id });
    else dispatch({ type: "chooseP2", packId: id });
  }

  function next() {
    if (p === 1) {
      dispatch({
        type: "setPhase",
        phase: { kind: "pass", to: 2, next: { kind: "choose", player: 2 } },
      });
    } else {
      dispatch({ type: "setPhase", phase: { kind: "reveal" } });
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Choose your fighter</div>
        <h2 className="mt-2 text-3xl font-display font-bold">
          {name}, lock in <span className="text-neon">one pack</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Once locked, both squads will be revealed and simulated.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div key={pack.id} className="space-y-3">
            <PackCard
              label={pack.label}
              selected={chosen === pack.id}
              onClick={() => pick(pack.id)}
            />
            <button
              onClick={() => setExpanded((e) => (e === pack.id ? null : pack.id))}
              className="w-full text-xs text-muted-foreground hover:text-neon"
            >
              {expanded === pack.id ? "Hide" : "Peek at players"}
            </button>
            {expanded === pack.id && (
              <div className="glass rounded-2xl p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {pack.players.map((pl, i) => (
                  <PlayerCard key={pl.id} player={pl} delayMs={i * 20} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          onClick={next}
          disabled={!chosen}
          size="lg"
          className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon disabled:opacity-40 px-8"
        >
          Lock choice
        </Button>
      </div>
    </div>
  );
}

function RevealPhase({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const teamA = useMemo(() => state.packs1.find((p) => p.id === state.choice1)!, [state]);
  const teamB = useMemo(() => state.packs2.find((p) => p.id === state.choice2)!, [state]);
  const sim = useServerFn(simulateMatch);
  const [loading, setLoading] = useState(false);

  async function runSim() {
    setLoading(true);
    try {
      const r = await sim({
        data: {
          teamA: teamA.players,
          teamB: teamB.players,
          nameA: state.p1Name,
          nameB: state.p2Name,
        },
      });
      dispatch({ type: "setResult", r });
    } catch (e) {
      console.error(e);
      toast.error("The analyst is offline. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Squads revealed</div>
        <h2 className="mt-2 text-3xl font-display font-bold">
          <span className="text-neon">{state.p1Name}</span> vs{" "}
          <span className="text-neon">{state.p2Name}</span>
        </h2>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {[
          { name: state.p1Name, pack: teamA },
          { name: state.p2Name, pack: teamB },
        ].map((side) => (
          <div key={side.name} className="glass-strong rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {side.name}
                </div>
                <div className="font-display text-xl">{side.pack.label}</div>
              </div>
              <div className="text-neon text-xs">11 players</div>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {side.pack.players.map((p, i) => (
                <PlayerCard key={p.id} player={p} delayMs={i * 40} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          onClick={runSim}
          disabled={loading}
          size="lg"
          className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon px-10"
        >
          {loading ? "Simulating…" : "Kick off the match"}
        </Button>
      </div>
    </div>
  );
}

function ResultPhase({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const navigate = useNavigate();
  const r = state.matchResult!;
  const teamA = state.packs1.find((p) => p.id === state.choice1)!;
  const teamB = state.packs2.find((p) => p.id === state.choice2)!;

  return (
    <div className="animate-fade-up max-w-4xl mx-auto">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Full time</div>
        <h2 className="mt-2 text-4xl md:text-5xl font-display font-bold">
          Winner: <span className="text-neon">{r.winner}</span>
        </h2>
        <div className="mt-3 font-display text-6xl md:text-7xl tracking-tight">
          <span>{state.p1Name}</span>{" "}
          <span className="text-neon">{r.score}</span>{" "}
          <span>{state.p2Name}</span>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <StatBar label={`${state.p1Name} win`} value={r.winA} accent="neon" />
        <StatBar label="Draw" value={r.draw} accent="muted" />
        <StatBar label={`${state.p2Name} win`} value={r.winB} accent="neon" />
      </div>

      <div className="mt-8 glass-strong rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Match MVP</div>
        <div className="mt-1 font-display text-2xl text-neon">{r.mvp}</div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Summary</div>
          <p className="text-sm leading-relaxed">{r.summary}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Tactics</div>
          <p className="text-sm leading-relaxed">{r.tactics}</p>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {[
          { name: state.p1Name, pack: teamA },
          { name: state.p2Name, pack: teamB },
        ].map((side) => (
          <div key={side.name} className="glass rounded-2xl p-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {side.name} · {side.pack.label}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {side.pack.players.map((p) => p.name).join(" · ")}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <Button
          onClick={() => dispatch({ type: "restart" })}
          size="lg"
          className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon px-8"
        >
          New match
        </Button>
        <Button
          onClick={() => navigate({ to: "/" })}
          size="lg"
          variant="outline"
          className="glass border-white/10 hover:border-neon/60 hover:bg-white/5"
        >
          Home
        </Button>
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "neon" | "muted";
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`font-display text-2xl ${accent === "neon" ? "text-neon" : ""}`}>
          {value}%
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${accent === "neon" ? "bg-neon" : "bg-muted-foreground"}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
