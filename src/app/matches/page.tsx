"use client";

/**
 * matches/page.tsx — Editorial Tournament Archive
 *
 * NOT a dashboard. NOT a sports app.
 * This is a curated World Cup archive — like an exhibition catalogue.
 *
 * Layout:
 *   MATCHES (massive) + "104 Matches · June 11 — July 26"
 *   Search input (thin underline)
 *   Stage filter (text links, not pills)
 *   Date groups (JUNE 12, JUNE 13...) as massive section headings
 *   Match entries as typography compositions (ARGENTINA — SAUDI ARABIA)
 *
 * Visual rules:
 *   - 70-80% viewport width, centered
 *   - No cards, no borders, no shadows, no panels
 *   - Thin 1px separators only
 *   - Massive whitespace between sections
 *   - Full country names, always
 *   - Typography-first hierarchy
 */

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

import {
  TournamentStage,
  MatchStatus,
  STAGE_LABELS_SHORT,
  formatDateEditorial,
} from "@/lib/matches-data";

import {
  filterLiveMatches,
  groupLiveMatchesByDate,
} from "@/hooks/useLiveMatches";
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches";
import type { MatchWithScore } from "@/app/api/matches/route";
import TeamLogo from "@/components/TeamLogo";
import LiveIndicator from "@/components/LiveIndicator";
import RevealText from "@/components/RevealText";
import { getTeamBranding } from "@/lib/data/team-branding";

// ---------------------------------------------------------------------------
// Stage filter — minimal text links, not pills
// ---------------------------------------------------------------------------

const STAGES = [
  TournamentStage.ALL,
  TournamentStage.GROUP_STAGE,
  TournamentStage.ROUND_OF_32,
  TournamentStage.ROUND_OF_16,
  TournamentStage.QUARTER_FINALS,
  TournamentStage.SEMI_FINALS,
  TournamentStage.THIRD_PLACE,
  TournamentStage.FINAL,
] as const;

// ---------------------------------------------------------------------------
// Match Entry — typography composition, not a card
// ---------------------------------------------------------------------------

