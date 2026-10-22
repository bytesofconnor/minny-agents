import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Minny Agents — Missed calls, piled-up reviews, invoices in your inbox.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#060A1A",
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(60,219,192,0.20), transparent 58%), radial-gradient(ellipse 50% 40% at 12% 0%, rgba(155,140,255,0.12), transparent 55%), radial-gradient(ellipse 45% 35% at 88% 8%, rgba(124,242,160,0.10), transparent 50%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
          <svg width="28" height="28" viewBox="0 0 16 16">
            <path fill="#3CDBC0" d="M8 0l1.15 6.85L16 8l-6.85 1.15L8 16l-1.15-6.85L0 8l6.85-1.15L8 0z" />
          </svg>
          <span style={{ color: "#F5F5F5", fontSize: "44px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Minny Agents
          </span>
        </div>
        <div
          style={{
            color: "#EAF0F6",
            fontSize: "52px",
            fontWeight: 500,
            lineHeight: 1.05,
            maxWidth: "980px",
            letterSpacing: "-0.03em",
          }}
        >
          Missed calls, piled-up reviews, invoices in your inbox.
        </div>
      </div>
    ),
    { ...size }
  );
}
