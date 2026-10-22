import { ImageResponse } from "next/og";
import { INK, STAR_D, TEAL, WAVE_D } from "./mark";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: INK,
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32">
          <path fill={TEAL} d={STAR_D} />
          <path fill={TEAL} d={WAVE_D} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
