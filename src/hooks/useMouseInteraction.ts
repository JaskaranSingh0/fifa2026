/**
 * useMouseInteraction.ts
 *
 * Normalises mouse and touch input into a unified interface.
 * Provides:
 *  - mousePos: normalised [-1, 1] cursor position
 *  - clickPos: last click/tap position (null when idle)
 *  - isTouching: whether a finger is currently on screen
 *  - reducedMotion: respects prefers-reduced-motion
 *
 * All interaction values are suitable for direct consumption by
 * the particle system's attraction and burst functions.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface MouseInteractionState {
  mousePos: { x: number; y: number };
  clickPos: { x: number; y: number } | null;
  isTouching: boolean;
  reducedMotion: boolean;
}

export function useMouseInteraction(): MouseInteractionState {
  const [state, setState] = useState<MouseInteractionState>({
    mousePos: { x: 0, y: 0 },
    clickPos: null,
    isTouching: false,
    reducedMotion: false,
  });

  // Track reduced motion preference
  const reducedMotionRef = useRef(false);

  // Use refs for high-frequency updates to avoid React re-render overhead.
  // The particle system reads from these refs each frame.
  const mousePosRef = useRef({ x: 0, y: 0 });
  const clickPosRef = useRef<{ x: number; y: number } | null>(null);
  const isTouchingRef = useRef(false);

  // Clear click burst after it has been consumed
  const clearClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalise = useCallback((clientX: number, clientY: number) => ({
    x: (clientX / window.innerWidth) * 2 - 1,
    y: -((clientY / window.innerHeight) * 2 - 1),
  }), []);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    setState((prev) => ({ ...prev, reducedMotion: mq.matches }));

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      setState((prev) => ({ ...prev, reducedMotion: e.matches }));
    };
    mq.addEventListener("change", handleMotionChange);

    // Mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (reducedMotionRef.current) return;
      const pos = normalise(e.clientX, e.clientY);
      mousePosRef.current = pos;
      setState((prev) => ({ ...prev, mousePos: pos }));
    };

    // Mouse click
    const handleClick = (e: MouseEvent) => {
      if (reducedMotionRef.current) return;
      const pos = normalise(e.clientX, e.clientY);
      clickPosRef.current = pos;
      setState((prev) => ({ ...prev, clickPos: pos }));

      // Auto-clear the burst trigger after 100ms
      if (clearClickTimeout.current) clearTimeout(clearClickTimeout.current);
      clearClickTimeout.current = setTimeout(() => {
        clickPosRef.current = null;
        setState((prev) => ({ ...prev, clickPos: null }));
      }, 100);
    };

    // Touch start
    const handleTouchStart = (e: TouchEvent) => {
      isTouchingRef.current = true;
      setState((prev) => ({ ...prev, isTouching: true }));
      if (reducedMotionRef.current) return;
      const touch = e.touches[0];
      const pos = normalise(touch.clientX, touch.clientY);
      mousePosRef.current = pos;
      setState((prev) => ({ ...prev, mousePos: pos }));
    };

    // Touch move — drives particle attraction on mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (reducedMotionRef.current) return;
      const touch = e.touches[0];
      const pos = normalise(touch.clientX, touch.clientY);
      mousePosRef.current = pos;
      setState((prev) => ({ ...prev, mousePos: pos }));
    };

    // Touch end — trigger burst on tap
    const handleTouchEnd = (e: TouchEvent) => {
      isTouchingRef.current = false;
      setState((prev) => ({ ...prev, isTouching: false }));

      if (reducedMotionRef.current) return;
      // Use changedTouches for the release position
      const touch = e.changedTouches[0];
      if (touch) {
        const pos = normalise(touch.clientX, touch.clientY);
        clickPosRef.current = pos;
        setState((prev) => ({ ...prev, clickPos: pos }));

        if (clearClickTimeout.current) clearTimeout(clearClickTimeout.current);
        clearClickTimeout.current = setTimeout(() => {
          clickPosRef.current = null;
          setState((prev) => ({ ...prev, clickPos: null }));
        }, 100);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      mq.removeEventListener("change", handleMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (clearClickTimeout.current) clearTimeout(clearClickTimeout.current);
    };
  }, [normalise]);

  return state;
}
