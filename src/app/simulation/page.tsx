"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Shell, TopNav, GlassCard } from "@/components/ui";
import { scenarioCatalog } from "@/data/mock-data";
import { useSession } from "@/context/session-context";
import { evaluateDecision } from "@/lib/scoring";
import { ActionId, Scenario, ScenarioAction } from "@/lib/types";

const TOTAL_TIME = 9;

const SimulationScene = dynamic(() => import("@/components/simulation-scene").then((mod) => mod.SimulationScene), {
  ssr: false,
  loading: () => (
    <div className="h-[390px] w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-950 to-slate-900" />
  )
});

export default function SimulationPage() {
  const { selection, setResult, result } = useSession();
  const scenario = useMemo(() => scenarioCatalog.find((s) => s.id === selection.scenarioId) ?? scenarioCatalog[0], [selection.scenarioId]);
  const recommendedAction = useMemo(() => getRecommendedAction(scenario), [scenario]);
  const selectedAction = useMemo(
    () => (result ? scenario.actions.find((action) => action.id === result.actionId) : undefined),
    [result, scenario.actions]
  );

  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(TOTAL_TIME);
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

  const urgencyPct = Math.max(0, (countdown / TOTAL_TIME) * 100);

  return (
    <Shell>
      <TopNav />
      {!started ? (
        <GlassCard className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-accent">Flagship Scenario</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Midfielder Under Central Pressure</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Scan before contact. You have one touch to orient and one action to break pressure. Choose within the tactical decision window.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-7 rounded-full bg-accent px-7 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
          >
            Enter Simulation
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <GlassCard className="overflow-hidden">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Decision Window</p>
                <h2 className="text-2xl font-semibold">{scenario.title}</h2>
              </div>
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-2xl font-semibold text-cyan-200">{countdown}s</div>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-400 to-fuchsia-400 transition-all duration-500"
                style={{ width: `${urgencyPct}%` }}
              />
            </div>

            <div className="mb-5 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Objective</p>
              <p className="mt-1 text-sm text-slate-100">{getObjectiveCopy(scenario, recommendedAction)}</p>
            </div>

            <SimulationScene recommendedActionId={recommendedAction?.id} />
          </GlassCard>

          {!result ? (
            <div className="grid gap-3 md:grid-cols-2">
              {scenario.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleChoice(action.id)}
                  className="rounded-xl border border-white/20 bg-slate-900/60 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{action.label}</p>
                    {action.eliteRecommended ? (
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-200">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">Risk {action.risk} · Success {action.successRate}% · xValue {action.expectedValue}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ConsequenceBadge label={getRiskConsequence(action)} tone="risk" />
                    <ConsequenceBadge label={getUpsideConsequence(action)} tone="upside" />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{action.coachNote}</p>
                </button>
              ))}
            </div>
          ) : (
            <GlassCard title="Outcome Feedback" className="grid gap-4 md:grid-cols-2">
              <Metric label="Decision speed" value={`${(result.decisionMs / 1000).toFixed(2)}s`} />
              <Metric label="Risk level" value={scenario.actions.find((a) => a.id === result.actionId)?.risk ?? "Moderate"} />
              <Metric label="Expected value" value={`${result.expectedValueCaptured} / 10`} />
              <Metric label="Coach note" value={result.feedback} />
              <div className="md:col-span-2 rounded-xl border border-white/15 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Decision Breakdown</p>
                <p className="mt-2 text-sm text-slate-100">{getDecisionExplanation(selectedAction, recommendedAction)}</p>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                <Link className="rounded-full border border-white/20 px-5 py-2 transition hover:border-accent" href="/analytics">
                  Open Analytics
                </Link>
                <Link className="rounded-full bg-accent px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300" href="/replay">
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
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  );
}

function getRecommendedAction(scenario: Scenario) {
  return scenario.actions.find((action) => action.eliteRecommended) ?? [...scenario.actions].sort((a, b) => b.expectedValue - a.expectedValue)[0];
}

function getObjectiveCopy(scenario: Scenario, recommendedAction?: ScenarioAction) {
  if (!recommendedAction) {
    return `Choose the highest value progression option inside ${scenario.estimatedDecisionTime}.`;
  }

  return `In this rep, your target is ${recommendedAction.label.toLowerCase()} within ${scenario.estimatedDecisionTime} before pressure closes the lane.`;
}

function getRiskConsequence(action: ScenarioAction) {
  if (action.risk === "Low") return "Low turnover risk";
  if (action.risk === "Moderate") return "Balanced risk profile";
  return "High reward, high turnover risk";
}

function getUpsideConsequence(action: ScenarioAction) {
  if (action.expectedValue >= 85) return "High upside if executed";
  if (action.expectedValue >= 70) return "Moderate attacking upside";
  return "Stabilizes possession";
}

function getDecisionExplanation(selectedAction?: ScenarioAction, recommendedAction?: ScenarioAction) {
  if (!selectedAction) return "Your selection could not be mapped to a known action.";

  if (!recommendedAction) {
    return `You chose ${selectedAction.label.toLowerCase()}. This action carries ${selectedAction.risk.toLowerCase()} risk with an estimated ${selectedAction.successRate}% success rate.`;
  }

  if (selectedAction.id === recommendedAction.id) {
    return `You chose ${selectedAction.label.toLowerCase()}, which matched the top-value option for this situation. The tradeoff was ${selectedAction.risk.toLowerCase()} risk for high attacking value.`;
  }

  return `You chose ${selectedAction.label.toLowerCase()} (${selectedAction.risk.toLowerCase()} risk, ${selectedAction.successRate}% success), while the higher-value option was ${recommendedAction.label.toLowerCase()}. That choice was safer, but it gave up some progression upside.`;
}

function ConsequenceBadge({ label, tone }: { label: string; tone: "risk" | "upside" }) {
  const className =
    tone === "risk"
      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
      : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${className}`}>{label}</span>;
}
