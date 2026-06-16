"use client";

/**
 * page.tsx — FIFA World Cup 2026 Homepage
 *
 * Navigation gateway. Not a content page.
 * Fits inside a single 100vh screen — no scrolling.
 *
 * THREE-STAGE EXPERIENCE (phase: 'gate' → 'warp' → 'universe'):
 *   gate     → Title card + "26" particle morph; ENTER EXPERIENCE / Skip
 *   warp     → WarpTunnel star-streak transition (~3.5s, skippable)
 *   universe → Particle universe + center navigation
 *
 * Returning visitors (sessionStorage 'wc2026_entered') skip straight to 'universe'.
 *
 * UNIVERSE INTRO TIMELINE (requestAnimationFrame, ms from universe start):
 *   →1400ms  Particles materialise   (uIntroProgress 0→1)
 *   →1800ms  Particle motion begins  (state → IDLE)
 *   →2200ms  Welcome text fades in
 *   →2700ms  Nav items appear sequentially
 *   →3000ms  Full idle — all interactions active
 *
 * prefers-reduced-motion short-circuits the timeline and reveals everything at once.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

import WelcomeText from "@/components/WelcomeText";
import { useMouseInteraction } from "@/hooks/useMouseInteraction";
import { ParticleState } from "@/lib/particle-system";

// Dynamically import the WebGL canvas — avoids SSR issues with Three.js
const ParticleBackground = dynamic(
  () => import("@/components/ParticleBackground"),
  { ssr: false }
);

const GateParticlesDynamic = dynamic(
  () => import("@/components/GateParticles"),
  { ssr: false }
);

const WarpTunnelDynamic = dynamic(
  () => import("@/components/WarpTunnel"),
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Intro timing constants (ms)
// ---------------------------------------------------------------------------
const PHASE_2_END = 1400;   // Particle materialisation window
const PHASE_3_END = 1800;   // Motion begins
const PHASE_4_END = 2200;   // Welcome text in
const PHASE_5_END = 2700;   // Nav items in
const INTRO_COMPLETE = 3000; // Full idle

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { label: "MATCHES",  href: "/matches",  state: ParticleState.HOVER_MATCHES  },
  { label: "TEAMS",    href: "/teams",    state: ParticleState.HOVER_TEAMS    },
  { label: "STADIUMS", href: "/stadiums", state: ParticleState.HOVER_STADIUMS },
  { label: "GROUPS",   href: "/groups",   state: ParticleState.HOVER_GROUPS   },
  { label: "BRACKET",  href: "/bracket",  state: ParticleState.HOVER_BRACKET  },
] as const;

// ---------------------------------------------------------------------------
// NavPortal — individual item with GSAP hover + Framer Motion entrance
// ---------------------------------------------------------------------------

interface NavPortalProps {
  label: string;
  href: string;
  navState: ParticleState;
  onNavHover: (state: ParticleState) => void;
  onNavLeave: () => void;
  reducedMotion: boolean;
  introComplete: boolean;
  /** refs for all sibling links — so we can dim them on hover */
  siblingRefs: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
  myIndex: number;
}

