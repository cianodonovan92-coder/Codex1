"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { ActionId } from "@/lib/types";

type CameraMode = "Tactical" | "Broadcast" | "Tracking";

const CAMERA_MODES: CameraMode[] = ["Tactical", "Broadcast", "Tracking"];

function makeLabelSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "700 94px Arial";
  ctx.fillStyle = "#8ed8ff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(99, 211, 255, 0.5)";
  ctx.shadowBlur = 24;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.2, 1.05, 1);
  sprite.position.set(0, 0.2, 6.1);

  return { sprite, texture, material };
}

function makeDashedLane(start: THREE.Vector3, end: THREE.Vector3, color: string) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.5,
    gapSize: 0.24,
    transparent: true,
    opacity: 0.95
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  line.position.y = 0.02;
  return { line, geometry, material };
}

function makePitchTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, "#0a2c1d");
  grad.addColorStop(0.45, "#0d351f");
  grad.addColorStop(1, "#081f16");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(61, 143, 92, 0.26)" : "rgba(19, 75, 49, 0.26)";
    ctx.fillRect((i * 1024) / 16, 0, 1024 / 16, 1024);
  }

  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const s = Math.random() * 1.9 + 0.2;
    ctx.fillStyle = "rgba(120, 205, 150, 0.1)";
    ctx.fillRect(x, y, s, s);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5.2, 3.6);
  texture.anisotropy = 8;
  return texture;
}

function createStadiumRing(scene: THREE.Scene) {
  const stands: THREE.Mesh[] = [];
  const standMaterial = new THREE.MeshStandardMaterial({
    color: "#15263d",
    metalness: 0.3,
    roughness: 0.75,
    emissive: "#0b1523",
    emissiveIntensity: 0.48
  });

  const radiusX = 15.5;
  const radiusZ = 11.8;
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const width = 3.4;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 3 + (i % 4) * 0.45, 2.3), standMaterial.clone());
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.position.set(Math.cos(angle) * radiusX, 1.55 + (i % 3) * 0.1, Math.sin(angle) * radiusZ);
    mesh.lookAt(0, 0.7, 0);
    scene.add(mesh);
    stands.push(mesh);
  }

  return stands;
}

function createGoal(scene: THREE.Scene, x: number, z: number, rotY = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  const postMat = new THREE.MeshStandardMaterial({ color: "#dce8f3", metalness: 0.45, roughness: 0.25 });
  const barGeom = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 20);
  const bar = new THREE.Mesh(barGeom, postMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 1.22, 0);

  const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.22, 20), postMat);
  leftPost.position.set(-1.2, 0.61, 0);
  const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.22, 20), postMat);
  rightPost.position.set(1.2, 0.61, 0);

  const net = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 1.2, 0.9),
    new THREE.MeshStandardMaterial({ color: "#a7b6c7", wireframe: true, opacity: 0.25, transparent: true })
  );
  net.position.set(0, 0.6, -0.42);

  [bar, leftPost, rightPost, net].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  });

  scene.add(group);
  return group;
}

function createPlayer(color: string, index: number) {
  const group = new THREE.Group();

  const jersey = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16, 0.26, 5, 9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.08, emissive: color, emissiveIntensity: 0.08 })
  );
  jersey.position.y = 0.5;

  const shorts = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.18, 0.2),
    new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.6 })
  );
  shorts.position.y = 0.28;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 20, 20),
    new THREE.MeshStandardMaterial({ color: "#f6c7a0", roughness: 0.65 })
  );
  head.position.y = 0.76;

  const legGeo = new THREE.BoxGeometry(0.08, 0.28, 0.08);
  const legMat = new THREE.MeshStandardMaterial({ color: "#d6d9dd", roughness: 0.6 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  const rightLeg = new THREE.Mesh(legGeo, legMat.clone());
  leftLeg.position.set(-0.07, 0.09, 0);
  rightLeg.position.set(0.07, 0.09, 0);

  [jersey, shorts, head, leftLeg, rightLeg].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  });

  group.position.set(index - 1, 0, -2);
  return { group, index, leftLeg, rightLeg };
}

function getRecommendedLaneIndex(actionId?: ActionId) {
  if (actionId === "safe-left") return 0;
  if (actionId === "line-break") return 1;
  if (actionId === "dribble-turn") return 2;
  if (actionId === "switch-play") return 3;
  return 1;
}

