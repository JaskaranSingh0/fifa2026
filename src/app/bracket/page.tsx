"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TournamentStage } from "@/lib/data/matches";
import TeamLogo from "@/components/TeamLogo";
import { getTeamBranding } from "@/lib/data/team-branding";
import RevealText from "@/components/RevealText";
import type { MatchWithScore } from "@/app/api/matches/route";
import MirroredBracket from "@/components/bracket/MirroredBracket";
import {
  buildBracketTree,
  buildGroupSlotResolver,
  isRealTeam,
  slotLabel,
  type BracketMatch,
  type LiveGroupStanding,
} from "@/lib/bracket";

// status arrives as a plain string from the API — keep it loose
type UIMatch = Omit<MatchWithScore, "status"> & { status: string };

const STAGES = [
  { id: TournamentStage.ROUND_OF_32, label: "Round of 32" },
  { id: TournamentStage.ROUND_OF_16, label: "Round of 16" },
  { id: TournamentStage.QUARTER_FINALS, label: "Quarter-Finals" },
  { id: TournamentStage.SEMI_FINALS, label: "Semi-Finals" },
  { id: TournamentStage.FINAL, label: "Final" },
];

const SHORT: Record<string, string> = {
  [TournamentStage.ROUND_OF_32]: "R32",
  [TournamentStage.ROUND_OF_16]: "R16",
  [TournamentStage.QUARTER_FINALS]: "QF",
  [TournamentStage.SEMI_FINALS]: "SF",
  [TournamentStage.FINAL]: "FINAL",
};

// The bracket narrows toward the Final — each round's grid is capped narrower
// than the one above it, so the columns visibly converge into one trophy.
const FUNNEL_MAX: Record<string, number> = {
  [TournamentStage.ROUND_OF_32]: 1120,
  [TournamentStage.ROUND_OF_16]: 860,
  [TournamentStage.QUARTER_FINALS]: 600,
  [TournamentStage.SEMI_FINALS]: 600,
  [TournamentStage.FINAL]: 340,
};

function formatMatchDate(isoString: string) {
  const parts = isoString.split("-");
  if (parts.length >= 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  }
  return isoString;
}

function isPlaceholder(code: string, name: string) {
  if (!name) return true;
  if (/TBD|Winner|Loser/i.test(name)) return true;
  return !/^[A-Z]{3}$/.test(code) || code === "TBD";
}

