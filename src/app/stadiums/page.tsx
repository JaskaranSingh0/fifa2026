import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Stadiums | FIFA World Cup 2026",
  description: "Discover all 16 iconic stadiums hosting the FIFA World Cup 2026 across the USA, Canada, and Mexico.",
};

export default function StadiumsPage() {
  return (
    <PlaceholderPage
      title="Stadiums"
      subtitle="16 iconic venues across the USA, Canada, and Mexico."
      accentChar="S"
    />
  );
}
