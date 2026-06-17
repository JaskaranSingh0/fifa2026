"use client";

/**
 * MusicProvider.tsx — site-wide background music.
 *
 * Lives in the root layout, so the <audio> element survives client-side
 * navigation and keeps playing across every page. Exposes a context:
 *   start()       → begin the cinematic track at FULL volume (homepage Enter)
 *   toggleMute()  → mute / unmute
 *   started, muted
 *
 * Volume curve: full volume for the first 30s, then a smooth fade to a 40%
 * "background" level that stays for the rest of the session (including later
 * tracks / loops). Add more tracks to TRACKS and they play in sequence, looping.
 *
 * On pages other than the homepage, music auto-starts at background level on the
 * first user interaction (browsers block silent-start audio without a gesture).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

// Add more tracks here later — they play in order, then loop.
const TRACKS = ["/intro/champions.mp3"];

const BG_VOLUME = 0.4;        // background level after the intro swell
const FULL_DURATION = 30000;  // ms at full volume before ducking
const DUCK_DURATION = 2500;   // fade length

interface MusicContextValue {
  started: boolean;
  muted: boolean;
  start: () => void;
  toggleMute: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within <MusicProvider>");
  return ctx;
}

export default function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackIndex = useRef(0);
  const baseVolume = useRef(1); // intended volume, independent of mute
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const pathname = usePathname();

  // Cinematic start — full volume (homepage Enter gesture)
  const start = useCallback(() => {
    const a = audioRef.current;
    if (!a || started) return;
    setStarted(true);
    trackIndex.current = 0;
    baseVolume.current = 1;
    a.currentTime = 0;
    a.volume = 1;
    a.muted = muted;
    a.play().catch(() => {});
  }, [started, muted]);

  // Quiet start — background level (incidental first interaction on a subpage)
  const startBackground = useCallback(() => {
    const a = audioRef.current;
    if (!a || started) return;
    setStarted(true);
    trackIndex.current = 0;
    baseVolume.current = BG_VOLUME;
    a.currentTime = 0;
    a.volume = BG_VOLUME;
    a.muted = muted;
    a.play().catch(() => {});
  }, [started, muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  // Advance the playlist on track end, looping; hold the background volume.
  const handleEnded = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    trackIndex.current = (trackIndex.current + 1) % TRACKS.length;
    a.src = TRACKS[trackIndex.current];
    a.currentTime = 0;
    a.volume = baseVolume.current;
    a.play().catch(() => {});
  }, []);

  // Volume curve: full → 40% after 30s, then stay.
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const step = () => {
        const p = Math.min((performance.now() - t0) / DUCK_DURATION, 1);
        baseVolume.current = 1 + (BG_VOLUME - 1) * p;
        if (audioRef.current && !audioRef.current.muted) {
          audioRef.current.volume = baseVolume.current;
        }
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, FULL_DURATION);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [started]);

  // Auto-start at background level on first interaction (non-homepage only —
  // the homepage starts via the Enter gesture for the full cinematic swell).
  useEffect(() => {
    if (started || pathname === "/") return;
    const onFirst = () => startBackground();
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("keydown", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, [started, pathname, startBackground]);

  return (
    <MusicContext.Provider value={{ started, muted, start, toggleMute }}>
      <audio ref={audioRef} src={TRACKS[0]} preload="auto" onEnded={handleEnded} />
      {children}

      {/* Global mute toggle — appears once music is playing */}
      {started && (
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute music" : "Mute music"}
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
            color: "rgba(255,255,255,0.7)",
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
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M19 5a9 9 0 0 1 0 14" />
            </svg>
          )}
        </button>
      )}
    </MusicContext.Provider>
  );
}
