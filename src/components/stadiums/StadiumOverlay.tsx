"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- presentational overlay over fetched match JSON */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Stadium } from "@/lib/data/stadiums";
import { formatLocalKickoff, formatDateEditorial } from "@/lib/matches-data";
import TeamLogo from "@/components/TeamLogo";
import { useModalA11y } from "@/hooks/useModalA11y";

interface Props {
  stadium: Stadium;
  onClose: () => void;
}

const FLAG: Record<Stadium["country"], string> = {
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
};

/**
 * StadiumOverlay — full-screen editorial venue dossier. Same exhibition-catalogue
 * language as TeamProfileOverlay: an accent-tinted hero, a facts grid that hides
 * blank fields, the real fixtures scheduled at this venue (pulled live from
 * /api/matches), and a closing "did you know". Framer Motion handles the entrance
 * (so it honours reduced-motion via the app-level MotionConfig).
 */
export default function StadiumOverlay({ stadium, onClose }: Props) {
  const [matches, setMatches] = useState<any[]>([]);
  const accent = stadium.accent;
  // Dialog a11y: focus trap + restore, body-scroll-lock, Escape to close.
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);

  // Fixtures played at this venue — match on the city/stadium strings the
  // schedule actually uses (stadium.matchCities).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (!alive) return;
        const here = (data.matches || []).filter((m: any) =>
          stadium.matchCities.some((c) => {
            const needle = c.toLowerCase();
            return (
              (m.city ?? "").toLowerCase().includes(needle) ||
              (m.stadium ?? "").toLowerCase().includes(needle)
            );
          })
        );
        here.sort((a: any, b: any) =>
          a.date !== b.date ? a.date.localeCompare(b.date) : (a.matchNumber ?? 0) - (b.matchNumber ?? 0)
        );
        setMatches(here);
      } catch {
        /* fixtures are a bonus — silent fail keeps the dossier usable */
      }
    })();
    return () => { alive = false; };
  }, [stadium.matchCities]);

  const facts = [
    { label: "Capacity", value: stadium.capacity.toLocaleString(), accent: true },
    { label: "Opened", value: String(stadium.opened) },
    { label: "Roof", value: stadium.roof },
    { label: "Pitch", value: stadium.surface },
    { label: "Elevation", value: stadium.elevation ?? "" },
    { label: "Resident Teams", value: stadium.tenants },
  ].filter((f) => f.value && f.value.trim() !== "");

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${stadium.name} details`}
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
      <div
        className="mx-auto"
        style={{ width: "min(82%, 1000px)", minWidth: "320px", paddingBottom: "8rem" }}
      >
        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div style={{ paddingTop: "clamp(2.5rem, 6vw, 5rem)" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.65rem",
              fontWeight: 400,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              transition: "color 0.25s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            ← All Venues
          </button>
        </div>

        {/* ── DISTINCTION + LOCATION ────────────────────────────────────── */}
        <div className="flex items-center gap-3" style={{ marginTop: "clamp(2rem, 5vw, 3.5rem)" }}>
          <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{FLAG[stadium.country]}</span>
          <span
            className="uppercase"
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "var(--accent)",
            }}
          >
            {stadium.distinction}
          </span>
        </div>

        {/* ── STADIUM NAME ──────────────────────────────────────────────── */}
        <h1
          style={{
            fontSize: "clamp(2.6rem, 8vw, 6.5rem)",
            fontWeight: 800,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "#ffffff",
            textShadow: "0 0 60px color-mix(in srgb, var(--accent) 35%, transparent)",
            lineHeight: 0.92,
            marginTop: "clamp(0.75rem, 1.5vw, 1.25rem)",
          }}
        >
          {stadium.name}
        </h1>

        {/* ── CITY + OFFICIAL WC NAME ───────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1"
          style={{ marginTop: "clamp(1rem, 2vw, 1.5rem)" }}
        >
          <span
            className="uppercase"
            style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.18em", color: "rgba(255,255,255,0.7)" }}
          >
            {stadium.city}, {stadium.country}
          </span>
          {stadium.officialName !== stadium.name && (
            <>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontSize: "0.72rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                Known as <span style={{ color: "rgba(255,255,255,0.65)" }}>{stadium.officialName}</span> during the tournament
              </span>
            </>
          )}
        </div>

        {/* ── DESCRIPTION ───────────────────────────────────────────────── */}
        <p
          style={{
            fontSize: "clamp(1.05rem, 1.7vw, 1.3rem)",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.6)",
            maxWidth: "640px",
            marginTop: "clamp(2rem, 4vw, 3rem)",
            marginBottom: "clamp(3rem, 6vw, 4.5rem)",
          }}
        >
          {stadium.description}
        </p>

        {/* ── SEPARATOR ─────────────────────────────────────────────────── */}
        <div
          style={{
            height: "1px",
            background: "color-mix(in srgb, var(--accent) 40%, rgba(255,255,255,0.06))",
            marginBottom: "clamp(2.5rem, 5vw, 3.5rem)",
          }}
        />

        {/* ── FACTS GRID ────────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 md:grid-cols-3"
          style={{ gap: "clamp(2rem, 4vw, 3rem)", marginBottom: "clamp(3rem, 6vw, 4.5rem)" }}
        >
          {facts.map((f) => (
            <div key={f.label}>
              <div
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.38)",
                  marginBottom: "0.6rem",
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontSize: "clamp(1rem, 1.6vw, 1.35rem)",
                  fontWeight: 600,
                  color: f.accent ? "var(--accent)" : "#ffffff",
                  lineHeight: 1.3,
                }}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── FIXTURES AT THIS VENUE ────────────────────────────────────── */}
        {matches.length > 0 && (
          <>
            <div
              style={{
                height: "1px",
                background: "color-mix(in srgb, var(--accent) 40%, rgba(255,255,255,0.06))",
                marginBottom: "clamp(2.5rem, 5vw, 3.5rem)",
              }}
            />
            <section style={{ marginBottom: "clamp(3rem, 5vw, 4rem)" }}>
              <h2
                className="uppercase"
                style={{
                  fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1,
                  marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
                }}
              >
                Matches Here
                <span style={{ color: "var(--accent)", marginLeft: "0.6rem", fontWeight: 400 }}>
                  {matches.length}
                </span>
              </h2>

              <ul className="flex flex-col">
                {matches.map((m: any) => {
                  const ended = m.status === "FINISHED";
                  const live = m.status === "LIVE";
                  const { month, day } = formatDateEditorial(m.date);
                  return (
                    <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: "none" }}>
                      <li
                        className="group flex items-center gap-4"
                        style={{ padding: "1.1rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        {/* Date */}
                        <div style={{ width: "64px", flexShrink: 0 }}>
                          <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>
                            {month.slice(0, 3)}
                          </div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>
                            {day}
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TeamLogo code={m.home.code} size={22} />
                          <span className="uppercase truncate" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", color: "rgba(255,255,255,0.85)" }}>
                            {m.home.name}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", flexShrink: 0 }}>
                            {live ? (
                              <span style={{ color: "#FF0000", fontWeight: 700 }}>{m.homeScore}–{m.awayScore}</span>
                            ) : ended ? (
                              <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{m.homeScore}–{m.awayScore}</span>
                            ) : "vs"}
                          </span>
                          <span className="uppercase truncate" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.04em", color: "rgba(255,255,255,0.85)" }}>
                            {m.away.name}
                          </span>
                          <TeamLogo code={m.away.code} size={22} />
                        </div>

                        {/* Stage / time */}
                        <div className="text-right hidden sm:block" style={{ flexShrink: 0 }}>
                          <div className="uppercase" style={{ fontSize: "0.55rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)" }}>
                            {m.group ?? (m.stage ?? "").replace(/_/g, " ")}
                          </div>
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

        {/* ── DID YOU KNOW ──────────────────────────────────────────────── */}
        <div
          style={{
            borderLeft: "2px solid var(--accent)",
            paddingLeft: "1.25rem",
            marginTop: "clamp(2rem, 4vw, 3rem)",
            maxWidth: "640px",
          }}
        >
          <div
            className="uppercase"
            style={{ fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.22em", color: "var(--accent)", marginBottom: "0.6rem" }}
          >
            Did You Know
          </div>
          <p style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
            {stadium.funFact}
          </p>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer
          style={{
            marginTop: "clamp(4rem, 8vw, 6rem)",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            className="uppercase"
            style={{ fontSize: "0.55rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.1)" }}
          >
            FIFA World Cup 2026 · {stadium.officialName} · {stadium.city}
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
