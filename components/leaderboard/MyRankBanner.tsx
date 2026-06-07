"use client";

import { motion } from "framer-motion";
import { Flame, TrendingUp, Sparkles, ChevronUp, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LeagueBreakdownModal } from "@/components/gamification/LeagueBreakdownModal";
import { RankDeltaToast } from "@/components/gamification/RankDeltaToast";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// MyRankBanner — la signature de la refonte P3.
//
// Affiche au talent connecté son rang + ligue + niveau XP + delta hebdo dans
// CE classement. Sticky quand on scroll (backdrop-blur, ring ambre, shadow
// montante). Quand on est en haut de page, la version standard. Quand on
// scroll → version sticky compacte avec scroll-to-top.
//
// Mécaniques psychologiques en jeu :
//   • "TOI · #47" → identity priming dès l'arrivée
//   • Progress bar XP → progress dripping (presque-pleine = action)
//   • "↑+3 cette semaine" → variable reward + momentum
//   • CTA "Pour monter" → chemin d'action clair, pas de frustration
//
// Pour l'instant la data est MOCKÉE car le talent loggé n'a pas encore de
// profession_id en base. On simule un rang aléatoire stable basé sur l'id
// du métier. Quand Supabase Phase 2 sera live, remplacer mockMyRank par
// un vrai fetch.
// ─────────────────────────────────────────────────────────────────────────────

interface MyRank {
  rank: number;
  totalTalents: number;
  league: "S" | "A" | "B" | "C" | "D" | "E";
  level: number;
  xpCurrent: number;
  xpNeeded: number;
  deltaThisWeek: number;
}

interface Props {
  professionId: string;
  professionLabel: string;
  totalTalents: number;
  /** Optionnel : passe un vrai rang si dispo. Sinon mock. */
  rank?: MyRank;
}

// Mock stable basé sur l'id du métier — le user voit toujours le même rang
// quand il revient sur le même classement, pas un random à chaque mount.
function mockMyRank(professionId: string, totalTalents: number): MyRank {
  const seed = professionId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rank = Math.max(1, Math.min(totalTalents, (seed % Math.max(1, totalTalents - 5)) + 5));
  const leagues = ["S", "A", "B", "C", "D", "E"] as const;
  // Ligue dépend du percentile
  const percentile = (rank / totalTalents) * 100;
  const league =
    percentile < 10 ? "S" :
    percentile < 25 ? "A" :
    percentile < 50 ? "B" :
    percentile < 75 ? "C" :
    percentile < 90 ? "D" : "E";
  const level = Math.max(1, Math.min(50, 30 - Math.floor(percentile / 4)));
  return {
    rank,
    totalTalents,
    league: leagues[Math.max(0, leagues.indexOf(league))],
    level,
    xpCurrent: (seed * 17) % 1000,
    xpNeeded: 1000,
    deltaThisWeek: (seed % 6) - 1, // -1 à +4
  };
}

// Palette ligues alignée charte : deepblue (autorité Légende) →
// energy (Maître) → skyblue (Expert/Avancé) → mid blues → slate (Apprenti).
// L'or et l'argent restent réservés aux médailles podium (universel).
const LEAGUE_STYLES = {
  S: { bg: "from-deepblue-700 to-deepblue-900",  glow: "shadow-[0_4px_16px_-4px_rgba(10,30,63,0.55)]",  text: "Légende"  },
  A: { bg: "from-energy-400 to-energy-600",       glow: "shadow-[0_4px_16px_-4px_rgba(255,138,0,0.5)]",  text: "Maître"   },
  B: { bg: "from-skyblue-400 to-skyblue-600",     glow: "shadow-[0_4px_16px_-4px_rgba(30,107,255,0.5)]", text: "Expert"   },
  C: { bg: "from-skyblue-300 to-skyblue-500",     glow: "shadow-[0_4px_16px_-4px_rgba(111,144,255,0.4)]",text: "Avancé"   },
  D: { bg: "from-deepblue-300 to-deepblue-500",   glow: "shadow-[0_4px_16px_-4px_rgba(58,84,140,0.4)]",  text: "Confirmé" },
  E: { bg: "from-slate-400 to-slate-600",         glow: "shadow-[0_4px_16px_-4px_rgba(100,116,139,0.4)]",text: "Apprenti" },
} as const;

