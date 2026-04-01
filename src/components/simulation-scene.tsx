"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function makeLabelSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "700 52px Arial";
  ctx.fillStyle = "#7dd3fc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.8, 0.7, 1);
  sprite.position.set(0, 0.2, 4.6);

  return { sprite, texture, material };
}

function makeDashedLane(start: THREE.Vector3, end: THREE.Vector3, color: string) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.35,
    gapSize: 0.22
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return { line, geometry, material };
}

export function SimulationScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const vrSessionRef = useRef<(() => Promise<void>) | null>(null);
  const vrExitRef = useRef<(() => Promise<void>) | null>(null);
  const desktopToggleRef = useRef<(() => Promise<void>) | null>(null);

  const [xrSupport, setXrSupport] = useState<"checking" | "supported" | "unsupported">("checking");
  const [vrActive, setVrActive] = useState(false);
  const [vrError, setVrError] = useState<string | null>(null);

  const [desktopMode, setDesktopMode] = useState(false);
  const [desktopHint, setDesktopHint] = useState(false);
  const [desktopError, setDesktopError] = useState<string | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#070b15", 7, 18);

    const camera = new THREE.PerspectiveCamera(49, mount.clientWidth / mount.clientHeight, 0.1, 60);
    camera.position.set(0, 4.2, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor("#070b15", 1);
    renderer.xr.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.8;
    controls.maxPolarAngle = 1.25;
    controls.target.set(0, 0.2, 0);
    controls.update();

    const desktop = {
      enabled: false,
      yaw: 0,
      pitch: -0.22,
      position: new THREE.Vector3(0, 1.7, 6),
      keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        boost: false
      }
    };

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight("#8ab4ff", 1.25);
    directional.position.set(4, 8, 2);
    scene.add(directional);

    const spot = new THREE.SpotLight("#4FE3FF", 0.8, 0, 0.35, 0, 1);
    spot.position.set(-2, 5, 4);
    scene.add(spot);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 14),
      new THREE.MeshStandardMaterial({ color: "#0a1418", roughness: 0.9, metalness: 0.15 })
    );
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 24, 24),
      new THREE.MeshStandardMaterial({ color: "#e2e8f0", emissive: "#67e8f9", emissiveIntensity: 0.3, metalness: 0.25 })
    );
    ball.position.set(0, 0.15, 0);
    scene.add(ball);

    const defenders = [0, 1, 2].map((index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        new THREE.MeshStandardMaterial({ color: "#fb7185", emissive: "#fb7185", emissiveIntensity: 0.35, roughness: 0.2 })
      );
      mesh.position.set(index - 1, 0.2, -2);
      scene.add(mesh);
      return { mesh, index };
    });

    const laneDefs = [
      { end: new THREE.Vector3(-3, 0.16, 2), color: "#4ade80" },
      { end: new THREE.Vector3(0.3, 0.16, 4), color: "#22d3ee" },
      { end: new THREE.Vector3(1.1, 0.16, -1.5), color: "#f59e0b" },
      { end: new THREE.Vector3(4, 0.16, 1), color: "#a78bfa" }
    ];

    const laneResources = laneDefs.map(({ end, color }) => {
      const lane = makeDashedLane(new THREE.Vector3(0, 0.16, 0), end, color);
      scene.add(lane.line);
      return lane;
    });

    const label = makeLabelSprite("Forward lane");
    if (label) scene.add(label.sprite);

    const setDesktopEnabled = (enabled: boolean) => {
      desktop.enabled = enabled;
      controls.enabled = !enabled;
      setDesktopMode(enabled);
      if (enabled) {
        setDesktopHint(true);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!desktop.enabled) return;
      const key = event.key.toLowerCase();
      if (key === "w" || key === "arrowup") desktop.keys.forward = true;
      if (key === "s" || key === "arrowdown") desktop.keys.backward = true;
      if (key === "a" || key === "arrowleft") desktop.keys.left = true;
      if (key === "d" || key === "arrowright") desktop.keys.right = true;
      if (key === "shift") desktop.keys.boost = true;
      if (key === "escape") setDesktopEnabled(false);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "w" || key === "arrowup") desktop.keys.forward = false;
      if (key === "s" || key === "arrowdown") desktop.keys.backward = false;
      if (key === "a" || key === "arrowleft") desktop.keys.left = false;
      if (key === "d" || key === "arrowright") desktop.keys.right = false;
      if (key === "shift") desktop.keys.boost = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!desktop.enabled) return;
      if (document.pointerLockElement !== renderer.domElement) return;
      desktop.yaw -= event.movementX * 0.0026;
      desktop.pitch -= event.movementY * 0.0022;
      desktop.pitch = Math.max(-1.2, Math.min(0.75, desktop.pitch));
    };

    const onPointerLockChange = () => {
      if (!desktop.enabled) return;
      if (document.pointerLockElement !== renderer.domElement) {
        setDesktopEnabled(false);
      }
    };

    const onFullscreenChange = () => {
      if (!desktop.enabled) return;
      if (!document.fullscreenElement) {
        setDesktopEnabled(false);
      }
    };

    const updateDesktopCamera = (delta: number) => {
      const speed = desktop.keys.boost ? 6.4 : 3.6;
      const motion = new THREE.Vector3();

      if (desktop.keys.forward) motion.z -= 1;
      if (desktop.keys.backward) motion.z += 1;
      if (desktop.keys.left) motion.x -= 1;
      if (desktop.keys.right) motion.x += 1;

      if (motion.lengthSq() > 0) {
        motion.normalize().multiplyScalar(speed * delta);
        const forward = new THREE.Vector3(Math.sin(desktop.yaw), 0, Math.cos(desktop.yaw));
        const right = new THREE.Vector3(forward.z, 0, -forward.x);
        desktop.position.addScaledVector(forward, -motion.z);
        desktop.position.addScaledVector(right, motion.x);
      }

      desktop.position.x = THREE.MathUtils.clamp(desktop.position.x, -8, 8);
      desktop.position.z = THREE.MathUtils.clamp(desktop.position.z, -8, 8);
      desktop.position.y = 1.7;

      camera.position.copy(desktop.position);
      const look = new THREE.Vector3(
        Math.sin(desktop.yaw) * Math.cos(desktop.pitch),
        Math.sin(desktop.pitch),
        Math.cos(desktop.yaw) * Math.cos(desktop.pitch)
      );
      camera.lookAt(camera.position.clone().add(look));
    };

    const clock = new THREE.Clock();
    let elapsed = 0;

    const animate = () => {
      const delta = clock.getDelta();
      elapsed += delta;

      defenders.forEach(({ mesh, index }) => {
        const phase = elapsed * 0.85 + index;
        mesh.position.x = Math.sin(phase) * 1.55;
        mesh.position.z = -2 + Math.cos(phase) * 0.75;
        mesh.position.y = 0.2 + Math.sin(phase * 3) * 0.02;
      });

      const scale = 1 + Math.sin(elapsed * 6) * 0.045;
      ball.scale.set(scale, scale, scale);

      if (!renderer.xr.isPresenting) {
        if (desktop.enabled) {
          updateDesktopCamera(delta);
        } else {
          const azimuth = Math.sin(elapsed * 0.2) * 0.08;
          const polar = 1.03 + Math.cos(elapsed * 0.22) * 0.03;
          const radius = 8.2;
          camera.position.x = Math.sin(azimuth) * radius;
          camera.position.z = Math.cos(azimuth) * radius;
          camera.position.y = Math.cos(polar) * radius + 4.6;
          camera.lookAt(controls.target);
        }
      }

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    const xrNavigator = navigator as Navigator & {
      xr?: {
        isSessionSupported: (mode: string) => Promise<boolean>;
        requestSession: (
          mode: string,
          options?: { optionalFeatures?: string[]; requiredFeatures?: string[] }
        ) => Promise<unknown>;
      };
    };

    if (!xrNavigator.xr) {
      setXrSupport("unsupported");
    } else {
      xrNavigator.xr
        .isSessionSupported("immersive-vr")
        .then((supported) => {
          if (!disposed) setXrSupport(supported ? "supported" : "unsupported");
        })
        .catch(() => {
          if (!disposed) setXrSupport("unsupported");
        });
    }

    vrSessionRef.current = async () => {
      if (!xrNavigator.xr) {
        setVrError("WebXR is unavailable in this browser.");
        return;
      }

      try {
        setVrError(null);
        const session = await xrNavigator.xr.requestSession("immersive-vr", {
          optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
        });

        await (renderer.xr as { setSession: (nextSession: unknown) => Promise<void> }).setSession(session);
      } catch {
        setVrError("Could not start VR session. Use HTTPS or a headset-enabled browser (for example, Quest Browser).");
      }
    };

    vrExitRef.current = async () => {
      const activeSession = (renderer.xr as { getSession: () => { end: () => Promise<void> } | null }).getSession();
      if (activeSession) await activeSession.end();
    };

    desktopToggleRef.current = async () => {
      if (desktop.enabled) {
        setDesktopEnabled(false);
        if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
        if (document.fullscreenElement) await document.exitFullscreen();
        return;
      }

      try {
        setDesktopError(null);
        setDesktopEnabled(true);
        desktop.position.set(0, 1.7, 6);
        desktop.yaw = 0;
        desktop.pitch = -0.22;

        if (mount.requestFullscreen) {
          await mount.requestFullscreen();
        }

        if (renderer.domElement.requestPointerLock) {
          renderer.domElement.requestPointerLock();
        }
      } catch {
        setDesktopEnabled(false);
        setDesktopError("Could not start presentation mode. Browser blocked fullscreen or pointer lock.");
      }
    };

    const onSessionStart = () => setVrActive(true);
    const onSessionEnd = () => setVrActive(false);
    renderer.xr.addEventListener("sessionstart", onSessionStart);
    renderer.xr.addEventListener("sessionend", onSessionEnd);

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      disposed = true;
      renderer.xr.removeEventListener("sessionstart", onSessionStart);
      renderer.xr.removeEventListener("sessionend", onSessionEnd);
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      vrSessionRef.current = null;
      vrExitRef.current = null;
      desktopToggleRef.current = null;
      setVrActive(false);
      setDesktopMode(false);

      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);

      defenders.forEach(({ mesh }) => {
        (mesh.geometry as THREE.BufferGeometry).dispose();
        (mesh.material as THREE.Material).dispose();
        scene.remove(mesh);
      });

      laneResources.forEach(({ line, geometry, material }) => {
        geometry.dispose();
        material.dispose();
        scene.remove(line);
      });

      if (label) {
        label.texture.dispose();
        label.material.dispose();
        scene.remove(label.sprite);
      }

      (ball.geometry as THREE.BufferGeometry).dispose();
      (ball.material as THREE.Material).dispose();
      (plane.geometry as THREE.BufferGeometry).dispose();
      (plane.material as THREE.Material).dispose();

      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative h-[390px] w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-950 to-slate-900">
      <div ref={mountRef} className="h-full w-full" />
      <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2">
        <button
          onClick={() => {
            const run = desktopToggleRef.current;
            if (run) void run();
          }}
          className="pointer-events-auto rounded-full border border-indigo-300/30 bg-indigo-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100 transition hover:border-indigo-200 hover:bg-indigo-300/20"
        >
          {desktopMode ? "Exit Preview" : "Presentation Mode"}
        </button>

        {xrSupport === "supported" ? (
          <button
            onClick={() => {
              const run = vrActive ? vrExitRef.current : vrSessionRef.current;
              if (run) void run();
            }}
            className="pointer-events-auto rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20"
          >
            {vrActive ? "Exit VR" : "Enter VR"}
          </button>
        ) : xrSupport === "unsupported" ? (
          <span className="rounded-full border border-white/15 bg-slate-900/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-slate-300">
            VR unavailable
          </span>
        ) : null}

        {desktopMode || desktopHint ? (
          <span className="max-w-[270px] rounded-lg border border-indigo-300/25 bg-indigo-300/10 px-2.5 py-1.5 text-[11px] leading-snug text-indigo-100">
            Desktop immersive preview: move mouse to look, use WASD (Shift to sprint), press Esc to exit.
          </span>
        ) : null}

        {desktopError ? (
          <span className="max-w-[270px] rounded-lg border border-amber-300/25 bg-amber-300/10 px-2.5 py-1.5 text-[11px] leading-snug text-amber-100">
            {desktopError}
          </span>
        ) : null}

        {vrError ? (
          <span className="max-w-[270px] rounded-lg border border-amber-300/25 bg-amber-300/10 px-2.5 py-1.5 text-[11px] leading-snug text-amber-100">
            {vrError}
          </span>
        ) : null}
      </div>
    </div>
  );
}
