"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Info, TrendingUp, Award, Users, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// LeagueBreakdownModal — transparence du calcul ligue.
//
// Au clic sur le badge ligue (MyRankBanner), ouvre une modal qui explique
// EXACTEMENT pourquoi le user est dans cette ligue. Critique pour la
// CONFIANCE — sans transparence, le user pense que c'est arbitraire.
//
// 3 contributions au calcul :
//   1. Score QCM officiel (40% du poids)
//   2. Ancienneté sur la plateforme (20%)
//   3. Reviews par les pairs studio (40%)
//
// La modal montre :
//   • Le score actuel sur chaque dimension (progress bar)
//   • Les seuils des 6 ligues (S, A, B, C, D, E)
//   • Où le user est exactement (curseur sur l'échelle)
//   • Combien de points il manque pour la ligue supérieure
// ─────────────────────────────────────────────────────────────────────────────

export type LeagueId = "S" | "A" | "B" | "C" | "D" | "E";

interface LeagueBreakdown {
  qcmScore: number;       // 0-100
  seniorityScore: number; // 0-100 (basé sur années d'XP + activité)
  peerScore: number;      // 0-100 (basé sur reviews studio)
}

interface Props {
  open: boolean;
  onClose: () => void;
  league: LeagueId;
  breakdown: LeagueBreakdown;
  /** Position sur le percentile (0-100, 0 = top, 100 = bottom) */
  percentile: number;
}

const LEAGUE_INFO: Record<LeagueId, { label: string; range: string; color: string }> = {
  S: { label: "Légende",  range: "Top 10%",     color: "#0A1E3F" },
  A: { label: "Maître",   range: "Top 10-25%",  color: "#FF8A00" },
  B: { label: "Expert",   range: "Top 25-50%",  color: "#1E6BFF" },
  C: { label: "Avancé",   range: "Top 50-75%",  color: "#6F90FF" },
  D: { label: "Confirmé", range: "Top 75-90%",  color: "#3A548C" },
  E: { label: "Apprenti", range: "Bottom 10%",  color: "#6B7280" },
};

const LEAGUES: LeagueId[] = ["S", "A", "B", "C", "D", "E"];

function computeGlobalScore(b: LeagueBreakdown): number {
  return Math.round(b.qcmScore * 0.4 + b.seniorityScore * 0.2 + b.peerScore * 0.4);
}

