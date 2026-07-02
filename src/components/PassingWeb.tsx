"use client";

/**
 * PassingWeb.tsx — homepage background: a living "passing network".
 *
 * Each node is anchored to a fixed home and gently orbits it (bounded wander),
 * so the mesh stays EVENLY distributed across the whole screen forever — it
 * never migrates or clumps. Nearby nodes link with faint lines that fade with
 * distance, forming/dissolving like passing lanes. The cursor displaces nearby
 * nodes outward and they spring back when it leaves (parts → reforms). Nav
 * hover (`boost`) widens the wander + brightens the links.
 *
 * One THREE.Points (nodes) + one THREE.LineSegments (links), both additive.
 */

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Tunables ───────────────────────────────────────────────────────────────
const NODE_COUNT_DESKTOP = 300;
const NODE_COUNT_MOBILE = 150;
const FIELD_X = 22;   // half-width of the field (overflows the viewport)
const FIELD_Y = 13;
const FIELD_Z = 3;
const NODE_PX_DESKTOP = 4.5;  // ~node diameter in px at the base plane
const NODE_PX_MOBILE = 3.2;
const LINK_DIST = 4.8;        // max distance for a link
const MAX_LINKS = 5000;
const WANDER_AMP = 2.6;       // how far a node orbits its home
const EASE = 0.08;            // spring stiffness toward target
const REPEL_R = 6;            // cursor repulsion radius
const REPEL_PUSH = 5;         // how far the cursor shoves a node (it springs back)
const NODE_COLOR = new THREE.Color("#d4ecff");
const LINK_COLOR = new THREE.Color("#00d1ff");

const isMobile = () =>
  typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

interface WebProps {
  mousePos: { x: number; y: number };
  introProgress: number;
  reducedMotion: boolean;
  boost: number; // 0 idle, 1 on nav hover
  converge: boolean; // TEAMS handoff: the web gathers into a rotating Earth-sphere
}

