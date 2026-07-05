import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/game/Logo";
import { LanguageSwitcher } from "@/components/game/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";
import { PLAYERS } from "@/data/players";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Football Mystery Pack — Hidden Squad Duel" },
      { name: "description", content: "Two-player football deduction game. Draw mystery squads across every era and league, ask an AI referee, and let the AI analyst simulate the match." },
      { property: "og:title", content: "Football Mystery Pack" },
      { property: "og:description", content: "Hidden squad duel with an AI referee and AI match analyst." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const t = useT();
  const totalPlayers = PLAYERS.length;
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-6xl px-6 pt-8 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="text-xs text-muted-foreground uppercase tracking-widest">{t("brand.beta")}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-16 md:pt-24 pb-16">
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-neon">
              <span className="size-1.5 rounded-full bg-neon animate-pulse" /> {t("home.badge")}
            </div>
            <h1 className="mt-5 text-5xl md:text-7xl font-display font-bold leading-[0.95] tracking-tight">
              {t("home.title.1")}
              <br />
              <span className="text-neon">{t("home.title.2")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">{t("home.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/game">
                <Button size="lg" className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold shadow-neon px-8">
                  {t("home.cta.start")}
                </Button>
              </Link>
              <a href="#how" className="inline-flex">
                <Button size="lg" variant="outline" className="glass border-white/10 hover:border-neon/60 hover:bg-white/5">
                  {t("home.cta.how")}
                </Button>
              </a>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl font-display text-foreground">{totalPlayers}+</div>
                <div className="text-xs uppercase tracking-wider">{t("home.stat.players")}</div>
              </div>
              <div>
                <div className="text-2xl font-display text-foreground">6</div>
                <div className="text-xs uppercase tracking-wider">{t("home.stat.packs")}</div>
              </div>
              <div>
                <div className="text-2xl font-display text-foreground">∞</div>
                <div className="text-xs uppercase tracking-wider">{t("home.stat.possibilities")}</div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="absolute -inset-8 bg-neon/10 blur-3xl rounded-full" />
            <div className="relative grid grid-cols-3 gap-4">
              {["A", "B", "C"].map((l, i) => (
                <div
                  key={l}
                  className="glass-strong rounded-3xl aspect-[3/4] p-4 animate-pack-float"
                  style={{ animationDelay: `${i * 0.4}s`, transform: `rotate(${(i - 1) * 4}deg)` }}
                >
                  <div className="h-full flex flex-col items-center justify-between">
                    <span className="text-[10px] tracking-widest text-muted-foreground uppercase">{t("pack.mystery")}</span>
                    <svg viewBox="0 0 100 100" className="size-14 text-neon">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
                      <polygon points="50,28 64,38 58,54 42,54 36,38" fill="currentColor" opacity="0.9" />
                    </svg>
                    <div className="font-display text-2xl text-foreground">{t("pack.squad")} {l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mt-32 grid md:grid-cols-4 gap-4">
          {[
            { n: "01", t: t("home.step.1.t"), d: t("home.step.1.d") },
            { n: "02", t: t("home.step.2.t"), d: t("home.step.2.d") },
            { n: "03", t: t("home.step.3.t"), d: t("home.step.3.d") },
            { n: "04", t: t("home.step.4.t"), d: t("home.step.4.d") },
          ].map((s, i) => (
            <div key={s.n} className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-neon font-display text-sm">{s.n}</div>
              <div className="font-display text-lg mt-1">{s.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
            </div>
          ))}
        </section>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-8">{t("home.footer")}</footer>
    </div>
  );
}
