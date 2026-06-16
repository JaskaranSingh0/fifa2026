"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Sample pixel positions from canvas text ──────────────────────────────
function sampleTextPositions(
  text: string,
  fontSize: number,
  canvasSize: number,
  sampleStep: number
): [number, number][] {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${fontSize}px Inter, Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvasSize / 2, canvasSize / 2);

  const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  const positions: [number, number][] = [];

  for (let y = 0; y < canvasSize; y += sampleStep) {
    for (let x = 0; x < canvasSize; x += sampleStep) {
      const idx = (y * canvasSize + x) * 4;
      if (imageData.data[idx] > 128) {
        // Normalize to [-1, 1] range centered
        const nx = ((x / canvasSize) - 0.5) * 2;
        const ny = -((y / canvasSize) - 0.5) * 2;
        positions.push([nx, ny]);
      }
    }
  }

  return positions;
}

// ─── Particle System ──────────────────────────────────────────────────────
function ParticleMorph({ assembled }: { assembled: boolean }) {
  const meshRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const { targetPositions, startPositions, count } = useMemo(() => {
    const sampled = sampleTextPositions("26", 280, 512, 4);
    const count = Math.min(sampled.length, 3000);

    // Target: the "26" text positions
    const targetPositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      targetPositions[i * 3] = sampled[i][0] * 2.2;      // x — scale to scene
      targetPositions[i * 3 + 1] = sampled[i][1] * 1.4;  // y
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // z — slight depth
    }

    // Start: random scattered positions
    const startPositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      startPositions[i * 3] = Math.cos(angle) * radius;
      startPositions[i * 3 + 1] = Math.sin(angle) * radius;
      startPositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    return { targetPositions, startPositions, count };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    // Start scattered
    for (let i = 0; i < count * 3; i++) positions[i] = startPositions[i];
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, startPositions]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.025,
    color: new THREE.Color("#ffffff"),
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    const t = assembled
      ? Math.min(timeRef.current * 0.8, 1)  // assemble over ~1.25s
      : Math.max(1 - timeRef.current * 0.8, 0); // scatter over ~1.25s

    // Ease in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const positions = meshRef.current.geometry.attributes.position;
    const arr = positions.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const sx = startPositions[i * 3], sy = startPositions[i * 3 + 1], sz = startPositions[i * 3 + 2];
      const tx = targetPositions[i * 3], ty = targetPositions[i * 3 + 1], tz = targetPositions[i * 3 + 2];

      // Add subtle floating when assembled
      const floatY = assembled ? Math.sin(timeRef.current * 0.5 + i * 0.01) * 0.008 : 0;

      arr[i * 3]     = sx + (tx - sx) * ease;
      arr[i * 3 + 1] = sy + (ty - sy) * ease + floatY;
      arr[i * 3 + 2] = sz + (tz - sz) * ease;
    }

    positions.needsUpdate = true;

    // Subtle whole-mesh rotation when assembled
    if (assembled && t > 0.8) {
      meshRef.current.rotation.y = Math.sin(timeRef.current * 0.15) * 0.08;
    }
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}

// ─── Main Export ──────────────────────────────────────────────────────────
interface GateParticlesProps {
  assembled: boolean; // true = particles forming "26", false = scattered
}

export default function GateParticles({ assembled }: GateParticlesProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 60 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: false, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <ParticleMorph assembled={assembled} />
    </Canvas>
  );
}
