"use client";

/**
 * RevealText.tsx — editorial per-character "rise" reveal for the massive section
 * headings. Each glyph slides up from behind a clipped baseline with a stagger,
 * the way award-winning sites animate display type. Falls back to a plain fade
 * under prefers-reduced-motion.
 *
 * Renders an <h1> by default; pass `style`/`className` exactly as you would the
 * heading it replaces (font-size, letter-spacing, color, etc.).
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** seconds before the first glyph rises */
  delay?: number;
  /** seconds between glyphs */
  stagger?: number;
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function RevealText({
  text,
  className,
  style,
  delay = 0,
  stagger = 0.035,
}: RevealTextProps) {
  const reduced = useReducedMotion();
  const chars = Array.from(text);

  if (reduced) {
    return (
      <motion.h1
        className={className}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {text}
      </motion.h1>
    );
  }

  return (
    <motion.h1
      className={className}
      aria-label={text}
      // overflow hidden turns the heading box into the clip mask for the rising glyphs
      style={{ ...style, overflow: "hidden" }}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre", willChange: "transform" }}
          variants={{
            hidden: { y: "115%" },
            visible: { y: 0, transition: { duration: 0.72, ease: EASE } },
          }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.h1>
  );
}
