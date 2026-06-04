// ─────────────────────────────────────────────────────────────────────────────
// Saisons TalentRank — modèle Apex Legends / Fortnite.
//
// Une saison = 3 mois. Tout le monde garde son rang permanent au-dessus des
// saisons (le score global), mais en parallèle un classement SAISONNIER se
// remet à zéro et donne lieu à un trophée saisonnier décerné aux Top 10
// de chaque métier.
//
// Permet de :
//   • Donner une nouvelle chance aux talents arrivés tard
//   • Reactiver les anciens qui se sont laissé glisser
//   • Créer un évènement à célébrer médiatiquement (press release Top 10
//     saisonniers par métier)
//
// Saisons identifiées par leur date de début (1er janvier, 1er avril,
// 1er juillet, 1er octobre). Le nom suit la météo + l'année :
//   Q1 → "Winter 2026"   (jan-mars)
//   Q2 → "Spring 2026"   (avr-juin)
//   Q3 → "Summer 2026"   (juil-sept)
//   Q4 → "Autumn 2026"   (oct-déc)
// ─────────────────────────────────────────────────────────────────────────────

export interface Season {
  id: string;        // "2026-Q2"
  name: string;      // "Spring 2026"
  startISO: string;  // "2026-04-01"
  endISO: string;    // "2026-06-30"
}

const SEASON_NAMES = ["Winter", "Spring", "Summer", "Autumn"] as const;

/** Retourne la saison qui contient la date donnée (default = maintenant). */
export function currentSeason(date: Date = new Date()): Season {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const q = Math.floor(month / 3); // 0..3
  const startMonth = q * 3;
  const endMonth = startMonth + 2;

  const start = new Date(year, startMonth, 1);
  // Dernier jour du mois de fin
  const end = new Date(year, endMonth + 1, 0);

  const seasonName = SEASON_NAMES[q];
  return {
    id: `${year}-Q${q + 1}`,
    name: `${seasonName} ${year}`,
    startISO: toISODate(start),
    endISO: toISODate(end),
  };
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calcule le temps restant jusqu'à la fin de la saison courante.
 * Retourne null si la saison est déjà terminée (cas improbable).
 */
export function timeUntilSeasonEnd(date: Date = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
} | null {
  const season = currentSeason(date);
  const end = new Date(season.endISO + "T23:59:59");
  const diff = end.getTime() - date.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, totalMs: diff };
}

/** Trophée saisonnier décerné aux Top X du leaderboard à la fin de saison. */
export function seasonTrophyLabel(season: Season): string {
  return `Champion ${season.name}`;
}
