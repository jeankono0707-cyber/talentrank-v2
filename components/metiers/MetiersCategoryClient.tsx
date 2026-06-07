"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, Users, Crown, TrendingUp } from "lucide-react";
import {
  PROFESSION_CATEGORIES,
  professionLabel,
  professionShort,
  normalizeName,
  type ProfessionCategoryId,
} from "@/lib/professions";
import { allProfessionStatsForCategory } from "@/lib/profession-stats";
import { iconForCategory } from "@/lib/profession-icons";
import { TALENTS, talentProfessionId } from "@/lib/mock-talents";
import { SmartBackButton } from "@/components/ui/SmartBackButton";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { CategoryMascot } from "@/components/ui/CategoryMascot";
import { mascotForCategory } from "@/lib/category-mascots";
import { cn } from "@/lib/utils";

interface Props {
  categoryId: ProfessionCategoryId;
}

// ─────────────────────────────────────────────────────────────────────────────
// MetiersCategoryClient — REFONTE-P2.
//
// Page catégorie en cream theme cohérent avec le nouveau Hub (/ranking) et
// les pages métier (/ranking/[profession]). Chaque carte métier affiche :
//   • Nom du métier + label EN
//   • Nombre de talents classés
//   • Top 1 du classement (avatar + nom + score) — preview accrocheur
//   • Hover lift + ring catégorie
//
// Le but : éviter le "wall of cards" sec en donnant à voir un teaser du
// vrai produit (le classement) directement dans la carte.
// ─────────────────────────────────────────────────────────────────────────────

