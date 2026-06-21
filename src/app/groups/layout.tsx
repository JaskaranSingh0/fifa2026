import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groups | FIFA World Cup 2026",
  description:
    "All 12 groups and live standings for the FIFA World Cup 2026 — 48 nations, one road to the knockouts.",
};

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
