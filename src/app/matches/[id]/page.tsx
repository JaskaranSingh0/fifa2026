"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TEAM_BRANDING } from "@/lib/data/team-branding";

const formatMatchDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  }).toUpperCase();
};

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [baseMatch, setBaseMatch] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

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
      return <div className="text-[rgba(255,255,255,0.3)] text-sm tracking-[0.2em] uppercase text-center w-full">░░░░░░░░░░<br/>░░░░░░░░░░<br/>░░░░░░░░░░</div>;
    }
    if (details?.details?.goals?.length > 0) {
      return (
        <div className="flex flex-col gap-4">
          {details.details.goals.map((g: any, i: number) => (
            <div key={i} className="flex gap-6 items-baseline justify-center">
              <span className="w-8 text-right text-sm text-[rgba(255,255,255,0.6)]">{g.minute}&apos;</span>
              <div className="flex flex-col w-48">
                <div className="flex items-center gap-4">
                  <span className="tracking-widest uppercase text-white text-sm">{g.scorer}</span>
                </div>
                {g.assist && (
                  <span className="text-[0.65rem] text-[rgba(255,255,255,0.3)] lowercase ml-2 mt-1">
                    ↳ assist: {g.assist}
                  </span>
                )}
              </div>
            </div>
          ))}
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

  const renderLineups = () => {
    if (status === 'loading') {
      return <div className="text-[rgba(255,255,255,0.3)] text-sm tracking-[0.2em] uppercase text-center w-full">░░░░░░░░░░<br/>░░░░░░░░░░<br/>░░░░░░░░░░</div>;
    }
    
    const homeLineup = details?.details?.homeLineup;
    const awayLineup = details?.details?.awayLineup;

    if (!homeLineup?.startingXI?.length && !awayLineup?.startingXI?.length) {
      return <div className="text-[rgba(255,255,255,0.4)] text-sm tracking-[0.2em] uppercase text-center w-full">LINEUPS ANNOUNCED CLOSER TO KICKOFF</div>;
    }

    return (
      <div className="flex flex-col md:flex-row w-full justify-between gap-16 md:gap-24 px-4 md:px-12">
        <div className="flex-1">
          <h3 className="tracking-widest uppercase text-white/50 mb-8 text-sm md:text-base border-b border-[rgba(255,255,255,0.08)] pb-4">
            {baseMatch.home.name} {homeLineup?.formation ? `(${homeLineup.formation})` : ''}
          </h3>
          <div className="flex flex-col gap-3">
            {homeLineup?.startingXI?.map((p: any, i: number) => (
              <div key={i} className="flex gap-4 items-center">
                <span className="w-6 text-right text-[rgba(255,255,255,0.4)] text-xs">{p.shirtNumber}</span>
                <span className="text-white flex-1 text-sm">{p.name}</span>
                <span className="text-[0.6rem] text-[rgba(255,255,255,0.3)] uppercase tracking-widest w-8 text-right">{p.position}</span>
              </div>
            ))}
          </div>
          {homeLineup?.bench?.length > 0 && (
            <>
              <h4 className="tracking-widest uppercase text-[rgba(255,255,255,0.3)] mt-12 mb-6 text-xs">BENCH</h4>
              <div className="flex flex-col gap-3">
                {homeLineup.bench.map((p: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center">
                    <span className="w-6 text-right text-[rgba(255,255,255,0.3)] text-xs">{p.shirtNumber}</span>
                    <span className="text-[rgba(255,255,255,0.6)] flex-1 text-sm">{p.name}</span>
                    <span className="text-[0.6rem] text-[rgba(255,255,255,0.2)] uppercase tracking-widest w-8 text-right">{p.position}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex-1 mt-16 md:mt-0">
          <h3 className="tracking-widest uppercase text-white/50 mb-8 text-sm md:text-base md:text-right border-b border-[rgba(255,255,255,0.08)] pb-4">
            {baseMatch.away.name} {awayLineup?.formation ? `(${awayLineup.formation})` : ''}
          </h3>
          <div className="flex flex-col gap-3">
            {awayLineup?.startingXI?.map((p: any, i: number) => (
              <div key={i} className="flex gap-4 items-center md:flex-row-reverse">
                <span className="w-6 text-left md:text-right text-[rgba(255,255,255,0.4)] text-xs">{p.shirtNumber}</span>
                <span className="text-white flex-1 md:text-right text-sm">{p.name}</span>
                <span className="text-[0.6rem] text-[rgba(255,255,255,0.3)] uppercase tracking-widest w-8 text-left">{p.position}</span>
              </div>
            ))}
          </div>
          {awayLineup?.bench?.length > 0 && (
            <>
              <h4 className="tracking-widest uppercase text-[rgba(255,255,255,0.3)] mt-12 mb-6 text-xs md:text-right">BENCH</h4>
              <div className="flex flex-col gap-3">
                {awayLineup.bench.map((p: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center md:flex-row-reverse">
                    <span className="w-6 text-left md:text-right text-[rgba(255,255,255,0.3)] text-xs">{p.shirtNumber}</span>
                    <span className="text-[rgba(255,255,255,0.6)] flex-1 md:text-right text-sm">{p.name}</span>
                    <span className="text-[0.6rem] text-[rgba(255,255,255,0.2)] uppercase tracking-widest w-8 text-left">{p.position}</span>
                  </div>
                ))}
              </div>
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
                {details?.reason === 'api_error' && (
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
          </div>

        </motion.div>
      </div>
    </main>
  );
}