function Web({ mousePos, introProgress, reducedMotion, boost, converge }: WebProps) {
  const count = useMemo(() => (isMobile() ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP), []);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const boostRef = useRef(0);
  const convRef = useRef(0);

  const { pos, home, seed, sphere, nodeGeo, nodeMat, lineGeo, lineMat, linePos, lineCol } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const home = new Float32Array(count * 3);  // fixed anchor per node
    const seed = new Float32Array(count);      // per-node wander phase
    const sphere = new Float32Array(count * 3); // unit Fibonacci-sphere direction per node
    const GA = Math.PI * (3 - Math.sqrt(5));   // golden angle — even coverage
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * FIELD_X * 2;
      const y = (Math.random() - 0.5) * FIELD_Y * 2;
      const z = (Math.random() - 0.5) * FIELD_Z * 2;
      home[i * 3] = x; home[i * 3 + 1] = y; home[i * 3 + 2] = z;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      seed[i] = Math.random();
      const sy = 1 - (i / Math.max(1, count - 1)) * 2; // 1 → -1
      const r = Math.sqrt(Math.max(0, 1 - sy * sy));
      const th = GA * i;
      sphere[i * 3] = Math.cos(th) * r;
      sphere[i * 3 + 1] = sy;
      sphere[i * 3 + 2] = Math.sin(th) * r;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: isMobile() ? NODE_PX_MOBILE : NODE_PX_DESKTOP },
        uOpacity: { value: 0 },
        uColor: { value: NODE_COLOR },
      },
      vertexShader: `
        uniform float uSize;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(uSize * (20.0 / -mv.z), 1.0, 16.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.1, 0.5, d);
          gl_FragColor = vec4(uColor, a * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const linePos = new Float32Array(MAX_LINKS * 2 * 3);
    const lineCol = new Float32Array(MAX_LINKS * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { pos, home, seed, sphere, nodeGeo, nodeMat, lineGeo, lineMat, linePos, lineCol };
  }, [count]);

  useFrame(({ clock, viewport }) => {
    const t = clock.getElapsedTime();
    nodeMat.uniforms.uOpacity.value = introProgress;

    boostRef.current += (boost - boostRef.current) * 0.06;
    const b = boostRef.current;
    // Handoff factor — eases toward 1 while converging (~1.2s to gather)
    convRef.current += ((converge ? 1 : 0) - convRef.current) * 0.05;
    const c = convRef.current < 0.001 ? 0 : convRef.current;
    const cSmooth = c * c * (3 - 2 * c); // smoothstep — soft start, decisive gather

    if (!reducedMotion) {
      const mx = mousePos.x * FIELD_X;
      const my = mousePos.y * FIELD_Y;
      const amp = WANDER_AMP * (1 + b * 0.4);
      // Earth-sphere: fits the viewport, spins slowly while forming
      const R = Math.min(viewport.width, viewport.height) * 0.28;
      const rot = t * 0.22;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const ease = EASE * (1 + cSmooth * 1.4); // gather with intent
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ph = seed[i] * 6.2831;
        const sp = 0.18 + seed[i] * 0.22; // varied orbit speed
        // target = home + a small orbit around it (bounded → never migrates)
        let tx = home[i3] + Math.sin(t * sp + ph) * amp;
        let ty = home[i3 + 1] + Math.cos(t * sp * 1.1 + ph * 1.7) * amp;
        let tz = home[i3 + 2];

        // cursor shoves nodes outward (fades away as the sphere forms)
        const dx = tx - mx, dy = ty - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_R && dist > 0.001) {
          const push = (1 - dist / REPEL_R) * REPEL_PUSH * (1 - cSmooth);
          tx += (dx / dist) * push;
          ty += (dy / dist) * push;
        }

        if (cSmooth > 0) {
          // blend the web target into a point on the rotating sphere
          const sx = sphere[i3], sy = sphere[i3 + 1], sz = sphere[i3 + 2];
          const rx = sx * cosR + sz * sinR;
          const rz = -sx * sinR + sz * cosR;
          tx += (rx * R - tx) * cSmooth;
          ty += (sy * R - ty) * cSmooth;
          tz += (rz * R - tz) * cSmooth;
        }

        // spring current position toward target
        pos[i3] += (tx - pos[i3]) * ease;
        pos[i3 + 1] += (ty - pos[i3 + 1]) * ease;
        pos[i3 + 2] += (tz - pos[i3 + 2]) * ease;
      }
      (nodeGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    }

    // rebuild links between nearby nodes (tighter + brighter as the sphere forms
    // → reads as a wireframe Earth rather than a dense blob)
    let li = 0;
    const effLinkDist = LINK_DIST * (1 - cSmooth * 0.62);
    const maxD2 = effLinkDist * effLinkDist;
    const linkBoost = 0.55 * introProgress * (1 + b * 0.6 + cSmooth * 0.9);
    for (let i = 0; i < count && li < MAX_LINKS; i++) {
      const ix = pos[i * 3], iy = pos[i * 3 + 1], iz = pos[i * 3 + 2];
      for (let j = i + 1; j < count && li < MAX_LINKS; j++) {
        const dx = ix - pos[j * 3];
        const dy = iy - pos[j * 3 + 1];
        const dz = iz - pos[j * 3 + 2];
        // depth joins the distance check only as the sphere forms, so links hug
        // the surface instead of crossing the globe's interior
        const d2 = dx * dx + dy * dy + dz * dz * cSmooth;
        if (d2 < maxD2) {
          const a = 1 - Math.sqrt(d2) / effLinkDist;
          const k = a * a * linkBoost;
          const o = li * 6;
          linePos[o] = ix; linePos[o + 1] = iy; linePos[o + 2] = iz;
          linePos[o + 3] = pos[j * 3]; linePos[o + 4] = pos[j * 3 + 1]; linePos[o + 5] = pos[j * 3 + 2];
          lineCol[o] = LINK_COLOR.r * k; lineCol[o + 1] = LINK_COLOR.g * k; lineCol[o + 2] = LINK_COLOR.b * k;
          lineCol[o + 3] = LINK_COLOR.r * k; lineCol[o + 4] = LINK_COLOR.g * k; lineCol[o + 5] = LINK_COLOR.b * k;
          li++;
        }
      }
    }
    lineGeo.setDrawRange(0, li * 2);
    (lineGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (lineGeo.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <>
      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />
      <points ref={pointsRef} geometry={nodeGeo} material={nodeMat} />
    </>
  );
}

export interface PassingWebProps {
  mousePos: { x: number; y: number };
  introProgress: number;
  reducedMotion: boolean;
  boost?: number;
  /** TEAMS handoff — the web gathers into a rotating Earth-sphere silhouette */
  converge?: boolean;
}

export default function PassingWeb({ mousePos, introProgress, reducedMotion, boost = 0, converge = false }: PassingWebProps) {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Web mousePos={mousePos} introProgress={introProgress} reducedMotion={reducedMotion} boost={boost} converge={converge} />
      </Canvas>
    </div>
  );
}
