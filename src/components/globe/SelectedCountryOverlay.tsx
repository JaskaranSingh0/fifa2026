"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { GlobeTeamData } from "@/lib/data/globe-teams";

interface Props {
  country: GlobeTeamData;
  isTransitioning: boolean;
  onExploreTeam: () => void;
  onClose: () => void;
}

/**
 * SelectedCountryOverlay
 *
 * Pure presentation layer — no overlay state.
 * State machine lives in TeamsExperience.
 *
 * Shows: country name + GROUP/RANK + EXPLORE TEAM button + Back to Globe
 * During transition: name scales up via GSAP, buttons fade out
 */
export default function SelectedCountryOverlay({
  country,
  isTransitioning,
  onExploreTeam,
  onClose,
}: Props) {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // ── GSAP transition: name grows, meta + buttons fade ──────────────
  useEffect(() => {
    if (!isTransitioning) return;

    const tl = gsap.timeline();

    // Step 1: Country name scales up
    if (nameRef.current) {
      tl.to(nameRef.current, {
        scale: 1.4,
        duration: 0.8,
        ease: "expo.out",
      }, 0);
    }

    // Step 2: Meta info fades
    if (metaRef.current) {
      tl.to(metaRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      }, 0);
    }

    // Step 3: Buttons fade
    if (buttonsRef.current) {
      tl.to(buttonsRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      }, 0);
    }

    return () => { tl.kill(); };
  }, [isTransitioning]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12 z-20"
    >
      {/* Country name */}
      <div className="flex-1 flex flex-col justify-center items-center mt-32">
        <div className="text-center">
          <h1
            ref={nameRef}
            className="text-white font-light tracking-[0.2em] uppercase"
            style={{
              fontSize: "clamp(3rem, 8vw, 8rem)",
              lineHeight: 0.9,
            }}
          >
            {country.name}
          </h1>

          {/* Meta: group + ranking */}
          <div
            ref={metaRef}
            className="mt-6 flex space-x-8 justify-center"
            style={{ opacity: 0.7 }}
          >
            {country.group && (
              <span className="text-white text-sm tracking-[0.3em] uppercase">
                GROUP {country.group}
              </span>
            )}
            {country.ranking && (
              <span className="text-white text-sm tracking-[0.3em] uppercase">
                &nbsp;RANK {country.ranking}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: EXPLORE TEAM + Back to Globe */}
      <div
        ref={buttonsRef}
        className="flex flex-col items-center gap-6 pointer-events-auto pb-8"
      >
        {/* EXPLORE TEAM */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={onExploreTeam}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
            padding: "14px 40px",
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            transition: "all 0.35s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
          }}
        >
          Explore Team
        </motion.button>

        {/* Back to Globe */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.6rem",
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            transition: "color 0.25s ease",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
        >
          Back to Globe
        </motion.button>
      </div>
    </motion.div>
  );
}
