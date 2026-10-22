import { ImageResponse } from "next/og";
import { FAVICON_MARK_STAR_D, FAVICON_MARK_WAVE_D, INK, TEAL } from "./mark";

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
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path fill={TEAL} d={FAVICON_MARK_STAR_D} />
          <path fill={TEAL} d={FAVICON_MARK_WAVE_D} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
