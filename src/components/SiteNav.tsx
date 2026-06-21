"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveNowBadge from "@/components/LiveNowBadge";

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
      {/* Left: Brand mark + live pulse */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.75rem, 2vw, 1.25rem)" }}>
      <Link
        href="/"
        aria-label="Back to home"
        style={{
          textDecoration: "none",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.65)",
          textTransform: "uppercase",
          transition: "color 0.25s ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
      >
        WC <span style={{ opacity: 0.6 }}>·</span> 2026
      </Link>
      <LiveNowBadge compact />
      </div>

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
                fontSize: "0.72rem",
                fontWeight: isActive ? 600 : 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isActive
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.65)",
                borderBottom: isActive
                  ? "1px solid rgba(255,255,255,0.55)"
                  : "1px solid transparent",
                paddingBottom: "1px",
                transition: "color 0.25s ease, border-color 0.25s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.95)";
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.65)";
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
