"use client";

import Link from "next/link";
import { Shell, TopNav, GlassCard } from "@/components/ui";
import { useSession } from "@/context/session-context";
import { scenarioCatalog } from "@/data/mock-data";

export default function ReplayPage() {
  const { result } = useSession();
  const scenario = scenarioCatalog.find((item) => item.id === result?.scenarioId) ?? scenarioCatalog[0];
  const chosen = scenario.actions.find((action) => action.id === result?.actionId) ?? scenario.actions[0];
  const elite = scenario.actions.find((action) => action.eliteRecommended) ?? scenario.actions[1];

  return (
    <Shell>
      <TopNav />
      <h1 className="mb-6 text-3xl font-semibold">Replay + Explainability Review</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard title="Decision Comparison">
          <div className="space-y-3 text-sm">
            <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-amber-100">
              Chosen Decision: <strong>{chosen.label}</strong>
            </p>
            <p className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-emerald-100">
              Elite Recommendation: <strong>{elite.label}</strong>
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-white/15 bg-[#10212b] p-4">
            <FieldDiagram />
          </div>
        </GlassCard>

        <GlassCard title="Explainability Panel">
          <ExplainItem title="What the player saw" body="Immediate safe outlet and pressure closing from both shoulders." />
          <ExplainItem title="What they missed" body="Forward lane opened for 0.8 seconds as the near defender stepped late." />
          <ExplainItem title="What elite performers do" body="Pre-orient hips before first touch, then release line-break pass before second defender engages." />
          <ExplainItem title="Recommended next drill" body="6-rep constrained rondo with mandatory third-man action under 2.2s release timing." />
          <Link href="/demo" className="mt-5 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950">
            Run Another Session
          </Link>
        </GlassCard>
      </div>
    </Shell>
  );
}

function ExplainItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-1 text-sm text-slate-200">{body}</p>
    </div>
  );
}

function FieldDiagram() {
  return (
    <svg viewBox="0 0 360 180" className="h-52 w-full">
      <rect x="4" y="4" width="352" height="172" rx="10" fill="#0b3a2b" stroke="#67e8f9" strokeOpacity="0.3" />
      <line x1="180" y1="4" x2="180" y2="176" stroke="#bae6fd" strokeOpacity="0.4" />
      <circle cx="180" cy="90" r="20" fill="none" stroke="#bae6fd" strokeOpacity="0.4" />
      <circle cx="165" cy="90" r="7" fill="#e2e8f0" />
      <circle cx="130" cy="92" r="7" fill="#f43f5e" />
      <circle cx="205" cy="82" r="7" fill="#f43f5e" />
      <circle cx="260" cy="64" r="7" fill="#22d3ee" />
      <line x1="165" y1="90" x2="260" y2="64" stroke="#22d3ee" strokeWidth="3" strokeDasharray="6 4" />
    </svg>
  );
}
