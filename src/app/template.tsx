"use client";

/**
 * template.tsx — re-mounts on every navigation (unlike layout.tsx), so it's the
 * natural home for an enter transition. We render a branded "curtain" that starts
 * covering the viewport and lifts away to reveal the new route — making every
 * section feel like a room in one building rather than a separate website.
 *
 * The curtain is a self-contained fixed overlay: it never wraps or transforms the
 * page content, so it can't break the homepage's `position: fixed` particle canvas
 * or the fixed SiteNav (a transformed ancestor would re-anchor fixed descendants).
 */

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {children}

      <motion.div
        key={pathname}
        aria-hidden
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.04 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 8000,
          transformOrigin: "top",
          background: "#050505",
          pointerEvents: "none",
        }}
      >
        {/* Trailing cyan edge that rides down with the curtain */}
        <motion.span
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(0,209,255,0.6), transparent)",
          }}
        />
      </motion.div>
    </>
  );
}
