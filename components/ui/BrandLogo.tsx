import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// BrandLogo v3 — charte définitive haute résolution (image fournie).
//
// LE VRAI LOGO :
//   • Tête ronde SÉPARÉE en haut (cercle bleu profond #0A1E3F)
//   • Aile gauche ORANGE en forme de feuille pointue arrondie
//   • Aile droite BLEU PROFOND en forme de grand crochet (plus longue,
//     démarre en haut-droite et descend en arc vers le centre-bas)
//   • Les deux ailes ne se touchent pas — espace blanc au milieu
//
// WORDMARK :
//   • "Talent" en bleu profond
//   • "Rank" en orange
//   • Police : Plus Jakarta Sans Bold
//   • Baseline optionnelle : "LE CLASSEMENT MONDIAL DES TALENTS"
//
// 3 skins selon le fond (light / dark / orange).
// ─────────────────────────────────────────────────────────────────────────────

interface BrandLogoProps {
  variant?: "monogram" | "wordmark" | "wordmark-baseline";
  size?: number;
  skin?: "light" | "dark" | "orange";
  className?: string;
}

// Couleurs canoniques charte
const BLUE = "#0A1E3F";
const ORANGE = "#FF8A00";
const WHITE = "#FFFFFF";

export function BrandLogo({
  variant = "wordmark",
  size = 40,
  skin = "light",
  className,
}: BrandLogoProps) {
  // Couleurs des éléments selon le skin :
  //   light  → logo bicolore (orange + bleu) sur fond clair
  //   dark   → logo orange + blanc sur fond bleu
  //   orange → logo bleu + blanc sur fond orange
  const wingLeftColor  = ORANGE;
  const wingRightColor = skin === "dark" ? WHITE : skin === "orange" ? WHITE : BLUE;
  const headColor      = skin === "dark" ? WHITE : skin === "orange" ? WHITE : BLUE;
  // Si dark : l'aile gauche reste orange (signature), pas blanche.
  // Si orange : l'aile gauche devient blanche pour contraster sur orange.
  const wingLeftActual = skin === "orange" ? WHITE : ORANGE;

  const wordTalent = skin === "light" ? BLUE : WHITE;
  const wordRank   = skin === "orange" ? WHITE : ORANGE;
  const baselineCol = skin === "light" ? BLUE : WHITE;

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <FigureY
        size={size}
        leftColor={wingLeftActual}
        rightColor={wingRightColor}
        headColor={headColor}
      />

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
                opacity: 0.75,
                fontSize: Math.round(size * 0.16),
                letterSpacing: "0.22em",
                marginTop: Math.round(size * 0.14),
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
// La silhouette officielle : tête ronde séparée + 2 ailes courbées (feuilles).
// Construction sur viewBox 100×100 — lisible de 16px (favicon) à grand format.
//
// Paths construits aux courbes Bezier cubiques pour des galbes propres :
//   • Tête : cercle séparé (cx=50, cy=18, r=9)
//   • Aile gauche : feuille pointue, courbée vers le bas-gauche, mince
//     et arrondie en haut, terminant en pointe arrondie en bas
//   • Aile droite : grand crochet en C ouvert, démarre en haut-droite (x=82),
//     courbe vers le centre-gauche puis pointe vers le centre-bas (x=50, y=82)
function FigureY({
  size,
  leftColor,
  rightColor,
  headColor,
}: {
  size: number;
  leftColor: string;
  rightColor: string;
  headColor: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.05}
      viewBox="0 0 100 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      {/* ─── Aile droite BLEUE — grand crochet en C ouvert ─── */}
      <path
        d="M 80 14
           C 88 14, 90 22, 84 32
           C 76 46, 66 60, 56 78
           C 54 82, 51 84, 50 84
           C 49 84, 48 82, 49 80
           C 54 64, 62 48, 70 32
           C 75 22, 78 16, 80 14
           Z"
        fill={rightColor}
      />

      {/* ─── Aile gauche ORANGE — feuille pointue arrondie ─── */}
      <path
        d="M 40 32
           C 32 38, 28 50, 30 64
           C 32 76, 42 78, 46 70
           C 49 62, 48 50, 46 40
           C 44 34, 41 31, 40 32
           Z"
        fill={leftColor}
      />

      {/* ─── Tête — cercle séparé ─── */}
      <circle cx="58" cy="20" r="9" fill={headColor} />
    </svg>
  );
}
