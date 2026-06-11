"use client";

/**
 * DateGroup.tsx
 *
 * Groups matches under a cinematic date divider.
 * The date header feels architectural — large, editorial, low-weight.
 */

import React from "react";
import { motion } from "framer-motion";
import { Match, formatDate, formatDateShort } from "@/lib/matches-data";
import MatchCard from "./MatchCard";

interface DateGroupProps {
  date: string;
  matches: Match[];
  globalIndex: number; // running index for staggered entrance
}

export default function DateGroup({ date, matches, globalIndex }: DateGroupProps) {
  const formatted = formatDate(date);
  const short = formatDateShort(date);

  // Count live/finished/upcoming within group
  const liveCount = matches.filter((m) => m.status === "LIVE").length;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: Math.min(globalIndex * 0.06, 0.5) }}
      aria-label={`Matches on ${formatted}`}
    >
      {/* Date Header */}
      <div
        className="flex items-baseline justify-between gap-4 px-4 md:px-6 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Full date — desktop */}
        <div className="flex items-baseline gap-4">
          <h2
            className="hidden md:block"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.65rem, 1vw, 0.75rem)",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {formatted}
          </h2>

          {/* Short date — mobile */}
          <h2
            className="block md:hidden"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {short}
          </h2>

          {/* Live badge for this day */}
          {liveCount > 0 && (
            <span
              style={{
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#00D1FF",
              }}
            >
              {liveCount} LIVE
            </span>
          )}
        </div>

        {/* Match count for day */}
        <span
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.18)",
          }}
        >
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>

      {/* Match Cards */}
      <div>
        {matches.map((match, i) => (
          <MatchCard
            key={match.id}
            match={match}
            index={globalIndex + i}
          />
        ))}
      </div>
    </motion.section>
  );
}
