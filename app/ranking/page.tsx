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

  // 2. Catégories actives, enrichies pour le design "championnat" :
  //    - top1Talent (avatar + score du #1 de la catégorie)
  //    - subSpecialties (4 métiers les plus représentés)
  //    - mostActive = la catégorie avec le plus de talents (badge LE PLUS ACTIF)
  const catStats = allCategoryStats();
  const activeCategoriesRaw = catStats.filter((c) => c.talentCount > 0);
  const mostActiveCategoryId = activeCategoriesRaw.length
    ? [...activeCategoriesRaw].sort((a, b) => b.talentCount - a.talentCount)[0]
        .categoryId
    : null;

  const categories = activeCategoriesRaw.slice(0, 9).map((c) => {
    const meta = PROFESSION_CATEGORIES.find((cat) => cat.id === c.categoryId)!;

    // Top 1 talent de la catégorie (meilleur score)
    const top1 = c.topTalents[0] ?? null;

    // Sous-spécialités = 4 premiers métiers de la catégorie qui ont au moins
    // 1 talent (en ordre canonique). Affichage type "Animateurs · VFX · …".
    const subSpecialties = PROFESSIONS.filter(
      (p) =>
        p.category === c.categoryId &&
        (counts[p.id] ?? 0) > 0,
    )
      .slice(0, 4)
      .map((p) => p.frShort || p.short || p.frLabel);

    return {
      id: c.categoryId,
      frLabel: meta.frLabel,
      color: meta.color,
      talentCount: c.talentCount,
      professionCount: c.professionCount,
      isMostActive: c.categoryId === mostActiveCategoryId,
      subSpecialties,
      top1: top1
        ? {
            name: top1.name,
            initials: top1.initials,
            score: top1.score,
            slug: top1.slug,
          }
        : null,
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
