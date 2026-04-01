"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Defender({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(clock.getElapsedTime() + index) * 1.5;
    ref.current.position.z = -2 + Math.cos(clock.getElapsedTime() + index) * 0.7;
  });

  return (
    <mesh ref={ref} position={[index - 1, 0.2, -2]}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.25} />
    </mesh>
  );
}

function Lane({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  return <Line points={points} color={color} lineWidth={2.2} dashed dashScale={9} />;
}

export function SimulationScene() {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950">
      <Canvas camera={{ position: [0, 4, 8], fov: 52 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 2]} intensity={1.3} color="#8ab4ff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 14]} />
          <meshStandardMaterial color="#0e1a1f" />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        <Defender index={0} />
        <Defender index={1} />
        <Defender index={2} />

        <Lane start={[0, 0.16, 0]} end={[-3, 0.16, 2]} color="#4ade80" />
        <Lane start={[0, 0.16, 0]} end={[0.3, 0.16, 4]} color="#22d3ee" />
        <Lane start={[0, 0.16, 0]} end={[1.1, 0.16, -1.5]} color="#f59e0b" />
        <Lane start={[0, 0.16, 0]} end={[4, 0.16, 1]} color="#a78bfa" />

        <Text position={[0, 0.2, 4.6]} fontSize={0.35} color="#7dd3fc">
          Forward lane
        </Text>
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0.8} maxPolarAngle={1.2} />
      </Canvas>
    </div>
  );
}