function NavPortal({
  label,
  href,
  navState,
  onNavHover,
  onNavLeave,
  reducedMotion,
  introComplete,
  siblingRefs,
  myIndex,
}: NavPortalProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Register this element into the shared refs array
  useEffect(() => {
    siblingRefs.current[myIndex] = linkRef.current;
    return () => { siblingRefs.current[myIndex] = null; };
  }, [siblingRefs, myIndex]);

  const handleEnter = useCallback(() => {
    if (!introComplete || reducedMotion) return;
    onNavHover(navState);

    // Animate all siblings
    siblingRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === myIndex) {
        gsap.to(el, {
              scale: 1.06,
              opacity: 1,
              letterSpacing: "0.26em",
              duration: 0.4,
              ease: "power2.out",
            });
      } else {
        gsap.to(el, {
              scale: 1,
              opacity: 0.22,
              letterSpacing: "0.2em",
              duration: 0.35,
              ease: "power2.out",
            });
      }
    });
  }, [introComplete, reducedMotion, onNavHover, navState, siblingRefs, myIndex]);

  const handleLeave = useCallback(() => {
    if (!introComplete || reducedMotion) return;
    onNavLeave();

    siblingRefs.current.forEach((el) => {
      if (!el) return;
      gsap.to(el, {
        scale: 1,
        opacity: 1,
        letterSpacing: "0.2em",
        duration: 0.4,
        ease: "power2.out",
      });
    });
  }, [introComplete, reducedMotion, onNavLeave, siblingRefs]);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reducedMotion ? 0.01 : 0.72,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
    >
      <Link
        ref={linkRef}
        href={href}
        aria-label={`Navigate to ${label}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className="flex items-center justify-center min-h-[52px] md:min-h-0 focus-visible:outline-none"
        style={{
          fontFamily: "var(--font-inter, 'Inter', sans-serif)",
          fontSize: "clamp(1.1rem, 2.1vw, 2.4rem)",
          fontWeight: 700,
          letterSpacing: "0.2em",
          lineHeight: 1,
          color: "#ffffff",
          textDecoration: "none",
          textTransform: "uppercase",
          userSelect: "none",
          willChange: "transform, opacity",
          display: "flex",
          alignItems: "center",
        }}
      >
        {label}
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------

export default function HomePage() {
  const [phase, setPhase] = useState<'gate' | 'warp' | 'universe'>('gate');
  const [navState, setNavState] = useState<ParticleState>(ParticleState.INTRO);
  const [introProgress, setIntroProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [particlesAssembled, setParticlesAssembled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('wc2026_entered') === 'true') {
      setPhase('universe');
    }
  }, []);

  // Start assembling 600ms after gate appears
  useEffect(() => {
    if (phase !== 'gate') return;
    const t = setTimeout(() => setParticlesAssembled(true), 600);
    return () => clearTimeout(t);
  }, [phase]);

  const handleEnter = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem('wc2026_entered', 'true');
    setParticlesAssembled(false); // scatter particles on exit
    setPhase('warp');
  }, []);

  const handleSkip = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem('wc2026_entered', 'true');
    setPhase('universe');
  }, []);

  const handleWarpComplete = useCallback(() => {
    setPhase('universe');
  }, []);

  const startTime = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const navStateRef = useRef(navState);
  const showWelcomeRef = useRef(false);
  const showNavRef = useRef(false);
  const introCompleteRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { navStateRef.current = navState; }, [navState]);

  const { mousePos, clickPos, reducedMotion } = useMouseInteraction();

  // Shared refs for GSAP nav sibling animation
  const siblingRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // ---------------------------------------------------------------------------
  // Intro animation driver — requestAnimationFrame loop
  // ---------------------------------------------------------------------------
  const driveIntro = useCallback((timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;

    // Particle materialisation progress [0 → 1]
    const rawProgress = Math.min(elapsed / PHASE_2_END, 1);
    // Ease in-out quad
    const easedProgress = rawProgress < 0.5
      ? 2 * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
    setIntroProgress(easedProgress);

    // Phase 3: particle motion begins
    if (elapsed >= PHASE_3_END && navStateRef.current === ParticleState.INTRO) {
      setNavState(ParticleState.IDLE);
    }

    // Phase 4: welcome text
    if (elapsed >= PHASE_4_END && !showWelcomeRef.current) {
      showWelcomeRef.current = true;
      setShowWelcome(true);
    }

    // Phase 5: nav appears
    if (elapsed >= PHASE_5_END && !showNavRef.current) {
      showNavRef.current = true;
      setShowNav(true);
    }

    // Phase 6: intro complete
    if (elapsed >= INTRO_COMPLETE && !introCompleteRef.current) {
      introCompleteRef.current = true;
      setIntroComplete(true);
      return; // Stop RAF loop
    }

    animFrameRef.current = requestAnimationFrame(driveIntro);
  }, []);

  useEffect(() => {
    if (phase !== 'universe') return; // Don't start until gate is dismissed

    if (reducedMotion) {
      // Skip intro — show everything immediately
      setIntroProgress(1);
      setNavState(ParticleState.IDLE);
      setShowWelcome(true);
      setShowNav(true);
      setIntroComplete(true);
      introCompleteRef.current = true;
      showWelcomeRef.current = true;
      showNavRef.current = true;
      return;
    }

    animFrameRef.current = requestAnimationFrame(driveIntro);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [reducedMotion, driveIntro, phase]);

  // ---------------------------------------------------------------------------
  // Nav interaction handlers
  // ---------------------------------------------------------------------------
  const handleNavHover = useCallback((state: ParticleState) => {
    if (!introCompleteRef.current) return;
    setNavState(state);
  }, []);

  const handleNavLeave = useCallback(() => {
    if (!introCompleteRef.current) return;
    setNavState(ParticleState.IDLE);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main
      role="main"
      aria-label="FIFA World Cup 2026"
      className="fixed inset-0 overflow-hidden bg-[#050505]"
      style={{ width: "100dvw", height: "100dvh" }}
    >
      <AnimatePresence>
        {phase === 'gate' && (
          <motion.div
            key="gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: '#050505',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0',
            }}
          >
            {/* Particle canvas plays behind gate at very low opacity */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
              <ParticleBackground
                navState={ParticleState.IDLE}
                mousePos={{ x: 0.5, y: 0.5 }}
                clickPos={null}
                introProgress={1}
                reducedMotion={false}
              />
            </div>

            {/* GateParticles — "26" forming behind the text */}
            <div style={{
              position: 'absolute',
              bottom: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(600px, 90vw)',
              height: 'min(300px, 40vh)',
              opacity: 0.35,  // subtle — behind the text
              pointerEvents: 'none',
            }}>
              <GateParticlesDynamic assembled={particlesAssembled} />
            </div>

            {/* Title composition */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', userSelect: 'none' }}>
              
              {/* Tiny label */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  fontSize: '0.6rem', letterSpacing: '0.4em',
                  color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                  marginBottom: '2rem', fontWeight: 400,
                }}
              >
                USA · MEXICO · CANADA · 2026
              </motion.p>

              {/* MASSIVE title — staggered lines */}
              {['FIFA', 'WORLD CUP', '2026'].map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    fontSize: line === 'FIFA' 
                      ? 'clamp(4rem, 14vw, 12rem)'
                      : line === 'WORLD CUP'
                      ? 'clamp(2rem, 7vw, 6rem)'
                      : 'clamp(3rem, 10vw, 9rem)',
                    fontWeight: 900,
                    letterSpacing: line === 'FIFA' ? '0.1em' : '0.08em',
                    lineHeight: 0.9,
                    color: line === '2026' ? 'rgba(255,255,255,0.15)' : '#ffffff',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  {line}
                </motion.div>
              ))}

              {/* Thin separator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  height: '1px', background: 'rgba(255,255,255,0.1)',
                  margin: '2.5rem auto', width: '80px', transformOrigin: 'center',
                }}
              />

              {/* ENTER EXPERIENCE button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                onClick={handleEnter}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '100px', cursor: 'pointer',
                  padding: '0.75rem 2rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {/* Play triangle */}
                <svg width="10" height="12" viewBox="0 0 10 12" fill="rgba(255,255,255,0.7)">
                  <path d="M0 0L10 6L0 12V0Z" />
                </svg>
                <span style={{
                  fontSize: '0.65rem', letterSpacing: '0.3em',
                  color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 500,
                }}>
                  ENTER EXPERIENCE
                </span>
              </motion.button>
            </div>

            {/* Skip button — bottom right */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              onClick={handleSkip}
              style={{
                position: 'absolute', bottom: '2rem', right: '2rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.55rem', letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
            >
              Skip ›
            </motion.button>
          </motion.div>
        )}

        {phase === 'warp' && (
          <WarpTunnelDynamic onComplete={handleWarpComplete} />
        )}
      </AnimatePresence>

      {/* ── WebGL Particle Universe ────────────────────────────────────────── */}
      <ParticleBackground
        navState={navState}
        mousePos={mousePos}
        clickPos={clickPos}
        introProgress={introProgress}
        reducedMotion={reducedMotion}
      />

      {/* ── Welcome Text (top-right desktop / top-center mobile) ────────────── */}
      {phase === 'universe' && (
        <WelcomeText isVisible={showWelcome} reducedMotion={reducedMotion} />
      )}

      {/* ── Year Badge — top left ─────────────────────────────────────────── */}
      {phase === 'universe' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={showWelcome ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          className="absolute z-20 bottom-6 right-6 md:bottom-8 md:right-8 lg:right-12 pointer-events-none select-none"
        >
          <span
            className="text-white uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-inter, 'Inter', sans-serif)",
              fontSize: "clamp(0.55rem, 0.9vw, 0.7rem)",
              fontWeight: 300,
              opacity: 0.58,
              letterSpacing: "0.18em",
            }}
          >
            FIFA · World Cup · 2026
          </span>
        </motion.div>
      )}

      {/* ── Center Navigation ─────────────────────────────────────────────── */}
      {phase === 'universe' && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <AnimatePresence>
            {showNav && (
              <motion.nav
                key="main-nav"
                role="navigation"
                aria-label="Main navigation"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: reducedMotion ? 0 : 0.11,
                    },
                  },
                }}
                className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-10 w-full px-8"
              >
                {NAV_ITEMS.map((item, index) => (
                  <NavPortal
                    key={item.label}
                    label={item.label}
                    href={item.href}
                    navState={item.state}
                    onNavHover={handleNavHover}
                    onNavLeave={handleNavLeave}
                    reducedMotion={reducedMotion}
                    introComplete={introComplete}
                    siblingRefs={siblingRefs}
                    myIndex={index}
                  />
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Bottom vertical accent line ───────────────────────────────────── */}
      {phase === 'universe' && (
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={showWelcome ? { scaleY: 1, opacity: 1 } : {}}
          transition={{
            duration: 1.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.6,
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            width: "1px",
            height: "56px",
            background: "linear-gradient(to top, rgba(0,209,255,0.35), transparent)",
            transformOrigin: "bottom center",
          }}
          aria-hidden="true"
        />
      )}
    </main>
  );
}

