"use client";

import Link from "next/link";
import { Shell, TopNav, GlassCard } from "@/components/ui";
import { scenarioCatalog } from "@/data/mock-data";
import { Difficulty, Role, Sport } from "@/lib/types";
import { useSession } from "@/context/session-context";

const sports: Sport[] = ["football/soccer", "basketball", "american football"];
const roles: Role[] = ["midfielder", "point guard", "quarterback"];
const difficulties: Difficulty[] = ["easy", "medium", "elite"];

export default function DemoPage() {
  const { selection, setSelection } = useSession();

  return (
    <Shell>
      <TopNav />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Scenario Selection</h1>
        <p className="mt-2 text-slate-300">Configure athlete context and launch a high-pressure decision simulation.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SelectGroup label="Sport" options={sports} value={selection.sport} onChange={(sport) => setSelection({ sport: sport as Sport })} />
        <SelectGroup label="Role" options={roles} value={selection.role} onChange={(role) => setSelection({ role: role as Role })} />
        <SelectGroup
          label="Difficulty"
          options={difficulties}
          value={selection.difficulty}
          onChange={(difficulty) => setSelection({ difficulty: difficulty as Difficulty })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {scenarioCatalog.map((scenario) => (
          <GlassCard key={scenario.id} className={`transition ${selection.scenarioId === scenario.id ? "border-accent" : ""}`}>
            <h2 className="text-xl font-semibold">{scenario.title}</h2>
            <p className="mt-2 min-h-14 text-sm text-slate-300">{scenario.description}</p>
            <div className="mt-4 space-y-1 text-xs text-slate-400">
              <p>Pressure: {scenario.pressureLevel}</p>
              <p>Decision window: {scenario.estimatedDecisionTime}</p>
            </div>
            <button
              className="mt-5 w-full rounded-lg border border-white/20 px-3 py-2 text-sm hover:border-accent"
              onClick={() => setSelection({ scenarioId: scenario.id })}
            >
              {selection.scenarioId === scenario.id ? "Selected" : "Choose Scenario"}
            </button>
          </GlassCard>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Link href="/simulation" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950">
          Start Simulation
        </Link>
      </div>
    </Shell>
  );
}

function SelectGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <GlassCard title={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
              value === option ? "bg-accent text-slate-950" : "border border-white/20 text-slate-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
