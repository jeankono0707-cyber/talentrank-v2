"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// RankDeltaToast — la version "perte" du delta hebdo.
//
// PSYCHO :
// Variable reward au mount → user voit "tu as perdu 2 places" → friction
// douloureuse → action immédiate via CTA "Repasse un QCM" (sortie).
//
// Affiché 1 SEULE FOIS par session (sessionStorage flag) pour pas devenir
// agressif. Apparition après 800ms (laisser la page se monter), reste 8s
// puis fade out auto. Cliquable pour dismiss avant.
//
// Visuellement positionné en bottom-right, au-dessus du FeedbackWidget.
// Z-index 40 (au-dessus de la sidebar 30, en-dessous des modales 50).
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = "tr_delta_toast_shown";

interface Props {
  /** Nombre de places perdues. Si <= 0, le toast ne s'affiche pas. */
  placesLost: number;
  /** Nom du métier pour personnaliser le message. */
  professionLabel: string;
  /** Lien CTA. Default /qcm. */
  ctaHref?: string;
  /** Délai avant apparition (ms). Default 800. */
  delayMs?: number;
}

export function RankDeltaToast({
  placesLost,
  professionLabel,
  ctaHref = "/qcm",
  delayMs = 800,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (placesLost <= 0) return;
    if (typeof window === "undefined") return;

    // Déjà montré cette session ?
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      return;
    }

    const showTimer = setTimeout(() => {
      setVisible(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }, delayMs);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, delayMs + 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [placesLost, delayMs]);

  if (placesLost <= 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-40 max-w-sm pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-ink-700/10 overflow-hidden">
            {/* Accent rouge top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-energy-500 to-red-600" />

            <div className="p-4 pr-10">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 ring-1 ring-inset ring-red-200">
                  <TrendingDown className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[14px] font-black text-night-900 leading-tight">
                    Tu as perdu {placesLost} place{placesLost > 1 ? "s" : ""}.
                  </p>
                  <p className="text-[12px] text-mist-200 mt-0.5 leading-snug">
                    Cette semaine en {professionLabel}. Repasse un QCM pour
                    remonter.
                  </p>
                </div>
              </div>

              <Link
                href={ctaHref}
                onClick={() => setVisible(false)}
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full",
                  "bg-gradient-to-r from-energy-500 to-orange-600 text-white",
                  "px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em]",
                  "shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all",
                )}
              >
                Repasser le QCM
                <ArrowRight className="h-3 w-3" strokeWidth={3} />
              </Link>
            </div>

            <button
              onClick={() => setVisible(false)}
              aria-label="Fermer la notification"
              className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full hover:bg-ink-100 transition"
            >
              <X className="h-3.5 w-3.5 text-mist-300" strokeWidth={2.4} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
