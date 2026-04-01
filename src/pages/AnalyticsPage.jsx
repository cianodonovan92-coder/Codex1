import { motion } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';

const kpis = [
  ['Team Readiness', '93.2', '+2.1'],
  ['Explosive Capacity', '88.7', '+1.4'],
  ['Recovery Quality', '91.5', '+3.8'],
  ['Injury Risk Delta', '-18', '-6.2']
];

export default function AnalyticsPage() {
  return (
    <div className="page analytics">
      <SectionHeading
        eyebrow="Executive Dashboard"
        title="An elite performance platform, not a generic dashboard"
        subtitle="Signal-forward analytics with clear hierarchies for coaching, medical, and strategy teams."
      />
      <div className="kpi-grid">
        {kpis.map(([name, value, delta], idx) => (
          <motion.article
            key={name}
            className="kpi-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.35 }}
          >
            <p>{name}</p>
            <h3>{value}</h3>
            <span className={delta.startsWith('-') ? 'neg' : 'pos'}>{delta}% vs baseline</span>
          </motion.article>
        ))}
      </div>

      <section className="insight-panel glass-panel">
        <h3>High-Impact Insight</h3>
        <p>
          Squads showing improved hamstring eccentric output by at least 6% sustained match-speed
          sprint quality deeper into sessions with lower recovery debt.
        </p>
      </section>
    </div>
  );
}
