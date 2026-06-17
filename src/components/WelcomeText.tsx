"use client";

/**
 * WelcomeText.tsx
 *
 * Cinematic rotating headline — top-left, largest text on the page.
 *
 * Starts with "Welcome to the World of Football" then cycles through
 * all phrases every 3 seconds using Framer Motion AnimatePresence.
 *
 * Each phrase fades out upward, new one fades in from below.
 * Feels like a film title card sequence.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Phrase sequence — first phrase is the anchor, rest cycle after
// ---------------------------------------------------------------------------
const PHRASES = [
  "48 Nations. One Dream.",
  "Welcome to the World of Football",
  "The Greatest Tournament on Earth.",
  "For Those Who Live the Game.",
  "Beyond the Final Whistle.",
  "The Story of a World Cup.",
  "Football's Biggest Stage.",
  "One Trophy. Infinite Stories.",
] as const;

const CYCLE_INTERVAL = 8000; // ms between phrases

interface WelcomeTextProps {
  isVisible: boolean;
  reducedMotion: boolean;
}

export default function WelcomeText({ isVisible, reducedMotion }: WelcomeTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cycling only after the component becomes visible
  useEffect(() => {
    if (!isVisible || reducedMotion) return;

    intervalRef.current = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, CYCLE_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, reducedMotion]);

  return (
    // Outer container: entrance animation (whole block fades in during intro)
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 12 }}
      transition={{
        duration: reducedMotion ? 0.1 : 1.0,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="absolute z-20 top-6 left-6 md:top-8 md:left-8 lg:left-12 pointer-events-none select-none"
      style={{ maxWidth: "clamp(16rem, 38vw, 520px)" }}
    >
      {/* Fixed height container so layout doesn't shift on phrase change */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: "clamp(2rem, 4vw, 4.2rem)" }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.55,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-white uppercase leading-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1.1rem, 2vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "0.06em",
              lineHeight: 1.15,
              opacity: 0.92,
            }}
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Thin accent underline — cycles with each phrase */}
      <motion.div
        key={`line-${phraseIndex}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut", delay: 0.1 }}
        style={{
          height: "1px",
          background: "linear-gradient(to right, rgba(0,209,255,0.6), transparent)",
          transformOrigin: "left center",
          marginTop: "0.5rem",
          width: "100%",
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
