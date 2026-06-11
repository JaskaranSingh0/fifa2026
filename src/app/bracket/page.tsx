import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Bracket | FIFA World Cup 2026",
  description: "The knockout stage bracket for the FIFA World Cup 2026 — from Round of 32 to the Final.",
};

export default function BracketPage() {
  return (
    <PlaceholderPage
      title="Bracket"
      subtitle="Round of 32 to the Final — the road to the World Cup."
      accentChar="B"
    />
  );
}
