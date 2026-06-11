"use client";

/**
 * StageFilter.tsx
 *
 * Horizontal tournament stage filter pills.
 * Elegantly minimal — thin underline indicator, no heavy button styling.
 */

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { TournamentStage, STAGE_LABELS_SHORT } from "@/lib/matches-data";

const STAGES = [
  TournamentStage.ALL,
  TournamentStage.GROUP_STAGE,
  TournamentStage.ROUND_OF_32,
  TournamentStage.ROUND_OF_16,
  TournamentStage.QUARTER_FINALS,
  TournamentStage.SEMI_FINALS,
  TournamentStage.FINAL,
] as const;

interface StageFilterProps {
  active: TournamentStage;
  onChange: (stage: TournamentStage) => void;
  matchCounts: Partial<Record<TournamentStage, number>>;
}

export default function StageFilter({ active, onChange, matchCounts }: StageFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-0 overflow-x-auto scrollbar-none"
      role="tablist"
      aria-label="Filter by tournament stage"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {STAGES.map((stage) => {
        const isActive = stage === active;
        const count = matchCounts[stage];

        return (
          <button
            key={stage}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(stage)}
            className="relative flex items-center gap-1.5 px-4 py-3 shrink-0 focus-visible:outline-none group"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {/* Label */}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "color 0.25s ease, font-weight 0.25s ease",
                whiteSpace: "nowrap",
              }}
            >
              {STAGE_LABELS_SHORT[stage]}
            </span>

            {/* Count badge */}
            {count !== undefined && count > 0 && (
              <span
                style={{
                  fontSize: "0.5rem",
                  fontWeight: 500,
                  color: isActive ? "rgba(0,209,255,0.8)" : "rgba(255,255,255,0.18)",
                  letterSpacing: "0.08em",
                  transition: "color 0.25s ease",
                }}
              >
                {count}
              </span>
            )}

            {/* Active underline */}
            {isActive && (
              <motion.div
                layoutId="stage-indicator"
                className="absolute bottom-0 left-3 right-3 h-px"
                style={{ background: "#ffffff" }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
