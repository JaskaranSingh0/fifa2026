"use client";

/**
 * GlobeLoader.tsx — branded loading veil for the Teams globe. The Earth textures
 * (blue-marble, night, clouds, specular, topology) are several MB and previously
 * loaded behind a blank `Suspense fallback={null}`. This reads the R3F loading
 * manager via drei's useProgress and shows a cinematic counter until the world is
 * ready, then lifts away.
 */

import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobeLoader() {
  const { active, progress } = useProgress();
  const pct = Math.min(100, Math.round(progress));

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
          style={{ background: "#050505" }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "1.5rem",
            }}
          >
            Assembling the World
          </span>

          {/* Counter */}
          <span
            className="tabular-nums"
            style={{
              fontSize: "clamp(3rem, 9vw, 7rem)",
              fontWeight: 200,
              letterSpacing: "0.04em",
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            {String(pct).padStart(2, "0")}
          </span>

          {/* Progress rail */}
          <div
            style={{
              marginTop: "2rem",
              width: "min(220px, 60vw)",
              height: "1px",
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(to right, rgba(0,209,255,0.7), #ffffff)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
