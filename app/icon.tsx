import { ImageResponse } from "next/og";

// Next.js metadata file — généré au build comme /icon.
// Référence officielle : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
//
// Le favicon TalentRank charte Nadia :
//   • Fond night #0E1117 (carré arrondi 32px)
//   • Lettrage "TR" en blanc Sora black
//   • Slash ambre #F5B22E qui traverse le R en diagonale
//
// Lisible dès 16×16, distinctif à 32×32, propre à 192×192.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0E1117",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Slash ambre — diagonale qui traverse le carré sous le R */}
        <div
          style={{
            position: "absolute",
            right: -2,
            bottom: 4,
            width: 18,
            height: 4,
            background: "#F5B22E",
            transform: "rotate(-32deg)",
            transformOrigin: "right center",
            borderRadius: 1,
          }}
        />
        {/* Lettrage TR */}
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: -1.2,
            lineHeight: 1,
            zIndex: 1,
            display: "flex",
          }}
        >
          TR
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
