'use client';

import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SectionHeading from '@/components/SectionHeading';
import SiteShell from '@/components/SiteShell';

const trend = [
  { week: 'W1', readiness: 81, explosiveness: 74 },
  { week: 'W2', readiness: 84, explosiveness: 76 },
  { week: 'W3', readiness: 86, explosiveness: 79 },
  { week: 'W4', readiness: 90, explosiveness: 83 },
  { week: 'W5', readiness: 93, explosiveness: 88 }
];

const kpis = [
  { name: 'Team Readiness', value: '93.2', delta: '+2.1%' },
  { name: 'Explosive Capacity', value: '88.7', delta: '+1.4%' },
  { name: 'Recovery Quality', value: '91.5', delta: '+3.8%' },
  { name: 'Injury Risk Delta', value: '-18', delta: '-6.2%' }
];

export default function AnalyticsPage() {
  return (
    <SiteShell>
      <main className="space-y-6">
        <SectionHeading
          eyebrow="Executive Dashboard"
          title="A real elite performance platform, not a template"
          subtitle="High-signal visual hierarchy for coaching, medical, and strategy teams under live pressure."
        />

        <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-4">
          <section className="glass p-5 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="section-eyebrow">Performance Trendline</p>
                <h3 className="text-2xl font-semibold">Readiness vs Explosiveness</h3>
              </div>
              <p className="text-sm text-slate-300">Last 5 microcycles</p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="readiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#67dcff" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#67dcff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="explosive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a690ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a690ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(174,198,255,0.18)" />
                  <XAxis dataKey="week" stroke="#b8c8f5" />
                  <YAxis stroke="#b8c8f5" domain={[60, 100]} />
                  <Tooltip contentStyle={{ background: '#09152d', border: '1px solid rgba(174,198,255,0.24)' }} />
                  <Area type="monotone" dataKey="readiness" stroke="#67dcff" fill="url(#readiness)" strokeWidth={2.3} />
                  <Area type="monotone" dataKey="explosiveness" stroke="#a690ff" fill="url(#explosive)" strokeWidth={2.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="space-y-4">
            {kpis.map((kpi, index) => (
              <motion.article
                key={kpi.name}
                className="glass p-5"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.1 }}
              >
                <p className="text-slate-300">{kpi.name}</p>
                <h4 className="text-4xl font-semibold mt-1">{kpi.value}</h4>
                <p className={`text-sm mt-2 ${kpi.delta.startsWith('-') ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {kpi.delta} vs baseline
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        <section className="glass p-5">
          <h3 className="text-xl font-semibold mb-2">High-Impact Insight</h3>
          <p className="text-slate-300 max-w-3xl">
            Cohorts improving hamstring eccentric output by ≥6% sustained higher sprint quality later in sessions with measurably lower recovery debt.
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
