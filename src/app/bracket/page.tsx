"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TournamentStage } from "@/lib/data/matches";
import TeamLogo from "@/components/TeamLogo";
import { getTeamBranding } from "@/lib/data/team-branding";

const STAGES = [
  { id: TournamentStage.ROUND_OF_32, label: "Round of 32" },
  { id: TournamentStage.ROUND_OF_16, label: "Round of 16" },
  { id: TournamentStage.QUARTER_FINALS, label: "Quarter-Finals" },
  { id: TournamentStage.SEMI_FINALS, label: "Semi-Finals" },
  { id: TournamentStage.FINAL, label: "Final" },
];

function formatMatchDate(isoString: string) {
  // ISO: 2026-06-11
  const parts = isoString.split("-");
  if (parts.length >= 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  }
  return isoString;
}

function isPlaceholder(code: string) {
  // e.g. "W50", "L60", "1A", "2B"
  return !/^[A-Z]{3}$/.test(code) || code === "TBD";
}

export default function BracketPage() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        setLiveMatches(data.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const knockoutMatches = useMemo(() => {
    return liveMatches.filter(
      (m) =>
        m.stage !== TournamentStage.GROUP_STAGE &&
        m.stage !== TournamentStage.ALL &&
        m.stage !== TournamentStage.THIRD_PLACE
    );
  }, [liveMatches]);

  const thirdPlaceMatch = useMemo(() => {
    return liveMatches.find((m) => m.stage === TournamentStage.THIRD_PLACE);
  }, [liveMatches]);

  return (
    <div
      className="min-h-screen bg-[#050505] overflow-y-auto"
      style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}
    >
      <div
        className="mx-auto"
        style={{
          width: "min(90%, 1400px)",
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
            Bracket
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
              Knockout Stage
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
              32 Teams
            </span>
          </motion.div>
        </header>

        {/* BRACKET HORIZONTAL SCROLL */}
        <div
          className="mt-16 md:mt-24 overflow-x-auto pb-12 scrollbar-none"
          style={{ width: "100%", maskImage: "linear-gradient(to right, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)" }}
        >
          {loading ? (
            <div className="flex gap-16 min-w-max">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-6" style={{ width: "280px" }}>
                  <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                  <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                  <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-16 min-w-max">
              {STAGES.map((stageDef, i) => {
                const stageMatches = knockoutMatches.filter((m) => m.stage === stageDef.id);
                if (stageMatches.length === 0) return null;

                return (
                  <motion.div
                    key={stageDef.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="flex flex-col gap-6"
                    style={{ width: "280px" }}
                  >
                    <h2
                      className="mb-4"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        paddingBottom: "12px",
                      }}
                    >
                      {stageDef.label}
                    </h2>

                    <div className="flex flex-col gap-4">
                      {stageMatches.map((match) => {
                        const homePlaceholder = isPlaceholder(match.home.code);
                        const awayPlaceholder = isPlaceholder(match.away.code);
                        
                        let borderStyle = "1px solid rgba(255,255,255,0.05)";
                        if (match.status === "FINISHED" && match.homeScore !== undefined && match.awayScore !== undefined) {
                          const winnerCode = match.homeScore > match.awayScore ? match.home.code : match.away.code;
                          const branding = getTeamBranding(winnerCode);
                          borderStyle = `1px solid rgba(255,255,255,0.05)`; // default
                          borderStyle = borderStyle.replace('1px solid', '');
                          borderStyle = `1px solid rgba(255,255,255,0.05); border-left: 2px solid color-mix(in srgb, ${branding.primary} 60%, transparent)`;
                        }

                        return (
                          <div key={match.id} className="flex flex-col gap-1">
                            <Link
                              href={`/matches/${match.id}`}
                              className="group flex flex-col focus-visible:outline-none relative"
                              style={{
                                background: "rgba(255,255,255,0.02)",
                                padding: "1rem",
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                                ...(match.status === "FINISHED" && match.homeScore !== undefined && match.awayScore !== undefined
                                  ? {
                                      border: "1px solid rgba(255,255,255,0.05)",
                                      borderLeft: `2px solid color-mix(in srgb, ${getTeamBranding(match.homeScore > match.awayScore ? match.home.code : match.away.code).primary} 60%, transparent)`
                                    }
                                  : { border: "1px solid rgba(255,255,255,0.05)" })
                              }}
                            >
                              <div className="flex flex-col gap-3">
                                {/* Home */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {homePlaceholder ? null : <TeamLogo code={match.home.code} size={20} />}
                                    <span
                                      style={{
                                        fontSize: "0.85rem",
                                        fontWeight: homePlaceholder ? 400 : 600,
                                        fontStyle: homePlaceholder ? "italic" : "normal",
                                        color: homePlaceholder ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                                        letterSpacing: "0.05em",
                                      }}
                                    >
                                      {homePlaceholder ? "TBD" : match.home.name}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      color: "rgba(255,255,255,0.5)",
                                    }}
                                  >
                                    {match.homeScore ?? "-"}
                                  </span>
                                </div>
                                {/* Away */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {awayPlaceholder ? null : <TeamLogo code={match.away.code} size={20} />}
                                    <span
                                      style={{
                                        fontSize: "0.85rem",
                                        fontWeight: awayPlaceholder ? 400 : 600,
                                        fontStyle: awayPlaceholder ? "italic" : "normal",
                                        color: awayPlaceholder ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                                        letterSpacing: "0.05em",
                                      }}
                                    >
                                      {awayPlaceholder ? "TBD" : match.away.name}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      color: "rgba(255,255,255,0.5)",
                                    }}
                                  >
                                    {match.awayScore ?? "-"}
                                  </span>
                                </div>
                              </div>
                              {/* Match Info */}
                              <div
                                className="mt-4 pt-3 flex justify-between"
                                style={{
                                  borderTop: "1px solid rgba(255,255,255,0.05)",
                                  fontSize: "0.6rem",
                                  color: "rgba(255,255,255,0.25)",
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                }}
                              >
                                <span>M{match.matchNumber}</span>
                                <span>{match.status}</span>
                              </div>
                            </Link>
                            {/* Date outside the card */}
                            <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "4px", textTransform: "uppercase" }}>
                              {formatMatchDate(match.date)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* THIRD PLACE MATCH */}
        {!loading && thirdPlaceMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 border-t border-[rgba(255,255,255,0.05)] pt-8 flex flex-col gap-4"
            style={{ width: "280px" }}
          >
            <h2
              className="mb-2"
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
              }}
            >
              Third Place Match
            </h2>
            <div className="flex flex-col gap-1">
              <Link
                href={`/matches/${thirdPlaceMatch.id}`}
                className="group flex flex-col focus-visible:outline-none"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: "1rem",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  ...(thirdPlaceMatch.status === "FINISHED" && thirdPlaceMatch.homeScore !== undefined && thirdPlaceMatch.awayScore !== undefined
                    ? {
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderLeft: `2px solid color-mix(in srgb, ${getTeamBranding(thirdPlaceMatch.homeScore > thirdPlaceMatch.awayScore ? thirdPlaceMatch.home.code : thirdPlaceMatch.away.code).primary} 60%, transparent)`
                      }
                    : { border: "1px solid rgba(255,255,255,0.05)" })
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPlaceholder(thirdPlaceMatch.home.code) ? null : <TeamLogo code={thirdPlaceMatch.home.code} size={20} />}
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: isPlaceholder(thirdPlaceMatch.home.code) ? 400 : 600,
                          fontStyle: isPlaceholder(thirdPlaceMatch.home.code) ? "italic" : "normal",
                          color: isPlaceholder(thirdPlaceMatch.home.code) ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {isPlaceholder(thirdPlaceMatch.home.code) ? "TBD" : thirdPlaceMatch.home.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                      {thirdPlaceMatch.homeScore ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPlaceholder(thirdPlaceMatch.away.code) ? null : <TeamLogo code={thirdPlaceMatch.away.code} size={20} />}
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: isPlaceholder(thirdPlaceMatch.away.code) ? 400 : 600,
                          fontStyle: isPlaceholder(thirdPlaceMatch.away.code) ? "italic" : "normal",
                          color: isPlaceholder(thirdPlaceMatch.away.code) ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {isPlaceholder(thirdPlaceMatch.away.code) ? "TBD" : thirdPlaceMatch.away.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                      {thirdPlaceMatch.awayScore ?? "-"}
                    </span>
                  </div>
                </div>
                <div
                  className="mt-4 pt-3 flex justify-between"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>M{thirdPlaceMatch.matchNumber}</span>
                  <span>{thirdPlaceMatch.status}</span>
                </div>
              </Link>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "4px", textTransform: "uppercase" }}>
                {formatMatchDate(thirdPlaceMatch.date)}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
