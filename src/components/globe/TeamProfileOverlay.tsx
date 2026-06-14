"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  TeamProfile,
  groupSquadByPosition,
} from "@/lib/data/team-profiles";
import { getTeamBranding } from "@/lib/data/team-branding";
import TeamLogo from "@/components/TeamLogo";

interface Props {
  profile: TeamProfile;
  teamName: string;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Editorial team overlay — NOT a dashboard, NOT cards, NOT tabs.
// Think exhibition catalogue. Think architecture monograph.
// GSAP drives entrance animations. Framer Motion handles mount/unmount.
// ---------------------------------------------------------------------------

function formatMatchDate(isoString: string) {
  // ISO: 2026-06-11
  const parts = isoString.split("-");
  if (parts.length >= 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  }
  return isoString;
}

export default function TeamProfileOverlay({ profile, teamName, onBack }: Props) {
  const squadGroups = groupSquadByPosition(profile.squad);
  const contentRef = useRef<HTMLDivElement>(null);
  const branding = getTeamBranding(profile.code);

  const [groupData, setGroupData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [gRes, mRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/matches')
        ]);
        const gData = await gRes.json();
        const mData = await mRes.json();

        // Find group
        const myGroup = (gData.groups || []).find((g: any) => 
          g.teams.some((t: any) => t.code === profile.code)
        );
        setGroupData(myGroup);

        // Find matches
        const myMatches = (mData.matches || []).filter((m: any) => 
          m.home.code === profile.code || m.away.code === profile.code
        ).slice(0, 6);
        setMatches(myMatches);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [profile.code]);

