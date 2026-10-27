import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer, Header } from "./Chrome";
import { SITE_DESCRIPTION, SITE_TITLE } from "./seo";
import { SITE_URL } from "./site";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], display: "swap", variable: "--font-sans-x" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono-x" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Minny Agents",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI agents Minneapolis",
    "AI for restaurants Minneapolis",
    "AI automation Twin Cities",
    "small business",
    "restaurants",
    "home services",
    "clinics",
    "bookkeeping",
    "reviews",
  ],
  authors: [{ name: "Connor Barrett" }],
  creator: "Connor Barrett",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Minny Agents",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
        <div className="relative min-h-screen">
          <div className="scene" aria-hidden="true">
            <div className="aurora" />
          </div>
          <div className="relative z-10 mx-auto max-w-[1440px] border-x border-line">
            <Header />
            {children}
            <Footer />
          </div>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
