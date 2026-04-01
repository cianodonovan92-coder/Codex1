'use client';

import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import SectionHeading from '@/components/SectionHeading';
import SiteShell from '@/components/SiteShell';

const chips = [
  { label: 'Acceleration Arc', confidence: '94%' },
  { label: 'Load Asymmetry Risk', confidence: '11%' },
  { label: 'Neuromuscular Freshness', confidence: '89%' }
];

function OrbitalScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 55 }}>
      <color attach="background" args={['#050912']} />
      <ambientLight intensity={0.8} />
      <pointLight position={[2, 2, 2]} color="#74e9ff" intensity={26} />
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
        <Sphere args={[1.1, 64, 64]}>
          <meshStandardMaterial color="#74dfff" roughness={0.14} metalness={0.55} emissive="#3657b4" emissiveIntensity={0.35} />
        </Sphere>
      </Float>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}

export default function SimulationPage() {
  return (
    <SiteShell>
      <main>
        <section className="glass relative overflow-hidden p-8 min-h-[72vh] bg-gradient-to-b from-[#070d1c] via-[#081327] to-[#0b1a35]">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(186,216,255,0.02),rgba(186,216,255,0.02)_1px,transparent_1px,transparent_6px)]" />
          <div className="relative z-10 space-y-6">
            <SectionHeading
              eyebrow="Simulation Theatre"
              title="Cinematic prediction layers for decisive calls"
              subtitle="Trajectory envelopes, risk overlays, and confidence timelines in one immersive operational view."
            />

            <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-stretch">
              <div className="rounded-2xl overflow-hidden border border-slate-300/20 min-h-[360px]">
                <OrbitalScene />
              </div>
              <div className="space-y-3">
                {chips.map((chip, index) => (
                  <motion.div
                    key={chip.label}
                    className="rounded-xl border border-slate-300/20 bg-[#0c1b38b0] px-4 py-3 flex items-center justify-between"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index + 0.1 }}
                  >
                    <span>{chip.label}</span>
                    <strong className="text-cyan-200">{chip.confidence}</strong>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            className="pointer-events-none absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent"
            animate={{ x: ['-20%', '120%'] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          />
        </section>
      </main>
    </SiteShell>
  );
}
