import "./globals.css";
import React from "react";

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
    <html lang="en" className="dark">
      <body className="bg-[#05080f] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
