"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Podium, type PodiumEntry } from "./Podium";
import { SeasonCountdown } from "@/components/gamification/SeasonCountdown";
import {
  PROFESSIONS,
  PROFESSION_CATEGORIES,
  normalizeName,
  type ProfessionCategoryId,
} from "@/lib/professions";
import { iconForCategory } from "@/lib/profession-icons";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// RankingHubClient — REFONTE-P1.
//
// Avant : un mur de 40+ cartes métier au scroll. Le visiteur ne savait pas
// quoi regarder. TalentRank passait pour un annuaire.
// Maintenant : un hub minimal type Chess.com / Duolingo leaderboard.
//
//   1. Hero centré — 1 titre, 1 promesse
//   2. Grande barre de recherche — point d'entrée principal
//   3. 3-6 cartes "Tendances" avec mini-podium par métier
//   4. Grille 9 catégories — pour ceux qui ne savent pas quoi chercher
//
// Hiérarchie : Search > Tendances > Catégories. Le scroll est court.
// ─────────────────────────────────────────────────────────────────────────────

interface ProfessionWithStats {
  id: string;
  label: string;
  frLabel: string;
  category: ProfessionCategoryId;
  talentCount: number;
  topScore: number | null;
}

interface CategoryWithStats {
  id: ProfessionCategoryId;
  frLabel: string;
  color: string;
  talentCount: number;
  professionCount: number;
  /** True pour la catégorie avec le plus de talents → badge "LE PLUS ACTIF". */
  isMostActive?: boolean;
  /** 4 noms de métiers représentatifs (cards catégories non-Royaume). */
  subSpecialties?: string[];
  /** Top 3 métiers par popularité — utilisé dans KingdomCard. */
  topProfessions?: { id: string; frLabel: string }[];
  /** Path vers le PNG mascot (e.g. "/brand/CREATION.png") — ce qui fait
   *  qu'une catégorie devient un "Royaume" en pleine page. Null = catégorie
   *  secondaire affichée en grid normal. */
  mascotSrc?: string | null;
  /** Top 1 talent de la catégorie (preview accrocheur dans la card). */
  top1?: {
    name: string;
    initials: string;
    score: number;
    slug: string;
  } | null;
}

interface TrendingMetier {
  professionId: string;
  professionLabel: string;
  categoryId: ProfessionCategoryId;
  talentCount: number;
  podium: PodiumEntry[];
  deltaThisWeek?: number;
}

interface Props {
  professions: ProfessionWithStats[];
  categories: CategoryWithStats[];
  trending: TrendingMetier[];
  totalTalents: number;
  totalProfessions: number;
}

