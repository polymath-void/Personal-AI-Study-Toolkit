import { Nunito, Quicksand } from "next/font/google";
import "./globals.css";
import React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const nunito = Nunito({ 
  subsets: ["latin"], 
  variable: "--font-nunito",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata = {
  title: "Study Guide Toolkit - Smart Visual Study Guide",
  description: "An AI-powered Study Guide Companion that normalizes complex matters in a smart way, offering simplified text explanations, interactive visual mind maps, follow-up Q&A, and active recall flashcards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${nunito.variable} ${quicksand.variable}`}>
      <body className={`bg-[#05080f] text-slate-100 min-h-screen font-sans ${nunito.className}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
