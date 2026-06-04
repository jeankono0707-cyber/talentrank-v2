"use client";

import { motion } from "framer-motion";
import { Trophy, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  currentSeason,
  timeUntilSeasonEnd,
  seasonTrophyLabel,
} from "@/lib/gamification/season";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SeasonCountdown — FOMO de cycle.
//
// Affiche la saison courante + le temps restant + la promesse du trophée
// saisonnier. Update toutes les minutes pour rester juste.
//
// VARIANTES :
//   • banner  → bande large (à mettre en haut du hub /ranking)
//   • compact → mini-pill (sidebar ou dashboard widget)
//   • card    → carte autonome (page profil)
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  variant?: "banner" | "compact" | "card";
  className?: string;
}

export function SeasonCountdown({ variant = "compact", className }: Props) {
  const [tick, setTick] = useState(0);
  const season = currentSeason();
  const t = timeUntilSeasonEnd();

  useEffect(() => {
    // Re-render toutes les 60s pour mettre à jour le countdown
    const id = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  tick;

  if (!t) return null;

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-deepblue-50 ring-1 ring-inset ring-deepblue-200/60 px-2.5 py-1",
          className,
        )}
        title={`Saison ${season.name} se termine dans ${t.days}j ${t.hours}h`}
      >
        <Trophy className="h-3.5 w-3.5 text-deepblue-700" strokeWidth={2.6} />
        <span className="text-[11px] font-bold text-deepblue-800 tabular-nums leading-none">
          {t.days}j {t.hours}h
        </span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative rounded-2xl overflow-hidden",
          "bg-gradient-to-r from-deepblue-700 via-deepblue-800 to-deepblue-900",
          "px-5 py-3.5 shadow-card",
          className,
        )}
      >
        {/* Décor — étoiles trophée */}
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 opacity-20">
          <Trophy className="h-full w-full text-white" strokeWidth={1.4} />
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-energy-500/20 ring-1 ring-inset ring-energy-400/40">
              <Trophy className="h-4 w-4 text-energy-400" strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-energy-300">
                Saison en cours · {season.name}
              </p>
              <p className="font-display text-[15px] font-bold text-white leading-tight">
                Top 10 final = <span className="text-energy-400">{seasonTrophyLabel(season)}</span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 mb-0.5">
              Fin dans
            </p>
            <p className="font-display text-[18px] font-black text-white tabular-nums leading-none">
              {t.days}<span className="text-energy-400">j</span>{" "}
              {t.hours}<span className="text-energy-400">h</span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // card variant — autonome avec progression visuelle
  // Estime un % de saison complétée pour la progress bar
  const seasonStart = new Date(season.startISO).getTime();
  const seasonEnd = new Date(season.endISO + "T23:59:59").getTime();
  const now = Date.now();
  const elapsed = ((now - seasonStart) / (seasonEnd - seasonStart)) * 100;

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-700/10",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-deepblue-700">
            Saison {season.name}
          </p>
          <p className="text-[12.5px] text-mist-200 mt-0.5">
            Trophée Top 10 par métier
          </p>
        </div>
        <Trophy className="h-5 w-5 text-energy-500 shrink-0" strokeWidth={2.4} />
      </div>
      <div className="flex items-baseline justify-between mb-1.5 text-[10.5px]">
        <span className="text-mist-300 font-semibold inline-flex items-center gap-1">
          <Clock className="h-3 w-3" strokeWidth={2.6} />
          Fin dans
        </span>
        <span className="text-deepblue-800 font-bold tabular-nums">
          {t.days}j {t.hours}h {t.minutes}m
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden ring-1 ring-inset ring-ink-700/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, elapsed))}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-skyblue-500 to-deepblue-700 rounded-full"
        />
      </div>
    </div>
  );
}
