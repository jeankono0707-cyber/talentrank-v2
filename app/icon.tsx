import { ImageResponse } from "next/og";

// Next.js metadata file — généré comme /icon au build.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
//
// Favicon TalentRank charte v2 :
//   • Fond bleu profond #0A1E3F (carré arrondi)
//   • Silhouette Y stylisée bicolore : moitié orange #FF8A00 / moitié blanche
//
// Lisible dès 16×16, identifiable à 32×32, propre à 192×192.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A1E3F",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Silhouette Y — SVG inline pour rendu net en PNG runtime.
            Mêmes paths que <FigureY /> de BrandLogo mais sans tête détaillée
            (pour rester lisible à 32px). */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gauche orange */}
          <path d="M 50 32 Q 38 28 22 16 Q 14 11 14 18 Q 16 24 32 34 Q 42 40 50 42 Z" fill="#FF8A00" />
          <path d="M 50 42 L 50 70 L 42 70 L 38 50 Q 42 44 50 42 Z" fill="#FF8A00" />
          <path d="M 42 70 L 50 70 L 50 92 Q 50 96 46 96 L 32 96 Q 28 96 30 92 Z" fill="#FF8A00" />
          {/* Droite blanc */}
          <path d="M 50 32 Q 62 28 78 16 Q 86 11 86 18 Q 84 24 68 34 Q 58 40 50 42 Z" fill="#FFFFFF" />
          <path d="M 50 42 L 50 70 L 58 70 L 62 50 Q 58 44 50 42 Z" fill="#FFFFFF" />
          <path d="M 58 70 L 50 70 L 50 92 Q 50 96 54 96 L 68 96 Q 72 96 70 92 Z" fill="#FFFFFF" />
          {/* Tête bicolor */}
          <path d="M 50 6 A 9 9 0 0 0 50 24 Z" fill="#FF8A00" />
          <path d="M 50 6 A 9 9 0 0 1 50 24 Z" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
