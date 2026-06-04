"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useStreak, nextMilestone, STREAK_MILESTONES } from "@/lib/gamification/streak";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// StreakBadge — 🔥 N jours.
//
// 3 tailles selon le contexte :
//   • mini    → pour sidebar (icône + chiffre 18px)
//   • compact → pour bandes / dashboard hero (icône + "N jours")
//   • full    → pour modal / page dédiée (avec progress bar vers next milestone)
//
// Animation :
//   • Le flame pulse en permanence (loop subtil)
//   • Quand le streak passe un milestone (3, 7, 14, 30…), célébration
//
// La couleur s'intensifie avec le streak :
//   1-2 jours    → orange charte
//   3-6 jours    → orange + rouge subtle
//   7-13 jours   → rouge vif
//   14-29 jours  → rouge → violet
//   30+ jours    → violet → légende (gradient)
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  variant?: "mini" | "compact" | "full";
  className?: string;
}

function colorForStreak(n: number) {
  if (n >= 30) return { ring: "from-violet-500 to-fuchsia-500", text: "text-violet-700" };
  if (n >= 14) return { ring: "from-red-500 to-orange-500", text: "text-red-700" };
  if (n >= 7)  return { ring: "from-orange-500 to-red-500",   text: "text-orange-700" };
  if (n >= 3)  return { ring: "from-energy-400 to-orange-600", text: "text-energy-700" };
  return { ring: "from-energy-300 to-energy-500", text: "text-energy-700" };
}

export function StreakBadge({ variant = "compact", className }: Props) {
  const { current, longest } = useStreak();
  const c = colorForStreak(current);
  const next = nextMilestone(current);

  // Si pas de streak (1er render SSR safe), on rend rien — évite le flash 0
  if (current === 0) return null;

  if (variant === "mini") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full bg-energy-50 ring-1 ring-inset ring-energy-300/50 px-1.5 py-0.5",
          className,
        )}
        title={`Streak ${current} jours · meilleur ${longest}`}
      >
        <motion.span
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block leading-none"
        >
          🔥
        </motion.span>
        <span className={cn("text-[11px] font-black tabular-nums leading-none", c.text)}>
          {current}
        </span>
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-energy-50 ring-1 ring-inset ring-energy-300/50 px-2.5 py-1",
          className,
        )}
        title={`Streak ${current} jours · meilleur ${longest}`}
      >
        <motion.span
          animate={{ scale: [1, 1.15, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block leading-none text-[14px]"
        >
          🔥
        </motion.span>
        <span className={cn("text-[12px] font-bold tabular-nums leading-none", c.text)}>
          {current} jour{current > 1 ? "s" : ""}
        </span>
      </span>
    );
  }

  // full variant — avec progress bar vers next milestone
  const progress = next ? Math.min(100, (current / next) * 100) : 100;
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-700/10",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br shadow-sm",
            c.ring,
          )}
        >
          <Flame className="h-5 w-5 text-white" strokeWidth={2.6} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist-300">
            Streak
          </div>
          <div className="font-display text-[20px] font-black text-night-900 leading-none">
            {current} jour{current > 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-mist-300">
            Record
          </div>
          <div className="text-[14px] font-bold tabular-nums text-mist-100">
            {longest}
          </div>
        </div>
      </div>
      {next && (
        <>
          <div className="flex items-baseline justify-between text-[10.5px] mb-1">
            <span className="text-mist-300 font-semibold">
              Prochain palier
            </span>
            <span className="text-energy-700 font-bold tabular-nums">
              {current} / {next}
            </span>
          </div>
          <div className="h-2 rounded-full bg-ink-100 overflow-hidden ring-1 ring-inset ring-ink-700/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={cn("h-full bg-gradient-to-r rounded-full", c.ring)}
            />
          </div>
        </>
      )}
      {!next && (
        <p className="text-[11px] text-mist-300 font-semibold">
          Tu as atteint le dernier palier (365 jours). Légende vivante.
        </p>
      )}
    </div>
  );
}

// Re-export utilitaires pour conserver une API stable depuis ce module.
export { STREAK_MILESTONES };
