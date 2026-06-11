"use client";

/**
 * SearchBar.tsx
 *
 * Minimal search input — no heavy styling, just a clean underline
 * and a subtle focus state. Feels like a terminal command, not a form.
 */

import React, { useRef } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4 w-full max-w-lg">
      {/* Search icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{ opacity: 0.35, flexShrink: 0 }}
      >
        <circle cx="5.5" cy="5.5" r="4.5" stroke="white" strokeWidth="1" />
        <path d="M9.5 9.5L13 13" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Input */}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search team, stadium, city..."
          className="w-full bg-transparent focus:outline-none"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 300,
            letterSpacing: "0.08em",
            color: "#ffffff",
            caretColor: "#00D1FF",
            paddingBottom: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label="Search matches"
        />

        {/* Focus glow underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-px w-full"
          style={{ background: "#00D1FF", scaleX: 0, transformOrigin: "left center" }}
          whileFocus={{ scaleX: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      {/* Result count */}
      {value && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.28)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {resultCount} / {totalCount}
        </motion.span>
      )}
    </div>
  );
}