// ---------------------------------------------------------------------------
// Match card — one consistent unit used across every round
// ---------------------------------------------------------------------------
function BracketMatchCard({ match, resolver, featured = false }: {
  match: UIMatch;
  resolver: (code: string) => { code: string; name: string } | null;
  featured?: boolean;
}) {
  const homeResolved = isRealTeam(match.home.code) ? match.home : resolver(match.home.code);
  const awayResolved = isRealTeam(match.away.code) ? match.away : resolver(match.away.code);
  const finished =
    match.status === "FINISHED" && match.homeScore !== undefined && match.awayScore !== undefined;
  const live = match.status === "LIVE";
  const homeWon = finished && (match.homeScore as number) > (match.awayScore as number);
  const awayWon = finished && (match.awayScore as number) > (match.homeScore as number);
  const winnerCode = homeWon ? match.home.code : awayWon ? match.away.code : null;
  const accent = winnerCode && isRealTeam(winnerCode) ? getTeamBranding(winnerCode).primary : null;
  const idleBorder = accent ?? "rgba(255,255,255,0.08)";

  const teamRow = (side: "home" | "away") => {
    const t = match[side];
    const resolved = side === "home" ? homeResolved : awayResolved;
    const won = side === "home" ? homeWon : awayWon;
    const score = side === "home" ? match.homeScore : match.awayScore;
    return (
      <div className="flex items-center justify-between" style={{ gap: "0.75rem" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          {resolved ? (
            <TeamLogo code={resolved.code} size={featured ? 24 : 20} />
          ) : (
            <span
              style={{
                width: featured ? 24 : 20,
                height: featured ? 24 : 20,
                borderRadius: "50%",
                border: "1px dashed rgba(255,255,255,0.18)",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
          )}
          <span
            className="uppercase truncate"
            style={{
              fontSize: featured ? "1rem" : "0.85rem",
              fontWeight: won ? 800 : 600,
              letterSpacing: "0.03em",
              fontStyle: resolved ? "normal" : "italic",
              color: resolved ? (won ? "#ffffff" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.3)",
            }}
          >
            {resolved ? resolved.name : slotLabel(t.code)}
          </span>
        </div>
        <span
          className="tabular-nums"
          style={{
            fontSize: featured ? "1.1rem" : "0.9rem",
            fontWeight: won ? 800 : 600,
            flexShrink: 0,
            color: finished || live ? (won ? "#ffffff" : "rgba(255,255,255,0.6)") : "rgba(255,255,255,0.22)",
          }}
        >
          {finished || live ? score ?? 0 : "—"}
        </span>
      </div>
    );
  };

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block focus-visible:outline-none"
      style={{ textDecoration: "none", width: 260, maxWidth: "100%" }}
      aria-label={`${homeResolved ? homeResolved.name : slotLabel(match.home.code)} versus ${awayResolved ? awayResolved.name : slotLabel(match.away.code)}`}
    >
      <div
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = idleBorder;
          e.currentTarget.style.transform = "translateY(0)";
        }}
        style={{
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: accent ? `3px solid ${accent}` : "1px solid rgba(255,255,255,0.08)",
          background: featured ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.02)",
          boxShadow: featured ? `0 0 50px ${(accent ?? "#00D1FF")}1f` : "none",
          padding: featured ? "1.1rem 1.2rem" : "0.85rem 1rem",
          transition: "border-color 0.3s ease, transform 0.3s ease",
        }}
      >
        {/* Top row: date + status */}
        <div className="flex items-center justify-between" style={{ marginBottom: featured ? "0.9rem" : "0.7rem" }}>
          <span className="uppercase" style={{ fontSize: "0.55rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)" }}>
            {formatMatchDate(match.date)}
          </span>
          {live ? (
            <span className="flex items-center gap-1.5" style={{ fontSize: "0.55rem", letterSpacing: "0.12em", color: "#FF3B3B", fontWeight: 700 }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF0000]" />
              </span>
              LIVE{match.liveData?.currentMinute ? ` ${match.liveData.currentMinute}'` : ""}
            </span>
          ) : finished ? (
            <span style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>FT</span>
          ) : null}
        </div>

        {/* Teams */}
        <div className="flex flex-col" style={{ gap: featured ? "0.7rem" : "0.55rem" }}>
          {teamRow("home")}
          {teamRow("away")}
        </div>
      </div>
    </Link>
  );
}

