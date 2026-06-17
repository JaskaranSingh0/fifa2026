/**
 * particle-system.ts
 *
 * Core particle engine for the FIFA World Cup 2026 experience.
 *
 * ARCHITECTURE NOTE:
 * This system is designed with future globe morphing in mind.
 * The `MorphTarget` interface and `morphTargetPositions` concept
 * are intentionally baked into the data structures now so the
 * Teams globe transition can be added later without rebuilding this system.
 *
 * Future morph sequence:
 *   IDLE → MORPH_GLOBE → Interactive Globe Experience
 */

// ---------------------------------------------------------------------------
// Types & Enums
// ---------------------------------------------------------------------------

export enum ParticleState {
  INTRO = "INTRO",
  IDLE = "IDLE",
  HOVER_MATCHES = "HOVER_MATCHES",
  HOVER_TEAMS = "HOVER_TEAMS",
  HOVER_STADIUMS = "HOVER_STADIUMS",
  HOVER_GROUPS = "HOVER_GROUPS",
  HOVER_BRACKET = "HOVER_BRACKET",
  BURST = "BURST",
  MORPH_GLOBE = "MORPH_GLOBE", // Future: triggered by clicking TEAMS
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  depthRange: number; // z-axis spread
  attractionStrength: number;
  burstStrength: number;
}

/**
 * MorphTarget — future globe transition data.
 * When implementing the globe, populate targetPositions with
 * lat/lon-derived sphere surface coordinates.
 */
export interface MorphTarget {
  targetPositions: Float32Array | null; // null until globe feature is implemented
  progress: number; // 0 → 1 lerp progress
  duration: number; // ms
}

export interface ParticleSystemData {
  positions: Float32Array;      // xyz per particle
  velocities: Float32Array;     // xyz velocity per particle
  phases: Float32Array;         // random phase offset per particle [0, 2π]
  layers: Float32Array;         // depth layer assignment [0, 1, 2]
  originalPositions: Float32Array; // starting positions for formation resets
  morphTarget: MorphTarget;     // future globe morph data
}

// ---------------------------------------------------------------------------
// Device Capability Detection
// ---------------------------------------------------------------------------

/**
 * Determines optimal particle count based on device capabilities.
 * Conservative defaults ensure smooth performance across devices.
 */
export function getOptimalParticleCount(): number {
  if (typeof window === "undefined") return 2000;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile) {
    return memory && memory <= 2 ? 1800 : 3000;
  }

  // Desktop scaling
  if (cores >= 8 && (!memory || memory >= 8)) return 8000;
  if (cores >= 4) return 6000;
  return 3500;
}

export function getConfig(count: number): ParticleConfig {
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

  return {
    count,
    size: isMobile ? 6.6 : 7.8,
    speed: 0.14,
    depthRange: 28,
    attractionStrength: 0.0006,
    burstStrength: 0.02,
  };
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Creates and seeds all particle buffers.
 * Returns a ParticleSystemData object that the R3F component owns.
 */
export function initParticles(count: number): ParticleSystemData {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const layers = new Float32Array(count);
  const originalPositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Distribute across a wide field — slightly elongated on x for widescreen
    const x = (Math.random() - 0.5) * 60;
    const y = (Math.random() - 0.5) * 36;
    const z = (Math.random() - 0.5) * 28;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    originalPositions[i3] = x;
    originalPositions[i3 + 1] = y;
    originalPositions[i3 + 2] = z;

    // Slow, gentle initial velocities
    velocities[i3] = (Math.random() - 0.5) * 0.008;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.008;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.004;

    phases[i] = Math.random() * Math.PI * 2;

    // Three depth layers: 0=back, 1=mid, 2=front
    layers[i] = Math.floor(Math.random() * 3);
  }

  return {
    positions,
    velocities,
    phases,
    layers,
    originalPositions,
    morphTarget: {
      targetPositions: null, // Populated in future globe feature
      progress: 0,
      duration: 2000,
    },
  };
}

// ---------------------------------------------------------------------------
// Mouse / Touch Attraction
// ---------------------------------------------------------------------------

/**
 * Applies a soft gravitational pull toward the cursor.
 * Elegant and subtle — never aggressive.
 */
