import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Northern Bytes — Forward-deployed engineers for the agent era";
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
            <span style={{ color: "#A0A0A0", fontSize: "16px", letterSpacing: "0.08em" }}>INDEPENDENT FORWARD-DEPLOYED ENGINEERING</span>
          </div>
          <h1
            style={{
              color: "#F5F5F5",
              fontSize: "72px",
              fontWeight: 500,
              lineHeight: 1,
              margin: 0,
              maxWidth: "900px",
              letterSpacing: "-0.035em",
            }}
          >
            Forward-deployed engineers for the agent era.
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "8px", backgroundColor: "#7CF2A0" }} />
            <div style={{ width: "32px", height: "8px", backgroundColor: "#3CDBC0" }} />
            <div style={{ width: "32px", height: "8px", backgroundColor: "#9B8CFF" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%" }}>
            <span style={{ color: "#F5F5F5", fontSize: "28px", fontWeight: 600, letterSpacing: "-0.01em" }}>Northern Bytes</span>
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
