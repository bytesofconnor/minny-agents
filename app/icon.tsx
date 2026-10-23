import { ImageResponse } from "next/og";
import { FAVICON_STAR_D, INK, TEAL } from "./mark";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <path fill={TEAL} d={FAVICON_STAR_D} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
