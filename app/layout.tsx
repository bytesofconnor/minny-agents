import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans-x" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-x" });
export const metadata: Metadata = {
  title: "Northern Bytes — Forward-deployed engineers for the agent era",
  description: "We embed with your team and ship production AI systems inside your business. Working software, in weeks.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={`${sans.variable} ${mono.variable} font-sans`}>{children}</body></html>);
}
