import { motion } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';

const features = [
  {
    title: 'Adaptive Biomech Engine',
    body: 'Realtime biomechanics models refine each frame with force-plate and motion-capture telemetry.'
  },
  {
    title: 'Scenario Intelligence',
    body: 'Run counterfactual athlete and team scenarios to simulate fatigue, load, and weather impacts.'
  },
  {
    title: 'Performance Storyline',
    body: 'Turn dense data into narrative briefs coaches and operators can act on in under 90 seconds.'
  }
];

export default function LandingPage() {
  return (
    <div className="page landing">
      <section className="hero glass-panel">
        <div>
          <p className="eyebrow">Performance Operating System</p>
          <h2>
            The premium command layer for <span>elite human performance</span>.
          </h2>
          <p>
            ApexLab brings simulation, readiness, and tactical analytics into one cinematic
            environment built for performance directors and high-pressure staff.
          </p>
          <div className="hero-cta-row">
            <button className="button-primary">Enter Command Center</button>
            <button className="button-ghost">Watch Platform Tour</button>
          </div>
        </div>
        <motion.div
          className="hero-metric"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="eyebrow">Readiness Index</p>
          <h3>96.4</h3>
          <p>+4.9% over trailing microcycle</p>
        </motion.div>
      </section>

      <section className="feature-grid">
        <SectionHeading
          eyebrow="Platform Highlights"
          title="Precision tools with executive-grade polish"
          subtitle="Every surface has been tuned for clarity, confidence, and faster decisions."
        />
        <div className="cards">
          {features.map((feature, idx) => (
            <motion.article
              key={feature.title}
              className="feature-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.1, duration: 0.5 }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
