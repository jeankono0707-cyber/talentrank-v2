"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SmartBackButton — bouton retour intelligent (audit user).
//
// Comportement (par ordre de priorité) :
//   1. Si l'utilisateur a un historique de navigation dans cet onglet
//      (history.length > 1 ET il existe un referrer dans la même origine)
//      → router.back()
//   2. Sinon → fallbackHref (la route "logique précédente" selon le contexte)
//   3. Le label peut être personnalisé ; default "Retour"
//
// Conçu pour ne JAMAIS renvoyer brutalement à l'accueil sauf si le caller
// le demande explicitement via fallbackHref="/".
//
// SSR-safe : pas d'accès à window au render initial. Le check d'historique
// se fait dans useEffect → mount client uniquement.
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
    // Heuristique : si on a au moins une entrée d'historique avant la nôtre
    // ET que le referrer est interne (même origin), alors router.back() est sûr.
    if (typeof window === "undefined") return;
    const internal =
      document.referrer && document.referrer.startsWith(window.location.origin);
    setHasHistory(window.history.length > 1 && Boolean(internal));
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
