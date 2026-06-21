"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- presentational overlay over fetched match JSON */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Group } from "@/lib/data/groups";
import { getTeam } from "@/lib/data/teams";
import { getTeamBranding } from "@/lib/data/team-branding";
import { getTeamProfile } from "@/lib/data/team-profiles";
import { formatLocalKickoff, formatDateEditorial } from "@/lib/matches-data";
import TeamLogo from "@/components/TeamLogo";
import { useModalA11y } from "@/hooks/useModalA11y";

export interface StandingRow {
  code: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface Props {
  group: Group;
  standings?: { teams: StandingRow[] };
  onClose: () => void;
}

/**
 * GroupOverlay — full-screen group dossier in the same exhibition language as the
 * team and stadium overlays. Accent is the Pot-1 (seed) nation's colour, so each
 * group carries an identity. Shows the four nations, the full standings table with
 * qualification highlighting, and the group's six round-robin fixtures pulled live
 * from /api/matches. Framer entrance (reduced-motion-safe via MotionConfig); Esc closes.
 */
export default function GroupOverlay({ group, standings, onClose }: Props) {
  const [matches, setMatches] = useState<any[]>([]);

  // Seed nation's colour = the group's identity accent.
  const seed = group.teams[0];
  const accent = getTeamProfile(seed)?.kitPrimary || getTeamBranding(seed).primary;
  // Dialog a11y: focus trap + restore, body-scroll-lock, Escape to close.
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (!alive) return;
        const here = (data.matches || []).filter(
          (m: any) =>
            m.stage === "GROUP_STAGE" &&
            group.teams.includes(m.home.code) &&
            group.teams.includes(m.away.code)
        );
        here.sort((a: any, b: any) =>
          a.date !== b.date ? a.date.localeCompare(b.date) : (a.matchNumber ?? 0) - (b.matchNumber ?? 0)
        );
        setMatches(here);
      } catch {
        /* fixtures are a bonus */
      }
    })();
    return () => { alive = false; };
  }, [group.teams]);

  // Standings rows — fall back to the static four (alphabetical seed order) with
  // zeroed stats while the live standings are still loading.
  const rows: StandingRow[] =
    standings?.teams ??
    group.teams.map((code) => ({
      code,
      name: getTeam(code)?.name ?? code,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0,
    }));

  const qualColor = (pos: number) =>
    pos <= 2 ? accent : pos === 3 ? "rgba(255,255,255,0.25)" : "transparent";

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Group ${group.letter} details`}
      tabIndex={-1}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 overflow-y-auto outline-none"
      style={{
        background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${accent} 12%, transparent) 0%, #050505 60%)`,
        fontFamily: "var(--font-inter, 'Inter', sans-serif)",
        "--accent": accent,
      } as React.CSSProperties}
    >
      <div className="mx-auto" style={{ width: "min(84%, 1040px)", minWidth: "320px", paddingBottom: "8rem" }}>
        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div style={{ paddingTop: "clamp(2.5rem, 6vw, 5rem)" }}>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.65rem", fontWeight: 400, letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
              transition: "color 0.25s ease", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            ← All Groups
          </button>
        </div>

        {/* ── TITLE ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: "clamp(1.5rem, 4vw, 3rem)" }}>
          <span
            className="uppercase"
            style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.3em", color: "var(--accent)" }}
          >
            Group Stage
          </span>
          <h1
            style={{
              fontSize: "clamp(3rem, 12vw, 9rem)",
              fontWeight: 900,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#ffffff",
              textShadow: "0 0 60px color-mix(in srgb, var(--accent) 35%, transparent)",
              lineHeight: 0.9,
              marginTop: "0.5rem",
            }}
          >
            Group {group.letter}
          </h1>
        </div>

        {/* ── NATIONS ROW ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3" style={{ marginTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
          {group.teams.map((code) => (
            <div key={code} className="flex items-center gap-2">
              <TeamLogo code={code} size={26} />
              <span className="uppercase" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.75)" }}>
                {getTeam(code)?.name ?? code}
              </span>
            </div>
          ))}
        </div>

        {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
        <div style={{ height: "1px", background: "color-mix(in srgb, var(--accent) 40%, rgba(255,255,255,0.06))", margin: "clamp(2.5rem, 5vw, 3.5rem) 0" }} />

        {/* ── STANDINGS ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: "clamp(3rem, 5vw, 4rem)" }}>
          <h2 className="uppercase" style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.24em", color: "rgba(255,255,255,0.45)", marginBottom: "1.25rem" }}>
            Standings
          </h2>

          {/* Header */}
          <div
            className="grid items-center"
            style={{ gridTemplateColumns: "28px 1fr 32px 32px 32px 32px 40px 44px", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div />
            <div />
            {["P", "W", "D", "L", "GD", "PTS"].map((h) => (
              <div key={h} className="text-right uppercase" style={{ fontSize: "0.6rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
                {h}
              </div>
            ))}
          </div>

          <ul className="flex flex-col">
            {rows.map((t, i) => {
              const pos = i + 1;
              return (
                <li
                  key={t.code}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "28px 1fr 32px 32px 32px 32px 40px 44px",
                    gap: "0.5rem",
                    padding: "0.85rem 0 0.85rem 12px",
                    marginLeft: "-12px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    borderLeft: `3px solid ${qualColor(pos)}`,
                  }}
                >
                  <div style={{ fontSize: "0.75rem", fontWeight: 400, color: pos <= 2 ? "var(--accent)" : "rgba(255,255,255,0.3)" }}>{pos}</div>
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamLogo code={t.code} size={24} />
                    <span className="uppercase truncate" style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.92)" }}>
                      {t.name}
                    </span>
                  </div>
                  <div className="text-right text-xs tabular-nums text-white/55">{t.played}</div>
                  <div className="text-right text-xs tabular-nums text-white/55">{t.won}</div>
                  <div className="text-right text-xs tabular-nums text-white/55">{t.drawn}</div>
                  <div className="text-right text-xs tabular-nums text-white/55">{t.lost}</div>
                  <div className="text-right text-xs tabular-nums text-white/55">{t.gd > 0 ? `+${t.gd}` : t.gd}</div>
                  <div className="text-right tabular-nums" style={{ fontSize: "0.95rem", fontWeight: 800, color: t.played > 0 ? "#ffffff" : "rgba(255,255,255,0.25)" }}>
                    {t.points}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-2" style={{ marginTop: "1.25rem" }}>
            <span className="flex items-center gap-2" style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              <span style={{ width: 10, height: 10, background: accent }} /> Top 2 — Round of 32
            </span>
            <span className="flex items-center gap-2" style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              <span style={{ width: 10, height: 10, background: "rgba(255,255,255,0.25)" }} /> 3rd — best-third contention
            </span>
          </div>
        </section>

        {/* ── FIXTURES ──────────────────────────────────────────────────── */}
        {matches.length > 0 && (
          <>
            <div style={{ height: "1px", background: "color-mix(in srgb, var(--accent) 40%, rgba(255,255,255,0.06))", marginBottom: "clamp(2.5rem, 5vw, 3.5rem)" }} />
            <section>
              <h2 className="uppercase" style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.24em", color: "rgba(255,255,255,0.45)", marginBottom: "1.25rem" }}>
                Fixtures
                <span style={{ color: "var(--accent)", marginLeft: "0.5rem" }}>{matches.length}</span>
              </h2>

              <ul className="flex flex-col">
                {matches.map((m: any) => {
                  const ended = m.status === "FINISHED";
                  const live = m.status === "LIVE";
                  const { month, day } = formatDateEditorial(m.date);
                  return (
                    <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: "none" }}>
                      <li className="flex items-center gap-4" style={{ padding: "1.1rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ width: "58px", flexShrink: 0 }}>
                          <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>{month.slice(0, 3)}</div>
                          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>{day}</div>
                        </div>

                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TeamLogo code={m.home.code} size={22} />
                          <span className="uppercase truncate" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", color: "rgba(255,255,255,0.85)" }}>{m.home.name}</span>
                          <span style={{ flexShrink: 0, fontSize: "0.72rem" }}>
                            {live ? <span style={{ color: "#FF0000", fontWeight: 700 }}>{m.homeScore}–{m.awayScore}</span>
                              : ended ? <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{m.homeScore}–{m.awayScore}</span>
                              : <span style={{ color: "rgba(255,255,255,0.25)" }}>vs</span>}
                          </span>
                          <span className="uppercase truncate" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", color: "rgba(255,255,255,0.85)" }}>{m.away.name}</span>
                          <TeamLogo code={m.away.code} size={22} />
                        </div>

                        <div className="text-right hidden sm:block" style={{ flexShrink: 0 }}>
                          <div className="uppercase truncate" style={{ fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", maxWidth: "150px" }}>{m.city}</div>
                          <div style={{ fontSize: "0.6rem", color: live ? "#FF0000" : "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                            {live ? `LIVE ${m.liveData?.currentMinute ?? ""}'` : ended ? "FT" : formatLocalKickoff(m.date, m.time)}
                          </div>
                        </div>
                      </li>
                    </Link>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer style={{ marginTop: "clamp(4rem, 8vw, 6rem)", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="uppercase" style={{ fontSize: "0.55rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.1)" }}>
            FIFA World Cup 2026 · Group {group.letter} · {group.teams.length} Nations
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
