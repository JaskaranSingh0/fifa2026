import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Groups | FIFA World Cup 2026",
  description: "Group stage draw, standings, and results for the FIFA World Cup 2026.",
};

export default function GroupsPage() {
  return (
    <PlaceholderPage
      title="Groups"
      subtitle="12 groups. 4 teams each. The path to glory begins here."
      accentChar="G"
    />
  );
}
