import type { Metadata } from "next";
import { TalentDashboardHome } from "@/components/dashboard/TalentDashboardHome";
import { TALENTS } from "@/lib/mock-talents";

export const metadata: Metadata = { title: "Accueil — TalentRank" };

// Décision directeur : dashboard talent minimaliste — 1 objectif visible.
// L'ancien TalentDashboardClient (489 lignes) reste dans le repo pour
// référence, mais n'est plus utilisé par la home talent.
export default function TalentDashboardPage() {
  const talent = TALENTS[0];
  return <TalentDashboardHome talent={talent} />;
}