function MatchEntry({ match, index }: { match: MatchWithScore; index: number }) {
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const [flashHome, setFlashHome] = useState(false);
  const [flashAway, setFlashAway] = useState(false);
  const prevHomeRef = React.useRef(match.homeScore);
  const prevAwayRef = React.useRef(match.awayScore);

  React.useEffect(() => {
    if (match.homeScore !== undefined && match.homeScore > (prevHomeRef.current ?? -1)) {
      if (prevHomeRef.current !== undefined) {
        setFlashHome(true);
        setTimeout(() => setFlashHome(false), 600);
      }
    }
    prevHomeRef.current = match.homeScore;
  }, [match.homeScore]);

  React.useEffect(() => {
    if (match.awayScore !== undefined && match.awayScore > (prevAwayRef.current ?? -1)) {
      if (prevAwayRef.current !== undefined) {
        setFlashAway(true);
        setTimeout(() => setFlashAway(false), 600);
      }
    }
    prevAwayRef.current = match.awayScore;
  }, [match.awayScore]);

  const isFinished = match.status === MatchStatus.FINISHED;
  const isLive = match.status === MatchStatus.LIVE;
  const homeBranding = getTeamBranding(match.home.code);
  const awayBranding = getTeamBranding(match.away.code);

  // Winner/loser opacity
  const homeDimmed =
    isFinished && match.homeScore !== undefined && match.awayScore !== undefined
      ? match.homeScore < match.awayScore
      : false;
  const awayDimmed =
    isFinished && match.homeScore !== undefined && match.awayScore !== undefined
      ? match.awayScore < match.homeScore
      : false;

  const handleEnter = () => {
    if (!linkRef.current) return;
    gsap.to(linkRef.current, { x: 4, duration: 0.35, ease: "power2.out" });
  };
  const handleLeave = () => {
    if (!linkRef.current) return;
    gsap.to(linkRef.current, { x: 0, duration: 0.35, ease: "power2.out" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.03, 0.4),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        ref={linkRef}
        href={`/matches/${match.id}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="block focus-visible:outline-none group"
        style={{
          textDecoration: "none",
          padding: "clamp(1.6rem, 2.5vw, 2.2rem) 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          willChange: "transform",
        }}
        aria-label={`${match.home.name} versus ${match.away.name}`}
      >
        {/* Top line: stage info + venue */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            {isLive && (
              <LiveIndicator minute={match.liveData?.currentMinute} />
            )}

            {/* Stage / Group */}
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: isFinished ? 500 : 400,
                letterSpacing: "0.16em",
                color: isLive 
                  ? "rgba(255,0,0,0.7)" 
                  : isFinished 
                  ? "rgba(255,255,255,0.35)" 
                  : "rgba(255,255,255,0.2)",
                textTransform: "uppercase",
              }}
            >
              {match.group ?? STAGE_LABELS_SHORT[match.stage as TournamentStage]}
            </span>

            {/* Time */}
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 400,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.15)",
              }}
            >
              {match.time}
            </span>
          </div>

          {/* Venue — desktop only */}
          <span
            className="hidden md:block"
            style={{
              fontSize: "0.6rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.15)",
            }}
          >
            {match.stadium}, {match.city}
          </span>
        </div>

        {/* Main line: TEAM — score — TEAM */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Home team */}
          <div
            className="flex-1 flex items-center justify-end gap-3 md:gap-4"
            style={{
              opacity: homeDimmed ? 0.35 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <span
              className="text-right uppercase font-bold"
              style={{
                fontSize: "clamp(0.85rem, 1.8vw, 1.55rem)",
                letterSpacing: "0.08em",
                lineHeight: 1.1,
                color: homeDimmed ? "rgba(255,255,255,0.2)" : (isFinished && match.homeScore !== match.awayScore ? "#ffffff" : "#ffffff"),
              }}
            >
              {match.home.name}
            </span>
            <TeamLogo code={match.home.code} size={homeDimmed ? 28 : (isFinished ? 40 : 36)} />
          </div>

          {/* Score / Time block — center */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{ minWidth: "clamp(50px, 8vw, 90px)" }}
          >
            {isFinished || isLive ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span className="tabular-nums font-bold flex gap-2" style={{
                  fontSize: "clamp(1rem, 2.2vw, 1.8rem)",
                  letterSpacing: "0.06em",
                  color: isLive ? "#ffffff" : "#ffffff",
                }}>
                  <span className={flashHome ? "score-flash" : ""} style={{ "--team-primary": homeBranding.primary } as React.CSSProperties}>
                    {match.homeScore}
                  </span>
                  <span style={{ opacity: 0.3 }}>—</span>
                  <span className={flashAway ? "score-flash" : ""} style={{ "--team-primary": awayBranding.primary } as React.CSSProperties}>
                    {match.awayScore}
                  </span>
                </span>
                {isFinished && (
                  <span style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                    FT
                  </span>
                )}
                {isLive && match.liveData && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#FF0000', letterSpacing: '0.05em' }}>
                    {match.liveData.currentMinute}&apos;
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  vs
                </span>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.2)' }}>
                  {match.time?.split(' ')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div
            className="flex-1 flex items-center justify-start gap-3 md:gap-4"
            style={{
              opacity: awayDimmed ? 0.35 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <TeamLogo code={match.away.code} size={awayDimmed ? 28 : (isFinished ? 40 : 36)} />
            <span
              className="text-left uppercase font-bold"
              style={{
                fontSize: "clamp(0.85rem, 1.8vw, 1.55rem)",
                letterSpacing: "0.08em",
                lineHeight: 1.1,
                color: awayDimmed ? "rgba(255,255,255,0.2)" : (isFinished && match.homeScore !== match.awayScore ? "#ffffff" : "#ffffff"),
              }}
            >
              {match.away.name}
            </span>
          </div>
        </div>


      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MatchesPage() {
  const [activeStage, setActiveStage] = useState<TournamentStage>(TournamentStage.ALL);
  const [searchQuery, setSearchQuery] = useState("");

  const { matches: allMatches } = useRealtimeMatches();

  const totalMatches = allMatches.length;

  const dateRange = useMemo(() => {
    if (!allMatches.length) return "";
    const sorted = [...allMatches].sort((a, b) => a.date.localeCompare(b.date));
    const first = new Date(sorted[0].date + "T00:00:00");
    const last = new Date(sorted[sorted.length - 1].date + "T00:00:00");
    const f = first.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    const l = last.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    return `${f} — ${l}`;
  }, [allMatches]);

  const filtered = useMemo(
    () => filterLiveMatches(allMatches, activeStage, searchQuery),
    [allMatches, activeStage, searchQuery]
  );

  const grouped = useMemo(() => groupLiveMatchesByDate(filtered), [filtered]);

  const liveCount = useMemo(
    () => allMatches.filter((m) => m.status === MatchStatus.LIVE).length,
    [allMatches]
  );

  const handleStageChange = useCallback((stage: TournamentStage) => {
    setActiveStage(stage);
  }, []);

  let runningIndex = 0;

  const liveMatches = useMemo(() => allMatches.filter(m => m.status === MatchStatus.LIVE), [allMatches]);

  return (
    <div
      className="bg-[#050505]"
      style={{ minHeight: '100vh', fontFamily: "var(--font-inter, 'Inter', sans-serif)", paddingTop: '44px' }}
    >
      <style>{`
        @keyframes scoreFlash {
          0% { color: #ffffff; text-shadow: none; }
          30% { color: var(--team-primary); text-shadow: 0 0 15px var(--team-primary); }
          100% { color: #ffffff; text-shadow: none; }
        }
        .score-flash {
          animation: scoreFlash 600ms ease-out;
        }
      `}</style>
      
      {/* ── LIVE MATCH TICKER ────────────────────────────────────────────── */}
      <AnimatePresence>
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden"
            style={{ 
              background: 'rgba(255,0,0,0.04)',
              borderBottom: '1px solid rgba(255,0,0,0.15)'
            }}
          >
            <div className="mx-auto flex items-center gap-8 py-3 px-4 overflow-x-auto whitespace-nowrap" style={{ width: "min(80%, 1200px)", minWidth: "320px" }}>
              <span className="text-[0.6rem] font-bold tracking-widest text-[#FF0000] uppercase shrink-0 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000]"></span>
                </span>
                Live Matches
              </span>
              {liveMatches.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm shrink-0">
                  <span className="font-semibold text-white">{m.home.name}</span>
                  <span className="font-bold text-[#FF0000] bg-black/50 px-2 py-0.5 rounded tabular-nums">
                    {m.homeScore} - {m.awayScore}
                  </span>
                  <span className="font-semibold text-white">{m.away.name}</span>
                  <span className="text-[0.65rem] text-white/50">{m.liveData?.currentMinute}&apos;</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="mx-auto"
        style={{
          width: "min(80%, 1200px)",
          minWidth: "320px",
          paddingBottom: "8rem",
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
            EDITORIAL HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <header style={{ paddingTop: "clamp(4rem, 7vw, 6rem)" }}>

          {/* MATCHES — the title */}
          <RevealText
            text="Matches"
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

          {/* Subtitle — count + date range */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span
              style={{
                fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              {totalMatches} Matches
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
              {dateRange}
            </span>
            {liveCount > 0 && (
              <>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                <span
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "#FF0000",
                  }}
                >
                  <span className="relative flex h-[4px] w-[4px]">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: "#FF0000" }}
                    />
                    <span className="relative inline-flex rounded-full h-[4px] w-[4px]" style={{ background: "#FF0000" }} />
                  </span>
                  {liveCount} Live
                </span>
              </>
            )}
          </motion.div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            CONTROLS — search + filters
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            marginTop: "clamp(2rem, 4vw, 3.5rem)",
            paddingBottom: "clamp(1rem, 2vw, 1.5rem)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Search — thin underline */}
          <div className="flex items-center gap-3 mb-6" style={{ maxWidth: "420px" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ opacity: 0.25, flexShrink: 0 }}>
              <circle cx="5.5" cy="5.5" r="4.5" stroke="white" strokeWidth="1" />
              <path d="M9.5 9.5L13 13" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, city, stadium..."
              spellCheck={false}
              autoComplete="off"
              aria-label="Search matches"
              className="w-full bg-transparent focus:outline-none"
              style={{
                fontSize: "0.78rem",
                fontWeight: 300,
                letterSpacing: "0.08em",
                color: "#ffffff",
                caretColor: "#00D1FF",
                paddingBottom: "6px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            />
            {searchQuery && (
              <span
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.2)",
                  whiteSpace: "nowrap",
                }}
              >
                {filtered.length}
              </span>
            )}
          </div>

          {/* Stage filter — text links, not pills */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2" role="tablist" aria-label="Tournament stage filter">
            {STAGES.map((stage) => {
              const isActive = stage === activeStage;
              return (
                <button
                  key={stage}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleStageChange(stage)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    fontSize: "0.68rem",
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.2)",
                    borderBottom: isActive ? "1px solid rgba(255,255,255,0.5)" : "1px solid transparent",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.2)";
                  }}
                >
                  {STAGE_LABELS_SHORT[stage]}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            MATCH LIST — grouped by date
        ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
              style={{ paddingTop: "clamp(4rem, 10vw, 8rem)" }}
            >
              <span
                style={{
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  opacity: 0.04,
                  lineHeight: 1,
                }}
              >
                0
              </span>
              <p
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.2)",
                  textTransform: "uppercase",
                  marginTop: "1.5rem",
                }}
              >
                No matches found
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    marginTop: "1.5rem",
                    fontSize: "0.6rem",
                    letterSpacing: "0.14em",
                    color: "rgba(0,209,255,0.5)",
                    textTransform: "uppercase",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`${activeStage}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {Array.from(grouped.entries()).map(([date, dateMatches]) => {
                const gi = runningIndex;
                runningIndex += dateMatches.length;
                const { month, day } = formatDateEditorial(date);

                return (
                  <section
                    key={date}
                    aria-label={`Matches on ${month} ${day}`}
                    style={{ marginTop: "clamp(4rem, 8vw, 7rem)" }}
                  >
                    {/* ── MASSIVE DATE HEADER ──────────────── */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: Math.min(gi * 0.03, 0.3),
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{
                        marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
                        paddingBottom: "clamp(0.8rem, 1.5vw, 1.2rem)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "clamp(3.5rem, 8vw, 7rem)",
                          fontWeight: 900,
                          letterSpacing: "0.02em",
                          textTransform: "uppercase",
                          color: "#ffffff",
                          lineHeight: 0.9,
                          opacity: 1,
                        }}
                      >
                        <span style={{ display: 'block', fontSize: 'clamp(0.6rem, 1vw, 0.75rem)', letterSpacing: '0.3em', fontWeight: 400, opacity: 0.3, marginBottom: '0.5rem' }}>
                          {month.toUpperCase()}
                        </span>
                        {day}
                      </h2>
                    </motion.div>

                    {/* ── MATCH ENTRIES ──────────────────────── */}
                    {dateMatches.map((match, i) => (
                      <MatchEntry key={match.id} match={match} index={gi + i} />
                    ))}
                  </section>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════
            FOOTER — subtle, editorial
        ═══════════════════════════════════════════════════════════════════ */}
        <footer
          style={{
            marginTop: "clamp(4rem, 8vw, 6rem)",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              fontSize: "0.55rem",
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.1)",
              textTransform: "uppercase",
            }}
          >
            FIFA World Cup 2026 · {totalMatches} Matches · {dateRange}
          </p>
        </footer>
      </div>
    </div>
  );
}
