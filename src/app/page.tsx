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

export default function HomePage() {
  return (
    <Shell>
      <TopNav />
      <section className="grid gap-8 pb-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.22em] text-accent">Immersive Decision Intelligence</p>
          <h1 className="text-5xl font-semibold leading-tight text-white lg:text-6xl">
            XR Decision Lab
            <span className="mt-2 block text-2xl font-medium text-slate-300 lg:text-3xl">
              Adaptive training. Elite decisions. Measurable performance.
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            A premium cognitive simulator for sports organizations that train faster thinking under game-real pressure and deliver coach-grade insight after every rep.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/demo" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              Launch Demo Flow
            </Link>
            <Link href="/analytics" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-accent">
              View Coach Dashboard
            </Link>
          </div>
        </div>
        <GlassCard className="grid-bg relative min-h-[320px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-highlight/20 via-transparent to-accent/10" />
          <div className="relative z-10 space-y-4">
            <p className="text-sm text-slate-300">Session Preview · Midfielder · Elite</p>
            <div className="rounded-xl border border-white/15 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Pressure Window</p>
              <p className="mt-2 text-3xl font-semibold text-white">2.4s</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Decision Quality</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">86 / 100</p>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 pb-10 md:grid-cols-2">
        {features.map((feature) => (
          <GlassCard key={feature.title} title={feature.title}>
            <p className="text-slate-300">{feature.body}</p>
          </GlassCard>
        ))}
      </section>
    </Shell>
  );
}