export function applyMouseAttraction(
  mouseX: number,   // normalised [-1, 1]
  mouseY: number,   // normalised [-1, 1]
  positions: Float32Array,
  velocities: Float32Array,
  config: ParticleConfig
): void {
  // Convert normalised coords to world space (approximate)
  const targetX = mouseX * 30;
  const targetY = mouseY * 18;

  const count = positions.length / 3;
  const strength = config.attractionStrength;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const dx = targetX - positions[i3];
    const dy = targetY - positions[i3 + 1];
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

    // Attraction falls off with distance — only nearby particles respond strongly
    const falloff = Math.min(1.0, 8.0 / dist);

    velocities[i3] += dx * strength * falloff;
    velocities[i3 + 1] += dy * strength * falloff;
  }
}

// ---------------------------------------------------------------------------
// Click / Tap Burst
// ---------------------------------------------------------------------------

/**
 * Triggers an outward burst from a click/tap position.
 * Particles close to the click receive a strong outward impulse.
 */
export function triggerBurst(
  clickX: number,   // normalised [-1, 1]
  clickY: number,
  positions: Float32Array,
  velocities: Float32Array,
  config: ParticleConfig
): void {
  const cx = clickX * 30;
  const cy = clickY * 18;
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const dx = positions[i3] - cx;
    const dy = positions[i3 + 1] - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

    // Strong burst within radius 6, falls off quickly
    if (dist < 12) {
      const force = (config.burstStrength * (12 - dist)) / 12;
      velocities[i3] += (dx / dist) * force;
      velocities[i3 + 1] += (dy / dist) * force;
      velocities[i3 + 2] += (Math.random() - 0.5) * force * 0.5;
    }
  }
}

// ---------------------------------------------------------------------------
// Navigation Hover Formations
// ---------------------------------------------------------------------------

/**
 * Applies nav-state-specific particle behavior.
 * All formations are abstract — they suggest football concepts without
 * explicitly drawing football graphics.
 */
export function applyNavHoverBehavior(
  state: ParticleState,
  positions: Float32Array,
  velocities: Float32Array,
  time: number,
  delta: number
): void {
  const count = positions.length / 3;
  const t = time * 0.001; // seconds

  switch (state) {
    case ParticleState.HOVER_MATCHES: {
      // Passing lanes — directional flow streams, like tactical movement
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const lane = (i % 5) - 2; // -2 to 2
        const targetY = lane * 5;
        const targetX = Math.sin(t * 0.4 + i * 0.02) * 20;

        velocities[i3] += (targetX - positions[i3]) * 0.0008 * delta;
        velocities[i3 + 1] += (targetY - positions[i3 + 1]) * 0.0006 * delta;
      }
      break;
    }

    case ParticleState.HOVER_TEAMS: {
      // World-sphere suggestion — particles drift into a gentle hemisphere arc
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const angle = (i / count) * Math.PI * 2;
        const radius = 12 + Math.sin(t * 0.3 + i * 0.1) * 4;
        const targetX = Math.cos(angle + t * 0.05) * radius;
        const targetY = Math.sin(angle * 0.5 + t * 0.08) * (radius * 0.5);

        velocities[i3] += (targetX - positions[i3]) * 0.0005 * delta;
        velocities[i3 + 1] += (targetY - positions[i3 + 1]) * 0.0005 * delta;
      }
      break;
    }

    case ParticleState.HOVER_STADIUMS: {
      // Location-marker suggestion — particles drift inward then orbit center
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const angle = (i / count) * Math.PI * 2 + t * 0.1;
        const baseRadius = 4 + (i % 8) * 2;
        const targetX = Math.cos(angle) * baseRadius;
        const targetY = Math.sin(angle) * baseRadius * 0.4; // ellipse

        velocities[i3] += (targetX - positions[i3]) * 0.0006 * delta;
        velocities[i3 + 1] +=
          (targetY - positions[i3 + 1]) * 0.0006 * delta;
        // Slight upward drift — like a pin rising
        velocities[i3 + 1] += 0.0002 * delta;
      }
      break;
    }

    case ParticleState.HOVER_GROUPS: {
      // 5 organic cluster formations — one per group cluster
      const numClusters = 5;
      const clusterCenters = Array.from({ length: numClusters }, (_, k) => ({
        x: ((k - 2) / 2) * 20,
        y: Math.sin((k / numClusters) * Math.PI) * 6,
      }));

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const cluster = clusterCenters[i % numClusters];
        const wobble = Math.sin(t * 0.6 + i * 0.15) * 2;

        velocities[i3] +=
          (cluster.x + wobble - positions[i3]) * 0.0007 * delta;
        velocities[i3 + 1] +=
          (cluster.y - positions[i3 + 1]) * 0.0007 * delta;
      }
      break;
    }

    case ParticleState.HOVER_BRACKET: {
      // Knockout bracket tree — bifurcating split pattern
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const depth = i % 4; // 4 depth levels of the bracket
        const side = i % 2 === 0 ? 1 : -1;
        const targetX = side * (depth + 1) * 6;
        const slot = Math.floor(i / 4) % Math.pow(2, depth);
        const targetY =
          ((slot / Math.pow(2, depth)) - 0.5) * 20;

        velocities[i3] += (targetX - positions[i3]) * 0.0007 * delta;
        velocities[i3 + 1] += (targetY - positions[i3 + 1]) * 0.0007 * delta;
      }
      break;
    }

    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// Physics Integration
