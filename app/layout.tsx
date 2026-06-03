import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { RootShell } from "@/components/layout/RootShell";
import "./globals.css";

// Charte Nadia — pairing pro Chess.com / Linear style.
//   • Sora (display, géométrique, 700/800) → titres impact + wordmark
//   • Inter (body, neutre lisible) → tout le texte courant
//   • JetBrains Mono → chiffres/scores tabulaires
//
// Migration depuis Fredoka + Nunito (Duolingo enfant) vers Sora + Inter
// (premium adulte). Les anciennes variables --font-sans / --font-display
// sont conservées comme alias pour ne pas casser les composants qui les
// utilisent en font-family Tailwind (tailwind.config.ts).
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const display = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "TalentRank — Le marché mondial des talents classés.",
  description:
    "TalentRank, la plateforme de recrutement nouvelle génération. Tous les métiers, classés en temps réel. Pas de candidatures, pas de bruit.",
  metadataBase: new URL("https://talentrank.io"),
  openGraph: {
    title: "TalentRank — Sois trouvable.",
    description:
      "Choisis un métier, une ville, une disponibilité. Les meilleurs talents apparaissent.",
    type: "website",
    siteName: "TalentRank",
    locale: "fr_FR",
    images: [
      {
        url: "/api/og?title=Sois%20trouvable.&subtitle=Un%20m%C3%A9tier%2C%20un%20classement.",
        width: 1200,
        height: 630,
        alt: "TalentRank — Sois trouvable.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentRank — Sois trouvable.",
    description: "Un métier, un classement. Pas de candidatures à lire.",
    images: [
      "/api/og?title=Sois%20trouvable.&subtitle=Un%20m%C3%A9tier%2C%20un%20classement.",
    ],
  },
};

// Le chrome (sidebar + footer + offset) est géré par RootShell qui décide
// selon la route : sur /welcome on cache tout, sinon on render la sidebar
// classique. Voir components/layout/RootShell.tsx.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-950 text-mist-100 font-sans antialiased">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
