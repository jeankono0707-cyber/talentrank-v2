"use client";

// ─────────────────────────────────────────────────────────────────────────────
// global-error : fallback ULTIME quand même le RootLayout crashe (très rare).
// Doit être autonome (pas de Layout). On garde minimaliste — pas de Logo
// custom car les composants peuvent ne pas être disponibles.
// ─────────────────────────────────────────────────────────────────────────────

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#FFF8E1",
          color: "#1B1208",
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6E5A3E",
              margin: 0,
            }}
          >
            TalentRank · Erreur fatale
          </p>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              marginTop: 18,
              marginBottom: 12,
            }}
          >
            Quelque chose s&apos;est cassé en profondeur.
          </h1>
          <p style={{ fontSize: 14.5, color: "#3E2E1B", lineHeight: 1.6 }}>
            On a noté l&apos;incident. Recharge la page ou reviens dans quelques
            minutes.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 10.5,
                color: "#6E5A3E",
                marginTop: 14,
              }}
            >
              Réf : {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              background: "#1A2535",
              color: "white",
              border: "none",
              borderRadius: 9999,
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 6px 16px -8px rgba(0,0,0,0.35)",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
