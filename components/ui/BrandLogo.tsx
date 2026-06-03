import Image from "next/image";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// BrandLogo v4 — utilise les ASSETS PNG officiels (pas de SVG approximation).
//
// FICHIERS REQUIS dans public/brand/ :
//   • figure.png         → silhouette seule (tête + 2 ailes), FOND TRANSPARENT
//                          Ratio carré ou légèrement vertical, min 512×512
//   • figure-light.png   → version blanche+orange (pour fond bleu/sombre) [OPTIONNEL]
//   • figure-on-orange.png → version blanche+bleue (pour fond orange) [OPTIONNEL]
//
// Le wordmark "TalentRank" reste rendu en HTML/CSS (Plus Jakarta Sans avec
// "Talent" bleu et "Rank" orange). Comme ça la typo s'adapte à la résolution
// d'écran et reste nette, et on n'a qu'UN fichier image à maintenir.
//
// VARIANTES :
//   • monogram          → image silhouette seule (favicon, sidebar collapsed)
//   • wordmark          → image + "TalentRank" inline
//   • wordmark-baseline → + baseline "LE CLASSEMENT MONDIAL DES TALENTS"
//
// SKINS :
//   • light  → silhouette bicolor sur fond clair (figure.png)
//   • dark   → silhouette blanche+orange sur fond bleu (figure-light.png)
//   • orange → silhouette blanche+bleu sur fond orange (figure-on-orange.png)
// ─────────────────────────────────────────────────────────────────────────────

interface BrandLogoProps {
  variant?: "monogram" | "wordmark" | "wordmark-baseline";
  size?: number;
  skin?: "light" | "dark" | "orange";
  className?: string;
  /** Priorité de chargement (à mettre true pour le logo principal au-dessus du fold) */
  priority?: boolean;
}

const BLUE = "#0A1E3F";
const ORANGE = "#FF8A00";
const WHITE = "#FFFFFF";

export function BrandLogo({
  variant = "wordmark",
  size = 40,
  skin = "light",
  className,
  priority = false,
}: BrandLogoProps) {
  // Quel fichier image utiliser selon le skin ?
  // ⚠ Par défaut on pointe vers .svg (placeholder Bezier approximatif).
  // Quand ton vrai PNG est dans public/brand/, change l'extension en .png.
  const figureSrc =
    skin === "dark"
      ? "/brand/figure-light.svg"
      : skin === "orange"
        ? "/brand/figure-on-orange.svg"
        : "/brand/figure.svg";

  // Couleurs du wordmark selon le skin
  const wordTalent = skin === "light" ? BLUE : WHITE;
  const wordRank = skin === "orange" ? WHITE : ORANGE;
  const baselineCol = skin === "light" ? BLUE : WHITE;

  // L'image fait à peu près 1:1.05 (légèrement plus haute que large) — calibré
  // sur le ratio de la charte officielle. Si ton fichier est différent, ajuste.
  const imgHeight = Math.round(size * 1.05);

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src={figureSrc}
        alt="TalentRank"
        width={size}
        height={imgHeight}
        priority={priority}
        className="shrink-0 select-none"
        style={{ width: size, height: imgHeight }}
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
