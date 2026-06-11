"use client";

/**
 * PlaceholderPage.tsx
 *
 * Shared layout for all section placeholder pages.
 * Each section will eventually have its own immersive experience.
 * For now, this provides a clean, on-brand holding page.
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  accentChar: string;
}

export default function PlaceholderPage({
  title,
  subtitle,
  accentChar,
}: PlaceholderPageProps) {
  return (
    <main
      className="fixed inset-0 overflow-hidden bg-[#050505] flex flex-col items-center justify-center"
      style={{ width: "100dvw", height: "100dvh" }}
    >
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="absolute top-6 left-6 md:top-8 md:left-8 lg:left-12 z-10"
      >
        <Link
          href="/"
          className="text-white hover:text-[#00D1FF] transition-colors duration-300"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.7rem",
            fontWeight: 300,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            opacity: 0.45,
          }}
          aria-label="Back to homepage"
        >
          ← Back
        </Link>
      </motion.div>

      {/* Large background character */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.02, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(12rem, 28vw, 30rem)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          {accentChar}
        </span>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.55rem, 0.9vw, 0.72rem)",
            fontWeight: 300,
            color: "#00D1FF",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
            opacity: 0.8,
          }}
        >
          FIFA World Cup 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 7rem)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            lineHeight: 1,
            marginBottom: "2rem",
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "0.08em",
            opacity: 0.3,
          }}
        >
          {subtitle}
        </motion.p>

        {/* Thin accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto mt-10"
          style={{
            width: "40px",
            height: "1px",
            background: "rgba(0, 209, 255, 0.5)",
            transformOrigin: "center",
          }}
        />
      </div>
    </main>
  );
}
