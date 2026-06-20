"use client";

import { useEffect, useState } from "react";

/**
 * usePrefersReducedMotion — reactive `(prefers-reduced-motion: reduce)`.
 *
 * SSR-safe (starts `false`), syncs on mount, and updates live if the OS
 * setting changes mid-session. Used to quiet the rAF-driven 3D motion
 * (globe auto-rotation, space dust) that a global CSS media query and
 * framer-motion's <MotionConfig reducedMotion="user"> can't reach.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default usePrefersReducedMotion;
