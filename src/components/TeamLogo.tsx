"use client";

/**
 * TeamLogo.tsx — Reusable team emblem component
 *
 * Renders an inline SVG circle with the team's national colors and code.
 * Architecture supports swapping to real logo assets:
 *   → Drop a PNG/SVG into /public/logos/{CODE}.png
 *   → The component will prefer it over the generated mark
 *
 * Design: minimal circular mark with team primary color background
 * and the 3-letter code in a contrasting color. Consistent with
 * the editorial aesthetic — looks intentional, not placeholder.
 */

import React, { useState } from "react";
import Image from "next/image";
import { getTeam } from "@/lib/data/teams";

interface TeamLogoProps {
  code: string;
  size?: number;
  className?: string;
}

/**
 * Determines if white or black text has better contrast against a background.
 * Uses relative luminance calculation (WCAG 2.1).
 */
function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? "#000000" : "#FFFFFF";
}

export default function TeamLogo({ code, size = 28, className }: TeamLogoProps) {
  const team = getTeam(code);
  const [imgError, setImgError] = useState(false);
  const [primary] = team.colors;
  const textColor = contrastColor(primary);

  // Font size scales with circle size — stays readable at any dimension
  const fontSize = Math.max(size * 0.3, 7);

  // Try real logo first
  const logoPath = `/logos/${code.toLowerCase()}.png`;

  if (!imgError) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 relative overflow-hidden rounded-full ${className || ''}`}
        style={{
          width: size,
          height: size,
        }}
      >
        <Image
          src={logoPath}
          alt={team.name}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </span>
    );
  }

  // Fallback: generated SVG mark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={team.name}
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Background circle */}
      <circle
        cx="20"
        cy="20"
        r="19"
        fill={primary}
      />
      {/* Subtle inner ring */}
      <circle
        cx="20"
        cy="20"
        r="17.5"
        fill="none"
        stroke={textColor}
        strokeWidth="0.5"
        opacity="0.15"
      />
      {/* Team code */}
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={fontSize > 10 ? "11" : "9"}
        fontWeight="700"
        fontFamily="'Inter', system-ui, sans-serif"
        letterSpacing="0.5"
      >
        {code}
      </text>
    </svg>
  );
}
