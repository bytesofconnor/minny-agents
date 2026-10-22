import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans-x" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-x" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northern-bytes.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Minny Agents — AI agents for Twin Cities businesses",
    template: "%s | Minny Agents",
  },
  description: "We build AI agents that answer, follow up, and keep the books moving for restaurants, shops, and service businesses.",
  keywords: ["AI agents", "automation", "AI systems", "restaurants", "small business", "Twin Cities", "Minneapolis", "bookkeeping", "reviews"],
  authors: [{ name: "Connor Barrett" }],
  creator: "Connor Barrett",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Minny Agents",
    title: "Minny Agents — AI agents for Twin Cities businesses",
    description: "We build AI agents that answer, follow up, and keep the books moving for restaurants, shops, and service businesses.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Minny Agents — AI agents for Twin Cities businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minny Agents — AI agents for Twin Cities businesses",
    description: "We build AI agents that answer, follow up, and keep the books moving for restaurants, shops, and service businesses.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
