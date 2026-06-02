import type { Metadata } from "next";
import { RankingHubClient } from "@/components/leaderboard/RankingHubClient";
import {
  professionStats,
  countTalentsByProfession,
  allCategoryStats,
} from "@/lib/profession-stats";
import {
  PROFESSIONS,
  PROFESSION_CATEGORIES,
  type ProfessionCategoryId,
} from "@/lib/professions";
import { TALENTS, talentProfessionId } from "@/lib/mock-talents";

export const metadata: Metadata = {
  title: "Classements — TalentRank",
  description:
    "Découvre les meilleurs talents du monde, classés métier par métier. Pas de mix. Pas de bruit. Un classement, un métier.",
};

// ─────────────────────────────────────────────────────────────────────────────
// /ranking — Hub des classements (REFONTE-P1).
//
// Server Component qui prépare 3 jeux de données :
//   1. professions (pour la search) — id + label + category + count + topScore
//   2. categories — les 9 catégories actives avec leurs stats
//   3. trending — les 6 métiers les plus "chauds" avec leur mini-podium top 3
//
// Le tout est passé à <RankingHubClient> qui assemble l'UI.
// ─────────────────────────────────────────────────────────────────────────────

export default function RankingPage() {
  const stats = professionStats();
  const counts = countTalentsByProfession();

  // 1. Toutes les professions (avec ou sans talent) — pour la search
  const flatProfessions = PROFESSIONS.map((p) => {
    const stat = stats.find((s) => s.profession.id === p.id);
    return {
      id: p.id,
      label: p.label,
      frLabel: p.frLabel,
      category: p.category,
      talentCount: counts[p.id] ?? 0,
      topScore: stat?.topScore ?? null,
    };
  });

  // 2. Catégories actives (au moins un métier avec talents) + top 9
  const catStats = allCategoryStats();
  const categories = catStats
    .filter((c) => c.talentCount > 0)
    .slice(0, 9)
    .map((c) => {
      const meta = PROFESSION_CATEGORIES.find((cat) => cat.id === c.categoryId)!;
      return {
        id: c.categoryId,
        frLabel: meta.frLabel,
        color: meta.color,
        talentCount: c.talentCount,
        professionCount: c.professionCount,
      };
    });

  // 3. Trending — les 6 métiers avec le plus de talents, avec leur top 3
  const trending = stats.slice(0, 6).map((s) => {
    const talents = TALENTS.filter((t) => talentProfessionId(t) === s.profession.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const podium = talents.map((t, i) => ({
      rank: (i + 1) as 1 | 2 | 3,
      slug: t.slug,
      name: t.name,
      initials: t.initials,
      score: t.score,
      countryCode: t.countryCode,
      city: t.city,
    }));
    // Delta hebdo mocké : entre 0 et 8 places, basé sur l'id pour stabilité
    const seed = s.profession.id
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const delta = seed % 9; // 0..8
    return {
      professionId: s.profession.id,
      professionLabel: s.profession.frLabel,
      categoryId: s.profession.category as ProfessionCategoryId,
      talentCount: s.talentCount,
      podium,
      deltaThisWeek: delta > 0 ? delta : undefined,
    };
  });

  return (
    <RankingHubClient
      professions={flatProfessions}
      categories={categories}
      trending={trending}
    />
  );
}
