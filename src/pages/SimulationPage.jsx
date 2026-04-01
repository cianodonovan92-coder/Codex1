import { motion } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';

const scenes = [
  { label: 'Acceleration arc', confidence: '94%' },
  { label: 'Load asymmetry risk', confidence: '11%' },
  { label: 'Neuromuscular freshness', confidence: '89%' }
];

export default function SimulationPage() {
  return (
    <div className="page simulation">
      <section className="cinematic-stage glass-panel">
        <div className="scan-line" />
        <SectionHeading
          eyebrow="Simulation Theatre"
          title="Cinematic prediction layers for decisive calls"
          subtitle="Interact with dynamic trajectories, stress overlays, and confidence envelopes in one stage."
        />
        <div className="scene-grid">
          {scenes.map((scene, i) => (
            <motion.div
              className="scene-chip"
              key={scene.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
            >
              <p>{scene.label}</p>
              <strong>{scene.confidence}</strong>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="light-beam"
          animate={{ x: ['-8%', '108%'] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
        />
      </section>
    </div>
  );
}
