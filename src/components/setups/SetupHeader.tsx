import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Users } from "lucide-react";

export default function SetupHeader() {
  const location = useLocation();
  const isJaxtune = location.pathname.startsWith("/setups/jaxtune");
  const isCommunity = location.pathname.startsWith("/setups/community");

  return (
    <div className="w-full mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
      <div>
        <h1 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
          <span>ACC SETUP LAB & TELEMETRY</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          {isJaxtune
            ? "Verified, curated baseline setups crafted by Jaxtune for competitive ACC league pace."
            : "Community tuning workspace, team cloud variants, GitHub repositories, and custom setups."}
        </p>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1 shrink-0 self-start sm:self-auto">
        <Link
          to="/setups/jaxtune"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all min-h-[40px] ${
            isJaxtune
              ? "bg-zinc-800 text-red-500 shadow-sm border border-zinc-700 font-black"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Jaxtune</span>
        </Link>

        <Link
          to="/setups/community"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all min-h-[40px] ${
            isCommunity
              ? "bg-zinc-800 text-red-500 shadow-sm border border-zinc-700 font-black"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-red-500" />
          <span>Community</span>
        </Link>
      </div>
    </div>
  );
}
