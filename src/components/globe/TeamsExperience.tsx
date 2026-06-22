"use client";

import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";

import Earth from "./Earth";
import SpaceDust from "./SpaceDust";
import GlobeLoader from "./GlobeLoader";
import SelectedCountryOverlay from "./SelectedCountryOverlay";
import TeamProfileOverlay from "./TeamProfileOverlay";
import { globeTeams, GlobeTeamData } from "@/lib/data/globe-teams";
import { getTeamProfile, TeamProfile } from "@/lib/data/team-profiles";
import { getTeamBranding } from "@/lib/data/team-branding";

// ---------------------------------------------------------------------------
// State machine: IDLE → COUNTRY_SELECTED → TEAM_OVERLAY → COUNTRY_SELECTED → IDLE
// ---------------------------------------------------------------------------
type ExperienceState = "IDLE" | "COUNTRY_SELECTED" | "TRANSITIONING" | "TEAM_OVERLAY";

export default function TeamsExperience() {
  const [dpr, setDpr] = useState(1.5);
  const [selectedCountry, setSelectedCountry] = useState<GlobeTeamData | null>(null);
  const [experienceState, setExperienceState] = useState<ExperienceState>("IDLE");
  const [mobileList, setMobileList] = useState(false);

  // The mobile "Browse Teams" sheet only belongs in the IDLE state — close it the
  // moment a country is selected (so the globe spin + country card are visible).
  useEffect(() => {
    if (experienceState !== "IDLE") setMobileList(false);
  }, [experienceState]);

  // Refs for GSAP transition targets
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);

  const handleSelectCountry = useCallback((country: GlobeTeamData | null) => {
    setSelectedCountry(country);
    setExperienceState(country ? "COUNTRY_SELECTED" : "IDLE");
  }, []);

  // ── EXPLORE TEAM: GSAP-driven transition ─────────────────────────────
  const handleExploreTeam = useCallback(() => {
    if (!selectedCountry) return;
    setExperienceState("TRANSITIONING");

    const tl = gsap.timeline({
      onComplete: () => setExperienceState("TEAM_OVERLAY"),
    });

    // Step 1+2: Dark overlay fades in over the globe (800ms)
    if (darkOverlayRef.current) {
      tl.to(darkOverlayRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
      }, 0);
    }

    // Step 3: Globe canvas fades (runs concurrently)
    if (canvasWrapRef.current) {
      tl.to(canvasWrapRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
      }, 0.2);
    }
  }, [selectedCountry]);

  // ── BACK: return from team overlay to country selected ─────────────
  const handleBackFromOverlay = useCallback(() => {
    setExperienceState("COUNTRY_SELECTED");

    // Restore canvas opacity
    if (canvasWrapRef.current) {
      gsap.to(canvasWrapRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" });
    }
    if (darkOverlayRef.current) {
      gsap.to(darkOverlayRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  // Resolve profile for the selected team
  const teamProfile: TeamProfile | null = selectedCountry
    ? getTeamProfile(selectedCountry.code)
    : null;

  // The team's signature colour — used to tint the transition wash so the hue
  // carries continuously from the country card into the explore page (which is
  // itself tinted the same colour). Matches the card/explore palette.
  const transitionPrimary = selectedCountry
    ? teamProfile?.kitPrimary || getTeamBranding(selectedCountry.code).primary
    : "#00d1ff";

  // Fallback profile for teams without full data
  const resolvedProfile: TeamProfile | null = selectedCountry
    ? teamProfile ?? {
        code: selectedCountry.code,
        logo: `/logos/${selectedCountry.code.toLowerCase()}.png`,
        flag: "🏳️",
        fifaRanking: selectedCountry.ranking ?? 0,
        confederation: "",
        coach: "—",
        captain: "—",
        worldCupAppearances: 0,
        titles: 0,
        bestFinish: "—",
        description: `${selectedCountry.name} are competing in the FIFA World Cup 2026.`,
        squad: [],
      }
    : null;

  return (
    <div className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden select-none">

      {/* ── Branded texture-load veil ───────────────────────────────────── */}
      <GlobeLoader />

      {/* ── Globe Canvas ────────────────────────────────────────────────── */}
      {/* touchAction:none lets the canvas capture drags on touch devices instead
          of the browser scrolling/zooming the page. */}
      <div ref={canvasWrapRef} className="absolute inset-0" style={{ touchAction: "none" }}>
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          dpr={dpr}
          style={{ touchAction: "none" }}
          onCreated={({ gl }) => { gl.domElement.style.touchAction = "none"; }}
        >
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
          <ambientLight intensity={0.02} />
          <directionalLight position={[5, 3, 5]} intensity={1.5} />

          <Suspense fallback={null}>
            <Earth
              teams={globeTeams}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </Suspense>

          <SpaceDust />
          <Preload all />
        </Canvas>
      </div>

      {/* ── GSAP dark overlay (the transition wash) ──────────────────────
          Tinted with the team colour at its centre over near-black, so the
          screen blooms into the nation's hue as the globe fades — then the
          explore page (same hue) resolves on top. */}
      <div
        ref={darkOverlayRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${transitionPrimary}33 0%, #050505 62%)`,
          opacity: 0,
        }}
      />

      {/* ── Country selection overlay ────────────────────────────────── */}
      <AnimatePresence>
        {(experienceState === "COUNTRY_SELECTED" || experienceState === "TRANSITIONING") &&
          selectedCountry && (
            <SelectedCountryOverlay
              country={selectedCountry}
              isTransitioning={experienceState === "TRANSITIONING"}
              onExploreTeam={handleExploreTeam}
              onClose={() => handleSelectCountry(null)}
            />
          )}
      </AnimatePresence>

      {/* ── Team profile overlay (sibling of globe, not nested) ──────── */}
      <AnimatePresence>
        {experienceState === "TEAM_OVERLAY" && selectedCountry && resolvedProfile && (
          <TeamProfileOverlay
            profile={resolvedProfile}
            teamName={selectedCountry.name}
            onBack={handleBackFromOverlay}
          />
        )}
      </AnimatePresence>

      {/* ── Default UI — IDLE state: heading + sidebars ──────────────── */}
      <AnimatePresence>
        {experienceState === "IDLE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between"
          >
            {/* Heading */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 z-10">
              <h1 className="text-white text-3xl md:text-5xl tracking-[0.2em] uppercase font-bold opacity-90">
                TEAMS
              </h1>
            </div>

            {/* Left Sidebar */}
            <div className="absolute left-8 top-[13vh] hidden md:flex flex-col gap-1 pointer-events-auto h-auto overflow-y-auto scrollbar-none pb-8">
              {[...globeTeams].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 24).map((team) => (
                <button
                  key={team.code}
                  onClick={() => handleSelectCountry(team)}
                  className="text-left text-sm md:text-base tracking-[0.1em] text-white/70 hover:text-white transition-colors duration-300 uppercase py-0.5 font-medium drop-shadow-md"
                >
                  {team.name}
                </button>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-8 top-[13vh] hidden md:flex flex-col gap-1 pointer-events-auto h-auto overflow-y-auto scrollbar-none text-right pb-8">
              {[...globeTeams].sort((a, b) => a.name.localeCompare(b.name)).slice(24, 48).map((team) => (
                <button
                  key={team.code}
                  onClick={() => handleSelectCountry(team)}
                  className="text-right text-sm md:text-base tracking-[0.1em] text-white/70 hover:text-white transition-colors duration-300 uppercase py-0.5 font-medium drop-shadow-md"
                >
                  {team.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: "Browse Teams" sheet (desktop uses the sidebars) ──── */}
      {experienceState === "IDLE" && (
        <button
          className="md:hidden"
          onClick={() => setMobileList(true)}
          style={{
            position: "absolute", left: "50%", bottom: "1.75rem", transform: "translateX(-50%)",
            zIndex: 30, pointerEvents: "auto", padding: "0.7rem 1.4rem", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)", background: "rgba(5,5,5,0.6)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.85)", fontSize: "0.65rem", letterSpacing: "0.2em",
            textTransform: "uppercase", fontWeight: 600,
          }}
        >
          Browse Teams
        </button>
      )}

      <AnimatePresence>
        {mobileList && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", inset: 0, zIndex: 120,
              background: "rgba(5,5,5,0.97)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>48 Nations</span>
              <button onClick={() => setMobileList(false)} aria-label="Close team list" style={{ background: "none", border: "none", color: "#fff", padding: 6, cursor: "pointer", display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "0.25rem 0 2rem", WebkitOverflowScrolling: "touch" }}>
              {[...globeTeams].sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
                <button
                  key={team.code}
                  onClick={() => handleSelectCountry(team)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "0.85rem 1.5rem",
                    background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.82)", fontSize: "0.95rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
                  }}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