export function SimulationScene({ recommendedActionId }: { recommendedActionId?: ActionId }) {
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
  const [cameraMode, setCameraMode] = useState<CameraMode>("Tactical");
  const cameraModeRef = useRef<CameraMode>("Tactical");
  const recommendedLaneRef = useRef(getRecommendedLaneIndex(recommendedActionId));

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    recommendedLaneRef.current = getRecommendedLaneIndex(recommendedActionId);
  }, [recommendedActionId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#070b15", 12, 34);

    const camera = new THREE.PerspectiveCamera(49, mount.clientWidth / mount.clientHeight, 0.1, 90);
    camera.position.set(0, 4.4, 8.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor("#050b16", 1);
    renderer.xr.enabled = true;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(mount.clientWidth, mount.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.3, 0.8, 0.75);
    composer.addPass(bloom);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.6;
    controls.maxPolarAngle = 1.3;
    controls.target.set(0, 0.5, 0);
    controls.update();

    const desktop = {
      enabled: false,
      yaw: 0,
      pitch: -0.22,
      position: new THREE.Vector3(0, 1.7, 6),
      keys: { forward: false, backward: false, left: false, right: false, boost: false }
    };

    const ambient = new THREE.HemisphereLight("#a8d4ff", "#0a141f", 0.48);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight("#b9d8ff", 1.35);
    directional.position.set(7, 10, 5);
    directional.castShadow = true;
    directional.shadow.mapSize.set(2048, 2048);
    directional.shadow.camera.left = -12;
    directional.shadow.camera.right = 12;
    directional.shadow.camera.top = 12;
    directional.shadow.camera.bottom = -12;
    scene.add(directional);

    const floodA = new THREE.SpotLight("#66ddff", 2.2, 90, 0.28, 0.45, 1.1);
    floodA.position.set(-10, 11, 8);
    floodA.castShadow = false;
    scene.add(floodA);

    const floodB = new THREE.SpotLight("#9ac4ff", 1.8, 90, 0.32, 0.55, 1.05);
    floodB.position.set(10, 11, -8);
    scene.add(floodB);

    const pitchTexture = makePitchTexture();
    const pitchMaterial = new THREE.MeshStandardMaterial({
      color: "#0d2a1f",
      map: pitchTexture ?? undefined,
      roughness: 0.95,
      metalness: 0.02
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), pitchMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const lines = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: "#d4ecff", transparent: true, opacity: 0.68 });

    const addLine = (pts: THREE.Vector3[]) => {
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const l = new THREE.Line(geo, lineMat);
      l.position.y = 0.025;
      lines.add(l);
      return geo;
    };

    const lineGeometries: THREE.BufferGeometry[] = [];
    lineGeometries.push(addLine([new THREE.Vector3(-11, 0, -7), new THREE.Vector3(11, 0, -7)]));
    lineGeometries.push(addLine([new THREE.Vector3(11, 0, -7), new THREE.Vector3(11, 0, 7)]));
    lineGeometries.push(addLine([new THREE.Vector3(11, 0, 7), new THREE.Vector3(-11, 0, 7)]));
    lineGeometries.push(addLine([new THREE.Vector3(-11, 0, 7), new THREE.Vector3(-11, 0, -7)]));
    lineGeometries.push(addLine([new THREE.Vector3(0, 0, -7), new THREE.Vector3(0, 0, 7)]));

    const centerCircleGeo = new THREE.BufferGeometry();
    const circlePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      circlePts.push(new THREE.Vector3(Math.cos(a) * 1.9, 0.03, Math.sin(a) * 1.9));
    }
    centerCircleGeo.setFromPoints(circlePts);
    lines.add(new THREE.Line(centerCircleGeo, lineMat));
    lineGeometries.push(centerCircleGeo);

    scene.add(lines);

    const stands = createStadiumRing(scene);
    const goalA = createGoal(scene, 0, -7.3, Math.PI);
    const goalB = createGoal(scene, 0, 7.3, 0);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 24, 24),
      new THREE.MeshStandardMaterial({ color: "#e9eef3", emissive: "#67e8f9", emissiveIntensity: 0.35, metalness: 0.35, roughness: 0.35 })
    );
    ball.position.set(0, 0.16, 0);
    ball.castShadow = true;
    ball.receiveShadow = true;
    scene.add(ball);

    const defenders = [0, 1, 2].map((idx) => createPlayer("#f16f8a", idx));
    defenders.forEach(({ group }) => scene.add(group));

    const laneDefs = [
      { end: new THREE.Vector3(-3.6, 0.16, 2.4), color: "#45f19e" },
      { end: new THREE.Vector3(0.25, 0.16, 6.2), color: "#35d9ff" },
      { end: new THREE.Vector3(1.4, 0.16, -1.9), color: "#f8ae1a" },
      { end: new THREE.Vector3(4.5, 0.16, 1.3), color: "#a78bfa" }
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
      if (enabled) setDesktopHint(true);
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
      if (document.pointerLockElement !== renderer.domElement) setDesktopEnabled(false);
    };

    const onFullscreenChange = () => {
      if (!desktop.enabled) return;
      if (!document.fullscreenElement) setDesktopEnabled(false);
    };

    const updateDesktopCamera = (delta: number) => {
      const speed = desktop.keys.boost ? 6.4 : 3.7;
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

      desktop.position.x = THREE.MathUtils.clamp(desktop.position.x, -10.8, 10.8);
      desktop.position.z = THREE.MathUtils.clamp(desktop.position.z, -7.1, 7.1);
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

      defenders.forEach(({ group, index, leftLeg, rightLeg }) => {
        const phase = elapsed * 0.9 + index;
        group.position.x = Math.sin(phase) * 1.8;
        group.position.z = -2.1 + Math.cos(phase) * 0.88;
        group.rotation.y = Math.sin(phase * 0.8) * 0.6;
        group.position.y = Math.sin(phase * 2.5) * 0.05;
        leftLeg.rotation.x = Math.sin(phase * 6) * 0.45;
        rightLeg.rotation.x = Math.cos(phase * 6) * 0.45;
      });

      const scale = 1 + Math.sin(elapsed * 6.5) * 0.04;
      ball.scale.set(scale, scale, scale);
      ball.rotation.y += delta * 2;

      stands.forEach((stand, i) => {
        const pulse = 0.25 + Math.sin(elapsed * 0.8 + i * 0.5) * 0.08;
        const mat = stand.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.4 + pulse;
      });

      laneResources.forEach((lane, i) => {
        const recommendedLane = recommendedLaneRef.current;
        const mat = lane.material;
        if (i === recommendedLane) {
          mat.opacity = 0.9;
          mat.color.setStyle("#7CFFCF");
          mat.dashSize = 0.52 + Math.sin(elapsed * 3.2) * 0.12;
        } else {
          mat.opacity = 0.62;
          mat.color.set(laneDefs[i].color);
          mat.dashSize = 0.42;
        }
      });

      if (label) {
        label.sprite.material.opacity = 0.85 + Math.sin(elapsed * 2.1) * 0.1;
      }

      if (!renderer.xr.isPresenting) {
        const activeCameraMode = cameraModeRef.current;
        if (desktop.enabled) {
          updateDesktopCamera(delta);
        } else if (activeCameraMode === "Tactical") {
          const azimuth = Math.sin(elapsed * 0.2) * 0.11;
          const polar = 1.01 + Math.cos(elapsed * 0.18) * 0.045;
          const radius = 9.3;
          camera.position.x = Math.sin(azimuth) * radius;
          camera.position.z = Math.cos(azimuth) * radius;
          camera.position.y = Math.cos(polar) * radius + 4.7;
          camera.lookAt(0, 0.5, 0);
        } else if (activeCameraMode === "Broadcast") {
          camera.position.set(8.7 + Math.sin(elapsed * 0.42) * 0.7, 4.1, 3.6 + Math.cos(elapsed * 0.31) * 1.2);
          camera.lookAt(0, 0.42, 0.2);
        } else {
          camera.position.set(ball.position.x + 1.7, 1.55, ball.position.z + 3.6);
          camera.lookAt(ball.position.x, 0.28, ball.position.z + 0.8);
        }
      }

      if (renderer.xr.isPresenting) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }
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

        if (mount.requestFullscreen) await mount.requestFullscreen();
        if (renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock();
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
      composer.setSize(mount.clientWidth, mount.clientHeight);
      bloom.setSize(mount.clientWidth, mount.clientHeight);
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
      composer.dispose();

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

      defenders.forEach(({ group }) => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
          }
        });
        scene.remove(group);
      });

      laneResources.forEach(({ line, geometry, material }) => {
        geometry.dispose();
        material.dispose();
        scene.remove(line);
      });

      lineGeometries.forEach((g) => g.dispose());
      lineMat.dispose();
      scene.remove(lines);

      stands.forEach((stand) => {
        stand.geometry.dispose();
        (stand.material as THREE.Material).dispose();
        scene.remove(stand);
      });

      goalA.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      goalB.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      scene.remove(goalA);
      scene.remove(goalB);

      if (label) {
        label.texture.dispose();
        label.material.dispose();
        scene.remove(label.sprite);
      }

      if (pitchTexture) pitchTexture.dispose();
      pitchMaterial.dispose();
      plane.geometry.dispose();
      scene.remove(plane);

      ball.geometry.dispose();
      (ball.material as THREE.Material).dispose();
      scene.remove(ball);

      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative h-[390px] w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-950 to-slate-900">
      <div ref={mountRef} className="h-full w-full" />

      {desktopMode ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /> : null}

      <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2">
        <button
          onClick={() => setCameraMode((prev) => CAMERA_MODES[(CAMERA_MODES.indexOf(prev) + 1) % CAMERA_MODES.length])}
          className="pointer-events-auto rounded-full border border-white/20 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-100"
        >
          Camera: {cameraMode}
        </button>

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
          <span className="rounded-full border border-white/15 bg-slate-900/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-slate-300">VR unavailable</span>
        ) : null}

        {desktopMode || desktopHint ? (
          <span className="max-w-[290px] rounded-lg border border-indigo-300/25 bg-indigo-300/10 px-2.5 py-1.5 text-[11px] leading-snug text-indigo-100">
            Desktop immersive preview: move mouse to look, use WASD to move, hold Shift to sprint, press Esc to exit.
          </span>
        ) : null}

        {desktopError ? (
          <span className="max-w-[290px] rounded-lg border border-amber-300/25 bg-amber-300/10 px-2.5 py-1.5 text-[11px] leading-snug text-amber-100">{desktopError}</span>
        ) : null}

        {vrError ? (
          <span className="max-w-[290px] rounded-lg border border-amber-300/25 bg-amber-300/10 px-2.5 py-1.5 text-[11px] leading-snug text-amber-100">{vrError}</span>
        ) : null}
      </div>
    </div>
  );
}
