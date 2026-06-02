"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Error boundary global — Next.js l'utilise quand une page client crashe.
// Au lieu d'un écran blanc anxiogène, on affiche un fallback cream brandé
// avec 2 sorties (retry + accueil).
// ─────────────────────────────────────────────────────────────────────────────

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log côté console pour qu'on puisse diagnostiquer si PostHog n'est pas configuré
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("[TalentRank] Client-side error:", error);
    }
  }, [error]);

  return (
    <div className="container-page grid min-h-[80vh] place-items-center text-center">
      <div className="max-w-md">
        <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 ring-1 ring-inset ring-amber-300/40 mb-5">
          <AlertTriangle className="h-7 w-7 text-amber-700" strokeWidth={2.4} />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist-400">
          Erreur inattendue
        </p>
        <h1
          className="mt-4 font-display font-black tracking-tight text-mist-50"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
          }}
        >
          Cette page a fait un petit malaise.
        </h1>
        <p className="mt-4 text-[14.5px] text-mist-300 leading-relaxed">
          On a noté l&apos;incident côté serveur. Tu peux réessayer, ou revenir à
          l&apos;accueil. La beta a parfois ces hoquets — désolé.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-[10.5px] text-mist-400">
            Réf : {error.digest}
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-night-700 hover:bg-night-600 text-white px-5 text-[12.5px] font-bold uppercase tracking-[0.04em] transition shadow-card"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.6} />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white hover:bg-ink-50 ring-1 ring-inset ring-ink-700/10 text-mist-100 px-5 text-[12.5px] font-bold uppercase tracking-[0.04em] transition shadow-card"
          >
            <Home className="h-3.5 w-3.5 text-amber-700" strokeWidth={2.6} />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