// ---------------------------------------------------------------------------

/**
 * Main physics update — called every frame in useFrame.
 * Applies damping, boundary wrapping, and depth-layer speed multipliers.
 */
export function updateParticles(
  data: ParticleSystemData,
  config: ParticleConfig,
  state: ParticleState,
  time: number,
  delta: number
): void {
  const { positions, velocities, phases, layers } = data;
  const count = config.count;

  // Speed multipliers per depth layer (back=slow, front=faster)
  const layerSpeeds = [0.35, 1.0, 1.7];
  // Damping — how quickly particles lose excess velocity
  const damping = 0.985;
  // Field bounds
  const boundX = 32;
  const boundY = 20;
  const boundZ = 16;

  const t = time * 0.001;

  // Apply nav hover formations
  if (
    state !== ParticleState.IDLE &&
    state !== ParticleState.INTRO &&
    state !== ParticleState.BURST
  ) {
    applyNavHoverBehavior(state, positions, velocities, time, delta);
  }

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const layer = layers[i];
    const speedMult = layerSpeeds[layer] * config.speed;
    const phase = phases[i];

    // Ambient sinusoidal drift — the universe feels alive
    const waveX = Math.sin(t * 0.15 + phase) * 0.0015 * speedMult;
    const waveY = Math.cos(t * 0.12 + phase * 1.3) * 0.0015 * speedMult;
    const waveZ = Math.sin(t * 0.08 + phase * 0.7) * 0.0008 * speedMult;

    velocities[i3] += waveX;
    velocities[i3 + 1] += waveY;
    velocities[i3 + 2] += waveZ;

    // Apply damping
    velocities[i3] *= damping;
    velocities[i3 + 1] *= damping;
    velocities[i3 + 2] *= damping;

    // Integrate position
    positions[i3] += velocities[i3];
    positions[i3 + 1] += velocities[i3 + 1];
    positions[i3 + 2] += velocities[i3 + 2];

    // Wrap boundaries — particles that drift off-screen reappear on the other side
    if (positions[i3] > boundX) positions[i3] = -boundX;
    else if (positions[i3] < -boundX) positions[i3] = boundX;
    if (positions[i3 + 1] > boundY) positions[i3 + 1] = -boundY;
    else if (positions[i3 + 1] < -boundY) positions[i3 + 1] = boundY;
    if (positions[i3 + 2] > boundZ) positions[i3 + 2] = -boundZ;
    else if (positions[i3 + 2] < -boundZ) positions[i3 + 2] = boundZ;
  }
}

// ---------------------------------------------------------------------------
// Future: Morph Target (Globe)
// ---------------------------------------------------------------------------

/**
 * Sets sphere surface positions as morph targets.
 * Call this when preparing the Teams globe transition.
 * NOT called currently — this is the hook point for future work.
 */
export function prepareSphereTargets(
  count: number,
  radius: number = 10
): Float32Array {
  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Fibonacci sphere distribution for even coverage
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    targets[i3] = radius * Math.sin(phi) * Math.cos(theta);
    targets[i3 + 1] = radius * Math.cos(phi);
    targets[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  return targets;
}
