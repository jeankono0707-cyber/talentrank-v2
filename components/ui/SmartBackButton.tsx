"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PREV_PATH_KEY, CURR_PATH_KEY } from "@/components/ui/PathTracker";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SmartBackButton — bouton retour intelligent et FIABLE.
//
// Comportement :
//   1. Lecture de la "previous in-site path" via sessionStorage (alimenté par
//      <PathTracker /> monté dans RootShell).
//   2. Si une prev path existe ET est différente de la page actuelle ET est
//      différente du fallbackHref (sinon le clic ne fait rien d'utile) →
//      navigation vers cette prev path via router.push.
//   3. Sinon → fallbackHref (route logique parente).
//
// Pourquoi pas router.back() ? Parce que `window.history.length > 1` est
// trop permissif : il compte aussi l'historique externe pré-arrivée sur le
// site, donc router.back() peut faire quitter le site sans qu'on s'en rende
// compte (FIX-10 — l'utilisateur atterrissait toujours sur sa 1ère page
// visitée comme si on revenait à la racine).
//
// Avec PathTracker on a la VRAIE previous in-site path, fiable.
//
// SSR-safe : pas d'accès à sessionStorage au render initial.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  /** Route logique de repli si pas de prev path connue. ex: "/ranking". */
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
  // Le href affiché = fallbackHref tant qu'on n'a pas vérifié la prev path,
  // puis remplacé par la prev path si elle est dispo. Comme ça le composant
  // dégrade gracieusement même sans JS (SEO + crawl + a11y).
  const [smartHref, setSmartHref] = useState<string>(fallbackHref);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const prev = sessionStorage.getItem(PREV_PATH_KEY);
      const curr = sessionStorage.getItem(CURR_PATH_KEY);
      const currentPath = window.location.pathname;
      // Conditions pour utiliser prev :
      //   - prev existe
      //   - prev != current (sinon le clic ne ferait rien)
      //   - prev != curr stored (cohérence interne)
      //   - prev != fallbackHref (sinon pas d'avantage)
      if (
        prev &&
        prev !== currentPath &&
        prev !== curr &&
        prev !== fallbackHref
      ) {
        setSmartHref(prev);
      }
    } catch {
      // sessionStorage peut throw en mode privé strict — on retombe sur fallback.
    }
  }, [fallbackHref]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // On force router.push pour rester en SPA (pas de full reload).
    e.preventDefault();
    router.push(smartHref);
  };

  return (
    <Link
      href={smartHref}
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
