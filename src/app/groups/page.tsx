"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GROUPS } from "@/lib/data/groups";
import TeamLogo from "@/components/TeamLogo";
import RevealText from "@/components/RevealText";

interface GroupStandingRow {
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
interface LiveGroup {
  letter: string;
  name: string;
  teams: GroupStandingRow[];
}

export default function GroupsPage() {
  const [liveGroups, setLiveGroups] = useState<LiveGroup[]>([]);
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
      className="bg-[#050505]"
      style={{ minHeight: '100vh', fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}
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
            text="Groups"
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
                fontWeight: 400,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              12 Groups
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span
              style={{
                fontSize: "clamp(0.7rem, 1.1vw, 0.85rem)",
                fontWeight: 400,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              48 Nations
            </span>
          </motion.div>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 mt-16 md:mt-24">
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
                className="flex flex-col relative"
                style={{
                  background: 'radial-gradient(circle at 0% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)'
                }}
              >
                {/* Watermark Letter */}
                <h2
                  style={{
                    position: "absolute",
                    top: "-2rem",
                    right: "-1rem",
                    left: "auto",
                    zIndex: 0,
                    pointerEvents: "none",
                    fontSize: "clamp(8rem, 15vw, 14rem)",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.04)",
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {staticGroup.letter}
                </h2>

                {/* Group Label Row */}
                <div
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    paddingBottom: "1rem",
                    marginBottom: "1rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      letterSpacing: "0.3em",
                      color: "rgba(255,255,255,0.2)",
                      textTransform: "uppercase",
                    }}
                  >
                    GROUP {staticGroup.letter}
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col gap-4 py-4 relative z-10">
                    <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                    <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                    <div style={{ color: "rgba(255,255,255,0.06)", fontSize: "1.2rem", letterSpacing: "2px" }}>░░░░░░░░░░░░░░░░░░</div>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-0 relative z-10">
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
                        <div className="text-right uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>P</div>
                        <div className="text-right uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>W</div>
                        <div className="text-right uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>D</div>
                        <div className="text-right uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>L</div>
                        <div className="text-right uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>GD</div>
                        <div className="text-right uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>PTS</div>
                      </div>
                    </li>
                    {groupData?.teams.map((teamData, j) => {
                      const pos = j + 1;
                      const borderLeft =
                        pos === 1
                          ? "3px solid rgba(255,255,255,0.5)"
                          : pos === 2
                          ? "3px solid rgba(255,255,255,0.25)"
                          : pos === 3
                          ? "3px solid rgba(255,255,255,0.08)"
                          : "none";
                      
                      const paddingLeft = pos <= 3 ? "12px" : "15px";

                      return (
                        <li
                          key={teamData.code}
                          className="group flex items-center justify-between"
                          style={{
                            padding: "0.75rem 0",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            borderLeft,
                            paddingLeft,
                            marginLeft: pos <= 3 ? "-15px" : "-15px",
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
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                color: "rgba(255,255,255,0.9)",
                                transition: "color 0.3s ease",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "120px"
                              }}
                            >
                              {teamData.name}
                            </div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.played}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.won}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.drawn}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.lost}</div>
                            <div className="text-right text-xs tabular-nums text-white/60">{teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}</div>
                            <div className="text-right tabular-nums" style={{ fontSize: teamData.points > 0 ? "1rem" : "0.75rem", fontWeight: teamData.points > 0 ? 800 : 700, color: teamData.points > 0 ? "#ffffff" : "rgba(255,255,255,0.2)" }}>
                              {teamData.played > 0 ? teamData.points : "0"}
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
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", fontWeight: 500 }}>
            <span className="inline-block w-1 h-3 bg-[rgba(255,255,255,0.7)] mr-2 align-middle"></span>
            Advances to Round of 32
          </p>
        </div>
      </div>
    </div>
  );
}