export function MyRankBanner({ professionId, professionLabel, totalTalents, rank }: Props) {
  const my = rank ?? mockMyRank(professionId, totalTalents);
  const league = LEAGUE_STYLES[my.league];
  const xpProgress = (my.xpCurrent / my.xpNeeded) * 100;
  const [scrolled, setScrolled] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  // Mock breakdown stable basé sur seed pour démo. À remplacer par vrai
  // fetch quand Supabase Phase 2 sera live.
  const seed = professionId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const mockBreakdown = {
    qcmScore: 50 + ((seed * 7) % 50),
    seniorityScore: 40 + ((seed * 11) % 55),
    peerScore: 45 + ((seed * 13) % 50),
  };
  const percentile = Math.round((my.rank / my.totalTalents) * 100);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 220);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Bande principale — toujours dans le flow normal de la page */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-3xl bg-white shadow-card ring-1 ring-inset ring-energy-300/40 overflow-hidden"
      >
        {/* Subtle gradient bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,138,0,0.08) 0%, transparent 50%, rgba(255,138,0,0.04) 100%)",
          }}
        />

        <div className="relative p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* League badge — gros, à gauche.
                Clic = ouvre la modal de breakdown (transparence Léo). */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setBreakdownOpen(true)}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 14 }}
                aria-label={`Ligue ${my.league} — Comprendre le calcul`}
                className={cn(
                  "group relative shrink-0 grid place-items-center rounded-2xl bg-gradient-to-br cursor-pointer transition-all",
                  league.bg,
                  league.glow,
                  "h-16 w-16 md:h-20 md:w-20",
                  "hover:shadow-2xl",
                )}
              >
                <span className="font-display text-3xl md:text-4xl font-black text-white drop-shadow">
                  {my.league}
                </span>
                {/* Indicateur info au hover */}
                <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow-card ring-1 ring-ink-700/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="h-3 w-3 text-night-700" strokeWidth={2.8} />
                </span>
              </motion.button>

              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-energy-700">
                  Toi · {league.text}
                </p>
                <p className="font-display text-[24px] md:text-[28px] font-black tracking-tight text-night-900 leading-tight">
                  #{my.rank}
                  <span className="text-mist-300 font-bold text-[16px] md:text-[18px]">
                    {" "}/ {my.totalTalents}
                  </span>
                </p>
                <p className="text-[11.5px] text-mist-300 leading-tight mt-0.5 truncate">
                  en {professionLabel}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-12 w-px bg-ink-700/15" />

            {/* Niveau + XP — au milieu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist-400">
                  Niveau {my.level}
                </span>
                <span className="text-[11px] font-bold tabular-nums text-mist-300">
                  {my.xpCurrent}<span className="text-mist-400"> / {my.xpNeeded} XP</span>
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden ring-1 ring-inset ring-ink-700/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "h-full bg-gradient-to-r rounded-full",
                    league.bg,
                  )}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px]">
                {my.deltaThisWeek > 0 ? (
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-1 font-bold text-energy-700"
                  >
                    <TrendingUp className="h-3 w-3" strokeWidth={3} />
                    +{my.deltaThisWeek} place{my.deltaThisWeek > 1 ? "s" : ""} cette semaine
                    <Flame className="h-3 w-3 text-energy-500" strokeWidth={2.4} />
                  </motion.span>
                ) : my.deltaThisWeek < 0 ? (
                  <span className="inline-flex items-center gap-1 font-bold text-mist-300">
                    {my.deltaThisWeek} cette semaine
                  </span>
                ) : (
                  <span className="text-mist-300">Stable cette semaine</span>
                )}
                <Link
                  href="/qcm"
                  className="inline-flex items-center gap-1 font-bold text-energy-700 hover:text-energy-800 transition"
                >
                  <Sparkles className="h-3 w-3" strokeWidth={2.6} />
                  Pour monter →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky compact version — apparaît quand on scroll */}
      <motion.div
        initial={false}
        animate={{ y: scrolled ? 0 : -80, opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
        aria-hidden={!scrolled}
      >
        <div className="container-page pt-2 pointer-events-auto">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_8px_28px_-12px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-energy-300/40 px-4 py-2.5 flex items-center gap-3">
            <div
              className={cn(
                "shrink-0 grid place-items-center rounded-lg bg-gradient-to-br h-8 w-8",
                league.bg,
                league.glow,
              )}
            >
              <span className="font-display text-[14px] font-black text-white">
                {my.league}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[15px] font-black text-night-900 leading-none">
                TOI · #{my.rank}
                <span className="text-mist-300 font-bold text-[12px]"> / {my.totalTalents}</span>
              </p>
              <p className="text-[10.5px] text-mist-400 leading-tight mt-0.5 truncate">
                Niv {my.level} · {my.xpCurrent}/{my.xpNeeded} XP
                {my.deltaThisWeek > 0 && (
                  <span className="text-energy-700 font-bold"> · +{my.deltaThisWeek} 🔥</span>
                )}
              </p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Revenir en haut"
              className="shrink-0 grid h-8 w-8 place-items-center rounded-full bg-energy-100 hover:bg-energy-200 transition"
            >
              <ChevronUp className="h-4 w-4 text-energy-800" strokeWidth={2.8} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal breakdown ligue — transparence Léo. Au clic sur le badge ligue
          le user voit le détail du calcul (QCM + ancienneté + peer reviews). */}
      <LeagueBreakdownModal
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        league={my.league}
        breakdown={mockBreakdown}
        percentile={percentile}
      />

      {/* Toast delta négatif Léo — variable reward au mount. S'affiche 1 fois
          par session si le user a perdu des places cette semaine. */}
      {my.deltaThisWeek < 0 && (
        <RankDeltaToast
          placesLost={Math.abs(my.deltaThisWeek)}
          professionLabel={professionLabel}
        />
      )}
    </>
  );
}
