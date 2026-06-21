import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bracket | FIFA World Cup 2026",
  description:
    "The road to the final — follow the knockout stage of the FIFA World Cup 2026 all the way to MetLife Stadium.",
};

export default function BracketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
