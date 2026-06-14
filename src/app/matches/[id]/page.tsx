"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TEAM_BRANDING } from "@/lib/data/team-branding";

const formatMatchDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  }).toUpperCase();
};

function StatBar({ label, home, away }: { label: string; home: string | null; away: string | null }) {
  if (!home && !away) return null;
  
  const homeNum = parseFloat(home ?? '0');
  const awayNum = parseFloat(away ?? '0');
  const total = homeNum + awayNum;
  const homePercent = total > 0 ? (homeNum / total) * 100 : 50;
  
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', minWidth: '40px' }}>{home ?? '—'}</span>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', minWidth: '40px', textAlign: 'right' }}>{away ?? '—'}</span>
      </div>
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', display: 'flex' }}>
        {/* Home portion */}
        <div style={{
          height: '100%',
          width: `${homePercent}%`,
          background: `var(--home-primary, rgba(255,255,255,0.5))`,
          opacity: 0.7,
          borderRadius: '1px 0 0 1px',
          transition: 'width 1s ease'
        }} />
        {/* Away portion */}
        <div style={{
          height: '100%',
          width: `${100 - homePercent}%`,
          background: `var(--away-primary, rgba(255,255,255,0.3))`,
          opacity: 0.4,
          borderRadius: '0 1px 1px 0',
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  );
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [baseMatch, setBaseMatch] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showFullBenchHome, setShowFullBenchHome] = useState(false);
  const [showFullBenchAway, setShowFullBenchAway] = useState(false);
  const BENCH_LIMIT = 7;

  useEffect(() => {
    async function fetchData() {
      try {
        const matchesRes = await fetch('/api/matches');
        if (!matchesRes.ok) throw new Error('Failed to fetch matches');
        const matchesData = await matchesRes.json();
        const match = matchesData.matches.find((m: any) => m.id === id);
        
        if (!match) {
          setStatus('error');
          return;
        }
        setBaseMatch(match);

        const detailsRes = await fetch(`/api/matches/${id}/details`);
        if (!detailsRes.ok) {
          setStatus('loaded');
          return;
        }
        const detailsData = await detailsRes.json();

        setDetails(detailsData);
        setStatus('loaded');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    }
    fetchData();
  }, [id]);

  if (status === 'error' && !baseMatch) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Match not found
          </p>
          <button
            onClick={() => router.back()}
            style={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: "rgba(0,209,255,0.6)", textTransform: "uppercase", marginTop: "1rem" }}
          >
            ← MATCHES
          </button>
        </div>
      </main>
    );
  }

  if (!baseMatch) {
    return <main className="min-h-screen bg-[#050505]" />;
  }

  const homeBranding = TEAM_BRANDING[baseMatch.home.code] || { primary: "#ffffff" };
  const awayBranding = TEAM_BRANDING[baseMatch.away.code] || { primary: "#ffffff" };
  
  const homePrimary = homeBranding.primary;
  const awayPrimary = awayBranding.primary;

  const isLive = baseMatch.status === "LIVE";
  const isFinished = baseMatch.status === "FINISHED";

  const renderGoals = () => {
    if (status === 'loading') {
      return (
        <div className="w-full flex flex-col items-center gap-4 py-8">
          <div style={{ animation: 'pulse 1.5s ease-in-out infinite', width: '200px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ animation: 'pulse 1.5s ease-in-out infinite', width: '150px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>
      );
    }
    const goals = details?.details?.goals || [];
    if (goals.length > 0) {
      return (
        <div className="w-full flex flex-col">
          {goals.map((g: any, i: number) => {
            const isHome = g.team === baseMatch.home.name;
            return (
              <div key={i} className="flex w-full items-center justify-center py-4 border-b border-[rgba(255,255,255,0.04)] last:border-0 relative">
                
                {/* Home side */}
                <div className="flex-1 flex flex-col items-end text-right pr-6 md:pr-12">
                  {isHome && (
                    <>
                      <span className="font-bold text-white uppercase text-sm md:text-base">{g.scorer}</span>
                      {g.type !== 'Goal' && <span className="text-[0.6rem] text-[rgba(255,255,255,0.3)] uppercase tracking-widest mt-1">{g.type}</span>}
                      {g.assist && <span className="text-[0.65rem] text-[rgba(255,255,255,0.3)] mt-1" style={{ textTransform: 'capitalize' }}>↳ {g.assist}</span>}
                    </>
                  )}
                </div>

                {/* Minute Marker */}
                <div className="w-24 shrink-0 flex items-center justify-center gap-2">
                  <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1" />
                  <span className="text-xs text-[rgba(255,255,255,0.3)]">{g.minute}'</span>
                  <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1" />
                </div>

                {/* Away side */}
                <div className="flex-1 flex flex-col items-start text-left pl-6 md:pl-12">
                  {!isHome && (
                    <>
                      <span className="font-bold text-white uppercase text-sm md:text-base">{g.scorer}</span>
                      {g.type !== 'Goal' && <span className="text-[0.6rem] text-[rgba(255,255,255,0.3)] uppercase tracking-widest mt-1">{g.type}</span>}
                      {g.assist && <span className="text-[0.65rem] text-[rgba(255,255,255,0.3)] mt-1" style={{ textTransform: 'capitalize' }}>↳ {g.assist}</span>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    if (isFinished) {
      if (baseMatch.homeScore === 0 && baseMatch.awayScore === 0) {
        return <div className="text-[rgba(255,255,255,0.4)] text-sm tracking-[0.2em] uppercase text-center w-full">0 — 0 · FINAL</div>;
      }
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-[rgba(255,255,255,0.4)] text-sm tracking-[0.2em] uppercase">GOAL SCORER DATA UNAVAILABLE</span>
          <span className="text-[rgba(255,255,255,0.3)] text-xs tracking-widest uppercase">
            {baseMatch.home.name} {baseMatch.homeScore ?? 0} — {baseMatch.awayScore ?? 0} {baseMatch.away.name}
          </span>
        </div>
      );
    }
    return <div className="text-[rgba(255,255,255,0.4)] text-sm tracking-[0.2em] uppercase text-center w-full">NO GOALS YET</div>;
  };

  const renderStats = () => {
    if (status === 'loading') {
      return (
        <div className="w-full flex flex-col gap-6 py-4 px-4 md:px-16" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }} />
          ))}
        </div>
      );
    }

    const stats = details?.details?.matchStats;
    if (!stats) return null;

    // Check if everything is null
    const hasAnyStat = Object.values(stats).some((s: any) => s?.home !== null || s?.away !== null);
    if (!hasAnyStat) return null;

    return (
      <div className="w-full px-4 md:px-16" style={{ '--home-primary': homePrimary, '--away-primary': awayPrimary } as React.CSSProperties}>
        <StatBar label="Possession" home={stats.possession?.home} away={stats.possession?.away} />
        <StatBar label="Shots" home={stats.shots?.home} away={stats.shots?.away} />
        <StatBar label="Shots on Target" home={stats.shotsOnTarget?.home} away={stats.shotsOnTarget?.away} />
        <StatBar label="Corners" home={stats.corners?.home} away={stats.corners?.away} />
        <StatBar label="Fouls" home={stats.fouls?.home} away={stats.fouls?.away} />
        <StatBar label="Offsides" home={stats.offsides?.home} away={stats.offsides?.away} />
        <StatBar label="Saves" home={stats.saves?.home} away={stats.saves?.away} />
        
        {/* Cards row */}
        {(stats.yellowCards?.home || stats.yellowCards?.away || stats.redCards?.home || stats.redCards?.away) && (
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-4">
              {stats.yellowCards?.home && stats.yellowCards.home !== '0' && <span className="text-sm font-bold">{stats.yellowCards.home} <span className="text-yellow-400">🟨</span></span>}
              {stats.redCards?.home && stats.redCards.home !== '0' && <span className="text-sm font-bold">{stats.redCards.home} <span className="text-red-500">🟥</span></span>}
            </div>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Cards</span>
            <div className="flex gap-4">
              {stats.yellowCards?.away && stats.yellowCards.away !== '0' && <span className="text-sm font-bold">{stats.yellowCards.away} <span className="text-yellow-400">🟨</span></span>}
              {stats.redCards?.away && stats.redCards.away !== '0' && <span className="text-sm font-bold">{stats.redCards.away} <span className="text-red-500">🟥</span></span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLineups = () => {
    if (status === 'loading') {
      return (
        <div className="w-full flex justify-between px-4 md:px-12 py-8" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div className="w-1/3 flex flex-col gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-[rgba(255,255,255,0.06)] rounded-sm w-full" />)}
          </div>
          <div className="w-1/3 flex flex-col gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-[rgba(255,255,255,0.06)] rounded-sm w-full" />)}
          </div>
        </div>
      );
    }
    
    const homeLineup = details?.details?.homeLineup;
    const awayLineup = details?.details?.awayLineup;

    if (!homeLineup?.startingXI?.length && !awayLineup?.startingXI?.length) {
      return <div className="text-[rgba(255,255,255,0.4)] text-sm tracking-[0.2em] uppercase text-center w-full">LINEUPS ANNOUNCED CLOSER TO KICKOFF</div>;
    }

    const homeBench = showFullBenchHome ? homeLineup?.bench : homeLineup?.bench?.slice(0, BENCH_LIMIT);
    const awayBench = showFullBenchAway ? awayLineup?.bench : awayLineup?.bench?.slice(0, BENCH_LIMIT);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 4rem' }}>
        <div className="flex-1">
          <h3 className="tracking-widest uppercase text-white/50 mb-8 text-sm md:text-base border-b border-[rgba(255,255,255,0.08)] pb-4">
            {baseMatch.home.name} {homeLineup?.formation ? <span className="text-[rgba(255,255,255,0.4)] text-xs ml-2">({homeLineup.formation})</span> : ''}
          </h3>
          <h4 className="tracking-widest uppercase text-[rgba(255,255,255,0.3)] mt-8 mb-6 text-xs">STARTING XI</h4>
          <div className="flex flex-col">
            {homeLineup?.startingXI?.map((p: any, i: number) => (
              <div key={i} style={{ 
                display: 'grid', 
                gridTemplateColumns: '24px 1fr',
                gap: '0 0.75rem',
                padding: '0.65rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}>
                  {p.shirtNumber}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
          {homeLineup?.bench?.length > 0 && (
            <>
              <h4 className="tracking-widest uppercase text-[rgba(255,255,255,0.3)] mt-12 mb-6 text-xs">BENCH</h4>
              <div className="flex flex-col">
                {homeBench?.map((p: any, i: number) => (
                  <div key={i} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '28px 1fr 40px',
                    gap: '0 0.5rem',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}>
                      {p.shirtNumber}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.55rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.2)', textAlign: 'right' }}>
                      {p.position}
                    </span>
                  </div>
                ))}
              </div>
              {homeLineup.bench.length > BENCH_LIMIT && (
                <button
                  onClick={() => setShowFullBenchHome(!showFullBenchHome)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)', padding: '0.75rem 0',
                    transition: 'color 0.2s ease',
                    width: '100%', textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                >
                  {showFullBenchHome ? '↑ Show Less' : `+ ${homeLineup.bench.length - BENCH_LIMIT} More`}
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex-1 mt-16 md:mt-0">
          <h3 className="tracking-widest uppercase text-white/50 mb-8 text-sm md:text-base md:text-right border-b border-[rgba(255,255,255,0.08)] pb-4">
            {baseMatch.away.name} {awayLineup?.formation ? <span className="text-[rgba(255,255,255,0.4)] text-xs mr-2">({awayLineup.formation})</span> : ''}
          </h3>
          <h4 className="tracking-widest uppercase text-[rgba(255,255,255,0.3)] mt-8 mb-6 text-xs md:text-right">STARTING XI</h4>
          <div className="flex flex-col">
            {awayLineup?.startingXI?.map((p: any, i: number) => (
              <div key={i} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 24px',
                gap: '0 0.75rem',
                padding: '0.65rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', textAlign: 'right' }}>
                  {p.name}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                  {p.shirtNumber}
                </span>
              </div>
            ))}
          </div>
          {awayLineup?.bench?.length > 0 && (
            <>
              <h4 className="tracking-widest uppercase text-[rgba(255,255,255,0.3)] mt-12 mb-6 text-xs md:text-right">BENCH</h4>
              <div className="flex flex-col">
                {awayBench?.map((p: any, i: number) => (
                  <div key={i} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '40px 1fr 28px',
                    gap: '0 0.5rem',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.55rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.2)' }}>
                      {p.position}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', textAlign: 'right' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                      {p.shirtNumber}
                    </span>
                  </div>
                ))}
              </div>
              {awayLineup.bench.length > BENCH_LIMIT && (
                <button
                  onClick={() => setShowFullBenchAway(!showFullBenchAway)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)', padding: '0.75rem 0',
                    transition: 'color 0.2s ease',
                    width: '100%', textAlign: 'right'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                >
                  {showFullBenchAway ? '↑ Show Less' : `+ ${awayLineup.bench.length - BENCH_LIMIT} More`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderOfficials = () => {
    if (status === 'loading') return <div className="text-[rgba(255,255,255,0.3)] text-sm tracking-[0.2em] uppercase text-center w-full">░░░░░░░░░░</div>;
    const refs = details?.details?.referees;
    if (!refs || refs.length === 0) return <div className="text-[rgba(255,255,255,0.4)] text-sm tracking-[0.2em] uppercase text-center w-full">OFFICIALS TBA</div>;
    
    return (
      <div className="flex flex-col items-center gap-3">
        {refs.map((r: any, i: number) => (
          <p key={i} className="text-xs tracking-widest uppercase text-[rgba(255,255,255,0.6)]">
            <span className="text-white">{r.name}</span>
            {r.nationality && <span className="text-[rgba(255,255,255,0.4)] ml-2">· {r.nationality}</span>}
          </p>
        ))}
      </div>
    );
  };

  const hasStats = details?.details?.matchStats && Object.values(details.details.matchStats).some((s: any) => s?.home !== null || s?.away !== null);

  return (
    <main
      className="min-h-screen bg-[#050505] text-white px-8 md:px-16 lg:px-24 py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: `linear-gradient(to right, 
            color-mix(in srgb, ${homePrimary} 12%, transparent) 0%, 
            transparent 45%, 
            transparent 55%,
            color-mix(in srgb, ${awayPrimary} 12%, transparent) 100%)`
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }} className="flex flex-col w-full items-center">
        <div className="w-full max-w-6xl self-center flex justify-start">
          <button
            onClick={() => router.back()}
            className="text-xs tracking-widest text-[rgba(255,255,255,0.3)] uppercase hover:text-white transition-colors mb-16 inline-block"
          >
            ← MATCHES
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-full">
          
          {/* Hero Block */}
          <div className="flex w-full items-center justify-between py-20 mb-4 max-w-6xl mx-auto">
            <div className="flex flex-col items-center flex-1 gap-4">
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
                {baseMatch.home.code}
              </span>
              <img 
                src={`/logos/${baseMatch.home.code.toLowerCase()}.png`} 
                alt={baseMatch.home.name}
                style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.9 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-2xl md:text-3xl tracking-[0.3em] uppercase font-light text-center mt-2">
                {baseMatch.home.name}
              </span>
            </div>

            <div className="flex flex-col items-center shrink-0 mx-4 md:mx-8">
              <div className="flex items-center gap-4 md:gap-8">
                <span className="text-[10rem] md:text-[14rem] font-black leading-none text-white">
                  {baseMatch.homeScore ?? 0}
                </span>
                <span className="text-[2.5rem] md:text-[4rem] font-light text-[rgba(255,255,255,0.3)]">
                  —
                </span>
                <span className="text-[10rem] md:text-[14rem] font-black leading-none text-white">
                  {baseMatch.awayScore ?? 0}
                </span>
              </div>
              <div className="mt-8 flex flex-col items-center gap-1">
                {isLive ? (
                  <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: homePrimary }}>
                    ● LIVE {baseMatch.minute}&apos;
                  </span>
                ) : (
                  <span className="text-xs tracking-[0.2em] text-[rgba(255,255,255,0.4)] uppercase">
                    {baseMatch.status}
                  </span>
                )}
                {details?.reason === 'no_external_id' && (
                  <span className="text-[0.55rem] tracking-[0.1em] text-[rgba(255,255,255,0.2)] mt-2 uppercase">
                    MATCH DATA AVAILABLE AFTER KICKOFF
                  </span>
                )}
                {details?.reason === 'server_error' && (
                  <span className="text-[0.55rem] tracking-[0.1em] text-[rgba(255,255,255,0.2)] mt-2 uppercase">
                    DETAILED STATS TEMPORARILY UNAVAILABLE
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center flex-1 gap-4">
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
                {baseMatch.away.code}
              </span>
              <img 
                src={`/logos/${baseMatch.away.code.toLowerCase()}.png`} 
                alt={baseMatch.away.name}
                style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.9 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-2xl md:text-3xl tracking-[0.3em] uppercase font-light text-center mt-2">
                {baseMatch.away.name}
              </span>
            </div>
          </div>

          <div className="mt-8 mb-24 text-xs tracking-widest text-white/40 uppercase text-center">
            {formatMatchDate(baseMatch.date)} · {baseMatch.group ?? baseMatch.stage.replace(/_/g, " ")} · {baseMatch.stadium === baseMatch.city ? baseMatch.stadium : `${baseMatch.stadium} · ${baseMatch.city}`}
          </div>

          <hr className="w-full max-w-5xl border-[rgba(255,255,255,0.08)] my-0" />

          <div className="w-full max-w-5xl py-16">
            <h2 className="text-xs tracking-[0.3em] text-white/30 mb-8 text-center uppercase">GOALS</h2>
            <div className="w-full flex justify-center">
              {renderGoals()}
            </div>
          </div>

          {(hasStats || status === 'loading') && (
            <>
              <hr className="w-full max-w-5xl border-[rgba(255,255,255,0.08)] my-0" />
              <div className="w-full max-w-5xl py-16">
                <h2 className="text-xs tracking-[0.3em] text-white/30 mb-8 text-center uppercase">MATCH STATS</h2>
                <div className="w-full flex justify-center">
                  {renderStats()}
                </div>
              </div>
            </>
          )}

          <hr className="w-full max-w-5xl border-[rgba(255,255,255,0.08)] my-0" />

          <div className="w-full max-w-5xl py-16">
            <h2 className="text-xs tracking-[0.3em] text-white/30 mb-8 text-center uppercase">LINEUPS</h2>
            {renderLineups()}
          </div>

          <hr className="w-full max-w-5xl border-[rgba(255,255,255,0.08)] my-0" />

          <div className="w-full max-w-5xl py-16">
            <h2 className="text-xs tracking-[0.3em] text-white/30 mb-8 text-center uppercase">OFFICIALS</h2>
            <div className="w-full flex justify-center">
              {renderOfficials()}
            </div>
            {details?.details?.attendance && (
              <div className="w-full text-center mt-6">
                <span className="text-[rgba(255,255,255,0.3)] text-xs tracking-widest uppercase">ATTENDANCE {details.details.attendance.toLocaleString()}</span>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </main>
  );
}
