import { ImageResponse } from "next/og";

// Favicon TalentRank charte v3 :
//   • Fond bleu profond #0A1E3F (carré arrondi)
//   • Silhouette : tête + aile orange + aile blanche (sur fond bleu)

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
        <svg
          width="24"
          height="25"
          viewBox="0 0 100 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Aile droite BLANCHE (grand crochet) */}
          <path
            d="M 80 14 C 88 14, 90 22, 84 32 C 76 46, 66 60, 56 78 C 54 82, 51 84, 50 84 C 49 84, 48 82, 49 80 C 54 64, 62 48, 70 32 C 75 22, 78 16, 80 14 Z"
            fill="#FFFFFF"
          />
          {/* Aile gauche ORANGE */}
          <path
            d="M 40 32 C 32 38, 28 50, 30 64 C 32 76, 42 78, 46 70 C 49 62, 48 50, 46 40 C 44 34, 41 31, 40 32 Z"
            fill="#FF8A00"
          />
          {/* Tête BLANCHE */}
          <circle cx="58" cy="20" r="9" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
