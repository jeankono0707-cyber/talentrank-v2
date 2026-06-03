import { ImageResponse } from "next/og";

// Apple touch icon — 180×180 PNG pour iOS home screen / PWA.
// Même esprit que /icon mais avec plus de respiration et un grain de tonal
// shift (radial gradient subtil) pour passer le 180px sans paraître plat.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 30% 20%, #1A2334 0%, #0E1117 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Slash ambre — version épaisse pour iOS */}
        <div
          style={{
            position: "absolute",
            right: -12,
            bottom: 28,
            width: 110,
            height: 22,
            background: "linear-gradient(90deg, #F5B22E 0%, #E0A800 100%)",
            transform: "rotate(-30deg)",
            transformOrigin: "right center",
            borderRadius: 4,
            boxShadow: "0 6px 18px -4px rgba(245,178,46,0.45)",
          }}
        />
        {/* Lettrage TR */}
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: -6,
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
