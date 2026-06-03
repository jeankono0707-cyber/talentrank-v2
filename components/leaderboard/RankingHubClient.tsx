"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
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
}

export function RankingHubClient({ professions, categories, trending }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50/30 via-transparent to-transparent">
      {/* Décor subtil — soft glow ambre derrière le hero */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 60%)",
        }}
      />

      <div className="container-page pt-16 md:pt-20 pb-24">
        {/* ─── HERO ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/60 px-4 py-1.5 ring-1 ring-inset ring-amber-300/40 mb-5">
            <Trophy className="h-3.5 w-3.5 text-amber-700" strokeWidth={2.6} />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800">
              Classements TalentRank
            </span>
          </div>
          <h1 className="font-display text-[40px] md:text-[58px] font-black tracking-tight leading-[1.05] text-night-900">
            Qui est le meilleur,
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              dans ton métier ?
            </span>
          </h1>
          <p className="mt-5 text-[15px] md:text-[16px] text-mist-200 max-w-xl mx-auto">
            Découvre les meilleurs talents du monde, classés métier par métier.
            <strong className="text-mist-50"> Pas de mix, pas de bruit.</strong>
          </p>
        </motion.div>

        {/* ─── HERO SEARCH ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <HeroSearchBar professions={professions} />
        </motion.div>

        {/* ─── TRENDING ─── */}
        {trending.length > 0 && (
          <section className="mt-20">
            <SectionHeader
              icon={<Flame className="h-4 w-4 text-amber-600" strokeWidth={2.6} />}
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

        {/* ─── CATÉGORIES ─── */}
        <section className="mt-24">
          <SectionHeader
            icon={<Sparkles className="h-4 w-4 text-night-700" strokeWidth={2.6} />}
            eyebrow="Explorer par domaine"
            title="Ou choisis un univers"
            subtitle="9 catégories — toutes les professions, classées."
          />
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
            {categories.map((c, i) => (
              <CategoryTile key={c.id} category={c} index={i} />
            ))}
          </div>
        </section>
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
            ? "ring-amber-400/60 shadow-[0_12px_40px_-12px_rgba(245,158,11,0.4)]"
            : "ring-ink-700/15 hover:ring-ink-700/25",
        )}
      >
        <Search
          className={cn(
            "ml-5 h-5 w-5 transition-colors",
            focused ? "text-amber-700" : "text-mist-400",
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
          className="mr-2 grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-card hover:shadow-card-hover hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100"
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
              className="rounded-full bg-white/80 ring-1 ring-inset ring-ink-700/10 px-3 py-1 text-[12px] font-semibold text-mist-100 hover:bg-amber-50 hover:ring-amber-300/40 hover:text-amber-800 transition"
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
                    i === highlight ? "bg-amber-50" : "hover:bg-ink-50",
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
            <div className="px-4 py-2.5 bg-amber-50/50 border-b border-amber-200/30">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-amber-800">
                Parcourir par domaine
              </p>
            </div>
            {activeCategories.map((c) => {
              const Icon = iconForCategory(c.id);
              return (
                <Link
                  key={c.id}
                  href={`/metiers/${c.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-50"
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
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-black">
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
        <div className="flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-amber-700 group-hover:text-amber-800 transition">
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

// ─── CategoryTile ─────────────────────────────────────────────────────────────
function CategoryTile({ category, index }: { category: CategoryWithStats; index: number }) {
  const Icon = iconForCategory(category.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link
        href={`/metiers/${category.id}`}
        className="group relative block rounded-3xl bg-white p-5 ring-1 ring-inset ring-ink-700/10 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all overflow-hidden"
      >
        {/* Decorative blur halo */}
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity"
          style={{ background: category.color }}
        />
        <div className="relative">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl mb-3"
            style={{
              background: `linear-gradient(160deg, ${category.color}30, ${category.color}10)`,
            }}
          >
            <Icon className="h-6 w-6" strokeWidth={2.5} style={{ color: category.color }} />
          </span>
          <h3 className="font-display text-[15px] md:text-[16px] font-black tracking-tight text-night-900 leading-tight">
            {category.frLabel}
          </h3>
          <p className="mt-1 text-[11px] text-mist-400">
            {category.professionCount} métier{category.professionCount > 1 ? "s" : ""} ·{" "}
            {category.talentCount} talent{category.talentCount > 1 ? "s" : ""}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
