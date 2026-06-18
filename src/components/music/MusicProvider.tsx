"use client";

/**
 * MusicProvider.tsx — site-wide background music.
 *
 * Lives in the root layout, so the <audio> element survives client-side
 * navigation. Behaviour:
 *   - Starts on the homepage "Enter" gesture (start()), from the top.
 *   - Plays ONCE — when the track ends it stops (no loop).
 *   - Never auto-starts on incidental clicks; the only ways to start it are the
 *     intro Enter or the always-visible music toggle.
 *   - Volume curve: full for the first 30s, then a smooth fade to 40%.
 *   - The toggle is always on-screen (bottom-left): click to play-from-start,
 *     click again to stop.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const TRACK = "/intro/champions.mp3";
const BG_VOLUME = 0.4;        // level after the opening swell
const FULL_DURATION = 30000;  // ms at full volume before ducking
const DUCK_DURATION = 2500;   // fade length

interface MusicContextValue {
  playing: boolean;
  start: () => void;   // cinematic start (homepage Enter) — from the top
  toggle: () => void;  // music-icon click — play-from-start / stop
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within <MusicProvider>");
  return ctx;
}

export default function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRaf = useRef(0);
  const [playing, setPlaying] = useState(false);

  const clearFade = useCallback(() => {
    if (fadeTimer.current) { clearTimeout(fadeTimer.current); fadeTimer.current = null; }
    if (fadeRaf.current) { cancelAnimationFrame(fadeRaf.current); fadeRaf.current = 0; }
  }, []);

  // Always restarts from the beginning, then runs the full → 40% volume curve.
  const playFromStart = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    clearFade();
    a.currentTime = 0;
    a.volume = 1;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    fadeTimer.current = setTimeout(() => {
      const t0 = performance.now();
      const step = () => {
        const p = Math.min((performance.now() - t0) / DUCK_DURATION, 1);
        if (audioRef.current) audioRef.current.volume = 1 + (BG_VOLUME - 1) * p;
        if (p < 1) fadeRaf.current = requestAnimationFrame(step);
      };
      fadeRaf.current = requestAnimationFrame(step);
    }, FULL_DURATION);
  }, [clearFade]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    clearFade();
    a.pause();
    setPlaying(false);
  }, [clearFade]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else playFromStart();
  }, [playing, stop, playFromStart]);

  // Track finished → stop. No loop, no advance.
  const handleEnded = useCallback(() => {
    clearFade();
    setPlaying(false);
  }, [clearFade]);

  useEffect(() => clearFade, [clearFade]); // cleanup on unmount

  return (
    <MusicContext.Provider value={{ playing, start: playFromStart, toggle }}>
      <audio ref={audioRef} src={TRACK} preload="auto" onEnded={handleEnded} />
      {children}

      {/* Always-visible music toggle */}
      <button
        onClick={toggle}
        aria-label={playing ? "Stop music" : "Play music"}
        aria-pressed={playing}
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          zIndex: 60,
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: playing ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "border-color 0.25s ease, color 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = playing ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)";
        }}
      >
        {playing ? (
          // Sound on
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 5a9 9 0 0 1 0 14" />
          </svg>
        ) : (
          // Muted
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        )}
      </button>
    </MusicContext.Provider>
  );
}
