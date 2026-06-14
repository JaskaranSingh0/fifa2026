"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GROUPS } from "@/lib/data/groups";
import { getTeam } from "@/lib/data/teams";
import TeamLogo from "@/components/TeamLogo";

export default function GroupsPage() {
  const [liveGroups, setLiveGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/api/groups");
        const data = await res.json();
        setLiveGroups(data.groups || []);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
            Groups
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
              12 Groups
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
              48 Nations
            </span>
          </motion.div>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mt-16 md:mt-24">
          {GROUPS.map((staticGroup, i) => {
            const groupData = liveGroups.find((g) => g.letter === staticGroup.letter);
            
            return (
              <motion.div
                key={staticGroup.letter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: Math.min(i * 0.05, 0.3),
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex flex-col"
              >
                <div
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: 1,
                    }}
                  >
                    {staticGroup.letter}
                  </h2>
                </div>

                {loading ? (
                  <div className="flex flex-col gap-4 py-4">
                    <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                    <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                    <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-0 relative">
                    {/* Header Row */}
                    <li
                      className="group flex items-center justify-between"
                      style={{
                        padding: "0.5rem 0",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div className="grid w-full items-center" style={{ gridTemplateColumns: "20px 28px 1fr 28px 28px 28px 28px 28px 36px", gap: "0.5rem" }}>
                        <div />
                        <div />
                        <div />
                        <div className="text-right text-[0.6rem] tracking-widest text-white/20 uppercase">P</div>
                        <div className="text-right text-[0.6rem] tracking-widest text-white/20 uppercase">W</div>
                        <div className="text-right text-[0.6rem] tracking-widest text-white/20 uppercase">D</div>
                        <div className="text-right text-[0.6rem] tracking-widest text-white/20 uppercase">L</div>
                        <div className="text-right text-[0.6rem] tracking-widest text-white/20 uppercase">GD</div>
                        <div className="text-right text-[0.6rem] tracking-widest text-white/20 uppercase">PTS</div>
                      </div>
                    </li>
                    {groupData?.teams.map((teamData: any, j: number) => {
                      const pos = j + 1;
                      const borderLeft =
                        pos <= 2
                          ? "2px solid rgba(255,255,255,0.3)"
                          : pos === 3
                          ? "2px solid rgba(255,255,255,0.08)"
                          : "2px solid transparent";

                      return (
                        <li
                          key={teamData.code}
                          className="group flex items-center justify-between"
                          style={{
                            padding: "0.75rem 0",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            borderLeft,
                            paddingLeft: "12px",
                            marginLeft: "-14px",
                            transition: "background 0.3s ease",
                          }}
                        >
                          <div className="grid w-full items-center" style={{ gridTemplateColumns: "20px 28px 1fr 28px 28px 28px 28px 28px 36px", gap: "0.5rem" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 300, color: "rgba(255,255,255,0.2)" }}>
                              {pos}
                            </div>
                            <div className="flex justify-center">
                              <TeamLogo code={teamData.code} size={24} />
                            </div>
                            <div
                              className="uppercase"
                              style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                color: "rgba(255,255,255,0.8)",
                                transition: "color 0.3s ease",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {teamData.name}
                            </div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.played}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.won}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.drawn}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.lost}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}</div>
                            <div className="text-right text-xs tabular-nums font-bold" style={{ color: teamData.played > 0 ? "#ffffff" : "rgba(255,255,255,0.2)" }}>
                              {teamData.played > 0 ? teamData.points : "-"}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 md:mt-16 border-t border-[rgba(255,255,255,0.05)] pt-6">
          <p style={{ fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
            <span className="inline-block w-2 h-3 bg-[rgba(255,255,255,0.3)] mr-2 align-middle"></span>
            Advances to Round of 32
          </p>
        </div>
      </div>
    </div>
  );
}
