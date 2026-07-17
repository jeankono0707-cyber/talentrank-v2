// ─────────────────────────────────────────────────────────────────────────────
// Feature flags — décision directeur : cacher tout ce qui n'a pas de data
// réelle derrière, ou qui distract du parcours essentiel (talent → QCM →
// classement → partage).
//
// Philosophie : quand une feature ment (mock data affichée comme réelle),
// elle mine la confiance. Mieux vaut ne rien montrer qu'un chiffre bidon.
//
// Quand une capacité devient prête (Supabase branché, peer reviews réelles,
// messagerie live, saison terminée avec vrais trophées), on flip le flag ici.
// Aucun autre fichier à toucher.
// ─────────────────────────────────────────────────────────────────────────────

export const FEATURES = {
  // ─── Gamification qui ment actuellement ───────────────────────────────
  /** Streak quotidien 🔥 — OK (localStorage, pas de mensonge, juste 1 device). */
  streak: true,
  /** Modal breakdown ligue (QCM + ancienneté + peer reviews).
   *  OFF tant qu'aucune peer review n'existe (bloque Phase 5 Supabase). */
  leagueBreakdown: false,
  /** Toast "tu as perdu N places" — data mock déterministe, ment.
   *  OFF tant que pas de vrai delta hebdo en DB. */
  rankDeltaToast: false,
  /** Countdown saison Apex — affiche "Champion Spring 2026" mais aucun
   *  trophée ne sera décerné. OFF jusqu'à Q4 2026 quand on lancera vraiment. */
  seasonCountdown: false,

  // ─── Audiences ─────────────────────────────────────────────────────────
  /** Mode Studio (Chasse, Candidats, QCM Builder, Messagerie, Abonnement).
   *  Réactivé : le user teste les 2 modes. On garde tout accessible en UI
   *  même si la messagerie est encore mock. Les mécaniques de gamification
   *  fausses (season/toast/breakdown) restent OFF. */
  studioAudience: true,

  // ─── Marketing / navigation secondaire ─────────────────────────────────
  /** Programme parrainage — pas de récompenses réelles ni de mécanique
   *  live. OFF pour l'instant. */
  parrainage: false,
  /** Pages Pricing dédiée — pas prêt à monétiser. OFF. */
  pricing: false,

  // ─── Honnêteté ─────────────────────────────────────────────────────────
  /** Bandeau "BETA PRIVÉE · X talents · seed en cours" en haut des pages
   *  ranking. Sera OFF quand on aura N > 500 talents réels. */
  betaHonestyBanner: true,
  /** Compteurs gonflés dans le hero /ranking ("+18 452 talents"). Quand ce
   *  flag est OFF (défaut), on affiche les VRAIS chiffres. */
  showInflatedStats: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/** Helper : true si la feature est activée. */
export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}
