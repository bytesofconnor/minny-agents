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
    default: "Northern Bytes — Forward-deployed engineers for the agent era",
    template: "%s | Northern Bytes",
  },
  description: "We embed with your team and ship production AI systems inside your business. Working software, in weeks.",
  keywords: ["AI agents", "forward-deployed engineering", "automation", "AI systems", "production AI", "agent development", "business automation", "Minneapolis engineering"],
  authors: [{ name: "Connor Barrett" }],
  creator: "Connor Barrett",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Northern Bytes",
    title: "Northern Bytes — Forward-deployed engineers for the agent era",
    description: "We embed with your team and ship production AI systems inside your business. Working software, in weeks.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Northern Bytes — Forward-deployed engineers for the agent era",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Northern Bytes — Forward-deployed engineers for the agent era",
    description: "We embed with your team and ship production AI systems inside your business. Working software, in weeks.",
    images: ["/opengraph-image"],
  },
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
