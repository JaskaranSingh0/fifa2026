"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STADIUMS, Stadium } from "@/lib/data/stadiums";
import { MATCHES } from "@/lib/data/matches";
import RevealText from "@/components/RevealText";
import StadiumOverlay from "@/components/stadiums/StadiumOverlay";

export default function StadiumsPage() {
  const [hoveredStadium, setHoveredStadium] = useState<string | null>(null);
  const [selected, setSelected] = useState<Stadium | null>(null);

  // Group stadiums by country
  const grouped = {
    USA: STADIUMS.filter((s) => s.country === "USA"),
    Mexico: STADIUMS.filter((s) => s.country === "Mexico"),
    Canada: STADIUMS.filter((s) => s.country === "Canada"),
  };

  return (
    <div
      className="bg-[#050505]"
      style={{ minHeight: '100vh', fontFamily: "var(--font-inter, 'Inter', sans-serif)", background: 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, #050505 400px)' }}
    >
      {/* Dynamic Background glow based on hovered stadium (optional subtle effect) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 ease-out"
        style={{
          background: hoveredStadium
            ? "radial-gradient(circle at 50% 50%, rgba(0,209,255,0.03) 0%, transparent 60%)"
            : "none",
        }}
      />

      <div
        className="mx-auto relative z-10"
        style={{
          width: "min(90%, 1200px)",
          minWidth: "320px",
          paddingBottom: "8rem",
        }}
      >
        {/* HEADER */}
        <header style={{ paddingTop: "clamp(4rem, 7vw, 6rem)" }}>

          <RevealText
            text="Stadiums"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#ffffff",
              lineHeight: 0.9,
              marginBottom: "clamp(1rem, 2vw, 1.5rem)",
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <span
              style={{
                fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)",
              }}
            >
               16 Venues
            </span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span
              style={{
                fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              3 Nations
            </span>
          </motion.div>
        </header>

        {/* LIST */}
        <div className="mt-16 md:mt-24 space-y-24">
          {Object.entries(grouped).map(([country, venues], groupIndex) => (
            <motion.section
              key={country}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: groupIndex * 0.1 }}
            >
              {/* Country Header */}
              <div
                className="mb-8 flex items-end justify-between"
                style={{
                  borderTop: "2px solid rgba(255,255,255,0.15)",
                  paddingTop: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(0.6rem, 1vw, 0.8rem)",
                    fontWeight: 700,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {country}
                </h2>
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 300,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  {venues.length} Venues
                </span>
              </div>

              {/* Venues */}
              <div className="flex flex-col">
                {venues.map((stadium) => {
                  const isHovered = hoveredStadium === stadium.id;
                  const isAnyHovered = hoveredStadium !== null;

                  const matchCount = MATCHES.filter(m =>
                    stadium.matchCities.some(city =>
                      m.city?.toLowerCase().includes(city.toLowerCase()) ||
                      m.stadium?.toLowerCase().includes(city.toLowerCase())
                    )
                  ).length;

                  const countLabel = matchCount > 0 ? `${matchCount} MATCHES` : "";

                  return (
                    <div
                      key={stadium.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Explore ${stadium.name}`}
                      onMouseEnter={() => setHoveredStadium(stadium.id)}
                      onMouseLeave={() => setHoveredStadium(null)}
                      onClick={() => setSelected(stadium)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(stadium); }
                      }}
                      className="group relative flex flex-col md:flex-row md:items-start justify-between py-8 md:py-10 border-b border-[rgba(255,255,255,0.03)] cursor-pointer"
                      style={{
                        opacity: isAnyHovered ? (isHovered ? 1 : 0.2) : 1,
                        transition: "opacity 0.4s ease",
                      }}
                    >
                      {/* Name & City & Surface */}
                      <div className="flex flex-col gap-2">
                        <span
                          className="uppercase"
                          style={{
                            fontSize: "clamp(2rem, 4vw, 3.5rem)",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            color: isHovered ? "#ffffff" : "rgba(255,255,255,0.6)",
                            lineHeight: 1,
                            transition: "color 0.4s ease, transform 0.4s ease",
                            transform: isHovered ? "translateX(10px)" : "translateX(0)",
                          }}
                        >
                          {stadium.name}
                        </span>
                        <div className="flex items-center gap-3" style={{
                            transition: "transform 0.4s ease",
                            transform: isHovered ? "translateX(10px)" : "translateX(0)",
                          }}>
                          <span
                            className="uppercase"
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 400,
                              letterSpacing: "0.2em",
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            {stadium.city}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                          <span
                            className="uppercase"
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 600,
                              letterSpacing: "0.15em",
                              color: stadium.accent,
                            }}
                          >
                            {stadium.distinction}
                          </span>
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -5 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-3"
                              >
                                <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                                <span
                                  className="uppercase"
                                  style={{
                                    fontSize: "0.6rem",
                                    fontWeight: 400,
                                    letterSpacing: "0.15em",
                                    color: "rgba(255,255,255,0.4)",
                                  }}
                                >
                                  {stadium.surface}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <AnimatePresence>
                          {isHovered && (
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                fontSize: '0.7rem', fontWeight: 300, letterSpacing: '0.05em',
                                color: 'rgba(255,255,255,0.35)', marginTop: '0.5rem',
                                maxWidth: '480px', lineHeight: 1.6,
                                transform: 'translateX(10px)'
                              }}
                            >
                              {stadium.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {isHovered && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="uppercase"
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 600,
                                letterSpacing: "0.2em",
                                color: stadium.accent,
                                marginTop: "0.85rem",
                                transform: "translateX(10px)",
                              }}
                            >
                              Explore Venue →
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Capacity & Matches */}
                      <div className="mt-4 md:mt-0 text-left md:text-right flex flex-col md:items-end">
                        <div className="flex items-baseline gap-4">
                          <span
                            className="uppercase"
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 600,
                              letterSpacing: "0.15em",
                              color: stadium.id === 'metlife' ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {countLabel}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{
                              fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)",
                              fontWeight: 300,
                              letterSpacing: "0.05em",
                              color: isHovered ? "#ffffff" : "rgba(255,255,255,0.6)",
                              transition: "color 0.4s ease",
                            }}
                          >
                            {stadium.capacity.toLocaleString()}
                          </span>
                        </div>
                        <span
                          className="block uppercase"
                          style={{
                            fontSize: "0.58rem",
                            fontWeight: 500,
                            letterSpacing: "0.2em",
                            color: "rgba(255,255,255,0.45)",
                            marginTop: "4px",
                          }}
                        >
                          Capacity
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <StadiumOverlay stadium={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