export function RankingHubClient({ professions, categories, trending, totalTalents, totalProfessions }: Props) {
  // Split : catégories qui ont un mascot PNG → Royaumes (en avant)
  //         autres catégories → grille secondaire
  const kingdoms = categories.filter((c) => c.mascotSrc);
  const otherCategories = categories.filter((c) => !c.mascotSrc);
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-energy-50/30 via-transparent to-transparent">
      {/* Décor subtil — soft glow ambre derrière le hero */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,138,0,0.13) 0%, transparent 60%)",
        }}
      />

      <div className="container-page pt-12 md:pt-16 pb-24">
        {/* ─── HERO — épuré, centré sur la search ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="font-display text-[32px] md:text-[48px] font-black tracking-tight leading-[1.1] text-night-900">
            Quel métier recherches-tu ?
          </h1>
        </motion.div>

        {/* ─── HERO SEARCH ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 max-w-3xl mx-auto"
        >
          <HeroSearchBar professions={professions} />
        </motion.div>

        {/* ─── Stats inline ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-5 flex items-center justify-center gap-6 text-[13.5px] text-mist-200"
        >
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-skyblue-600" strokeWidth={2.4} />
            <strong className="text-night-900 tabular-nums">
              +{totalTalents.toLocaleString("fr-FR")}
            </strong>{" "}
            talents classés
          </span>
          <span className="h-4 w-px bg-ink-700/15" />
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-energy-500" strokeWidth={2.4} />
            dans{" "}
            <strong className="text-night-900 tabular-nums">
              {totalProfessions}
            </strong>{" "}
            métiers
          </span>
        </motion.div>

        {/* ─── ROYAUMES — 4 grandes cards avec mascotte ─── */}
        {kingdoms.length > 0 && (
          <section className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {kingdoms.map((c, i) => (
                <KingdomCard key={c.id} category={c} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Bandeau "Progressez. Grimpez." ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 rounded-2xl bg-skyblue-50/60 ring-1 ring-inset ring-skyblue-200/60 px-5 py-4 md:px-6 md:py-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-energy-400 to-energy-600 shadow-sm">
            <Trophy className="h-6 w-6 text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[16px] md:text-[18px] font-black text-night-900 leading-tight">
              Progressez. Grimpez. Devenez le numéro 1.
            </p>
            <p className="text-[12.5px] text-mist-200 mt-0.5">
              Rejoignez la compétition et hissez-vous au sommet de votre métier.
            </p>
          </div>
          <Link
            href="/qcm"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full",
              "bg-gradient-to-r from-skyblue-500 to-skyblue-700 text-white",
              "px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.12em]",
              "shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all",
            )}
          >
            <TrendingUp className="h-4 w-4" strokeWidth={2.6} />
            Découvrir comment
          </Link>
        </motion.div>

        {/* ─── Season countdown — FOMO de cycle Léo ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 max-w-3xl mx-auto"
        >
          <SeasonCountdown variant="banner" />
        </motion.div>

        {/* ─── TRENDING ─── */}
        {trending.length > 0 && (
          <section className="mt-20">
            <SectionHeader
              icon={<Flame className="h-4 w-4 text-energy-600" strokeWidth={2.6} />}
              eyebrow="Tendances de la semaine"
              title="Les classements les plus regardés"
              subtitle="Là où la compétition est la plus chaude. Clique pour voir le rang."
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((t, i) => (
                <TrendingCard key={t.professionId} trending={t} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ─── AUTRES UNIVERS — catégories sans mascotte, en grid compact ─── */}
        {otherCategories.length > 0 && (
          <section className="mt-20">
            <div className="max-w-3xl">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist-300 mb-1.5 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-mist-400" strokeWidth={2.6} />
                Et bien plus encore
              </p>
              <h2 className="font-display text-[22px] md:text-[28px] font-black tracking-tight text-night-900 leading-tight">
                Explore les autres univers
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {otherCategories.map((c, i) => (
                <CategoryChampionshipCard key={c.id} category={c} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── HeroSearchBar ────────────────────────────────────────────────────────────
// FIX-13 : Variétée des suggestions
// Avant : les 5 métiers avec le plus de talents (tous "Création & Visuel" car
// data biaisée → quelqu'un cherchant un plombier voyait Animateur 3D, no sens).
// Maintenant :
//   • Au focus sans query → liste des CATÉGORIES actives (parcours par domaine)
//   • Au focus avec query → fuzzy match cross-categories
//   • Sous la search → 4 chips populaires variées (1 par catégorie)
function HeroSearchBar({ professions }: { professions: ProfessionWithStats[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Catégories actives (avec au moins 1 métier ayant des talents).
  // C'est ce qu'on affiche AU FOCUS sans query — varié par essence.
  const activeCategories = useMemo(() => {
    const map = new Map<ProfessionCategoryId, { count: number; talents: number }>();
    for (const p of professions) {
      if (p.talentCount === 0) continue;
      const curr = map.get(p.category) ?? { count: 0, talents: 0 };
      map.set(p.category, {
        count: curr.count + 1,
        talents: curr.talents + p.talentCount,
      });
    }
    return PROFESSION_CATEGORIES.filter((c) => map.has(c.id)).map((c) => ({
      ...c,
      ...map.get(c.id)!,
    }));
  }, [professions]);

  // Chips populaires (sous la search bar) : 1 métier par catégorie pour la
  // variété. Le user voit du Tech, du Créa, de la Santé, du Bâtiment, etc.
  const variedSuggestions = useMemo(() => {
    const byCategory = new Map<ProfessionCategoryId, ProfessionWithStats>();
    const sorted = [...professions]
      .filter((p) => p.talentCount > 0)
      .sort((a, b) => b.talentCount - a.talentCount);
    for (const p of sorted) {
      if (!byCategory.has(p.category)) byCategory.set(p.category, p);
      if (byCategory.size >= 4) break;
    }
    return Array.from(byCategory.values());
  }, [professions]);

  // Fuzzy match sur label + synonymes (cross-categories) quand le user tape.
  const matches = useMemo(() => {
    const q = normalizeName(query.trim());
    if (!q) return [];
    return professions
      .filter((p) => {
        const prof = PROFESSIONS.find((pp) => pp.id === p.id);
        if (!prof) return false;
        const hay = [prof.label, prof.frLabel, prof.short, prof.frShort, ...(prof.synonyms ?? [])]
          .map(normalizeName)
          .join(" ");
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [query, professions]);

  // Click outside closes the dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (professionId: string) => {
    router.push(`/ranking/${professionId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && matches[highlight]) {
      e.preventDefault();
      handleSelect(matches[highlight].id);
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-3xl bg-white ring-1 ring-inset transition-all shadow-card",
          focused
            ? "ring-energy-400/60 shadow-[0_12px_40px_-12px_rgba(255,138,0,0.4)]"
            : "ring-ink-700/15 hover:ring-ink-700/25",
        )}
      >
        <Search
          className={cn(
            "ml-5 h-5 w-5 transition-colors",
            focused ? "text-energy-700" : "text-mist-400",
          )}
          strokeWidth={2.6}
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setHighlight(0);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Quel métier recherches-tu ?"
          className="h-16 md:h-[68px] flex-1 bg-transparent text-[16px] md:text-[18px] font-medium text-night-900 placeholder:text-mist-400 outline-none"
          aria-label="Rechercher un métier"
          autoComplete="off"
        />
        <button
          onClick={() => matches[0] && handleSelect(matches[0].id)}
          disabled={!matches[0]}
          className="mr-2 grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-2xl bg-gradient-to-br from-energy-400 to-energy-600 text-white shadow-card hover:shadow-card-hover hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100"
          aria-label="Lancer la recherche"
        >
          <ArrowRight className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>

      {/* Suggestions chips (visibles seulement quand pas focus) — VARIÉES par catégorie */}
      {!focused && !query && variedSuggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-400">
            Au hasard :
          </span>
          {variedSuggestions.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className="rounded-full bg-white/80 ring-1 ring-inset ring-ink-700/10 px-3 py-1 text-[12px] font-semibold text-mist-100 hover:bg-energy-50 hover:ring-energy-300/40 hover:text-energy-800 transition"
            >
              {p.frLabel}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {/* Cas 1 : on tape — fuzzy match métier */}
        {focused && query && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white shadow-2xl ring-1 ring-ink-700/10 overflow-hidden"
          >
            {matches.map((p, i) => {
              const cat = PROFESSION_CATEGORIES.find((c) => c.id === p.category);
              const Icon = iconForCategory(p.category);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    i === highlight ? "bg-energy-50" : "hover:bg-ink-50",
                  )}
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-xl shrink-0"
                    style={{ background: `${cat?.color ?? "#94A3B8"}22` }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.4} style={{ color: cat?.color ?? "#94A3B8" }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[14px] font-bold text-night-900 truncate">
                      {p.frLabel}
                    </div>
                    <div className="text-[11px] text-mist-300">
                      {cat?.frLabel} · {p.talentCount} talent{p.talentCount > 1 ? "s" : ""} classé{p.talentCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-mist-300 shrink-0" strokeWidth={2.4} />
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Cas 2 : pas de query — on liste les CATÉGORIES (parcours par domaine) */}
        {focused && !query && activeCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white shadow-2xl ring-1 ring-ink-700/10 overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-energy-50/50 border-b border-energy-200/30">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-energy-800">
                Parcourir par domaine
              </p>
            </div>
            {activeCategories.map((c) => {
              const Icon = iconForCategory(c.id);
              return (
                <Link
                  key={c.id}
                  href={`/metiers/${c.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-energy-50"
                  onClick={() => setFocused(false)}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl shrink-0"
                    style={{
                      background: `linear-gradient(160deg, ${c.color}30, ${c.color}10)`,
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.4} style={{ color: c.color }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[14px] font-bold text-night-900 truncate">
                      {c.frLabel}
                    </div>
                    <div className="text-[11px] text-mist-300">
                      {c.count} métier{c.count > 1 ? "s" : ""} · {c.talents} talent
                      {c.talents > 1 ? "s" : ""}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-mist-300 shrink-0" strokeWidth={2.4} />
                </Link>
              );
            })}
            <div className="px-4 py-2.5 bg-ink-50/40 border-t border-ink-700/5 text-center">
              <p className="text-[11px] text-mist-300">
                Tu sais déjà ce que tu cherches ? Tape le nom du métier.
              </p>
            </div>
          </motion.div>
        )}

        {/* Cas 3 : query sans résultat */}
        {focused && matches.length === 0 && query && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white shadow-2xl ring-1 ring-ink-700/10 p-6 text-center"
          >
            <p className="font-display text-[14px] font-semibold text-night-900">
              Aucun métier trouvé pour « {query} »
            </p>
            <p className="text-[12px] text-mist-300 mt-1">
              Tu peux le suggérer via le bouton{" "}
              <strong className="text-mist-100">Feedback</strong> en bas à droite.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-mist-400">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-[26px] md:text-[32px] font-black tracking-tight text-night-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-[14px] text-mist-300 max-w-xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

// ─── TrendingCard ─────────────────────────────────────────────────────────────
function TrendingCard({ trending, index }: { trending: TrendingMetier; index: number }) {
  const cat = PROFESSION_CATEGORIES.find((c) => c.id === trending.categoryId);
  const Icon = iconForCategory(trending.categoryId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/ranking/${trending.professionId}`}
        className="group block rounded-3xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-700/10 hover:shadow-card-hover hover:-translate-y-1 transition-all"
      >
        {/* Header : catégorie + delta */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{ background: `${cat?.color ?? "#94A3B8"}22` }}
            >
              <Icon
                className="h-4 w-4"
                strokeWidth={2.4}
                style={{ color: cat?.color ?? "#94A3B8" }}
              />
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: cat?.color ?? "#94A3B8" }}
            >
              {cat?.frLabel}
            </span>
          </div>
          {trending.deltaThisWeek !== undefined && trending.deltaThisWeek > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-energy-800 px-2 py-0.5 text-[10px] font-black">
              <TrendingUp className="h-3 w-3" strokeWidth={3} />
              +{trending.deltaThisWeek}
            </span>
          )}
        </div>

        {/* Titre métier */}
        <h3 className="font-display text-[18px] font-black tracking-tight text-night-900 leading-tight">
          {trending.professionLabel}
        </h3>
        <p className="text-[12px] text-mist-300 mb-4">
          <Users className="inline h-3 w-3 mr-1" strokeWidth={2.6} />
          {trending.talentCount} talent{trending.talentCount > 1 ? "s" : ""} classé
          {trending.talentCount > 1 ? "s" : ""}
        </p>

        {/* Mini podium */}
        {trending.podium.length > 0 && (
          <div className="mb-3">
            <Podium entries={trending.podium} variant="compact" static />
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-energy-700 group-hover:text-energy-800 transition">
          Voir le classement
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.8}
          />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── KingdomCard ─────────────────────────────────────────────────────────────
// Grande card "Royaume" — réservée aux 4 catégories qui ont un PNG mascot.
// Structure :
//   1. Bannière haute avec icône carrée + dégradé couleur catégorie
//   2. Mascotte 3D rendered en plein milieu (PNG transparent)
//   3. Body : titre "Royaume {nom}" + nb talents + Top 3 métiers numérotés
//   4. CTA "Voir le classement →" couleur catégorie
function KingdomCard({
  category,
  index,
}: {
  category: CategoryWithStats;
  index: number;
}) {
  const Icon = iconForCategory(category.id);
  // Nom court pour "Royaume X" — on garde uniquement le 1er mot avant " & "
  const shortLabel = category.frLabel
    .replace("Création & Visuel", "Créatif")
    .replace("Tech & Ingénierie logicielle", "Tech")
    .replace("Santé & Soins", "Santé")
    .replace("Data & IA", "Data & IA");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/metiers/${category.id}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white",
          "ring-1 ring-inset ring-ink-700/10 shadow-card",
          "hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200",
        )}
      >
        {/* Bannière haute — illustration mascotte + dégradé sky */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${category.color}22 0%, ${category.color}0a 100%)`,
          }}
        >
          {/* Bandeau iconique tag couleur catégorie */}
          <div
            className="absolute top-3 left-3 z-10 grid h-9 w-9 place-items-center rounded-lg shadow-md"
            style={{ background: category.color }}
          >
            <Icon className="h-4 w-4 text-white" strokeWidth={2.6} />
          </div>

          {/* Mascotte PNG — fill du wrapper avec un ratio fixe */}
          {category.mascotSrc && (
            <div className="relative aspect-[5/4] w-full">
              <Image
                src={category.mascotSrc}
                alt={`Mascotte ${shortLabel}`}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                className="object-contain"
                priority={index < 4}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="relative flex-1 flex flex-col p-4 md:p-5">
          {/* Titre — "Royaume {nom}" avec accent couleur catégorie */}
          <h3 className="font-display text-[18px] md:text-[20px] font-black tracking-tight leading-tight text-night-900">
            Royaume{" "}
            <span style={{ color: category.color }}>{shortLabel}</span>
          </h3>

          {/* Compteur talents */}
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-mist-200">
            <Users className="h-3.5 w-3.5" strokeWidth={2.6} style={{ color: category.color }} />
            <span className="tabular-nums text-night-900">
              {category.talentCount.toLocaleString("fr-FR")}
            </span>{" "}
            talents
          </div>

          {/* Top 3 métiers numérotés */}
          {category.topProfessions && category.topProfessions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {category.topProfessions.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 text-[12.5px] text-mist-100"
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full font-display text-[10.5px] font-black text-white tabular-nums shadow-sm",
                    )}
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(180deg, #FFD86A, #C99A00)"
                          : i === 1
                            ? "linear-gradient(180deg, #E5E7EB, #94A3B8)"
                            : "linear-gradient(180deg, #FCAB6E, #B45309)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-semibold truncate">{p.frLabel}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA footer */}
          <div
            className="mt-4 pt-3 border-t flex items-center justify-between"
            style={{ borderColor: `${category.color}26` }}
          >
            <span
              className="text-[11.5px] font-bold uppercase tracking-[0.14em]"
              style={{ color: category.color }}
            >
              Voir le classement
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={2.8}
              style={{ color: category.color }}
            />
          </div>
        </div>

        {/* Badge "🔥 LE PLUS ACTIF" si applicable */}
        {category.isMostActive && (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-white shadow-card ring-1 ring-inset ring-energy-300/60 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.12em] text-energy-700">
            <Flame className="h-3 w-3" strokeWidth={2.8} />
            Le plus actif
          </span>
        )}
      </Link>
    </motion.div>
  );
}

// ─── CategoryChampionshipCard ────────────────────────────────────────────────
// Carte catégorie style "Choisis ton championnat" (image de référence).
// Structure :
//   1. En-tête : icône colorée carrée à gauche, badge "🔥 LE PLUS ACTIF"
//      en haut-droite si applicable
//   2. Titre catégorie + sous-spécialités (4 métiers représentatifs)
//   3. Stats : 👤 N talents · 🏆 #1 Nom + Score
//   4. Footer : "VOIR LE CLASSEMENT →" en uppercase, couleur catégorie
function CategoryChampionshipCard({
  category,
  index,
}: {
  category: CategoryWithStats;
  index: number;
}) {
  const Icon = iconForCategory(category.id);
  // Sous-spécialités : si pas fournies, fallback texte simple
  const subSpecs =
    category.subSpecialties && category.subSpecialties.length > 0
      ? category.subSpecialties.join(" · ")
      : `${category.professionCount} métier${category.professionCount > 1 ? "s" : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/metiers/${category.id}`}
        className={cn(
          "group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white",
          "ring-1 ring-inset ring-ink-700/10 shadow-card",
          "hover:shadow-card-hover hover:-translate-y-1 hover:ring-deepblue-200/60",
          "transition-all duration-200",
        )}
      >
        {/* Badge "LE PLUS ACTIF" — coin haut-droite */}
        {category.isMostActive && (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-energy-50 ring-1 ring-inset ring-energy-300/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-energy-700">
            <Flame className="h-3 w-3" strokeWidth={2.8} />
            Le plus actif
          </span>
        )}

        {/* Halo coloré subtil en arrière-plan (signature catégorie) */}
        <div
          className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"
          style={{ background: category.color }}
        />

        <div className="relative p-5 flex-1 flex flex-col">
          {/* Header — icône carrée + titre */}
          <div className="flex items-start gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-sm"
              style={{ background: category.color }}
            >
              <Icon className="h-5 w-5 text-white" strokeWidth={2.6} />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-[17px] md:text-[18px] font-black tracking-tight text-night-900 leading-tight">
                {category.frLabel}
              </h3>
              <p className="mt-1 text-[11.5px] text-mist-300 leading-snug line-clamp-2">
                {subSpecs}
              </p>
            </div>
          </div>

          {/* Stats — count + Top 1 */}
          <div className="mt-5 grid grid-cols-2 gap-3 pb-1">
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-mist-300 mb-0.5">
                <Users className="h-3 w-3" strokeWidth={2.6} />
                Talents
              </div>
              <div className="font-display text-[18px] md:text-[20px] font-black text-night-900 tabular-nums leading-none">
                {category.talentCount.toLocaleString("fr-FR")}
              </div>
            </div>
            {category.top1 && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-mist-300 mb-0.5">
                  <Trophy
                    className="h-3 w-3"
                    strokeWidth={2.6}
                    style={{ color: category.color }}
                  />
                  #1 {category.top1.name.split(" ")[0]}{" "}
                  {category.top1.name.split(" ")[1]?.[0]}.
                </div>
                <div
                  className="font-display text-[14px] md:text-[15px] font-bold tabular-nums leading-none"
                  style={{ color: category.color }}
                >
                  Score {category.top1.score}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA — bande haut bord top */}
        <div
          className="relative border-t mt-1 px-5 py-3 flex items-center justify-between"
          style={{ borderColor: `${category.color}1a` }}
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.14em] transition-colors"
            style={{ color: category.color }}
          >
            Voir le classement
          </span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={2.8}
            style={{ color: category.color }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
