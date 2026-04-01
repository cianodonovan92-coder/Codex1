'use client';

import { motion } from 'framer-motion';
import SectionHeading from '@/components/SectionHeading';
import SiteShell from '@/components/SiteShell';

const features = [
  {
    title: 'Adaptive Biomech Engine',
    body: 'Realtime force and motion telemetry feed models that recalibrate every rep.'
  },
  {
    title: 'Scenario Intelligence',
    body: 'Run counterfactuals for load, travel, and environmental stress with confidence overlays.'
  },
  {
    title: 'Executive Briefing Layer',
    body: 'Transform dense signals into crisp, action-ready summaries for elite operators.'
  }
];

export default function HomePage() {
  return (
    <SiteShell>
      <main className="space-y-6">
        <section className="glass grid gap-6 lg:grid-cols-[1.2fr_0.8fr] p-8">
          <div className="space-y-4">
            <p className="section-eyebrow">Performance Operating System</p>
            <h1 className="text-4xl md:text-6xl leading-[1.05] font-semibold max-w-[14ch]">
              A premium command layer for <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">elite human performance</span>.
            </h1>
            <p className="text-slate-300 max-w-2xl">
              XR Decision Lab fuses simulation, readiness intelligence, and tactical analytics into one cinematic environment.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="rounded-full px-5 py-2.5 font-semibold text-slate-900 bg-gradient-to-r from-cyan-200 to-violet-300">Enter Command Center</button>
              <button className="rounded-full px-5 py-2.5 border border-slate-300/20 bg-white/5">Watch Platform Tour</button>
            </div>
          </div>
          <motion.div
            className="rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300/20 to-violet-300/20 p-6 grid place-content-center text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="section-eyebrow">Readiness Index</p>
            <p className="text-6xl font-semibold">96.4</p>
            <p className="text-slate-300">+4.9% over trailing microcycle</p>
          </motion.div>
        </section>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="Platform Highlights"
            title="Precision interfaces with executive-grade polish"
            subtitle="Every surface is tuned for hierarchy, speed, and calm confidence under pressure."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                className="glass p-5 space-y-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.1 }}
              >
                <h3 className="text-xl font-medium">{feature.title}</h3>
                <p className="text-slate-300">{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
