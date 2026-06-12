"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  TeamProfile,
  groupSquadByPosition,
} from "@/lib/data/team-profiles";

interface Props {
  profile: TeamProfile;
  teamName: string;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Editorial team overlay — NOT a dashboard, NOT cards, NOT tabs.
// Think exhibition catalogue. Think architecture monograph.
// GSAP drives entrance animations. Framer Motion handles mount/unmount.
// ---------------------------------------------------------------------------

export default function TeamProfileOverlay({ profile, teamName, onBack }: Props) {
  const squadGroups = groupSquadByPosition(profile.squad);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── GSAP staggered entrance ──────────────────────────────────────────
  useEffect(() => {
    if (!contentRef.current) return;

    const sections = contentRef.current.querySelectorAll("[data-animate]");
    gsap.set(sections, { opacity: 0, y: 20 });
    gsap.to(sections, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.1,
      delay: 0.2,
    });

    // Separators: draw from left
    const separators = contentRef.current.querySelectorAll("[data-separator]");
    gsap.set(separators, { scaleX: 0 });
    gsap.to(separators, {
      scaleX: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.15,
      delay: 0.4,
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background: "#050505",
        fontFamily: "var(--font-inter, 'Inter', sans-serif)",
      }}
    >
      <div
        ref={contentRef}
        className="mx-auto"
        style={{
          width: "min(72%, 960px)",
          minWidth: "320px",
          paddingBottom: "8rem",
        }}
      >
        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div data-animate style={{ paddingTop: "clamp(2.5rem, 6vw, 5rem)" }}>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 group"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.65rem",
              fontWeight: 400,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              transition: "color 0.25s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            ← Back to Globe
          </button>
        </div>

        {/* ── NATION NAME ───────────────────────────────────────────────── */}
        <h1
          data-animate
          style={{
            fontSize: "clamp(3.5rem, 10vw, 9rem)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#ffffff",
            lineHeight: 0.9,
            marginTop: "clamp(2rem, 5vw, 4rem)",
            marginBottom: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          {teamName}
        </h1>

        {/* ── DESCRIPTION ───────────────────────────────────────────────── */}
        <p
          data-animate
          style={{
            fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.55)",
            maxWidth: "640px",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          {profile.description}
        </p>

        {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
        <div
          data-separator
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            transformOrigin: "left",
            marginBottom: "clamp(2.5rem, 5vw, 4rem)",
          }}
        />

        {/* ── STATS — editorial, not cards ───────────────────────────────── */}
        <div
          data-animate
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          style={{
            gap: "clamp(2rem, 4vw, 3.5rem)",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          {[
            { label: "Coach", value: profile.coach },
            { label: "Captain", value: profile.captain },
            { label: "World Cup Titles", value: profile.titles.toString() },
            { label: "Appearances", value: profile.worldCupAppearances.toString() },
            { label: "Best Finish", value: profile.bestFinish },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 400,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: "0.6rem",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "clamp(0.85rem, 1.3vw, 1.05rem)",
                  fontWeight: 500,
                  color: "#ffffff",
                  lineHeight: 1.3,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
        <div
          data-separator
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            transformOrigin: "left",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        />

        {/* ── SQUAD BY POSITION ─────────────────────────────────────────── */}
        {squadGroups.map((group) => (
          <section
            key={group.position}
            data-animate
            style={{ marginBottom: "clamp(3rem, 5vw, 4.5rem)" }}
          >
            {/* Position heading */}
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#ffffff",
                lineHeight: 1,
                marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
                opacity: 0.85,
              }}
            >
              {group.label}
            </h2>

            {/* Player list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.players.map((player) => (
                <div
                  key={player.name}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "clamp(0.8rem, 1.5vw, 1.2rem) 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Number + Name */}
                  <div className="flex items-baseline gap-3 md:gap-4">
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 400,
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.15)",
                        minWidth: "24px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {player.number}
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(0.9rem, 1.5vw, 1.15rem)",
                        fontWeight: 500,
                        color: "#ffffff",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {player.name}
                    </span>
                  </div>

                  {/* Club */}
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 300,
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.2)",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {player.club}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer
          data-animate
          style={{
            marginTop: "clamp(4rem, 8vw, 6rem)",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.1)",
              textTransform: "uppercase",
            }}
          >
            FIFA World Cup 2026 · {teamName} · {profile.squad.length} Players
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
