"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TeamLogo from "@/components/TeamLogo";
import { getTeamBranding } from "@/lib/data/team-branding";
import {
  BracketMatch,
  BracketNode,
  BracketTree,
  ResolvedTeam,
  isRealTeam,
  slotLabel,
} from "@/lib/bracket";

type Resolver = (code: string) => ResolvedTeam;

const LINE = "rgba(255,255,255,0.16)";
const CARD_W = 152;

function shortDate(iso: string) {
  const p = iso.split("-");
  if (p.length < 3) return iso;
  return new Date(+p[0], +p[1] - 1, +p[2])
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

// Elbow connector between a pair of children and their parent. Because the tree
// is balanced and spacing comes from card margins (no flex gaps), each child's
// centre sits at exactly 25% / 75% of this stretched column — so the lines are
// pixel-aligned with no measurement.
function Connector({ side }: { side: "left" | "right" }) {
  const stub = side === "left" ? { left: 0, width: "50%" } : { right: 0, width: "50%" };
  const mid = side === "left" ? { left: "50%", width: "50%" } : { right: "50%", width: "50%" };
  return (
    <div style={{ position: "relative", width: 30, alignSelf: "stretch", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: "25%", height: "50%", width: 1, background: LINE, left: "50%" }} />
      <div style={{ position: "absolute", top: "25%", height: 1, background: LINE, ...stub }} />
      <div style={{ position: "absolute", top: "75%", height: 1, background: LINE, ...stub }} />
      <div style={{ position: "absolute", top: "50%", height: 1, background: LINE, ...mid }} />
    </div>
  );
}

function HLine() {
  return <div style={{ width: 30, height: 1, background: LINE, alignSelf: "center", flexShrink: 0 }} />;
}

function TeamSlot({ team, won, score, live, finished, resolver, onTrace }: {
  team: { code: string; name: string };
  won: boolean;
  score?: number;
  live: boolean;
  finished: boolean;
  resolver: Resolver;
  onTrace?: (code: string | null) => void;
}) {
  const resolved: ResolvedTeam = isRealTeam(team.code) ? team : resolver(team.code);
  return (
    <div
      className="flex items-center justify-between"
      style={{ gap: 8, padding: "5px 9px" }}
      onMouseEnter={resolved && onTrace ? () => onTrace(resolved.code) : undefined}
      onMouseLeave={onTrace ? () => onTrace(null) : undefined}
    >
      <div className="flex items-center" style={{ gap: 7, minWidth: 0 }}>
        {resolved ? (
          <TeamLogo code={resolved.code} size={16} />
        ) : (
          <span style={{ width: 16, height: 16, borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.18)", flexShrink: 0, display: "inline-block" }} />
        )}
        <span
          className="uppercase truncate"
          style={{
            fontSize: "0.66rem",
            fontWeight: won ? 800 : 600,
            letterSpacing: "0.02em",
            fontStyle: resolved ? "normal" : "italic",
            color: resolved ? (won ? "#fff" : "rgba(255,255,255,0.78)") : "rgba(255,255,255,0.3)",
          }}
        >
          {resolved ? resolved.name : slotLabel(team.code)}
        </span>
      </div>
      {(finished || live) && (
        <span className="tabular-nums" style={{ fontSize: "0.7rem", fontWeight: won ? 800 : 600, color: won ? "#fff" : "rgba(255,255,255,0.55)", flexShrink: 0 }}>
          {score ?? 0}
        </span>
      )}
    </div>
  );
}

function TreeCard({ match, resolver, featured = false, traced, onTrace }: {
  match: BracketMatch;
  resolver: Resolver;
  featured?: boolean;
  traced?: string | null;
  onTrace?: (code: string | null) => void;
}) {
  const finished = match.status === "FINISHED" && match.homeScore !== undefined && match.awayScore !== undefined;
  const live = match.status === "LIVE";
  // Level after 120' → the shootout decides the winner
  const pens = match.penaltyScore;
  const pensDecided = !!(finished && match.homeScore === match.awayScore && pens && pens[0] !== pens[1]);
  const homeWon = finished && ((match.homeScore as number) > (match.awayScore as number) || (pensDecided && pens![0] > pens![1]));
  const awayWon = finished && ((match.awayScore as number) > (match.homeScore as number) || (pensDecided && pens![1] > pens![0]));
  const winnerCode = homeWon ? match.home.code : awayWon ? match.away.code : null;
  const accent = winnerCode && isRealTeam(winnerCode) ? getTeamBranding(winnerCode).primary : featured ? "#E8C249" : null;

  // Path tracing: while a team is hovered anywhere in the bracket, its route
  // lights up in its colour and every other card recedes.
  const rHome = isRealTeam(match.home.code) ? match.home : resolver(match.home.code);
  const rAway = isRealTeam(match.away.code) ? match.away : resolver(match.away.code);
  const onPath = !!traced && (rHome?.code === traced || rAway?.code === traced);
  const traceColor = onPath ? getTeamBranding(traced!).primary : null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block"
      style={{
        textDecoration: "none", width: featured ? CARD_W + 24 : CARD_W, margin: "12px 0", flexShrink: 0,
        opacity: traced && !onPath ? 0.28 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = traceColor ?? accent ?? "rgba(255,255,255,0.1)"; }}
        style={{
          borderRadius: 8,
          border: `1px solid ${traceColor ? `${traceColor}88` : "rgba(255,255,255,0.1)"}`,
          borderTop: traceColor ? `2px solid ${traceColor}` : accent ? `2px solid ${accent}` : "1px solid rgba(255,255,255,0.1)",
          background: featured ? "rgba(232,194,73,0.06)" : "rgba(255,255,255,0.025)",
          boxShadow: traceColor ? `0 0 26px ${traceColor}33` : featured ? "0 0 40px rgba(232,194,73,0.12)" : "none",
          transition: "border-color 0.25s ease, box-shadow 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center justify-between" style={{ padding: "4px 9px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
            #{match.matchNumber}
          </span>
          {live ? (
            <span className="flex items-center gap-1" style={{ fontSize: "0.5rem", letterSpacing: "0.08em", color: "#FF3B3B", fontWeight: 700 }}>
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF0000]" /></span>
              LIVE
            </span>
          ) : (
            <span style={{ fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)" }}>
              {pensDecided ? `PENS ${pens![0]}–${pens![1]}` : finished ? (match.duration === "EXTRA_TIME" ? "AET" : "FT") : shortDate(match.date)}
            </span>
          )}
        </div>
        <TeamSlot team={match.home} won={homeWon} score={match.homeScore} live={live} finished={finished} resolver={resolver} onTrace={onTrace} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
        <TeamSlot team={match.away} won={awayWon} score={match.awayScore} live={live} finished={finished} resolver={resolver} onTrace={onTrace} />
      </div>
    </Link>
  );
}

function Side({ node, side, resolver, traced, onTrace }: {
  node: BracketNode; side: "left" | "right"; resolver: Resolver;
  traced: string | null; onTrace: (code: string | null) => void;
}) {
  if (!node.children) return <TreeCard match={node.match} resolver={resolver} traced={traced} onTrace={onTrace} />;
  const kids = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Side node={node.children[0]} side={side} resolver={resolver} traced={traced} onTrace={onTrace} />
      <Side node={node.children[1]} side={side} resolver={resolver} traced={traced} onTrace={onTrace} />
    </div>
  );
  const card = <TreeCard match={node.match} resolver={resolver} traced={traced} onTrace={onTrace} />;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {side === "left" ? (
        <>{kids}<Connector side="left" />{card}</>
      ) : (
        <>{card}<Connector side="right" />{kids}</>
      )}
    </div>
  );
}

function FinalBlock({ final, third, resolver, traced, onTrace }: {
  final: BracketMatch; third?: BracketMatch; resolver: Resolver;
  traced: string | null; onTrace: (code: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", flexShrink: 0, width: CARD_W + 40 }}>
      {/* top spacer keeps the Final card vertically centred against the semis */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 8 }}>
        <span className="uppercase" style={{ fontSize: "0.6rem", letterSpacing: "0.32em", color: "#E8C249", fontWeight: 800 }}>Final</span>
      </div>
      <TreeCard match={final} resolver={resolver} featured traced={traced} onTrace={onTrace} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", paddingTop: 10, gap: 10 }}>
        <span className="uppercase" style={{ fontSize: "0.55rem", letterSpacing: "0.28em", color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>★ Champion ★</span>
        {third && (
          <div className="flex flex-col items-center" style={{ marginTop: 8 }}>
            <span className="uppercase" style={{ fontSize: "0.5rem", letterSpacing: "0.26em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 2 }}>3rd Place</span>
            <TreeCard match={third} resolver={resolver} traced={traced} onTrace={onTrace} />
          </div>
        )}
      </div>
    </div>
  );
}

// Scales the (fixed-width) bracket down so it always fits the available width —
// no horizontal scroll — and keeps it horizontally centred (explicit px offset,
// not a percentage transform, so it can't drift). Re-measures on resize.
function ScaleToFit({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ scale: 1, tx: 0, height: 0, ready: false });

  useEffect(() => {
    const measure = () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;
      const natW = inner.scrollWidth;     // unaffected by the transform
      const natH = inner.scrollHeight;
      const avail = outer.clientWidth;
      if (!natW || !avail) return;
      const scale = Math.min(1, avail / natW);
      const tx = Math.max(0, (avail - natW * scale) / 2);
      setDims((prev) =>
        prev.ready && Math.abs(prev.scale - scale) < 0.002 && Math.abs(prev.tx - tx) < 0.5
          ? prev
          : { scale, tx, height: natH * scale, ready: true }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ position: "relative", width: "100%", overflow: "hidden", height: dims.ready ? dims.height : undefined }}>
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "max-content",
          transform: `translateX(${dims.tx}px) scale(${dims.scale})`,
          transformOrigin: "top left",
          visibility: dims.ready ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Mirrored column headers — same widths/order as the bracket below, so they sit
// directly over each column and scale with it.
const TONE = { g: "#3FB950", r: "#E5484D", gold: "#E8C249" } as const;
const HEADER_COLS: { label?: string; w: number; tone?: keyof typeof TONE }[] = [
  { label: "Round of 32", w: CARD_W, tone: "g" },
  { w: 30 },
  { label: "Round of 16", w: CARD_W, tone: "g" },
  { w: 30 },
  { label: "Quarter-final", w: CARD_W, tone: "r" },
  { w: 30 },
  { label: "Semi-final", w: CARD_W, tone: "r" },
  { w: 30 },
  { label: "Final", w: CARD_W + 40, tone: "gold" },
  { w: 30 },
  { label: "Semi-final", w: CARD_W, tone: "r" },
  { w: 30 },
  { label: "Quarter-final", w: CARD_W, tone: "r" },
  { w: 30 },
  { label: "Round of 16", w: CARD_W, tone: "g" },
  { w: 30 },
  { label: "Round of 32", w: CARD_W, tone: "g" },
];

function HeaderRow() {
  return (
    <div style={{ display: "flex", padding: "0 1rem", width: "max-content" }}>
      {HEADER_COLS.map((c, i) => (
        <div key={i} style={{ width: c.w, display: "flex", justifyContent: "center" }}>
          {c.label && (
            <span
              className="uppercase"
              style={{
                fontSize: "0.56rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: TONE[c.tone!],
                background: `${TONE[c.tone!]}1a`,
                border: `1px solid ${TONE[c.tone!]}33`,
                padding: "5px 10px",
                borderRadius: 5,
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MirroredBracket({ tree, resolver }: { tree: BracketTree; resolver: Resolver }) {
  // Hovered team code — its route through the rounds lights up (path tracing).
  const [traced, setTraced] = useState<string | null>(null);
  return (
    <ScaleToFit>
      <div style={{ display: "flex", flexDirection: "column", width: "max-content" }}>
        <HeaderRow />
        <div style={{ display: "flex", alignItems: "center", padding: "1.5rem 1rem" }}>
          {tree.left && <Side node={tree.left} side="left" resolver={resolver} traced={traced} onTrace={setTraced} />}
          <HLine />
          <FinalBlock final={tree.final} third={tree.third} resolver={resolver} traced={traced} onTrace={setTraced} />
          <HLine />
          {tree.right && <Side node={tree.right} side="right" resolver={resolver} traced={traced} onTrace={setTraced} />}
        </div>
      </div>
    </ScaleToFit>
  );
}
