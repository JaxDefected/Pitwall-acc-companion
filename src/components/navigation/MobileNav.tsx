import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, BarChart2, Gauge, Menu } from "lucide-react";

interface MobileNavProps {
  onOpenMore: () => void;
}

export default function MobileNav({ onOpenMore }: MobileNavProps) {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isSeries = location.pathname.startsWith("/series");
  const isStats = location.pathname.startsWith("/stats") || location.pathname.startsWith("/drivers");
  const isSetups = location.pathname.startsWith("/setups");

  const tabItemClass = (isActive: boolean) =>
    `flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all min-h-[48px] select-none ${
      isActive
        ? "text-red-500 font-extrabold"
        : "text-zinc-400 hover:text-zinc-200"
    }`;

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-lg pb-[env(safe-area-inset-bottom,12px)] flex items-center justify-around px-2 shadow-2xl"
    >
      {/* 1. Home */}
      <Link to="/" className={tabItemClass(isHome)}>
        <Home className={`w-5 h-5 ${isHome ? "text-red-500" : "text-zinc-400"}`} />
        <span className="text-[10px] font-mono tracking-wider uppercase">Home</span>
      </Link>

      {/* 2. Series */}
      <Link to="/series" className={tabItemClass(isSeries)}>
        <Trophy className={`w-5 h-5 ${isSeries ? "text-red-500" : "text-zinc-400"}`} />
        <span className="text-[10px] font-mono tracking-wider uppercase">Series</span>
      </Link>

      {/* 3. Stats */}
      <Link to="/stats" className={tabItemClass(isStats)}>
        <BarChart2 className={`w-5 h-5 ${isStats ? "text-red-500" : "text-zinc-400"}`} />
        <span className="text-[10px] font-mono tracking-wider uppercase">Stats</span>
      </Link>

      {/* 4. Setups */}
      <Link to="/setups/jaxtune" className={tabItemClass(isSetups)}>
        <Gauge className={`w-5 h-5 ${isSetups ? "text-red-500" : "text-zinc-400"}`} />
        <span className="text-[10px] font-mono tracking-wider uppercase">Setups</span>
      </Link>

      {/* 5. More */}
      <button
        type="button"
        onClick={onOpenMore}
        className={tabItemClass(false)}
        aria-label="Open More options menu"
      >
        <Menu className="w-5 h-5 text-zinc-400" />
        <span className="text-[10px] font-mono tracking-wider uppercase">More</span>
      </button>
    </nav>
  );
}
