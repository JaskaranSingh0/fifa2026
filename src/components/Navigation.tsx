"use client";

/**
 * Navigation.tsx
 *
 * GSAP-powered portal navigation for the FIFA World Cup 2026 homepage.
 *
 * Each nav item is a "destination" — not a button.
 * Hover triggers an elegant GSAP animation:
 *   - Hovered item: scale up, full brightness, wider letter spacing
 *   - All other items: fade to ~40% opacity
 *
 * The component fires onNavHover(state) to wire the particle system
 * to display nav-specific particle formations.
 */

import React, { useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ParticleState } from "@/lib/particle-system";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { label: "MATCHES", href: "/matches", state: ParticleState.HOVER_MATCHES },
  { label: "TEAMS", href: "/teams", state: ParticleState.HOVER_TEAMS },
  { label: "STADIUMS", href: "/stadiums", state: ParticleState.HOVER_STADIUMS },
  { label: "GROUPS", href: "/groups", state: ParticleState.HOVER_GROUPS },
  { label: "BRACKET", href: "/bracket", state: ParticleState.HOVER_BRACKET },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NavigationProps {
  onNavHover: (state: ParticleState) => void;
  isVisible: boolean;        // Controlled by intro sequence
  reducedMotion: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Navigation({
  onNavHover,
  isVisible,
  reducedMotion,
}: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeHoverIndex = useRef<number | null>(null);
  const gsapCtx = useRef<gsap.Context | null>(null);

  // Create GSAP context — cleans up animations on unmount
  useEffect(() => {
    gsapCtx.current = gsap.context(() => {}, navRef);
    return () => gsapCtx.current?.revert();
  }, []);

  // ---------------------------------------------------------------------------
  // Hover in
  // ---------------------------------------------------------------------------
  const handleMouseEnter = useCallback(
    (index: number) => {
      activeHoverIndex.current = index;
      onNavHover(NAV_ITEMS[index].state);

      if (reducedMotion) return;

      gsapCtx.current?.add(() => {
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          if (i === index) {
            // Active item: scale up, full brightness, wider tracking
            gsap.to(el, {
              scale: 1.06,
              opacity: 1,
              letterSpacing: "0.32em",
              duration: 0.4,
              ease: "power2.out",
            });
          } else {
            // Inactive items: fade back
            gsap.to(el, {
              scale: 1,
              opacity: 0.22,
              letterSpacing: "0.25em",
              duration: 0.35,
              ease: "power2.out",
            });
          }
        });
      });
    },
    [onNavHover, reducedMotion]
  );

  // ---------------------------------------------------------------------------
  // Hover out (reset)
  // ---------------------------------------------------------------------------
  const handleMouseLeave = useCallback(() => {
    activeHoverIndex.current = null;
    onNavHover(ParticleState.IDLE);

    if (reducedMotion) return;

    gsapCtx.current?.add(() => {
      itemRefs.current.forEach((el) => {
        if (!el) return;
        gsap.to(el, {
          scale: 1,
          opacity: 1,
          letterSpacing: "0.25em",
          duration: 0.4,
          ease: "power2.out",
        });
      });
    });
  }, [onNavHover, reducedMotion]);

  // ---------------------------------------------------------------------------
  // Keyboard focus — same visual treatment as hover
  // ---------------------------------------------------------------------------
  const handleFocus = useCallback(
    (index: number) => handleMouseEnter(index),
    [handleMouseEnter]
  );
  const handleBlur = useCallback(() => handleMouseLeave(), [handleMouseLeave]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className={`
        relative z-20 flex flex-col md:flex-row
        items-center justify-center
        gap-8 md:gap-10 lg:gap-14
        transition-opacity duration-700
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {NAV_ITEMS.map((item, index) => (
        <Link
          key={item.label}
          href={item.href}
          ref={(el) => { itemRefs.current[index] = el; }}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          aria-label={`Navigate to ${item.label}`}
          className={`
            nav-item
            font-bold uppercase
            text-white
            select-none
            no-underline
            whitespace-nowrap
            block
            min-h-[48px] md:min-h-0
            flex items-center
            cursor-pointer
            focus-visible:outline-none
            focus-visible:ring-0
          `}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(1.6rem, 3.2vw, 3.2rem)",
            letterSpacing: "0.25em",
            lineHeight: 1,
            // Will-change hint for GPU compositing during GSAP animations
            willChange: "transform, opacity",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
