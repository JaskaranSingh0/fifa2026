"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "MATCHES",  href: "/matches"  },
  { label: "TEAMS",    href: "/teams"    },
  { label: "STADIUMS", href: "/stadiums" },
  { label: "GROUPS",   href: "/groups"   },
  { label: "BRACKET",  href: "/bracket"  },
] as const;

export default function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Hide on homepage — it has its own cinematic navigation
  const isHomepage = pathname === "/";
  
  // Determine active section from current path
  const activeSection = NAV_ITEMS.find(item => 
    pathname === item.href || pathname.startsWith(item.href + "/")
  )?.href ?? null;

  // Subtle background on scroll
  useEffect(() => {
    if (isHomepage) return;
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  if (isHomepage) return null;

  return (
    <nav
      aria-label="Site navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(1rem, 4vw, 3rem)",
        background: scrolled 
          ? "rgba(5,5,5,0.92)" 
          : "linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
        transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease",
      }}
    >
      {/* Left: Brand mark */}
      <Link
        href="/"
        aria-label="Back to home"
        style={{
          textDecoration: "none",
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
          transition: "color 0.25s ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
      >
        WC <span style={{ opacity: 0.5 }}>·</span> 2026
      </Link>

      {/* Right: Section links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(1rem, 2.5vw, 2.5rem)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                textDecoration: "none",
                fontSize: "0.55rem",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isActive 
                  ? "rgba(255,255,255,0.9)" 
                  : "rgba(255,255,255,0.22)",
                borderBottom: isActive 
                  ? "1px solid rgba(255,255,255,0.4)" 
                  : "1px solid transparent",
                paddingBottom: "1px",
                transition: "color 0.25s ease, border-color 0.25s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.22)";
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