export function MetiersCategoryClient({ categoryId }: Props) {
  const cat = PROFESSION_CATEGORIES.find((c) => c.id === categoryId)!;
  const Icon = iconForCategory(categoryId);
  const allStats = useMemo(() => allProfessionStatsForCategory(categoryId), [categoryId]);

  const [query, setQuery] = useState("");
  const [showEmpty, setShowEmpty] = useState(false);

  const filtered = useMemo(() => {
    const q = normalizeName(query);
    let r = allStats;
    if (!showEmpty) r = r.filter((s) => s.talentCount > 0);
    if (!q) return r;
    return r.filter((s) => {
      const p = s.profession;
      const hay = [p.label, p.frLabel, p.short, p.frShort, ...(p.synonyms ?? [])]
        .map(normalizeName)
        .join(" ");
      return hay.includes(q);
    });
  }, [allStats, query, showEmpty]);

  const activeCount = allStats.filter((s) => s.talentCount > 0).length;
  const totalTalents = allStats.reduce((sum, s) => sum + s.talentCount, 0);

  return (
    <div className="relative min-h-screen">
      {/* Soft category-tinted halo at top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[700px] -z-10 opacity-50"
        style={{
          background: `radial-gradient(ellipse at center, ${cat.color}20 0%, transparent 70%)`,
        }}
      />

      <div className="container-page pt-16 pb-24">
        <SmartBackButton fallbackHref="/ranking" label="Tous les classements" />

        {/* ─── Hero catégorie ─── */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-card ring-1 ring-inset ring-ink-700/10 px-3 py-1.5 mb-5">
            <span
              className="grid h-6 w-6 place-items-center rounded-lg"
              style={{
                background: `linear-gradient(160deg, ${cat.color}30, ${cat.color}10)`,
              }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.6} style={{ color: cat.color }} />
            </span>
            <span
              className="text-[10.5px] font-bold uppercase tracking-[0.2em]"
              style={{ color: cat.color }}
            >
              {mascotForCategory(categoryId) ? "Royaume" : "Catégorie"}
            </span>
          </div>

          {/* Grande mascotte PNG charte si dispo (creative/tech/data/health). */}
          {mascotForCategory(categoryId) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center mb-4"
            >
              <CategoryMascot id={categoryId} size={140} priority />
            </motion.div>
          )}

          <h1 className="font-display text-[36px] md:text-[48px] font-black tracking-tight leading-[1.05] text-night-900">
            {cat.frLabel}
          </h1>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white shadow-sm ring-1 ring-inset ring-ink-700/10 px-3 py-1">
              <Sparkles className="h-3 w-3" strokeWidth={2.6} style={{ color: cat.color }} />
              <strong className="text-night-900">{activeCount}</strong>
              <span className="text-mist-300">métier{activeCount > 1 ? "s" : ""}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white shadow-sm ring-1 ring-inset ring-ink-700/10 px-3 py-1">
              <Users className="h-3 w-3" strokeWidth={2.6} style={{ color: cat.color }} />
              <strong className="text-night-900">{totalTalents}</strong>
              <span className="text-mist-300">talent{totalTalents > 1 ? "s" : ""}</span>
            </span>
          </div>
        </motion.header>

        {/* ─── Search + toggle ─── */}
        <div className="mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-full bg-white ring-1 ring-inset ring-ink-700/10 focus-within:ring-amber-400/60 transition px-4 py-2 shadow-card">
            <Search className="h-4 w-4 text-mist-400" strokeWidth={2.4} />
            <input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Filtrer les métiers"
              className="h-9 flex-1 bg-transparent text-[14px] text-night-900 placeholder:text-mist-300 outline-none"
            />
          </div>
          <button
            onClick={() => setShowEmpty((v) => !v)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[12.5px] font-semibold transition ring-1 ring-inset whitespace-nowrap",
              showEmpty
                ? "bg-amber-100 text-amber-800 ring-amber-300/60"
                : "bg-white text-mist-200 ring-ink-700/10 hover:text-mist-50 shadow-sm",
            )}
          >
            {showEmpty ? "Cacher les métiers vides" : "Inclure tout"}
          </button>
        </div>

        {/* ─── Grille des métiers — leaderboard-style cards ─── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stat, i) => {
            const p = stat.profession;
            const empty = stat.talentCount === 0;
            // Top 1 du métier
            const top1 = TALENTS.filter((t) => talentProfessionId(t) === p.id)
              .sort((a, b) => b.score - a.score)[0];

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (i % 9) * 0.04 }}
              >
                <Link
                  href={empty ? "#" : `/ranking/${p.id}`}
                  onClick={(e) => empty && e.preventDefault()}
                  className={cn(
                    "group relative block overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-700/10 transition-all",
                    !empty && "hover:shadow-card-hover hover:-translate-y-1",
                    !empty && "hover:ring-amber-300/40",
                    empty && "cursor-not-allowed opacity-50",
                  )}
                >
                  {/* Halo blur catégorie en arrière-plan */}
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-25 blur-2xl transition-opacity",
                      !empty && "group-hover:opacity-40",
                    )}
                    style={{ background: cat.color }}
                  />

                  <div className="relative">
                    {/* Header : titre + badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-[17px] font-black tracking-tight text-night-900 leading-tight">
                        {professionLabel(p, "fr")}
                      </h3>
                      {p.pending && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-amber-100 ring-1 ring-inset ring-amber-300/60 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.12em] text-amber-800">
                          À valider
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-mist-300">
                      {professionShort(p, "en")}
                    </p>

                    {/* Top 1 preview — la vraie valeur d'une carte catégorie */}
                    {top1 && !empty && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50/60 ring-1 ring-inset ring-amber-300/30 p-2.5">
                        <Crown
                          className="h-3.5 w-3.5 text-amber-600 shrink-0"
                          strokeWidth={2.6}
                        />
                        <AvatarChip
                          initials={top1.initials}
                          gradient={`bg-gradient-to-br ${top1.avatarGradient}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-[12.5px] font-bold text-night-900 leading-tight truncate">
                            {top1.name}
                          </p>
                          <p className="text-[10px] text-amber-700/80 font-bold uppercase tracking-[0.1em] leading-tight">
                            #1 · {top1.score} pts
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer : nb talents + CTA */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-mist-300">
                        <Users className="h-3 w-3" strokeWidth={2.4} />
                        {stat.talentCount} talent{stat.talentCount > 1 ? "s" : ""}
                      </span>
                      {!empty && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 group-hover:text-amber-800 transition">
                          Voir
                          <ArrowRight
                            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                            strokeWidth={2.8}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 mx-auto max-w-md rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-700/10 p-10 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-mist-300" strokeWidth={2.2} />
            <p className="mt-3 font-display text-[16px] font-bold text-night-900">
              Aucun métier ne correspond.
            </p>
            <p className="mt-1.5 text-[13px] text-mist-300">
              Essaie une autre recherche ou inclus les métiers sans talents.
            </p>
          </div>
        )}

        {/* Encouragement à explorer */}
        {activeCount < allStats.length && !showEmpty && (
          <div className="mt-10 text-center">
            <p className="text-[12px] text-mist-300">
              <TrendingUp className="inline h-3 w-3 mr-1 -mt-0.5" strokeWidth={2.6} />
              {allStats.length - activeCount} autre{allStats.length - activeCount > 1 ? "s" : ""}{" "}
              métier{allStats.length - activeCount > 1 ? "s" : ""} bientôt disponible{allStats.length - activeCount > 1 ? "s" : ""}.
              Sois le premier à le{allStats.length - activeCount > 1 ? "s" : ""} classer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
