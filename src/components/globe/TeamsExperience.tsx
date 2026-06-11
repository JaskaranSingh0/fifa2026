"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";

import Earth from "./Earth";
import SpaceDust from "./SpaceDust";
import SelectedCountryOverlay from "./SelectedCountryOverlay";
import { globeTeams, GlobeTeamData } from "@/lib/data/globe-teams";

export default function TeamsExperience() {
  const [dpr, setDpr] = useState(1.5);
  const [selectedCountry, setSelectedCountry] = useState<GlobeTeamData | null>(null);

  const handleSelectCountry = (country: GlobeTeamData | null) => {
    setSelectedCountry(country);
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={dpr}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
        
        {/* Lights */}
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

      {/* 2D Overlay layer - Selection state */}
      <AnimatePresence>
        {selectedCountry && (
          <SelectedCountryOverlay 
            country={selectedCountry} 
            onClose={() => handleSelectCountry(null)}
          />
        )}
      </AnimatePresence>

      {/* Default UI - Heading and Sidebars */}
      <AnimatePresence>
        {!selectedCountry && (
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
