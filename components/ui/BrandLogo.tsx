import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// BrandLogo — charte Nadia (DA officielle).
//
// Variante "monogram" et "wordmark" selon le contexte d'usage :
//   • monogram → carré night avec TR + slash ambre (favicon, app icon, avatar)
//   • wordmark → monogram + texte "TalentRank" + baseline éventuelle
//
// À utiliser pour TOUS les nouveaux composants brand-facing (navbar, footer,
// landing, press kit, OG images). L'ancien <Logo /> (podium) reste pour
// rétro-compatibilité — on remplace au fur et à mesure.
//
// Anatomie :
//   ┌─────────────┐
//   │  T R       │ ← Sora black, blanc, tracking serré
//   │       ╲    │ ← slash ambre 30deg, en bas-droite
//   └─────────────┘
//
// Couleurs canoniques charte :
//   • night #0E1117
//   • amber #F5B22E
//   • white #FFFFFF
// ─────────────────────────────────────────────────────────────────────────────

interface BrandLogoProps {
  /** Variante : monogram (carré seul) ou wordmark (avec texte). */
  variant?: "monogram" | "wordmark" | "wordmark-baseline";
  /** Taille du monogramme en px. Wordmark s'ajuste auto. */
  size?: number;
  /** Skin : "dark" (carré night, défaut) · "light" (carré blanc, pour fond foncé) · "ghost" (transparent, juste contour). */
  skin?: "dark" | "light" | "ghost";
  className?: string;
}

export function BrandLogo({
  variant = "wordmark",
  size = 36,
  skin = "dark",
  className,
}: BrandLogoProps) {
  const bg = skin === "light" ? "#FFFFFF" : skin === "ghost" ? "transparent" : "#0E1117";
  const fg = skin === "light" ? "#0E1117" : "#FFFFFF";
  const ring = skin === "ghost" ? "ring-1 ring-inset ring-brand-night/15" : "";
  const wordmarkColor = "text-brand-night dark:text-white";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* ─── Monogram ─── */}
      <span
        className={cn("relative inline-block overflow-hidden", ring)}
        style={{
          width: size,
          height: size,
          background: bg,
          borderRadius: Math.round(size * 0.22),
        }}
        aria-hidden
      >
        {/* Slash ambre — diagonale traversant le bas-droit */}
        <span
          className="absolute block"
          style={{
            right: -Math.round(size * 0.06),
            bottom: Math.round(size * 0.12),
            width: Math.round(size * 0.55),
            height: Math.max(2, Math.round(size * 0.11)),
            background: "linear-gradient(90deg, #F5B22E 0%, #E0A800 100%)",
            transform: "rotate(-30deg)",
            transformOrigin: "right center",
            borderRadius: Math.max(1, Math.round(size * 0.025)),
            boxShadow: `0 ${Math.round(size * 0.06)}px ${Math.round(size * 0.16)}px -${Math.round(size * 0.04)}px rgba(245,178,46,0.4)`,
          }}
        />
        {/* TR — Sora black, tracking ultra serré */}
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-black leading-none"
          style={{
            color: fg,
            fontSize: Math.round(size * 0.55),
            letterSpacing: `-${Math.round(size * 0.04)}px`,
            paddingTop: Math.round(size * 0.02),
          }}
        >
          TR
        </span>
      </span>

      {/* ─── Wordmark ─── */}
      {variant !== "monogram" && (
        <span className="inline-flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-tight",
              wordmarkColor,
            )}
            style={{
              fontSize: Math.round(size * 0.5),
              letterSpacing: "-0.02em",
            }}
          >
            Talent
            <span style={{ color: "#F5B22E" }}>Rank</span>
          </span>
          {variant === "wordmark-baseline" && (
            <span
              className="font-sans font-semibold uppercase text-brand-slate"
              style={{
                fontSize: Math.round(size * 0.18),
                letterSpacing: "0.2em",
                marginTop: Math.round(size * 0.08),
              }}
            >
              Le classement mondial des talents
            </span>
          )}
        </span>
      )}
    </span>
  );
}
