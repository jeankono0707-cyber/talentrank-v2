"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";
import type { Talent } from "@/lib/mock-talents";
import { getTalentProfession } from "@/lib/mock-talents";
import { professionLabel } from "@/lib/professions";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { ShareScoreCard } from "@/components/share/ShareScoreCard";
import { CategoryMascot } from "@/components/ui/CategoryMascot";
import { mascotForCategory } from "@/lib/category-mascots";
import { FEATURES } from "@/lib/features";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TalentDashboardHome — décision directeur : 1 objectif visible par écran.
//
// L'ancien TalentDashboardClient (489 lignes) empilait streak + hearts +
// XP daily + quest + activity feed + right rail + 3 CTAs. Résultat : le
// user ne savait pas quelle action prendre en premier.
//
// Version minimale — 2 états seulement :
//
//   État 1 : aucun QCM passé (score = 0)
//     → 1 seul écran, 1 seul CTA : "Passe ton premier QCM"
//     → Explication de valeur en 1 phrase
//     → Rien d'autre (pas de stats vides, pas de graphes)
//
//   État 2 : QCM passé (score > 0)
//     → Card "Ton rang" avec CTA "Voir mon classement"
//     → Bouton "Partager mon rang" (levier viral #1)
//     → Chip streak si actif
//
// Ce qui est PARTI (par rapport à l'ancien dashboard) :
//   - Right rail avec hearts, XP, quest, activity feed (mock data → mensonge)
//   - Stat cards (mock)
//   - Multiple CTAs qui divisaient l'attention
//   - Recherche de talents inline (redondant avec /ranking)
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  talent: Talent;
}

export function TalentDashboardHome({ talent }: Props) {
  const profession = getTalentProfession(talent);
  const hasQcm = talent.score > 0;

  return (
    <div className="container-page pt-8 pb-24 max-w-3xl">
      {/* En-tête minimal : bonjour + streak (si actif) */}
      <div className="flex items-baseline justify-between gap-4 mb-8">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-mist-300">
            Bonjour
          </p>
          <h1 className="mt-1 font-display text-[26px] md:text-[32px] font-black tracking-tight text-night-900 leading-none">
            Salut {talent.name.split(" ")[0]} 👋
          </h1>
        </div>
        {FEATURES.streak && <StreakBadge variant="compact" />}
      </div>

      {hasQcm ? <RankCard talent={talent} /> : <FirstQcmCTA />}
    </div>
  );
}

// ─── État 1 : aucun QCM passé ─────────────────────────────────────────────
function FirstQcmCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-700/10 p-8 md:p-10"
    >
      {/* Halo décoratif */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "#FF8A00" }}
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-energy-50 ring-1 ring-inset ring-energy-300/50 px-3 py-1 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-energy-700" strokeWidth={2.6} />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-energy-700">
            Étape 1 · Ton premier classement
          </span>
        </div>

        <h2 className="font-display text-[28px] md:text-[36px] font-black tracking-tight leading-tight text-night-900">
          Passe ton QCM officiel.
        </h2>

        <p className="mt-3 text-[15px] text-mist-200 max-w-lg">
          20 questions. 15 minutes. Un score honnête vérifié anti-triche. C'est
          ce QCM qui te positionne dans le classement mondial de ton métier.
        </p>

        <Link
          href="/qcm"
          className={cn(
            "mt-7 inline-flex items-center gap-2 rounded-full",
            "bg-gradient-to-r from-energy-500 to-orange-600 text-white",
            "px-6 py-3 text-[13.5px] font-bold uppercase tracking-[0.1em]",
            "shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all",
          )}
        >
          Commencer le QCM
          <ArrowRight className="h-4 w-4" strokeWidth={2.8} />
        </Link>

        <ul className="mt-8 space-y-2 text-[12.5px] text-mist-300">
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#1E6BFF" }}
            />
            Anti-triche : fingerprint navigateur + rotation de questions
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#1E6BFF" }}
            />
            Re-passage verrouillé 1 mois (score stable)
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#1E6BFF" }}
            />
            Score public sur ton profil dès la 1ère validation
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

// ─── État 2 : QCM passé, montrer le rang ─────────────────────────────────
function RankCard({ talent }: { talent: Talent }) {
  const profession = getTalentProfession(talent);
  const catId = profession.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-700/10 p-6 md:p-8"
    >
      <div className="flex items-start gap-5">
        {mascotForCategory(catId) && (
          <div className="hidden sm:block shrink-0">
            <CategoryMascot id={catId} size={100} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-skyblue-700">
            Ton rang · {professionLabel(profession, "fr")}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[46px] md:text-[56px] font-black tabular-nums leading-none text-night-900">
              #{talent.globalRank ?? "—"}
            </span>
            <span className="text-[14px] text-mist-300 font-semibold">
              mondial
            </span>
          </div>

          <p className="mt-2 text-[13.5px] text-mist-200">
            Score officiel <strong className="text-night-900">{talent.score}</strong>
            {talent.percentile != null && (
              <>
                {" "}· Top{" "}
                <strong className="text-night-900">{talent.percentile}%</strong>
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/ranking/${profession.id}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full",
                "bg-gradient-to-r from-skyblue-500 to-skyblue-700 text-white",
                "px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.1em]",
                "shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all",
              )}
            >
              <Trophy className="h-4 w-4" strokeWidth={2.6} />
              Voir mon classement
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
            </Link>

            <ShareScoreCard
              variant="ghost"
              name={talent.name}
              score={talent.score}
              percentile={talent.percentile}
              professionId={profession.id}
              professionLabel={professionLabel(profession, "fr")}
              city={talent.city}
              slug={talent.slug}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
