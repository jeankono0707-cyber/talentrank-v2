import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// BrandLogo v2 — charte définitive validée par Jean-Marie.
//
// IDENTITÉ :
//   • Silhouette humaine stylisée en Y (personne triomphante, bras levés)
//     bicolore : moitié orange #FF8A00 / moitié bleu #0A1E3F
//   • Wordmark : "Talent" en bleu profond, "Rank" en orange
//   • Baseline optionnelle : "LE CLASSEMENT MONDIAL DES TALENTS"
//
// VALEURS PORTÉES (charte) :
//   • Progression — la figure monte/triomphe
//   • Excellence — bras tendus, posture victoire
//   • Mondial — silhouette universelle, abstraction
//   • Communauté — humain au cœur du logo
//   • Impact — couleurs saturées, vivantes
//
// USAGE :
//   • monogram          → carré (favicon, app icon, avatar UI)
//   • wordmark          → silhouette + "TalentRank"
//   • wordmark-baseline → + baseline "LE CLASSEMENT MONDIAL DES TALENTS"
//
// 3 skins selon le fond :
//   • light → logo bicolore sur fond clair (défaut)
//   • dark  → logo blanc+orange sur fond bleu profond
//   • orange → logo blanc+bleu sur fond orange
// ─────────────────────────────────────────────────────────────────────────────

interface BrandLogoProps {
  variant?: "monogram" | "wordmark" | "wordmark-baseline";
  /** Taille de la silhouette en px. Wordmark s'ajuste auto. */
  size?: number;
  /** Adapte les couleurs au fond. */
  skin?: "light" | "dark" | "orange";
  className?: string;
}

// Couleurs canoniques
const BLUE = "#0A1E3F";
const ORANGE = "#FF8A00";
const WHITE = "#FFFFFF";

export function BrandLogo({
  variant = "wordmark",
  size = 40,
  skin = "light",
  className,
}: BrandLogoProps) {
  // Selon skin :
  //   • light  → orange + bleu sur fond clair, "Talent" bleu / "Rank" orange
  //   • dark   → orange + blanc sur fond bleu, "Talent" blanc / "Rank" orange
  //   • orange → bleu + blanc sur fond orange, "Talent" blanc / "Rank" bleu
  const figureLeft  = skin === "orange" ? BLUE   : ORANGE;
  const figureRight = skin === "dark"   ? WHITE  : skin === "orange" ? WHITE : BLUE;
  const wordTalent  = skin === "light"  ? BLUE   : WHITE;
  const wordRank    = skin === "orange" ? BLUE   : ORANGE;
  const baselineCol = skin === "light"  ? BLUE   : WHITE;

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {/* ─── Silhouette Y ─── */}
      <FigureY size={size} leftColor={figureLeft} rightColor={figureRight} />

      {/* ─── Wordmark ─── */}
      {variant !== "monogram" && (
        <span className="inline-flex flex-col leading-none">
          <span
            className="font-display font-extrabold tracking-tight"
            style={{
              fontSize: Math.round(size * 0.62),
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            <span style={{ color: wordTalent }}>Talent</span>
            <span style={{ color: wordRank }}>Rank</span>
          </span>
          {variant === "wordmark-baseline" && (
            <span
              className="font-sans font-bold uppercase"
              style={{
                color: baselineCol,
                opacity: 0.7,
                fontSize: Math.round(size * 0.16),
                letterSpacing: "0.22em",
                marginTop: Math.round(size * 0.12),
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

// ─── FigureY ──────────────────────────────────────────────────────────────
// La silhouette humaine triomphante en Y. Tête ronde, bras levés en V,
// jambes en V renversé. Bicolore : moitié gauche / moitié droite.
//
// Construction symétrique sur viewBox 100×100 pour rester lisible à toutes
// les tailles (favicon 16px → poster 4K).
function FigureY({
  size,
  leftColor,
  rightColor,
}: {
  size: number;
  leftColor: string;
  rightColor: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      {/* ─── MOITIÉ GAUCHE (couleur leftColor) ─── */}

      {/* Bras gauche (monte vers le haut-gauche) */}
      <path
        d="M 50 32
           Q 38 28 22 16
           Q 14 11 14 18
           Q 16 24 32 34
           Q 42 40 50 42
           Z"
        fill={leftColor}
      />
      {/* Corps gauche (tronc) */}
      <path
        d="M 50 42
           L 50 70
           L 42 70
           L 38 50
           Q 42 44 50 42
           Z"
        fill={leftColor}
      />
      {/* Jambe gauche */}
      <path
        d="M 42 70
           L 50 70
           L 50 92
           Q 50 96 46 96
           L 32 96
           Q 28 96 30 92
           Z"
        fill={leftColor}
      />

      {/* ─── MOITIÉ DROITE (couleur rightColor) ─── */}

      {/* Bras droit (monte vers le haut-droite) */}
      <path
        d="M 50 32
           Q 62 28 78 16
           Q 86 11 86 18
           Q 84 24 68 34
           Q 58 40 50 42
           Z"
        fill={rightColor}
      />
      {/* Corps droit (tronc) */}
      <path
        d="M 50 42
           L 50 70
           L 58 70
           L 62 50
           Q 58 44 50 42
           Z"
        fill={rightColor}
      />
      {/* Jambe droite */}
      <path
        d="M 58 70
           L 50 70
           L 50 92
           Q 50 96 54 96
           L 68 96
           Q 72 96 70 92
           Z"
        fill={rightColor}
      />

      {/* ─── TÊTE — split bicolor au centre ─── */}
      {/* Moitié gauche de la tête */}
      <path
        d="M 50 6
           A 9 9 0 0 0 50 24
           Z"
        fill={leftColor}
      />
      {/* Moitié droite de la tête */}
      <path
        d="M 50 6
           A 9 9 0 0 1 50 24
           Z"
        fill={rightColor}
      />
    </svg>
  );
}
