import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Matches | FIFA World Cup 2026",
  description: "All FIFA World Cup 2026 match schedules, results, and fixtures.",
};

export default function MatchesPage() {
  return (
    <PlaceholderPage
      title="Matches"
      subtitle="Full schedule, results, and live fixtures — coming soon."
      accentChar="M"
    />
  );
}
