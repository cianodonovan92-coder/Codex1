"use client";

import { Shell, TopNav, GlassCard } from "@/components/ui";
import { historicalMetrics, playerProfile, recommendations, scenarioCatalog } from "@/data/mock-data";
import { useSession } from "@/context/session-context";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart
} from "recharts";

export default function AnalyticsPage() {
  const { result } = useSession();
  const selected = scenarioCatalog.find((scenario) => scenario.id === result?.scenarioId) ?? scenarioCatalog[0];

  const expectedChosen = [
    { metric: "Expected", score: selected.actions.find((a) => a.eliteRecommended)?.expectedValue ?? 90 },
    { metric: "Chosen", score: selected.actions.find((a) => a.id === result?.actionId)?.expectedValue ?? 74 }
  ];

  const radarData = [
    { subject: "Decision Quality", value: result?.qualityScore ?? 84 },
    { subject: "Pressure Handling", value: result?.pressureScore ?? 79 },
    { subject: "Hesitation", value: 100 - Math.round((result?.hesitationMs ?? 520) / 20) },
    { subject: "Execution Tempo", value: Math.max(45, 100 - Math.round((result?.decisionMs ?? 2400) / 30)) }
  ];

  return (
    <Shell>
      <TopNav />
      <h1 className="mb-6 text-3xl font-semibold">Coach Analytics Dashboard</h1>
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <GlassCard title="Player Profile">
          <p className="text-xl font-semibold">{playerProfile.name}</p>
          <p className="text-sm text-slate-300">
            {playerProfile.team} · {playerProfile.role}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Age {playerProfile.age} · {playerProfile.dominantFoot}-footed · {playerProfile.sessionsThisMonth} sessions this month
          </p>
        </GlassCard>
        <GlassCard title="Session Summary" className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryMetric label="Quality Score" value={`${result?.qualityScore ?? 84}`} />
            <SummaryMetric label="Reaction Time" value={`${((result?.decisionMs ?? 2400) / 1000).toFixed(2)}s`} />
            <SummaryMetric label="Hesitation" value={`${Math.round((result?.hesitationMs ?? 520) / 10)}%`} />
            <SummaryMetric label="Pressure Score" value={`${result?.pressureScore ?? 79}`} />
          </div>
        </GlassCard>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <GlassCard title="Reaction Time Trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="session" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reaction" stroke="#22d3ee" name="Reaction (s)" />
                <Line type="monotone" dataKey="quality" stroke="#818cf8" name="Quality" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Decision Profile Radar">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar dataKey="value" stroke="#4FE3FF" fill="#4FE3FF" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard title="Expected vs Chosen Decision Value">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expectedChosen}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="score" fill="#6B8CFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Improvement Recommendations">
          <ul className="space-y-3 text-sm text-slate-200">
            {recommendations.map((item) => (
              <li key={item} className="rounded-lg border border-white/10 bg-white/5 p-3">
                {item}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </Shell>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
