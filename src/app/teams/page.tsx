import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Teams | FIFA World Cup 2026",
  description: "Explore all 48 nations competing in the FIFA World Cup 2026.",
};

export default function TeamsPage() {
  return (
    <PlaceholderPage
      title="Teams"
      subtitle="48 nations. One dream. The interactive globe is coming."
      accentChar="T"
    />
  );
}
