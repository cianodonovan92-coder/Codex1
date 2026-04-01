import Link from "next/link";
import { Shell, TopNav, GlassCard } from "@/components/ui";

const features = [
  {
    title: "Immersive Scenarios",
    body: "Run match-speed cognitive reps with pressure, dynamic opponents, and spatial constraints tuned for each role."
  },
  {
    title: "Adaptive AI Training",
    body: "Session difficulty evolves from your latest decisions, forcing faster perception and better option selection."
  },
  {
    title: "Coach Analytics",
    body: "Translate split-second decisions into measurable patterns coaches can review and act on immediately."
  },
  {
    title: "Measurable Improvement",
    body: "Track reaction time, hesitation, and decision value to prove progress across every training block."
  }
];

const statTiles = [
  ["Avg decision latency", "2.1s"],
  ["Pressure adaptation", "+18%"],
  ["Session confidence", "92 / 100"]
];

export default function HomePage() {
  return (
    <Shell>
      <TopNav />
      <section className="grid gap-8 pb-12 lg:grid-cols-[1.15fr_1fr] lg:items-stretch">
        <div className="space-y-7 self-center">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/90">Immersive Decision Intelligence</p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            XR Decision Lab
            <span className="mt-3 block text-xl font-medium leading-snug text-slate-300 sm:text-2xl lg:text-3xl">
              Adaptive training. Elite decisions. Measurable performance.
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            A premium cognitive simulator for sports organizations that train faster thinking under game-real pressure and deliver coach-grade insight after every rep.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Launch Demo Flow
            </Link>
            <Link
              href="/analytics"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-accent"
            >
              View Coach Dashboard
            </Link>
          </div>
        </div>

        <GlassCard className="hero-glow grid-bg relative min-h-[360px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-highlight/20 via-transparent to-accent/10" />
          <div className="relative z-10 space-y-4">
            <p className="text-sm text-slate-300">Session Preview · Midfielder · Elite</p>
            <div className="rounded-xl border border-white/15 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Pressure Window</p>
              <p className="mt-2 text-3xl font-semibold text-white">2.4s</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Decision Quality</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">86 / 100</p>
            </div>
            <div className="grid gap-3 pt-1 sm:grid-cols-3">
              {statTiles.map(([label, value]) => (
                <div key={label} className="muted-ring rounded-xl bg-slate-900/55 p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 pb-10 md:grid-cols-2">
        {features.map((feature) => (
          <GlassCard key={feature.title} title={feature.title} className="transition duration-300 hover:-translate-y-1 hover:border-accent/30">
            <p className="text-slate-300">{feature.body}</p>
          </GlassCard>
        ))}
      </section>
    </Shell>
  );
}
