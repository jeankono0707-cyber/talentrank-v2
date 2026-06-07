"use client";

import Image from "next/image";
import { mascotForCategory } from "@/lib/category-mascots";
import { iconForCategory } from "@/lib/profession-icons";
import { PROFESSION_CATEGORIES, type ProfessionCategoryId } from "@/lib/professions";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// CategoryMascot — affiche la mascotte 3D PNG si la catégorie en a une,
// sinon fallback sur l'icône Lucide colorée.
//
// Permet de migrer progressivement les composants vers les mascottes charte
// sans refondre toute leur UI — l'icône Lucide reste pour les catégories
// secondaires qui n'ont pas encore de PNG.
//
// USAGE :
//   <CategoryMascot id="creative" size={120} />
//   <CategoryMascot id="business" size={48} fallbackStyle="badge" />
//
// VARIANTS de fallback (quand pas de PNG) :
//   • "badge"   → cadre coloré avec icône Lucide blanche (style sidebar)
//   • "tinted"  → cadre teint cat.color + icône cat.color (style page header)
//   • "icon"    → juste l'icône Lucide brute (pas de cadre)
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  id: ProfessionCategoryId;
  size?: number;
  fallbackStyle?: "badge" | "tinted" | "icon";
  className?: string;
  /** Priorité de chargement Next.js Image (mettre true pour le hero). */
  priority?: boolean;
}

export function CategoryMascot({
  id,
  size = 64,
  fallbackStyle = "tinted",
  className,
  priority = false,
}: Props) {
  const mascotSrc = mascotForCategory(id);
  const cat = PROFESSION_CATEGORIES.find((c) => c.id === id);

  // PNG mascot charte
  if (mascotSrc) {
    return (
      <div
        className={cn("relative shrink-0", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={mascotSrc}
          alt={cat ? `Mascotte ${cat.frLabel}` : "Mascotte"}
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority={priority}
        />
      </div>
    );
  }

  // Fallback Lucide
  const Icon = iconForCategory(id);
  const color = cat?.color ?? "#94A3B8";

  if (fallbackStyle === "icon") {
    return (
      <Icon
        className={cn("shrink-0", className)}
        style={{ color, width: size, height: size }}
        strokeWidth={2.4}
      />
    );
  }

  if (fallbackStyle === "badge") {
    return (
      <span
        className={cn("inline-grid shrink-0 place-items-center rounded-2xl shadow-sm", className)}
        style={{
          background: color,
          width: size,
          height: size,
          borderRadius: Math.max(8, Math.round(size * 0.22)),
        }}
      >
        <Icon
          className="text-white"
          strokeWidth={2.6}
          style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }}
        />
      </span>
    );
  }

  // Tinted (default)
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-2xl", className)}
      style={{
        background: `linear-gradient(160deg, ${color}30, ${color}10)`,
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.22)),
      }}
    >
      <Icon
        strokeWidth={2.4}
        style={{
          color,
          width: Math.round(size * 0.5),
          height: Math.round(size * 0.5),
        }}
      />
    </span>
  );
}
