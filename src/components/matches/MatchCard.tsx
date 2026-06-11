"use client";

/**
 * MatchCard.tsx
 *
 * Premium horizontal match card for the Tournament Control Center.
 *
 * Layout:
 *   [Group/Stage tag]  [Flag Team] [Score/Time] [Team Flag]  [Stadium · City]  [Status]
 *
 * States:
 *   - UPCOMING: shows kick-off time
 *   - LIVE: pulsing dot + current minute + live score
 *   - FINISHED: final score, dimmed time
 *
 * Architecture:
 *   - Accepts full Match object — all future fields (events, statistics,
 *     lineup, liveData) are already typed and ready to wire to a detail page.
 *   - onClick → future: navigate to /matches/[id] for full match detail view
 */

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Match, MatchStatus, TournamentStage, STAGE_LABELS_SHORT } from "@/lib/matches-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stagePill(stage: TournamentStage, group?: string): string {
  if (stage === TournamentStage.GROUP_STAGE && group) return group;
  return STAGE_LABELS_SHORT[stage];
}

// ---------------------------------------------------------------------------
// Live pulse dot
// ---------------------------------------------------------------------------
function LiveDot() {
  return (
    <span className="relative inline-flex items-center gap-1.5">
      <span className="relative flex h-[6px] w-[6px]">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: "#00D1FF" }}
        />
        <span
          className="relative inline-flex rounded-full h-[6px] w-[6px]"
          style={{ background: "#00D1FF" }}
        />
      </span>
      <span
        style={{
          color: "#00D1FF",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
        }}
      >
        LIVE
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Score / Time block
// ---------------------------------------------------------------------------
function ScoreBlock({ match }: { match: Match }) {
  if (match.status === MatchStatus.LIVE) {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[80px]">
        <div
          className="flex items-center gap-2 font-bold tabular-nums"
          style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "0.04em" }}
        >
          <span>{match.homeScore ?? 0}</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8em" }}>—</span>
          <span>{match.awayScore ?? 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LiveDot />
          {match.liveData && (
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
              {match.liveData.currentMinute}&apos;
            </span>
          )}
        </div>
      </div>
    );
  }

  if (match.status === MatchStatus.FINISHED) {
    return (
      <div className="flex flex-col items-center gap-1 min-w-[80px]">
        <div
          className="flex items-center gap-2 font-bold tabular-nums"
          style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "0.04em" }}
        >
          <span>{match.homeScore}</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8em" }}>—</span>
          <span>{match.awayScore}</span>
        </div>
        <span
          style={{
            fontSize: "0.58rem",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 500,
          }}
        >
          FT
        </span>
      </div>
    );
  }

  // UPCOMING
  return (
    <div className="flex flex-col items-center gap-1 min-w-[80px]">
      <span
        className="font-bold"
        style={{ fontSize: "clamp(1rem, 1.8vw, 1.5rem)", letterSpacing: "0.06em" }}
      >
        {match.time.split(" ")[0]}
      </span>
      <span
        style={{
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 500,
        }}
      >
        {match.time.split(" ")[1] ?? "ET"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team block
// ---------------------------------------------------------------------------
function TeamBlock({
  team,
  align,
  won,
  status,
}: {
  team: Match["home"];
  align: "left" | "right";
  won?: boolean;
  status: MatchStatus;
}) {
  const isFinished = status === MatchStatus.FINISHED;
  const opacity = isFinished && won === false ? 0.38 : 1;

  return (
    <div
      className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}
      style={{ opacity }}
    >
      {/* Flag */}
      <span
        className="leading-none"
        style={{ fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", lineHeight: 1 }}
        role="img"
        aria-label={team.name}
      >
        {team.flag}
      </span>

      {/* Name + Code */}
      <div className={`flex flex-col ${align === "right" ? "items-end" : ""}`}>
        <span
          className="font-bold uppercase"
          style={{
            fontSize: "clamp(0.7rem, 1.2vw, 1rem)",
            letterSpacing: "0.14em",
            lineHeight: 1.1,
          }}
        >
          {team.code}
        </span>
        <span
          className="hidden md:block"
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.35)",
            fontWeight: 400,
          }}
        >
          {team.name}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MatchCard
// ---------------------------------------------------------------------------

interface MatchCardProps {
  match: Match;
  index: number;
}

export default function MatchCard({ match, index }: MatchCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // Determine winner for opacity treatment
  const homeWon =
    match.status === MatchStatus.FINISHED &&
    match.homeScore !== undefined &&
    match.awayScore !== undefined
      ? match.homeScore > match.awayScore
        ? true
        : match.homeScore < match.awayScore
        ? false
        : undefined // draw
      : undefined;

  const awayWon = homeWon === true ? false : homeWon === false ? true : undefined;

  const handleEnter = () => {
    if (!cardRef.current || !lineRef.current) return;
    gsap.to(cardRef.current, {
      backgroundColor: "rgba(255,255,255,0.03)",
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(lineRef.current, {
      scaleX: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    if (!cardRef.current || !lineRef.current) return;
    gsap.to(cardRef.current, {
      backgroundColor: "rgba(255,255,255,0)",
      duration: 0.35,
      ease: "power2.out",
    });
    gsap.to(lineRef.current, {
      scaleX: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.04, 0.6),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative"
    >
      {/* Hover accent line — left edge */}
      <div
        ref={lineRef}
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{
          background: match.status === MatchStatus.LIVE
            ? "#00D1FF"
            : "rgba(255,255,255,0.4)",
          transform: "scaleX(0)",
          transformOrigin: "left center",
        }}
        aria-hidden="true"
      />

      <Link
        ref={cardRef}
        href={`/matches/${match.id}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="group relative block px-4 md:px-6 py-4 md:py-5 focus-visible:outline-none"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "0",
          transition: "background-color 0.3s ease",
        }}
        aria-label={`${match.home.name} vs ${match.away.name}`}
      >
        {/* LIVE card: subtle left accent */}
        {match.status === MatchStatus.LIVE && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, rgba(0,209,255,0.04) 0%, transparent 40%)",
            }}
            aria-hidden="true"
          />
        )}

        <div className="relative flex items-center gap-4 md:gap-6">

          {/* ── Stage / Group pill ────────────────────────────── */}
          <div className="hidden lg:flex items-center" style={{ minWidth: "100px" }}>
            <span
              style={{
                fontSize: "0.58rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                color:
                  match.status === MatchStatus.LIVE
                    ? "#00D1FF"
                    : "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {stagePill(match.stage, match.group)}
            </span>
          </div>

          {/* ── Home Team ─────────────────────────────────────── */}
          <div className="flex-1 flex justify-end">
            <TeamBlock
              team={match.home}
              align="right"
              won={homeWon}
              status={match.status}
            />
          </div>

          {/* ── Score / Time ──────────────────────────────────── */}
          <ScoreBlock match={match} />

          {/* ── Away Team ─────────────────────────────────────── */}
          <div className="flex-1 flex justify-start">
            <TeamBlock
              team={match.away}
              align="left"
              won={awayWon}
              status={match.status}
            />
          </div>

          {/* ── Venue ─────────────────────────────────────────── */}
          <div
            className="hidden xl:flex flex-col items-end"
            style={{ minWidth: "160px" }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              {match.stadium}
            </span>
            <span
              style={{
                fontSize: "0.58rem",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              {match.city}
            </span>
          </div>

          {/* ── Match number ──────────────────────────────────── */}
          <div
            className="hidden md:block"
            style={{ minWidth: "28px", textAlign: "right" }}
          >
            <span
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.15)",
                fontWeight: 400,
              }}
            >
              #{match.matchNumber}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
