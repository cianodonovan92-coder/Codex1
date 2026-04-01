"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Shell, TopNav, GlassCard } from "@/components/ui";
import { SimulationScene } from "@/components/simulation-scene";
import { scenarioCatalog } from "@/data/mock-data";
import { useSession } from "@/context/session-context";
import { evaluateDecision } from "@/lib/scoring";
import { ActionId } from "@/lib/types";

export default function SimulationPage() {
  const { selection, setResult, result } = useSession();
  const scenario = useMemo(() => scenarioCatalog.find((s) => s.id === selection.scenarioId) ?? scenarioCatalog[0], [selection.scenarioId]);
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(9);
  const [decisionStart, setDecisionStart] = useState<number>();

  useEffect(() => {
    if (!started || result) return;
    if (!decisionStart) setDecisionStart(Date.now());
    const timer = setInterval(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, decisionStart, result]);

  const handleChoice = (actionId: ActionId) => {
    if (!decisionStart) return;
    const action = scenario.actions.find((a) => a.id === actionId);
    if (!action) return;
    const decisionMs = Date.now() - decisionStart;
    const hesitationMs = Math.max(0, decisionMs - 1400);
    const next = evaluateDecision({
      scenarioId: scenario.id,
      action,
      decisionMs,
      hesitationMs,
      difficulty: selection.difficulty
    });
    setResult(next);
  };

  return (
    <Shell>
      <TopNav />
      {!started ? (
        <GlassCard className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Flagship Scenario</p>
          <h1 className="mt-3 text-3xl font-semibold">Midfielder Under Central Pressure</h1>
          <p className="mt-3 text-slate-300">
            Scan before contact. You have one touch to orient and one action to break pressure. Choose within the tactical decision window.
          </p>
          <button onClick={() => setStarted(true)} className="mt-6 rounded-full bg-accent px-7 py-3 font-semibold text-slate-950">
            Enter Simulation
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-5">
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-400">Live Decision Window</p>
                <h2 className="text-2xl font-semibold">{scenario.title}</h2>
              </div>
              <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-2xl font-semibold text-cyan-200">{countdown}s</div>
            </div>
            <SimulationScene />
          </GlassCard>

          {!result ? (
            <div className="grid gap-3 md:grid-cols-2">
              {scenario.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleChoice(action.id)}
                  className="rounded-xl border border-white/20 bg-slate-900/60 p-4 text-left transition hover:border-accent"
                >
                  <p className="font-medium text-white">{action.label}</p>
                  <p className="text-sm text-slate-400">Risk {action.risk} · xValue {action.expectedValue}</p>
                </button>
              ))}
            </div>
          ) : (
            <GlassCard title="Outcome Feedback" className="grid gap-4 md:grid-cols-2">
              <Metric label="Decision speed" value={`${(result.decisionMs / 1000).toFixed(2)}s`} />
              <Metric label="Risk level" value={scenario.actions.find((a) => a.id === result.actionId)?.risk ?? "Moderate"} />
              <Metric label="Expected value" value={`${result.expectedValueCaptured} / 10`} />
              <Metric label="Coach note" value={result.feedback} />
              <div className="md:col-span-2 flex justify-end gap-3">
                <Link className="rounded-full border border-white/20 px-5 py-2" href="/analytics">
                  Open Analytics
                </Link>
                <Link className="rounded-full bg-accent px-5 py-2 font-semibold text-slate-950" href="/replay">
                  Review Replay
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </Shell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-slate-900/70 p-3">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}
