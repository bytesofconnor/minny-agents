import { ImageResponse } from "next/og";

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
          backgroundColor: "#060A1A",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 16 16">
          <path fill="#3CDBC0" d="M8 0l1.15 6.85L16 8l-6.85 1.15L8 16l-1.15-6.85L0 8l6.85-1.15L8 0z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
