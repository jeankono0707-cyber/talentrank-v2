"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PathTracker — mémorise la page précédente RÉELLEMENT visitée dans le site.
//
// Pourquoi ce composant existe : `window.history.length > 1` est faussement
// permissif. Il compte aussi les pages ouvertes AVANT l'arrivée sur le site
// (Google, autre onglet, etc.). Du coup `router.back()` peut faire quitter
// le site sans qu'on s'en rende compte. Le SmartBackButton se basait sur ce
// signal — résultat : retour erratique, l'utilisateur atterrissait toujours
// sur la 1ère page visitée du site.
//
// Solution : on track manuellement la suite des pathnames internes via
// sessionStorage. Au mount d'un SmartBackButton, on lit la valeur précédente.
// Si elle existe ET est différente du pathname actuel → on l'utilise pour le
// retour. Sinon → fallbackHref.
//
// SessionStorage (pas localStorage) : on veut que ça se reset si l'utilisateur
// ferme l'onglet — pas de pollution entre sessions.
// ─────────────────────────────────────────────────────────────────────────────

export const PREV_PATH_KEY = "tr_prev_path";
export const CURR_PATH_KEY = "tr_curr_path";

export function PathTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Lecture de l'état actuel en sessionStorage
    const storedCurr = sessionStorage.getItem(CURR_PATH_KEY);

    // Si le pathname a changé depuis le dernier track, on shift :
    // - l'ancien curr devient le nouveau prev
    // - le nouveau pathname devient curr
    if (storedCurr && storedCurr !== pathname) {
      sessionStorage.setItem(PREV_PATH_KEY, storedCurr);
    }
    sessionStorage.setItem(CURR_PATH_KEY, pathname);
    lastTrackedRef.current = pathname;
  }, [pathname]);

  return null;
}