  // ── GSAP staggered entrance ──────────────────────────────────────────
  useEffect(() => {
    if (!contentRef.current) return;

    // We use a small timeout to let dynamic data render before animating
    const timer = setTimeout(() => {
      const sections = contentRef.current?.querySelectorAll("[data-animate]");
      if (sections) {
        gsap.set(sections, { opacity: 0, y: 20 });
        gsap.to(sections, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.2,
        });
      }

      // Separators: draw from left
      const separators = contentRef.current?.querySelectorAll("[data-separator]");
      if (separators) {
        gsap.set(separators, { scaleX: 0 });
        gsap.to(separators, {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.15,
          delay: 0.4,
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [groupData, matches]); // Re-run animation setup when data arrives

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background: `radial-gradient(circle at top, color-mix(in srgb, var(--team-primary) 8%, transparent) 0%, #050505 100%)`,
        fontFamily: "var(--font-inter, 'Inter', sans-serif)",
        "--team-primary": branding.primary,
        "--team-secondary": branding.secondary,
      } as React.CSSProperties}
    >
      <div
        ref={contentRef}
        className="mx-auto"
        style={{
          width: "min(72%, 960px)",
          minWidth: "320px",
          paddingBottom: "8rem",
        }}
      >
        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div data-animate style={{ paddingTop: "clamp(2.5rem, 6vw, 5rem)" }}>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 group"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.65rem",
              fontWeight: 400,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              transition: "color 0.25s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            ← Back to Globe
          </button>
        </div>

        {/* ── LOGO & FLAG ───────────────────────────────────────────────── */}
        <div
          data-animate
          className="flex items-center gap-4"
          style={{ marginTop: "clamp(2rem, 5vw, 4rem)" }}
        >
          {profile.logo && (
            <img
              src={profile.logo}
              alt={`${teamName} logo`}
              style={{
                width: "clamp(2.5rem, 5vw, 4rem)",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
          <span style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            {profile.flag}
          </span>
        </div>

        {/* ── NATION NAME ───────────────────────────────────────────────── */}
        <h1
          data-animate
          style={{
            fontSize: "clamp(3.5rem, 10vw, 9rem)",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#ffffff",
            lineHeight: 0.9,
            marginTop: "clamp(1rem, 2vw, 2rem)",
            marginBottom: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          {teamName}
        </h1>

        {/* ── DESCRIPTION ───────────────────────────────────────────────── */}
        <p
          data-animate
          style={{
            fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.55)",
            maxWidth: "640px",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          {profile.description}
        </p>

        {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
        <div
          data-separator
          style={{
            height: "1px",
            background: "color-mix(in srgb, var(--team-primary) 40%, rgba(255,255,255,0.06))",
            transformOrigin: "left",
            marginBottom: "clamp(2.5rem, 5vw, 4rem)",
          }}
        />

        {/* ── STATS — editorial, not cards ───────────────────────────────── */}
        <div
          data-animate
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          style={{
            gap: "clamp(2rem, 4vw, 3.5rem)",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        >
          {[
            { label: "FIFA Ranking", value: `#${profile.fifaRanking}`, isAccent: true },
            { label: "Coach", value: profile.coach },
            { label: "Captain", value: profile.captain },
            { label: "World Cup Titles", value: profile.titles.toString() },
            { label: "Appearances", value: profile.worldCupAppearances.toString() },
            { label: "Best Finish", value: profile.bestFinish },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 400,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: "0.6rem",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "clamp(0.85rem, 1.3vw, 1.05rem)",
                  fontWeight: 500,
                  color: stat.isAccent ? "var(--team-primary)" : "#ffffff",
                  lineHeight: 1.3,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
        <div
          data-separator
          style={{
            height: "1px",
            background: "color-mix(in srgb, var(--team-primary) 40%, rgba(255,255,255,0.06))",
            transformOrigin: "left",
            marginBottom: "clamp(3rem, 6vw, 5rem)",
          }}
        />

        {/* ── GROUP STANDING ────────────────────────────────────────────── */}
        {groupData && (
          <>
            <section
              data-animate
              style={{ marginBottom: "clamp(3rem, 5vw, 4.5rem)" }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--team-primary)",
                  lineHeight: 1,
                  marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
                  opacity: 0.85,
                }}
              >
                GROUP {groupData.letter}
              </h2>
              
              <ul className="flex flex-col gap-0 relative">
                {groupData.teams.map((teamData: any, j: number) => {
                  const isCurrentTeam = teamData.code === profile.code;
                  return (
                    <li
                      key={teamData.code}
                      className="group flex items-center justify-between"
                      style={{
                        padding: "0.75rem 0",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                      }}
                    >
                      <div className="flex items-center w-full">
                        <div style={{ width: "20px", fontSize: "0.7rem", fontWeight: 300, color: "rgba(255,255,255,0.2)" }}>
                          {j + 1}
                        </div>
                        <div className="flex justify-center" style={{ width: "28px", marginRight: "12px" }}>
                          <TeamLogo code={teamData.code} size={20} />
                        </div>
                        <div
                          className="uppercase flex-1"
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            color: isCurrentTeam ? "var(--team-primary)" : "rgba(255,255,255,0.8)",
                          }}
                        >
                          {teamData.name}
                        </div>
                        <div className="text-right text-xs tabular-nums font-bold" style={{ width: "36px", color: teamData.played > 0 ? "#ffffff" : "rgba(255,255,255,0.2)" }}>
                          {teamData.played > 0 ? teamData.points : "-"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
            <div
              data-separator
              style={{
                height: "1px",
                background: "color-mix(in srgb, var(--team-primary) 40%, rgba(255,255,255,0.06))",
                transformOrigin: "left",
                marginBottom: "clamp(3rem, 6vw, 5rem)",
              }}
            />
          </>
        )}

        {/* ── ROAD TO 2026 ──────────────────────────────────────────────── */}
        {matches.length > 0 && (
          <>
            <section
              data-animate
              style={{ marginBottom: "clamp(3rem, 5vw, 4.5rem)" }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--team-primary)",
                  lineHeight: 1,
                  marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
                  opacity: 0.85,
                }}
              >
                ROAD TO 2026
              </h2>
              
              <ul className="flex flex-col gap-0 relative">
                {matches.map((match: any) => {
                  const isHome = match.home.code === profile.code;
                  const opponent = isHome ? match.away : match.home;
                  const myScore = isHome ? match.homeScore : match.awayScore;
                  const theirScore = isHome ? match.awayScore : match.homeScore;
                  
                  let scoreDisplay = "—";
                  let won = false;
                  if (match.status === "FINISHED" && myScore !== undefined && theirScore !== undefined) {
                    scoreDisplay = `${myScore} — ${theirScore}`;
                    won = myScore > theirScore;
                  } else if (match.status === "LIVE" && myScore !== undefined && theirScore !== undefined) {
                    scoreDisplay = `${myScore} — ${theirScore}`;
                  }

                  return (
                    <Link href={`/matches/${match.id}`} key={match.id} style={{ textDecoration: 'none' }}>
                      <li
                        className="group flex items-center justify-between"
                        style={{
                          padding: "1rem 0",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          transition: "background 0.3s ease",
                        }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center w-full justify-between gap-2">
                          <div className="flex items-center gap-6">
                            <div style={{ width: "80px", fontSize: "0.65rem", fontWeight: 400, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                              {formatMatchDate(match.date)}
                            </div>
                            <div className="flex items-center gap-3">
                              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>vs</span>
                              <div
                                className="uppercase"
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.08em",
                                  color: "rgba(255,255,255,0.8)",
                                }}
                              >
                                {opponent.name}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 md:justify-end">
                            <div
                              className="tabular-nums"
                              style={{
                                fontSize: "1rem",
                                fontWeight: won ? 800 : 500,
                                color: won ? "var(--team-primary)" : "rgba(255,255,255,0.7)",
                              }}
                            >
                              {match.status === "LIVE" ? (
                                <span className="flex items-center gap-2">
                                  <span className="animate-pulse text-[0.6rem] text-red-500">●</span>
                                  {scoreDisplay}
                                  <span className="text-[0.6rem] text-red-500 ml-1">{match.liveData?.currentMinute}'</span>
                                </span>
                              ) : (
                                scoreDisplay
                              )}
                            </div>
                            <div style={{ width: "70px", textAlign: "right", fontSize: "0.6rem", fontWeight: 400, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {match.status}
                            </div>
                          </div>
                        </div>
                      </li>
                    </Link>
                  );
                })}
              </ul>
            </section>

            {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
            <div
              data-separator
              style={{
                height: "1px",
                background: "color-mix(in srgb, var(--team-primary) 40%, rgba(255,255,255,0.06))",
                transformOrigin: "left",
                marginBottom: "clamp(3rem, 6vw, 5rem)",
              }}
            />
          </>
        )}

        {/* ── SQUAD BY POSITION ─────────────────────────────────────────── */}
        {squadGroups.map((group) => (
          <section
            key={group.position}
            data-animate
            style={{ marginBottom: "clamp(3rem, 5vw, 4.5rem)" }}
          >
            {/* Position heading */}
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--team-primary)",
                lineHeight: 1,
                marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
                opacity: 0.85,
              }}
            >
               {group.label}
            </h2>

            {/* Player list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.players.map((player) => (
                <div
                  key={player.name}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "clamp(0.8rem, 1.5vw, 1.2rem) 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Number + Name */}
                  <div className="flex items-baseline gap-3 md:gap-4">
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 400,
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.15)",
                        minWidth: "24px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {player.number}
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(0.9rem, 1.5vw, 1.15rem)",
                        fontWeight: 500,
                        color: "#ffffff",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {player.name}
                    </span>
                  </div>

                  {/* Club */}
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 300,
                      letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.2)",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {player.club}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer
          data-animate
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
            FIFA World Cup 2026 · {teamName} · {profile.squad.length} Players
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
