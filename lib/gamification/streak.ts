"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Streak quotidien — mécanique d'engagement Duolingo style.
//
// MÉCANIQUE :
//   • Chaque jour où le user visite l'app, son streak +1
//   • S'il rate UN jour, le streak reset à 0
//   • S'il revient le même jour, rien ne change
//
// Loss aversion : perdre N jours de streak fait plus mal que d'en gagner N.
// C'est LE levier rétention #1 de Duolingo (100M MAU).
//
// STOCKAGE : localStorage (côté client uniquement). Pas besoin de Supabase
// pour cette feature — c'est par device. Quand auth sera live on pourra
// le sync en DB.
//
// CLEFS :
//   tr_streak       → JSON { current, longest, lastVisitISO }
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tr_streak";

export interface StreakState {
  current: number;
  longest: number;
  lastVisitISO: string; // YYYY-MM-DD
}

/** Retourne YYYY-MM-DD pour la date passée (default = aujourd'hui), en heure locale */
function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Différence en JOURS entre 2 dates ISO (a - b). Positif si a > b. */
function daysBetween(a: string, b: string): number {
  const dA = new Date(a + "T00:00:00");
  const dB = new Date(b + "T00:00:00");
  return Math.round((dA.getTime() - dB.getTime()) / (1000 * 60 * 60 * 24));
}

function readStreak(): StreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StreakState;
    if (typeof s.current !== "number") return null;
    return s;
  } catch {
    return null;
  }
}

function writeStreak(s: StreakState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // quota / private mode → no-op silently
  }
}

/**
 * Hook React : appelle au mount de la page principale (RootShell ou dashboard).
 *
 * Comportement :
 *   • Si jamais visité  → init { current: 1, longest: 1, today }
 *   • Si visité aujourd'hui → no-op
 *   • Si visité hier → current++ (et bump longest si dépasse)
 *   • Si rupture (>= 2 jours) → reset { current: 1, longest: max(longest,1), today }
 *
 * Retourne le state au moment du mount (memoize pour la première frame).
 */
export function useStreak(): StreakState {
  const [state, setState] = useState<StreakState>(() => {
    return { current: 0, longest: 0, lastVisitISO: toISODate() };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = toISODate();
    const prev = readStreak();

    let next: StreakState;
    if (!prev) {
      next = { current: 1, longest: 1, lastVisitISO: today };
    } else if (prev.lastVisitISO === today) {
      next = prev;
    } else {
      const gap = daysBetween(today, prev.lastVisitISO);
      if (gap === 1) {
        // Jour suivant — increment
        const current = prev.current + 1;
        next = {
          current,
          longest: Math.max(prev.longest, current),
          lastVisitISO: today,
        };
      } else {
        // Streak brisé — reset à 1
        next = { current: 1, longest: prev.longest, lastVisitISO: today };
      }
    }

    writeStreak(next);
    setState(next);
  }, []);

  return state;
}

/** Pour les tests / dev : reset complet */
export function clearStreak() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Milestones pour badges (utilisé par StreakBadge pour highlight des paliers) */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;
export type StreakMilestone = typeof STREAK_MILESTONES[number];

export function nextMilestone(current: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m > current) ?? null;
}
