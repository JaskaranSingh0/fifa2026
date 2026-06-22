"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { GlobeTeamData } from "@/lib/data/globe-teams";
import { GROUPS } from "@/lib/data/groups";
import { getTeamBranding } from "@/lib/data/team-branding";
import { getTeamProfile } from "@/lib/data/team-profiles";
import TeamLogo from "@/components/TeamLogo";

interface Props {
  country: GlobeTeamData;
  isTransitioning: boolean;
  onExploreTeam: () => void;
  onClose: () => void;
}

/**
 * SelectedCountryOverlay — the editorial card that appears once the globe spins
 * a country to centre. Pure presentation; the state machine lives in
 * TeamsExperience.
 *
 * Identity treatment: the nation's crest sits above its name, the scene is
 * tinted with the team's brand colour (so Argentina feels sky-blue, Brazil
 * gold-green…), and a soft dark scrim keeps the type legible over the bright
 * globe. During the EXPLORE transition the name scales up while everything
 * else fades.
 */
export default function SelectedCountryOverlay({
  country,
  isTransitioning,
  onExploreTeam,
  onClose,
}: Props) {
  const identityRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const teamGroup = GROUPS.find((g) => g.teams.includes(country.code));
  const dynamicGroup = teamGroup?.letter ?? country.group;

  const profile = getTeamProfile(country.code);
  // ESPN kit colour covers all 48; fall back to curated branding. Matches the
  // colour used on the explore page so the two views stay consistent.
  const primary = profile?.kitPrimary || getTeamBranding(country.code).primary;
  const titles = profile?.titles ?? 0;

  // ── GSAP transition: dive INTO the crest ─────────────────────────────
  // The whole identity block (crest + name + meta) scales up and fades, as if
  // the camera pushes through it — continuing the motion into the explore
  // page's hero, which blooms in the same team colour.
  useEffect(() => {
    if (!isTransitioning) return;
    const tl = gsap.timeline();
    if (identityRef.current) {
      gsap.set(identityRef.current, { transformOrigin: "50% 38%" });
      tl.to(identityRef.current, { scale: 1.55, opacity: 0, duration: 0.85, ease: "expo.in" }, 0);
    }
    if (buttonsRef.current) tl.to(buttonsRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0);
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
      {/* Legibility scrim */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 40% at 50% 44%, rgba(0,0,0,0.58) 0%, transparent 70%)" }}
      />
      {/* Team-colour identity glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          style={{
            width: "min(80vw, 900px)",
            height: "46vh",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${primary}26 0%, transparent 65%)`,
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Identity block */}
      <div className="flex-1 flex flex-col justify-center items-center mt-32 relative">
        <div ref={identityRef} className="text-center flex flex-col items-center">
          {/* Crest */}
          <div className="mb-6 relative flex items-center justify-center">
            <div
              aria-hidden
              style={{
                position: "absolute",
                width: 104,
                height: 104,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${primary}66 0%, transparent 70%)`,
                filter: "blur(6px)",
              }}
            />
            <span
              style={{
                position: "relative",
                display: "flex",
                borderRadius: "50%",
                boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px ${primary}66`,
              }}
            >
              <TeamLogo code={country.code} size={68} />
            </span>
          </div>

          {/* Name */}
          <h1
            className="text-white font-light tracking-[0.2em] uppercase"
            style={{ fontSize: "clamp(3rem, 8vw, 8rem)", lineHeight: 0.9 }}
          >
            {country.name}
          </h1>

          {/* Accent + epithet + group/rank */}
          <div className="flex flex-col items-center gap-4 mt-7">
            <div style={{ width: 64, height: 1, background: `linear-gradient(to right, transparent, ${primary}, transparent)` }} />

            {titles > 0 && (
              <div className="flex items-center gap-2">
                <span style={{ color: "#FFD75E", fontSize: "0.85rem", letterSpacing: "0.1em" }}>{"★".repeat(titles)}</span>
                <span
                  className="uppercase"
                  style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.22em" }}
                >
                  {titles}× World Champion{titles > 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div className="flex items-center gap-6">
              {dynamicGroup && (
                <span className="uppercase" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", letterSpacing: "0.28em", fontWeight: 500 }}>
                  Group {dynamicGroup}
                </span>
              )}
              {country.ranking && (
                <span className="uppercase" style={{ fontSize: "0.8rem", letterSpacing: "0.22em", fontWeight: 600 }}>
                  <span style={{ color: primary }}>#{country.ranking}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: "0.45em", fontWeight: 400, letterSpacing: "0.2em" }}>FIFA</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: EXPLORE TEAM + Back to Globe */}
      <div ref={buttonsRef} className="flex flex-col items-center gap-6 pointer-events-auto pb-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={onExploreTeam}
          style={{
            background: "rgba(8,8,8,0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "100px",
            border: `1px solid ${primary}59`,
            cursor: "pointer",
            padding: "14px 40px",
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
            transition: "all 0.35s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = primary;
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${primary}59`;
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
          }}
        >
          Explore Team
        </motion.button>

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
            color: "rgba(255,255,255,0.45)",
            transition: "color 0.25s ease",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          Back to Globe
        </motion.button>
      </div>
    </motion.div>
  );
}
