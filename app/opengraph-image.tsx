import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Minny Agents — AI agents for Twin Cities businesses";
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
          justifyContent: "space-between",
          backgroundColor: "#060A1A",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
            <span style={{ color: "#3CDBC0", fontSize: "20px", letterSpacing: "0.08em" }}>§ 00</span>
            <span style={{ color: "#A0A0A0", fontSize: "16px", letterSpacing: "0.08em" }}>AI AGENTS FOR TWIN CITIES BUSINESSES</span>
          </div>
          <h1
            style={{
              color: "#F5F5F5",
              fontSize: "64px",
              fontWeight: 500,
              lineHeight: 1,
              margin: 0,
              maxWidth: "960px",
              letterSpacing: "-0.035em",
            }}
          >
            Missed calls, piled-up reviews, invoices in your inbox.
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "8px", backgroundColor: "#7CF2A0" }} />
            <div style={{ width: "32px", height: "8px", backgroundColor: "#3CDBC0" }} />
            <div style={{ width: "32px", height: "8px", backgroundColor: "#9B8CFF" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="14" height="14" viewBox="0 0 16 16">
                <path fill="#3CDBC0" d="M8 0l1.15 6.85L16 8l-6.85 1.15L8 16l-1.15-6.85L0 8l6.85-1.15L8 0z" />
              </svg>
              <span style={{ color: "#F5F5F5", fontSize: "28px", fontWeight: 600, letterSpacing: "-0.01em" }}>Minny Agents</span>
            </div>
            <span style={{ color: "#A0A0A0", fontSize: "18px", letterSpacing: "0.08em" }}>MINNEAPOLIS, MN</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
