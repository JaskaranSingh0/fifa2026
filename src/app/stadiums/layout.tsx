import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stadiums | FIFA World Cup 2026",
  description:
    "The 16 host venues of the FIFA World Cup 2026 across the USA, Mexico, and Canada — capacities, fixtures, and stories.",
};

export default function StadiumsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
