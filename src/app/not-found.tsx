import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "var(--font-inter, 'Inter', sans-serif)",
      }}
    >
      <div
        style={{
          fontSize: "clamp(6rem, 22vw, 16rem)",
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: "0.02em",
          color: "rgba(255,255,255,0.06)",
        }}
      >
        404
      </div>
      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Off the pitch
      </p>
      <p
        style={{
          marginTop: "1rem",
          maxWidth: 420,
          fontSize: "0.95rem",
          lineHeight: 1.7,
          fontWeight: 300,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        This page isn&rsquo;t part of the tournament. Let&rsquo;s get you back to the action.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "2.5rem",
          padding: "0.8rem 2rem",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 999,
          color: "rgba(255,255,255,0.8)",
          textDecoration: "none",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        Enter the Universe
      </Link>
    </main>
  );
}
