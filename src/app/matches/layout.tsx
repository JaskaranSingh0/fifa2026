import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches | FIFA World Cup 2026",
  description:
    "Every fixture of the FIFA World Cup 2026 — live scores, local kickoff times, and results across all 104 matches.",
};

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
