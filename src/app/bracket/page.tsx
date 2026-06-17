"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TournamentStage } from "@/lib/data/matches";
import TeamLogo from "@/components/TeamLogo";
import { getTeamBranding } from "@/lib/data/team-branding";
import RevealText from "@/components/RevealText";
import type { MatchWithScore } from "@/app/api/matches/route";

// status arrives as a plain string from the API — keep it loose
type UIMatch = Omit<MatchWithScore, "status"> & { status: string };

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

function isPlaceholder(code: string, name: string) {
  if (!name) return true;
  if (/TBD|Winner|Loser/i.test(name)) return true;
  return !/^[A-Z]{3}$/.test(code) || code === "TBD";
}

export default function BracketPage() {
  const [liveMatches, setLiveMatches] = useState<UIMatch[]>([]);
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

  // Helper for rendering match scores
  const renderScore = (score: number | undefined, status: string) => {
    if (status === "FINISHED" && score !== undefined) {
      return <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{score}</span>;
    }
    return <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.15)" }}>—</span>;
  };

  const renderStatus = (status: string) => {
    if (status === "LIVE") {
      return (
        <span className="flex items-center gap-2" style={{ color: "#ff2a2a" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a] animate-pulse"></span>
          LIVE
        </span>
      );
    }
    if (status === "FINISHED") {
      return <span>FINISHED</span>;
    }
    return null; // Don't show anything for UPCOMING
  };

  return (
    <div
      className="bg-[#050505]"
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-inter, 'Inter', sans-serif)",
      }}
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
        <header style={{ paddingTop: "clamp(4rem, 7vw, 6rem)" }}>

          <RevealText
            text="Bracket"
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
          className="mt-16 md:mt-24 pb-12 scrollbar-none"
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "visible",
            WebkitOverflowScrolling: "touch",
            maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)"
          }}
        >
          {loading ? (
            <div className="flex gap-20 min-w-max">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-6" style={{ width: "360px" }}>
                  <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                  <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                  <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-20 min-w-max">
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
                    style={{ width: "360px" }}
                  >
                    <h2
                      className="mb-4"
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.3em",
                        color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        paddingBottom: "12px",
                      }}
                    >
                      {stageDef.label}
                    </h2>

                    <div className="flex flex-col">
                      {stageMatches.map((match) => {
                        const homePlaceholder = isPlaceholder(match.home.code, match.home.name);
                        const awayPlaceholder = isPlaceholder(match.away.code, match.away.name);
                        
                        const borderStyle = "1px solid rgba(255,255,255,0.04)";
                        let borderLeftStyle = "none";
                        if (match.status === "FINISHED" && match.homeScore !== undefined && match.awayScore !== undefined) {
                          const winnerCode = match.homeScore > match.awayScore ? match.home.code : match.away.code;
                          const branding = getTeamBranding(winnerCode);
                          borderLeftStyle = `2px solid color-mix(in srgb, ${branding.primary} 60%, transparent)`;
                        }

                        const statusNode = renderStatus(match.status);

                        return (
                          <div key={match.id} className="flex flex-col" style={{ marginBottom: "1.5rem" }}>
                            <Link
                              href={`/matches/${match.id}`}
                              className="group flex flex-col focus-visible:outline-none relative"
                              style={{
                                padding: "1.2rem 0",
                                borderBottom: borderStyle,
                                borderLeft: borderLeftStyle,
                                paddingLeft: borderLeftStyle !== 'none' ? '0.8rem' : '0',
                                textDecoration: "none",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <div className="flex justify-between items-center" style={{ marginBottom: "0.75rem" }}>
                                <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
                                  {formatMatchDate(match.date)}
                                </div>
                                {statusNode && (
                                  <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                                    {statusNode}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-3">
                                {/* Home */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {homePlaceholder ? null : <TeamLogo code={match.home.code} size={20} />}
                                    <span
                                      style={
                                        homePlaceholder
                                          ? {
                                              fontSize: "0.85rem",
                                              fontStyle: "italic",
                                              color: "rgba(255,255,255,0.2)",
                                              letterSpacing: "0.1em"
                                            }
                                          : {
                                              fontSize: "0.95rem",
                                              fontWeight: 600,
                                              letterSpacing: "0.03em",
                                              color: "rgba(255,255,255,0.9)",
                                            }
                                      }
                                    >
                                      {homePlaceholder ? "TBD" : match.home.name}
                                    </span>
                                  </div>
                                  {renderScore(match.homeScore, match.status)}
                                </div>
                                {/* Away */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {awayPlaceholder ? null : <TeamLogo code={match.away.code} size={20} />}
                                    <span
                                      style={
                                        awayPlaceholder
                                          ? {
                                              fontSize: "0.85rem",
                                              fontStyle: "italic",
                                              color: "rgba(255,255,255,0.2)",
                                              letterSpacing: "0.1em"
                                            }
                                          : {
                                              fontSize: "0.95rem",
                                              fontWeight: 600,
                                              letterSpacing: "0.03em",
                                              color: "rgba(255,255,255,0.9)",
                                            }
                                      }
                                    >
                                      {awayPlaceholder ? "TBD" : match.away.name}
                                    </span>
                                  </div>
                                  {renderScore(match.awayScore, match.status)}
                                </div>
                              </div>
                            </Link>
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
            style={{ width: "360px" }}
          >
            <h2
              className="mb-2"
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
              }}
            >
              Third Place Match
            </h2>
            <div className="flex flex-col gap-1" style={{ marginBottom: "1.5rem" }}>
              <Link
                href={`/matches/${thirdPlaceMatch.id}`}
                className="group flex flex-col focus-visible:outline-none"
                style={{
                  padding: "1.2rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  ...(thirdPlaceMatch.status === "FINISHED" && thirdPlaceMatch.homeScore !== undefined && thirdPlaceMatch.awayScore !== undefined
                    ? {
                        borderLeft: `2px solid color-mix(in srgb, ${getTeamBranding(thirdPlaceMatch.homeScore > thirdPlaceMatch.awayScore ? thirdPlaceMatch.home.code : thirdPlaceMatch.away.code).primary} 60%, transparent)`,
                        paddingLeft: '0.8rem'
                      }
                    : {})
                }}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
                    {formatMatchDate(thirdPlaceMatch.date)}
                  </div>
                  {renderStatus(thirdPlaceMatch.status) && (
                    <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                      {renderStatus(thirdPlaceMatch.status)}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPlaceholder(thirdPlaceMatch.home.code, thirdPlaceMatch.home.name) ? null : <TeamLogo code={thirdPlaceMatch.home.code} size={20} />}
                      <span
                        style={
                          isPlaceholder(thirdPlaceMatch.home.code, thirdPlaceMatch.home.name)
                            ? {
                                fontSize: "0.85rem",
                                fontStyle: "italic",
                                color: "rgba(255,255,255,0.2)",
                                letterSpacing: "0.1em"
                              }
                            : {
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                                color: "rgba(255,255,255,0.9)",
                              }
                        }
                      >
                        {isPlaceholder(thirdPlaceMatch.home.code, thirdPlaceMatch.home.name) ? "TBD" : thirdPlaceMatch.home.name}
                      </span>
                    </div>
                    {renderScore(thirdPlaceMatch.homeScore, thirdPlaceMatch.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isPlaceholder(thirdPlaceMatch.away.code, thirdPlaceMatch.away.name) ? null : <TeamLogo code={thirdPlaceMatch.away.code} size={20} />}
                      <span
                        style={
                          isPlaceholder(thirdPlaceMatch.away.code, thirdPlaceMatch.away.name)
                            ? {
                                fontSize: "0.85rem",
                                fontStyle: "italic",
                                color: "rgba(255,255,255,0.2)",
                                letterSpacing: "0.1em"
                              }
                            : {
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                                color: "rgba(255,255,255,0.9)",
                              }
                        }
                      >
                        {isPlaceholder(thirdPlaceMatch.away.code, thirdPlaceMatch.away.name) ? "TBD" : thirdPlaceMatch.away.name}
                      </span>
                    </div>
                    {renderScore(thirdPlaceMatch.awayScore, thirdPlaceMatch.status)}
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
