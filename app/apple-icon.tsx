import { ImageResponse } from "next/og";

// Apple touch icon — 180×180 PNG pour iOS home screen / PWA.
// Variante 180px du favicon : silhouette Y plus respirée, gradient subtil.

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
            "radial-gradient(circle at 30% 25%, #1F3D78 0%, #0A1E3F 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="120"
          height="120"
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
