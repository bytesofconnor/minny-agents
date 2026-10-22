import { ImageResponse } from "next/og";
import { INK, STAR_D, TEAL, WAVE_D } from "./mark";

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
          backgroundColor: INK,
          backgroundImage:
            "linear-gradient(100deg, transparent 8%, rgba(60,219,192,0.22) 38%, rgba(124,242,160,0.16) 52%, transparent 82%), radial-gradient(ellipse 70% 50% at 50% -8%, rgba(60,219,192,0.18), transparent 60%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "36px" }}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <path fill={TEAL} d={STAR_D} />
            <path fill={TEAL} d={WAVE_D} />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: "44px", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#F5F5F5", fontWeight: 700 }}>Minny</span>
            <span style={{ color: "rgba(234,240,246,0.72)", fontWeight: 500, marginLeft: "12px" }}>Agents</span>
          </div>
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
