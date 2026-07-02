"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- reads loosely-typed /api/matches JSON */

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface LiveMatch {
  id: string;
  home: { code: string };
  away: { code: string };
  homeScore?: number;
  awayScore?: number;
  liveData?: { currentMinute: number };
}

/**
 * LiveNowBadge — a global "the tournament is happening right now" pulse.
 * Polls /api/matches (light, 30s) for LIVE fixtures; renders nothing when none.
 * Links to the live match (or the matches page if several are live).
 */
export default function LiveNowBadge({ compact = false }: { compact?: boolean }) {
  const [live, setLive] = useState<LiveMatch[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        const data = await res.json();
        if (alive) setLive((data.matches || []).filter((m: any) => m.status === "LIVE"));
      } catch {
        /* badge is non-critical */
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (live.length === 0) return null;

  const single = live.length === 1 ? live[0] : null;
  const href = single ? `/matches/${single.id}` : "/matches";

  return (
    <Link
      href={href}
      aria-label={single ? `Live: ${single.home.code} versus ${single.away.code}` : `${live.length} live matches`}
      className="inline-flex items-center gap-2 group"
      style={{
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: "999px",
        border: "1px solid rgba(255,0,0,0.35)",
        background: "rgba(255,0,0,0.06)",
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000]" />
      </span>
      <span style={{ color: "#FF4646" }}>Live</span>
      {single ? (
        <span className={compact ? "hidden sm:inline" : ""} style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.06em" }}>
          {single.home.code} {single.homeScore ?? 0}–{single.awayScore ?? 0} {single.away.code}
        </span>
      ) : (
        <span style={{ color: "rgba(255,255,255,0.7)" }}>· {live.length}</span>
      )}
    </Link>
  );
}
