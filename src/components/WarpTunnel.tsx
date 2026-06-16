"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";

// ─── Warp Particles ────────────────────────────────────────────────────────
function WarpParticles({ onComplete }: { onComplete: () => void }) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const PARTICLE_COUNT = 2500;
  const TUNNEL_DEPTH = 80;
  const SPEED_BASE = 1.2;

  // Initialize particles in a tunnel formation
  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT); // z speed per particle
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random position in a cylinder tunnel
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3.5 + 0.1; // min radius prevents center cluster
      const z = -Math.random() * TUNNEL_DEPTH; // spread from 0 to -TUNNEL_DEPTH

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;

      velocities[i] = SPEED_BASE + Math.random() * 2.5; // varied speeds
      sizes[i] = 0.4 + Math.random() * 1.2;
    }

    return { positions, velocities, sizes };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  // Custom shader material for glowing streaks
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") },
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      uniform float uSpeed;
      varying float vAlpha;
      void main() {
        vAlpha = clamp((-position.z / 80.0) * 1.5, 0.0, 1.0);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + uSpeed * 0.5);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = (1.0 - d * 2.0) * vAlpha;
        gl_FragColor = vec4(uColor, alpha * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    timeRef.current += delta;

    // Ramp speed up fast, then slow down before transition
    const progress = Math.min(timeRef.current / 3.5, 1);
    const speedCurve = progress < 0.7
      ? progress / 0.7  // accelerate for first 70%
      : 1 - ((progress - 0.7) / 0.3); // decelerate last 30%
    const speed = speedCurve * 2.8 + 0.3;

    material.uniforms.uSpeed.value = speed;
    material.uniforms.uTime.value = timeRef.current;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 2] += velocities[i] * speed * delta;

      // Reset particle to far back when it passes camera
      if (arr[i * 3 + 2] > 3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3.5 + 0.1;
        arr[i * 3] = Math.cos(angle) * radius;
        arr[i * 3 + 1] = Math.sin(angle) * radius;
        arr[i * 3 + 2] = -TUNNEL_DEPTH;
      }
    }

    posAttr.needsUpdate = true;

    // Signal completion after 3.5 seconds
    if (timeRef.current >= 3.5) {
      onComplete();
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ─── Main Export ──────────────────────────────────────────────────────────
export default function WarpTunnel({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      key="warp"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: "fixed", inset: 0, zIndex: 48, background: "#000000" }}
    >
      {/* Cyan radial glow from center */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(0,180,255,0.08) 0%, transparent 60%)",
      }} />

      <Canvas
        camera={{ position: [0, 0, 2], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: false, alpha: false }}
        style={{ position: "absolute", inset: 0 }}
      >
        <WarpParticles onComplete={onComplete} />
      </Canvas>

      {/* Skip intro button */}
      <button
        onClick={onComplete}
        style={{
          position: "absolute", bottom: "2rem", right: "2rem",
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.55rem", letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
          fontFamily: "inherit", transition: "color 0.25s ease",
          zIndex: 10,
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
      >
        Skip Intro ›
      </button>
    </motion.div>
  );
}
