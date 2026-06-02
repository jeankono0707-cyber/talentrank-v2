"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SmartBackButton — bouton retour intelligent.
//
// Comportement :
//   1. Si l'utilisateur a un historique dans cet onglet (history.length > 1)
//      → router.back() (revient à la VRAIE page précédente du navigateur)
//   2. Sinon (l'utilisateur a tapé l'URL ou est arrivé directement)
//      → fallbackHref (la route "logique précédente" selon le contexte)
//
// FIX-6 : on a retiré le check `document.referrer` qui posait problème en
// SPA Next.js — referrer ne change pas lors des navigations client-side
// (router.push), donc le check tombait toujours en false et on partait sur
// le fallback même quand l'historique existait. Maintenant on fait confiance
// à history.length.
//
// SSR-safe : pas d'accès à window au render initial.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  /** Route logique de repli si pas d'historique. ex: "/ranking" depuis un profession ranking. */
  fallbackHref: string;
  /** Texte affiché. Default "Retour". */
  label?: string;
  /** Variante visuelle. */
  variant?: "subtle" | "filled" | "ghost";
  className?: string;
}

export function SmartBackButton({
  fallbackHref,
  label = "Retour",
  variant = "subtle",
  className,
}: Props) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // history.length > 1 = au moins une page précédente dans cet onglet.
    // C'est suffisant : si l'utilisateur a navigué sur le site, il revient
    // logiquement à sa page précédente. S'il est arrivé directement (URL
    // tapée, nouveau tab depuis un favori), length === 1 et on tombe sur
    // le fallback.
    setHasHistory(window.history.length > 1);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasHistory) return; // laisse le <Link> agir comme fallback
    e.preventDefault();
    router.back();
  };

  // En cas d'absence d'historique on rend un vrai Link vers fallbackHref pour
  // que le navigateur sache vers où aller (et le crawler SEO aussi).
  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 transition group",
        variant === "subtle" &&
          "text-[12px] font-bold text-mist-400 hover:text-mist-50",
        variant === "ghost" &&
          "h-9 rounded-full px-3 text-[12px] font-bold text-mist-100 hover:bg-ink-50",
        variant === "filled" &&
          "h-10 rounded-full bg-white ring-1 ring-inset ring-ink-700/10 hover:bg-ink-50 text-mist-100 px-4 text-[12px] font-bold uppercase tracking-[0.04em] shadow-card",
        className,
      )}
    >
      <ArrowLeft
        className={cn(
          "h-3.5 w-3.5 transition group-hover:-translate-x-0.5",
          variant === "filled" && "text-amber-700",
        )}
        strokeWidth={2.6}
      />
      {label}
    </Link>
  );
}