export default function BracketPage() {
  const [liveMatches, setLiveMatches] = useState<UIMatch[]>([]);
  const [groups, setGroups] = useState<LiveGroupStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [mRes, gRes] = await Promise.all([fetch("/api/matches"), fetch("/api/groups")]);
        const mData = await mRes.json();
        const gData = await gRes.json();
        if (!alive) return;
        setLiveMatches(mData.matches || []);
        setGroups(gData.groups || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    // Poll so background-synced standings + knockout results appear without a refresh.
    const id = setInterval(load, 20000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Resolve group-position slots ("1A"/"2B"…) into qualified teams, and build the
  // feeder tree for the mirrored desktop bracket.
  const resolver = useMemo(() => buildGroupSlotResolver(groups), [groups]);
  const bracketTree = useMemo(
    () => buildBracketTree(liveMatches as unknown as BracketMatch[]),
    [liveMatches]
  );

  const knockoutMatches = useMemo(
    () =>
      liveMatches.filter(
        (m) =>
          m.stage !== TournamentStage.GROUP_STAGE &&
          m.stage !== TournamentStage.ALL &&
          m.stage !== TournamentStage.THIRD_PLACE
      ),
    [liveMatches]
  );

  const thirdPlaceMatch = useMemo(
    () => liveMatches.find((m) => m.stage === TournamentStage.THIRD_PLACE),
    [liveMatches]
  );

  // ── Spotlight state — drives the cinematic hero ──────────────────────
  const finalMatch = useMemo(
    () => liveMatches.find((m) => m.stage === TournamentStage.FINAL),
    [liveMatches]
  );
  const champion = useMemo(() => {
    if (!finalMatch || finalMatch.status !== "FINISHED") return null;
    const h = finalMatch.homeScore, a = finalMatch.awayScore;
    if (h === undefined || a === undefined || h === a) return null;
    return {
      team: h > a ? finalMatch.home : finalMatch.away,
      loser: h > a ? finalMatch.away : finalMatch.home,
      score: `${Math.max(h, a)}–${Math.min(h, a)}`,
    };
  }, [finalMatch]);
  const finalReady = useMemo(() => {
    if (!finalMatch) return false;
    return (
      !isPlaceholder(finalMatch.home.code, finalMatch.home.name) &&
      !isPlaceholder(finalMatch.away.code, finalMatch.away.name)
    );
  }, [finalMatch]);
  // Furthest round that has real teams or a result — lights up the progress rail.
  const reachedIndex = useMemo(() => {
    let idx = 0;
    STAGES.forEach((s, i) => {
      const ms = liveMatches.filter((m) => m.stage === s.id);
      const active = ms.some(
        (m) =>
          m.status === "FINISHED" ||
          (!isPlaceholder(m.home.code, m.home.name) && !isPlaceholder(m.away.code, m.away.name))
      );
      if (active) idx = Math.max(idx, i);
    });
    return idx;
  }, [liveMatches]);
  const heroAccent = champion ? getTeamBranding(champion.team.code).primary : "#00D1FF";

  return (
    <div className="bg-[#050505]" style={{ minHeight: "100vh", fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
      <div className="mx-auto" style={{ width: "min(92%, 1240px)", minWidth: "320px", paddingBottom: "8rem" }}>
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
            <span style={{ fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)", fontWeight: 300, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>
              Knockout Stage
            </span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span style={{ fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)", fontWeight: 300, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
              32 Teams
            </span>
          </motion.div>
        </header>

        {/* ── SPOTLIGHT HERO + ROUND RAIL ──────────────────────────────── */}
        {!loading && (
          <div className="mt-10 md:mt-14">
            <div className="relative flex flex-col items-center text-center" style={{ padding: "clamp(2rem,5vw,3.5rem) 0" }}>
              <div aria-hidden className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div style={{ width: "min(70vw,640px)", height: "60%", borderRadius: "50%", background: `radial-gradient(ellipse, ${heroAccent}22 0%, transparent 70%)`, filter: "blur(50px)" }} />
              </div>

              {champion ? (
                <div className="relative flex flex-col items-center">
                  <span className="uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.4em", color: heroAccent, fontWeight: 600 }}>World Champions</span>
                  <div className="my-6 relative flex items-center justify-center">
                    <div aria-hidden style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${heroAccent}55 0%, transparent 70%)`, filter: "blur(8px)" }} />
                    <span style={{ position: "relative", borderRadius: "50%", boxShadow: `0 0 0 1px ${heroAccent}66, 0 12px 40px rgba(0,0,0,0.6)` }}>
                      <TeamLogo code={champion.team.code} size={84} />
                    </span>
                  </div>
                  <h2 className="uppercase" style={{ fontSize: "clamp(2.5rem,7vw,5.5rem)", fontWeight: 900, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.9, textShadow: `0 0 60px ${heroAccent}55` }}>
                    {champion.team.name}
                  </h2>
                  <span className="uppercase" style={{ marginTop: "1rem", fontSize: "0.75rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>
                    def. {champion.loser.name} · {champion.score}
                  </span>
                </div>
              ) : finalReady && finalMatch ? (
                <div className="relative flex flex-col items-center">
                  <span className="uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.4em", color: heroAccent, fontWeight: 600 }}>The Final · MetLife Stadium</span>
                  <div className="mt-7 flex items-center gap-6 md:gap-12">
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo code={finalMatch.home.code} size={64} />
                      <span className="uppercase" style={{ fontSize: "clamp(1.1rem,3vw,2.2rem)", fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>{finalMatch.home.name}</span>
                    </div>
                    <span style={{ fontSize: "clamp(1rem,2vw,1.5rem)", color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>vs</span>
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo code={finalMatch.away.code} size={64} />
                      <span className="uppercase" style={{ fontSize: "clamp(1.1rem,3vw,2.2rem)", fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>{finalMatch.away.name}</span>
                    </div>
                  </div>
                  <span className="uppercase" style={{ marginTop: "1.25rem", fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>
                    {formatMatchDate(finalMatch.date)} · New York / New Jersey
                  </span>
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  <span className="uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.4em", color: heroAccent, fontWeight: 600 }}>The Road to the Final</span>
                  <h2 className="uppercase" style={{ marginTop: "1rem", fontSize: "clamp(2rem,6vw,4.5rem)", fontWeight: 900, letterSpacing: "0.02em", color: "#fff", lineHeight: 0.95, textShadow: `0 0 60px ${heroAccent}33` }}>
                    One Trophy
                  </h2>
                  <span className="uppercase" style={{ marginTop: "1rem", fontSize: "0.72rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>
                    MetLife Stadium · New York / New Jersey · July 19, 2026
                  </span>
                </div>
              )}
            </div>

            {/* Round-progress rail — mobile funnel only; the desktop bracket has its own column headers */}
            <div className="md:hidden flex items-center gap-3" style={{ maxWidth: "640px", margin: "0 auto" }}>
              {STAGES.map((s, i) => (
                <React.Fragment key={s.id}>
                  {i > 0 && (
                    <span className="flex-1" style={{ height: "1px", background: i <= reachedIndex ? `${heroAccent}99` : "rgba(255,255,255,0.08)", transition: "background 0.4s ease" }} />
                  )}
                  <span className="uppercase" style={{ fontSize: "0.55rem", letterSpacing: "0.16em", whiteSpace: "nowrap", fontWeight: i === reachedIndex ? 700 : 500, color: i <= reachedIndex ? "#fff" : "rgba(255,255,255,0.3)" }}>
                    {SHORT[s.id]}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ── VERTICAL BRACKET FUNNEL ──────────────────────────────────── */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse" style={{ width: 260, height: 92, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop — classic mirrored connector bracket, scaled to fit (centered
                in the page container, no horizontal scroll) */}
            {bracketTree && (
              <div className="hidden md:block mt-8">
                <MirroredBracket tree={bracketTree} resolver={resolver} />
              </div>
            )}
            {/* Mobile — vertical funnel */}
            <div className="md:hidden mt-12 flex flex-col items-center">
            {STAGES.map((stageDef, i) => {
              const ms = knockoutMatches
                .filter((m) => m.stage === stageDef.id)
                .sort((a, b) => (a.date !== b.date ? a.date.localeCompare(b.date) : (a.matchNumber ?? 0) - (b.matchNumber ?? 0)));
              if (ms.length === 0) return null;
              const isFinal = stageDef.id === TournamentStage.FINAL;

              return (
                <motion.section
                  key={stageDef.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* connector from the round above */}
                  {i > 0 && (
                    <div aria-hidden style={{ width: 1, height: "clamp(28px,5vw,48px)", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.14))" }} />
                  )}

                  <h2
                    className="uppercase text-center"
                    style={{
                      fontSize: isFinal ? "clamp(1rem,2.2vw,1.5rem)" : "0.7rem",
                      fontWeight: isFinal ? 800 : 700,
                      letterSpacing: "0.3em",
                      color: isFinal ? "#ffffff" : "rgba(255,255,255,0.5)",
                      margin: "clamp(1.5rem,3vw,2.5rem) 0 clamp(1.25rem,2.5vw,1.75rem)",
                    }}
                  >
                    {stageDef.label}
                  </h2>

                  <div style={{ width: "100%", maxWidth: FUNNEL_MAX[stageDef.id], display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
                    {ms.map((m) => (
                      <BracketMatchCard key={m.id} match={m} resolver={resolver} featured={isFinal} />
                    ))}
                  </div>
                </motion.section>
              );
            })}

            {/* Third-place play-off — a quiet coda below the Final */}
            {thirdPlaceMatch && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center w-full"
              >
                <div aria-hidden style={{ width: 1, height: "clamp(28px,5vw,48px)", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.14))" }} />
                <h2
                  className="uppercase text-center"
                  style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.3em", color: "rgba(255,255,255,0.38)", margin: "clamp(1.5rem,3vw,2.5rem) 0 clamp(1.25rem,2.5vw,1.75rem)" }}
                >
                  Third Place
                </h2>
                <div style={{ width: "100%", maxWidth: 340, display: "flex", justifyContent: "center" }}>
                  <BracketMatchCard match={thirdPlaceMatch} resolver={resolver} />
                </div>
              </motion.section>
            )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
