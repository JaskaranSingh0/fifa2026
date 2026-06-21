"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide on homepage — it has its own cinematic navigation
  const isHomepage = pathname === "/";

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

  // Close the mobile menu on navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (isHomepage) return null;

  return (
    <>
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

        {/* Right: inline links (desktop) */}
        <div className="hidden md:flex items-center" style={{ gap: "clamp(1rem, 2.5vw, 2.5rem)" }}>
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
                  color: isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.65)",
                  borderBottom: isActive ? "1px solid rgba(255,255,255,0.55)" : "1px solid transparent",
                  paddingBottom: "1px",
                  transition: "color 0.25s ease, border-color 0.25s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: hamburger (mobile) */}
        <button
          className="flex md:hidden items-center justify-center"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, margin: -6, color: "#fff" }}
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
              <path d="M0 1h20M0 7h20M0 13h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 90,
              background: "rgba(5,5,5,0.98)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(1.5rem, 5vw, 2.5rem)",
            }}
          >
            {NAV_ITEMS.map((item, i) => {
              const isActive = activeSection === item.href;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    style={{
                      textDecoration: "none",
                      fontSize: "clamp(1.6rem, 8vw, 2.4rem)",
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
