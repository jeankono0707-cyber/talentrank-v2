import type { ProfessionCategoryId } from "./professions";

// ─────────────────────────────────────────────────────────────────────────────
// Mapping centralisé categoryId → mascotte PNG charte Nadia.
//
// Ces PNG vivent dans /public/brand/ et représentent les "Royaumes" du
// produit. Quand un PNG est défini ici, tous les composants qui affichent
// la catégorie (landing Hero, /metiers/[category], /chasse rayons,
// /ranking Hub, /studio Hero) utilisent l'image au lieu d'une icône Lucide
// ou d'une mascotte SVG.
//
// Pour ajouter une nouvelle mascotte :
//   1. Dépose le PNG dans public/brand/ (transparent, ratio ~1:1)
//   2. Ajoute l'entrée ici
//   3. Tous les composants la prennent en compte automatiquement
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_MASCOTS: Partial<Record<ProfessionCategoryId, string>> = {
  creative: "/brand/CREATION.png",
  tech:     "/brand/TECH.png",
  data:     "/brand/DATA_IA.png",
  health:   "/brand/SANTE.png",
};

/** Retourne le path du PNG mascotte si la catégorie en a un, sinon null. */
export function mascotForCategory(id: ProfessionCategoryId): string | null {
  return CATEGORY_MASCOTS[id] ?? null;
}

/** True si la catégorie a une mascotte PNG (= c'est un "Royaume" mis en avant). */
export function isKingdom(id: ProfessionCategoryId): boolean {
  return CATEGORY_MASCOTS[id] != null;
}
