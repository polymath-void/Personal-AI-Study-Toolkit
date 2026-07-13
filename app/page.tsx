"use client";

import dynamic from "next/dynamic";
import React from "react";

const StudyGuideApp = dynamic(() => import("@/components/StudyGuideApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060a12] text-slate-100">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/10 border-t-emerald-500 animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
          Loading Study Guide Workspace...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <StudyGuideApp />;
}
