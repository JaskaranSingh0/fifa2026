"use client";

/**
 * IntroVideo.tsx — fullscreen cinematic intro (the rendered reference video).
 *
 * Plays /intro/intro.mp4 cover-fit after the user clicks Enter, then calls
 * onComplete on end / error / safety-timeout so the page can crossfade into the
 * live particle universe. Muted + playsInline so autoplay is allowed; honours
 * prefers-reduced-motion by skipping straight through. The page's existing
 * "Skip Intro" button also drives onComplete.
 */

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface IntroVideoProps {
  onComplete: () => void;
  reducedMotion?: boolean;
}

export default function IntroVideo({ onComplete, reducedMotion }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (safetyRef.current) clearTimeout(safetyRef.current);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (reducedMotion) {
      finish();
      return;
    }
    // Fallback in case metadata never loads or autoplay is blocked
    safetyRef.current = setTimeout(finish, 15000);
    videoRef.current?.play().catch(() => finish());
    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, [reducedMotion, finish]);

  // Re-arm the safety net to just past the real clip length
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !isFinite(video.duration)) return;
    if (safetyRef.current) clearTimeout(safetyRef.current);
    safetyRef.current = setTimeout(finish, (video.duration + 1.5) * 1000);
  };

  if (reducedMotion) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ position: "absolute", inset: 0, zIndex: 1, background: "#000" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      >
        <source src="/intro/intro.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}
