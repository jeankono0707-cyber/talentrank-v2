"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { Crown, Medal } from "lucide-react";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Podium — le 1-2-3 du leaderboard. Staircase animée à l'entrée :
// bronze → argent → or, montent dans cet ordre pour bâtir l'attente.
//
// Réutilisé par :
//   - TrendingCard (hub /ranking) — version compacte sans score animé
//   - ProfessionRankingClient (page métier) — version full avec scores counters
//
// Respecte prefers-reduced-motion via opt-in du parent (pas de motion config
// globale ici, le parent décide).
// ─────────────────────────────────────────────────────────────────────────────

export interface PodiumEntry {
  rank: 1 | 2 | 3;
  slug: string;
  name: string;
  initials: string;
  score: number;
  countryCode?: string;
  city?: string;
}

interface PodiumProps {
  entries: PodiumEntry[];
  /** Variante visuelle.
   *  - "full" : grandes marches + scores animés (page métier)
   *  - "compact" : mini podium dans une carte (Trending) */
  variant?: "full" | "compact";
  /** Quand vrai, désactive les animations (pour mode preview / SSR-safe display). */
  static?: boolean;
}

const HEIGHTS_FULL = { 1: "h-44 md:h-52", 2: "h-36 md:h-40", 3: "h-32 md:h-36" };
const HEIGHTS_COMPACT = { 1: "h-20", 2: "h-16", 3: "h-14" };

const COLORS = {
  1: { bg: "from-amber-300 to-amber-500", text: "text-amber-900", glow: "shadow-[0_8px_24px_-8px_rgba(245,158,11,0.55)]" },
  2: { bg: "from-slate-200 to-slate-400", text: "text-slate-800", glow: "shadow-[0_6px_18px_-6px_rgba(148,163,184,0.55)]" },
  3: { bg: "from-orange-300 to-orange-500", text: "text-orange-900", glow: "shadow-[0_6px_18px_-6px_rgba(234,88,12,0.55)]" },
} as const;

const RANK_EMOJI = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;

export function Podium({ entries, variant = "full", static: isStatic = false }: PodiumProps) {
  // On force l'ordre visuel 2 / 1 / 3 (l'or au centre, plus haut), peu importe
  // l'ordre dans `entries`.
  const second = entries.find((e) => e.rank === 2);
  const first = entries.find((e) => e.rank === 1);
  const third = entries.find((e) => e.rank === 3);

  if (!first) return null;

  const baseDelay = isStatic ? 0 : 0;

  return (
    <div
      className={cn(
        "relative grid items-end gap-2",
        variant === "full" ? "grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto" : "grid-cols-3 gap-1.5",
      )}
    >
      {second && <PodiumPlace entry={second} variant={variant} delay={baseDelay} isStatic={isStatic} />}
      <PodiumPlace entry={first} variant={variant} delay={baseDelay + 0.15} isStatic={isStatic} />
      {third && <PodiumPlace entry={third} variant={variant} delay={baseDelay + 0.3} isStatic={isStatic} />}
    </div>
  );
}

function PodiumPlace({
  entry,
  variant,
  delay,
  isStatic,
}: {
  entry: PodiumEntry;
  variant: "full" | "compact";
  delay: number;
  isStatic: boolean;
}) {
  const heights = variant === "full" ? HEIGHTS_FULL : HEIGHTS_COMPACT;
  const c = COLORS[entry.rank];

  return (
    <motion.div
      initial={isStatic ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex flex-col items-center gap-2"
    >
      {/* Avatar + nom + score au-dessus de la marche */}
      <div className="flex flex-col items-center text-center">
        {variant === "full" ? (
          <>
            <div className="relative">
              {entry.rank === 1 && (
                <motion.div
                  initial={isStatic ? false : { y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: delay + 0.4, type: "spring", stiffness: 300 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl"
                >
                  <Crown className="h-6 w-6 text-amber-500 drop-shadow" strokeWidth={2.4} />
                </motion.div>
              )}
              <Link
                href={`/talent/${entry.slug}`}
                className="block hover:scale-105 transition-transform"
              >
                <AvatarChip
                  initials={entry.initials}
                  gradient="bg-gradient-to-br from-amber-400 to-amber-600"
                  countryCode={entry.countryCode}
                  size={entry.rank === 1 ? "lg" : "md"}
                />
              </Link>
            </div>
            <Link
              href={`/talent/${entry.slug}`}
              className="mt-2 font-display text-[13px] md:text-[14px] font-bold text-mist-50 hover:text-amber-500 transition leading-tight"
            >
              {entry.name}
            </Link>
            {entry.countryCode && (
              <span className="flex items-center gap-1 text-[11px] text-mist-400 mt-0.5">
                <Flag code={entry.countryCode} size="xs" />
                {entry.city}
              </span>
            )}
            <AnimatedScore value={entry.score} delay={delay + 0.3} isStatic={isStatic} rank={entry.rank} />
          </>
        ) : (
          // Compact version : just initials + score
          <>
            <span className="text-xl leading-none mb-0.5" aria-hidden>
              {RANK_EMOJI[entry.rank]}
            </span>
            <span className="font-display text-[11.5px] font-bold text-mist-50 leading-tight truncate max-w-[80px]">
              {entry.name.split(" ")[0]}
            </span>
            <span className="text-[10px] font-bold text-amber-700/80">{entry.score}</span>
          </>
        )}
      </div>

      {/* La marche du podium */}
      <div
        className={cn(
          "relative w-full rounded-t-xl bg-gradient-to-b shadow-card overflow-hidden",
          c.bg,
          c.glow,
          heights[entry.rank],
        )}
      >
        {/* Numéro géant sur la marche */}
        <div className="absolute inset-0 grid place-items-center">
          <span
            className={cn(
              "font-display font-black leading-none drop-shadow",
              c.text,
              variant === "full" ? "text-5xl md:text-6xl" : "text-2xl",
            )}
          >
            {entry.rank}
          </span>
        </div>
        {/* Glossy overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
    </motion.div>
  );
}

function AnimatedScore({
  value,
  delay,
  isStatic,
  rank,
}: {
  value: number;
  delay: number;
  isStatic: boolean;
  rank: 1 | 2 | 3;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (isStatic) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 1.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [count, value, delay, isStatic]);

  return (
    <motion.span
      className={cn(
        "mt-1 font-display font-black tabular-nums",
        rank === 1 ? "text-[28px] md:text-[32px] text-amber-500" : "text-[20px] md:text-[22px] text-mist-100",
      )}
    >
      {rounded}
    </motion.span>
  );
}

/** Static variant for SSR / lists where animations would be a distraction. */
export function StaticPodium({ entries, variant = "compact" }: Omit<PodiumProps, "static">) {
  return <Podium entries={entries} variant={variant} static />;
}
