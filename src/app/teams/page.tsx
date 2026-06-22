import type { Metadata } from "next";
import TeamsExperience from "@/components/globe/TeamsExperience";

export const metadata: Metadata = {
  title: "Teams | FIFA World Cup 2026",
  description: "Explore all 48 nations competing in the FIFA World Cup 2026.",
};

export default function TeamsPage() {
  return (
    <main className="w-full h-[100dvh] bg-[#050505]">
      <TeamsExperience />
    </main>
  );
}