export function LeagueBreakdownModal({ open, onClose, league, breakdown, percentile }: Props) {
  // Fermeture sur Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
  }, [open, onClose]);

  const globalScore = computeGlobalScore(breakdown);
  const info = LEAGUE_INFO[league];
  const currentIdx = LEAGUES.indexOf(league);
  const nextLeague = currentIdx > 0 ? LEAGUES[currentIdx - 1] : null;
  const nextInfo = nextLeague ? LEAGUE_INFO[nextLeague] : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-deepblue-900/40 backdrop-blur-sm z-50"
            aria-hidden
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="league-breakdown-title"
            className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl ring-1 ring-ink-700/10 overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header — gradient ligue */}
              <div
                className="relative px-6 py-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%)`,
                }}
              >
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                  <X className="h-4 w-4" strokeWidth={2.6} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm ring-2 ring-white/40">
                    <span className="font-display text-4xl font-black">{league}</span>
                  </div>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] opacity-80">
                      Tu es en Ligue {league}
                    </p>
                    <h2 id="league-breakdown-title" className="font-display text-[24px] font-black leading-tight">
                      {info.label}
                    </h2>
                    <p className="text-[12px] opacity-85 mt-0.5">{info.range} mondial · Top {percentile}%</p>
                  </div>
                </div>
              </div>

              {/* Body — breakdown */}
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-skyblue-500 shrink-0 mt-0.5" strokeWidth={2.4} />
                  <p className="text-[13px] text-mist-200 leading-relaxed">
                    Ta ligue est calculée à partir de <strong className="text-night-900">3 dimensions</strong>.
                    Aucune n'est arbitraire — tout est mesuré et public.
                  </p>
                </div>

                <BreakdownRow
                  icon={<Award className="h-4 w-4" strokeWidth={2.4} />}
                  label="Score QCM officiel"
                  weight={40}
                  value={breakdown.qcmScore}
                  color="#FF8A00"
                  hint="Anti-leak · Anti-fraude · Re-passage verrouillé 1 mois"
                />
                <BreakdownRow
                  icon={<TrendingUp className="h-4 w-4" strokeWidth={2.4} />}
                  label="Ancienneté & activité"
                  weight={20}
                  value={breakdown.seniorityScore}
                  color="#1E6BFF"
                  hint="Années d'expérience déclarées + complétion du profil"
                />
                <BreakdownRow
                  icon={<Users className="h-4 w-4" strokeWidth={2.4} />}
                  label="Reviews studios"
                  weight={40}
                  value={breakdown.peerScore}
                  color="#0A1E3F"
                  hint="Reviews publiées par les studios pour qui tu as travaillé"
                />

                {/* Score global */}
                <div className="rounded-2xl bg-deepblue-50 ring-1 ring-inset ring-deepblue-200/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-deepblue-700">
                      Score global pondéré
                    </span>
                    <span className="font-display text-[20px] font-black text-deepblue-800 tabular-nums">
                      {globalScore}
                      <span className="text-[12px] text-mist-300 font-bold"> / 100</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${globalScore}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-skyblue-500 to-deepblue-700 rounded-full"
                    />
                  </div>
                </div>

                {/* Chemin vers la prochaine ligue */}
                {nextLeague && nextInfo && (
                  <div className="rounded-2xl bg-energy-50 ring-1 ring-inset ring-energy-300/40 p-4">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-energy-700 mb-1">
                      Prochain palier
                    </p>
                    <p className="text-[13.5px] text-night-900 font-bold">
                      Passe en Ligue {nextLeague} ({nextInfo.label}) en{" "}
                      <span className="text-energy-700">
                        gagnant {Math.max(1, Math.round((100 - percentile) / 4))} percentile
                        {Math.round((100 - percentile) / 4) > 1 ? "s" : ""}
                      </span>
                    </p>
                    <p className="text-[12px] text-mist-200 mt-1.5">
                      Le moyen le plus rapide : repasser un QCM pour booster ton score.
                    </p>
                  </div>
                )}

                {/* Échelle ligues */}
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-mist-300 mb-2">
                    Les 6 ligues
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {LEAGUES.map((L) => {
                      const li = LEAGUE_INFO[L];
                      const isCurrent = L === league;
                      return (
                        <div
                          key={L}
                          className={cn(
                            "rounded-lg p-2 text-center transition-all",
                            isCurrent
                              ? "ring-2 ring-offset-2 ring-offset-white scale-110"
                              : "opacity-50",
                          )}
                          style={{
                            background: li.color,
                            ...(isCurrent
                              ? ({ "--tw-ring-color": li.color } as React.CSSProperties)
                              : {}),
                          }}
                        >
                          <div className="font-display text-[14px] font-black text-white">{L}</div>
                          <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-white/85 leading-tight mt-0.5">
                            {li.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BreakdownRow({
  icon,
  label,
  weight,
  value,
  color,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  weight: number;
  value: number;
  color: string;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-2 text-[12.5px] font-bold text-night-900">
          <span
            className="inline-grid h-7 w-7 place-items-center rounded-lg text-white"
            style={{ background: color }}
          >
            {icon}
          </span>
          {label}
          <span className="ml-1 text-[10.5px] text-mist-300 font-semibold">
            · pèse {weight}%
          </span>
        </span>
        <span className="font-display text-[14px] font-black text-night-900 tabular-nums">
          {value}
          <span className="text-mist-300 font-bold text-[11px]"> / 100</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden ring-1 ring-inset ring-ink-700/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="flex items-center gap-1 mt-1">
        <CheckCircle2 className="h-3 w-3 text-mist-400" strokeWidth={2.6} />
        <p className="text-[10.5px] text-mist-300 font-medium">{hint}</p>
      </div>
    </div>
  );
}
