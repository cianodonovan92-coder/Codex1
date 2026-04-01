"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Defender({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.85 + index;
    ref.current.position.x = Math.sin(t) * 1.55;
    ref.current.position.z = -2 + Math.cos(t) * 0.75;
    ref.current.position.y = 0.2 + Math.sin(t * 3) * 0.02;
  });

  return (
    <mesh ref={ref} position={[index - 1, 0.2, -2]}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.35} roughness={0.2} />
    </mesh>
  );
}

function BallPulse() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const scale = 1 + Math.sin(clock.getElapsedTime() * 6) * 0.045;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={ref} position={[0, 0.15, 0]}>
      <sphereGeometry args={[0.15, 24, 24]} />
      <meshStandardMaterial color="#e2e8f0" emissive="#67e8f9" emissiveIntensity={0.3} metalness={0.25} />
    </mesh>
  );
}

function Lane({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  return <Line points={points} color={color} lineWidth={2.2} dashed dashScale={8} />;
}

function TacticalCamera() {
  const controls = useRef<any>(null);
  useFrame(({ clock }) => {
    if (!controls.current) return;
    const t = clock.getElapsedTime();
    controls.current.setAzimuthalAngle(Math.sin(t * 0.2) * 0.08);
    controls.current.setPolarAngle(1.03 + Math.cos(t * 0.22) * 0.03);
  });

  return <OrbitControls ref={controls} enableZoom={false} enablePan={false} minPolarAngle={0.8} maxPolarAngle={1.25} />;
}

export function SimulationScene() {
  return (
    <div className="h-[390px] w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-950 to-slate-900">
      <Canvas camera={{ position: [0, 4.2, 8.2], fov: 49 }}>
        <fog attach="fog" args={["#070b15", 7, 18]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 8, 2]} intensity={1.25} color="#8ab4ff" />
        <spotLight position={[-2, 5, 4]} intensity={0.8} angle={0.35} color="#4FE3FF" penumbra={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 14]} />
          <meshStandardMaterial color="#0a1418" roughness={0.9} metalness={0.15} />
        </mesh>

        <BallPulse />

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
        <TacticalCamera />
      </Canvas>
    </div>
  );
}
