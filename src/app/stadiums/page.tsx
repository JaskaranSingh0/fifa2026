"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { STADIUMS } from "@/lib/data/stadiums";
import { MATCHES } from "@/lib/data/matches";

export default function StadiumsPage() {
  const [hoveredStadium, setHoveredStadium] = useState<string | null>(null);

  // Group stadiums by country
  const grouped = {
    USA: STADIUMS.filter((s) => s.country === "USA"),
    Mexico: STADIUMS.filter((s) => s.country === "Mexico"),
    Canada: STADIUMS.filter((s) => s.country === "Canada"),
  };

  return (
    <div
      className="min-h-screen bg-[#050505] overflow-y-auto"
      style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}
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
        <header style={{ paddingTop: "clamp(2.5rem, 6vw, 5rem)" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 group focus-visible:outline-none"
              style={{
                textDecoration: "none",
                fontSize: "0.65rem",
                fontWeight: 400,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                transition: "color 0.25s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            >
              ← Home
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#ffffff",
              lineHeight: 0.9,
              marginBottom: "clamp(1rem, 2vw, 1.5rem)",
            }}
          >
            Stadiums
          </motion.h1>

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
                className="mb-8 border-b border-[rgba(255,255,255,0.1)] pb-4 flex items-end justify-between"
              >
                <h2
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
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
                {venues.map((stadium, i) => {
                  const isHovered = hoveredStadium === stadium.id;
                  const isAnyHovered = hoveredStadium !== null;

                  const matchCount = MATCHES.filter(m => m.stadium.toLowerCase().includes(stadium.name.toLowerCase())).length;
                  const countLabel = stadium.id === 'metlife' ? 'FINAL' : `${matchCount} MATCHES`;

                  return (
                    <div
                      key={stadium.id}
                      onMouseEnter={() => setHoveredStadium(stadium.id)}
                      onMouseLeave={() => setHoveredStadium(null)}
                      className="group relative flex flex-col md:flex-row md:items-start justify-between py-6 md:py-8 border-b border-[rgba(255,255,255,0.03)] cursor-default"
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
                            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                            color: isHovered ? "#ffffff" : "rgba(255,255,255,0.85)",
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
                              fontSize: "0.7rem",
                              fontWeight: 400,
                              letterSpacing: "0.15em",
                              color: "rgba(0,209,255,0.8)",
                            }}
                          >
                            {stadium.city}
                          </span>
                          {isHovered && (
                            <>
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
                            </>
                          )}
                        </div>
                        {isHovered && (
                          <p style={{
                            fontSize: '0.7rem', fontWeight: 300, letterSpacing: '0.05em',
                            color: 'rgba(255,255,255,0.35)', marginTop: '0.5rem',
                            maxWidth: '480px', lineHeight: 1.6,
                            transform: 'translateX(10px)', transition: 'all 0.4s ease'
                          }}>
                            {stadium.description}
                          </p>
                        )}
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
                              color: stadium.id === 'metlife' ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
                            }}
                          >
                            {countLabel}
                          </span>
                          <span
                            className="tabular-nums"
                            style={{
                              fontSize: "clamp(1rem, 2vw, 1.5rem)",
                              fontWeight: 300,
                              letterSpacing: "0.05em",
                              color: isHovered ? "#ffffff" : "rgba(255,255,255,0.3)",
                              transition: "color 0.4s ease",
                            }}
                          >
                            {stadium.capacity.toLocaleString()}
                          </span>
                        </div>
                        <span
                          className="block uppercase"
                          style={{
                            fontSize: "0.55rem",
                            fontWeight: 400,
                            letterSpacing: "0.2em",
                            color: "rgba(255,255,255,0.15)",
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
    </div>
  );
}
