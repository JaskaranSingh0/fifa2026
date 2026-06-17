"use client";

/**
 * ParticleBackground.tsx
 *
 * Full-screen WebGL particle universe powered by React Three Fiber.
 *
 * Key design decisions:
 * - Single THREE.Points draw call — GPU-efficient, single shader
 * - Custom ShaderMaterial for soft glow discs (no MeshStandardMaterial)
 * - Three depth layers with independent speed multipliers
 * - Morph-target architecture ready for future globe transition
 * - Particle count adapts to device capability
 */

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  ParticleState,
  ParticleSystemData,
  initParticles,
  updateParticles,
  applyMouseAttraction,
  triggerBurst,
  getOptimalParticleCount,
  getConfig,
} from "@/lib/particle-system";

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

/**
 * Vertex shader: passes layer data to fragment for brightness variation.
 * Size attenuation gives correct perspective scaling.
 */
const vertexShader = `
  attribute float layer;
  attribute float phase;
  
  uniform float uTime;
  uniform float uIntroProgress;
  uniform float uSize;
  
  varying float vLayer;
  varying float vBrightness;
  varying vec2 vUv;
  
  void main() {
    vLayer = layer;
    
    // Layer-based brightness: back=dim, front=bright
    vBrightness = 0.3 + layer * 0.35;
    
    // Intro fade: particles materialise gradually
    // Each particle has a unique threshold based on phase
    float threshold = phase / (2.0 * 3.14159);
    float particleVisible = step(threshold, uIntroProgress);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Perspective-correct size — closer particles appear larger
    float depthFactor = 350.0 / -mvPosition.z;
    float baseSize = uSize + layer * (uSize * 0.3);
    
    gl_PointSize = baseSize * depthFactor * particleVisible;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment shader: renders each particle as a soft glowing disc.
 * The glow falloff creates the subtle ethereal look without excessive brightness.
 */
const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uTime;
  
  varying float vLayer;
  varying float vBrightness;
  
  void main() {
    // gl_PointCoord is [0,1] per particle quad
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    
    // Soft disc with glow falloff
    float disc = 1.0 - smoothstep(0.0, 0.5, dist);
    float glow = 0.15 * (1.0 - smoothstep(0.3, 0.5, dist));
    float alpha = disc * 0.75 + glow;
    
    if (alpha < 0.01) discard;
    
    // Front layer particles get a subtle accent tint
    float accentMix = vLayer * 0.08;
    vec3 color = mix(uColor, uAccent, accentMix) * vBrightness;
    
    gl_FragColor = vec4(color, alpha * vBrightness);
  }
`;

// ---------------------------------------------------------------------------
// Inner particle mesh component
// ---------------------------------------------------------------------------

interface ParticleUniverseProps {
  navState: ParticleState;
  mousePos: { x: number; y: number };
  clickPos: { x: number; y: number } | null;
  introProgress: number;
  reducedMotion: boolean;
}

function ParticleUniverse({
  navState,
  mousePos,
  clickPos,
  introProgress,
  reducedMotion,
}: ParticleUniverseProps) {
  const { size } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Particle system data — initialised once, mutated every frame via refs
  const particleCount = useMemo(() => getOptimalParticleCount(), []);
  const config = useMemo(() => getConfig(particleCount), [particleCount]);

  const systemData = useRef<ParticleSystemData>(
    initParticles(particleCount)
  );

  // Track last click to avoid re-triggering
  const lastClickPos = useRef<{ x: number; y: number } | null>(null);

  // Geometry — created once, position buffer updated every frame
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const data = systemData.current;

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(data.positions, 3)
    );
    geo.setAttribute(
      "layer",
      new THREE.BufferAttribute(data.layers, 1)
    );
    geo.setAttribute(
      "phase",
      new THREE.BufferAttribute(data.phases, 1)
    );

    return geo;
  }, []);

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntroProgress: { value: 0 },
      uSize: { value: config.size },
      uColor: { value: new THREE.Color("#ffffff") },
      uAccent: { value: new THREE.Color("#00D1FF") },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Adjust field of view based on viewport
  useEffect(() => {
    // Nothing needed — camera is handled by Canvas default
  }, [size]);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current || !materialRef.current) return;

    const time = clock.getElapsedTime() * 1000;
    const clampedDelta = Math.min(delta, 0.05); // cap at 50ms for stability

    // Update shader uniforms
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uIntroProgress.value = introProgress;

    if (reducedMotion) {
      // Minimal update — just sync intro progress
      const posAttr = pointsRef.current.geometry.getAttribute("position");
      (posAttr as THREE.BufferAttribute).needsUpdate = true;
      return;
    }

    const data = systemData.current;

    // Apply mouse attraction
    applyMouseAttraction(
      mousePos.x,
      mousePos.y,
      data.positions,
      data.velocities,
      config
    );

    // Apply click burst if new
    if (clickPos && clickPos !== lastClickPos.current) {
      lastClickPos.current = clickPos;
      triggerBurst(clickPos.x, clickPos.y, data.positions, data.velocities, config);
    }

    // Run physics simulation
    updateParticles(data, config, navState, time, clampedDelta * 60);

    // Mark position buffer dirty for GPU upload
    const posAttr = pointsRef.current.geometry.getAttribute("position");
    (posAttr as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface ParticleBackgroundProps {
  navState: ParticleState;
  mousePos: { x: number; y: number };
  clickPos: { x: number; y: number } | null;
  introProgress: number;
  reducedMotion: boolean;
}

export default function ParticleBackground({
  navState,
  mousePos,
  clickPos,
  introProgress,
  reducedMotion,
}: ParticleBackgroundProps) {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 20],
          fov: 60,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{
          antialias: false,          // Performance — particles don't need AA
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        {/* Minimal ambient — the scene is lit by particle glow only */}
        <ambientLight intensity={0} />

        <ParticleUniverse
          navState={navState}
          mousePos={mousePos}
          clickPos={clickPos}
          introProgress={introProgress}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
