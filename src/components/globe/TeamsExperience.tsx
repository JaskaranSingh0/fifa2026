"use client";

import React, { useState, useRef, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";

import Earth from "./Earth";
import SpaceDust from "./SpaceDust";
import SelectedCountryOverlay from "./SelectedCountryOverlay";
import TeamProfileOverlay from "./TeamProfileOverlay";
import { globeTeams, GlobeTeamData } from "@/lib/data/globe-teams";
import { getTeamProfile, TeamProfile } from "@/lib/data/team-profiles";

// ---------------------------------------------------------------------------
// State machine: IDLE → COUNTRY_SELECTED → TEAM_OVERLAY → COUNTRY_SELECTED → IDLE
// ---------------------------------------------------------------------------
type ExperienceState = "IDLE" | "COUNTRY_SELECTED" | "TRANSITIONING" | "TEAM_OVERLAY";

export default function TeamsExperience() {
  const [dpr, setDpr] = useState(1.5);
  const [selectedCountry, setSelectedCountry] = useState<GlobeTeamData | null>(null);
  const [experienceState, setExperienceState] = useState<ExperienceState>("IDLE");

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

  // Fallback profile for teams without full data
  const resolvedProfile: TeamProfile | null = selectedCountry
    ? teamProfile ?? {
        code: selectedCountry.code,
        logo: `/logos/${selectedCountry.code}.png`,
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
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden select-none">

      {/* ── Globe Canvas ────────────────────────────────────────────────── */}
      <div ref={canvasWrapRef} className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          dpr={dpr}
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

      {/* ── GSAP dark overlay (used during transition) ───────────────── */}
      <div
        ref={darkOverlayRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "#050505", opacity: 0 }}
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
    </div>
  );
}
