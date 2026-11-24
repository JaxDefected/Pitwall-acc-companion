import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Gauge, Clock, Wrench, ChevronDown, MessageSquare, Shield, User, LogIn, ExternalLink } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function DesktopNav() {
  const location = useLocation();
  const { user, profile, loading: authLoading, login } = useAuth();
  const [isSetupsDropdownOpen, setIsSetupsDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) =>
    `px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
      isActive(path)
        ? "text-red-500 bg-red-950/40 border border-red-500/30"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
    }`;

  const isAdmin = user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();

  return (
    <header className="hidden lg:flex bg-zinc-950/95 border-b border-zinc-850 sticky top-0 z-40 backdrop-blur-md px-6 py-2.5 items-center justify-between">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-red-600 text-white px-2 py-0.5 rounded text-[11px] font-mono font-black tracking-widest shadow-md shadow-red-600/20 group-hover:bg-red-500 transition-colors">
            PITWALL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              <Gauge className="text-red-500 w-4 h-4 animate-pulse" />
              PitWall
              <span className="text-[10px] text-zinc-500 font-mono font-normal border-l border-zinc-800 pl-1.5">
                LNR ACC COMPANION
              </span>
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link to="/series" className={navLinkClass("/series")}>
            Series
          </Link>
          <Link to="/stats" className={navLinkClass("/stats")}>
            Stats
          </Link>

          {/* Setups Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsSetupsDropdownOpen(true)}
            onMouseLeave={() => setIsSetupsDropdownOpen(false)}
          >
            <button
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                location.pathname.startsWith("/setups")
                  ? "text-red-500 bg-red-950/40 border border-red-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Setups
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSetupsDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isSetupsDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 animate-fade-in font-sans">
                <Link
                  to="/setups/jaxtune"
                  onClick={() => setIsSetupsDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-zinc-800 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    ⚡ Jaxtune Setups
                  </div>
                  <div className="text-[10px] text-zinc-400">Curated, baseline ACC setups</div>
                </Link>
                <div className="border-t border-zinc-800/80 my-1"></div>
                <Link
                  to="/setups/community"
                  onClick={() => setIsSetupsDropdownOpen(false)}
                  className="block px-4 py-2 hover:bg-zinc-800 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    👥 Community Tunes
                  </div>
                  <div className="text-[10px] text-zinc-400">My Tunes, Team Workspace & Sync</div>
                </Link>
              </div>
            )}
          </div>

          <Link to="/lap-times" className={navLinkClass("/lap-times")}>
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Lap Times
          </Link>
          <Link to="/engineer" className={navLinkClass("/engineer")}>
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            Engineer
          </Link>

          {isAdmin && (
            <Link to="/admin" className={navLinkClass("/admin")}>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Admin
            </Link>
          )}
        </nav>
      </div>

      {/* Right Side: Discord Link & User Profile / Login */}
      <div className="flex items-center gap-3">
        {/* Discord Join Link */}
        <a
          href="https://discord.gg/SX2hjFAZj"
          target="_blank"
          rel="noopener noreferrer"
          title="Join Late Night Racing on Discord"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-md text-[11px] font-mono font-bold text-[#7983F5] transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
          <span>LNR Discord</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>

        {/* Auth / Profile */}
        {authLoading ? (
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-400 text-xs font-mono animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Syncing...
          </div>
        ) : user ? (
          <Link
            to="/me"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-md transition-all group"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                referrerPolicy="no-referrer"
                alt={profile?.username || "Driver"}
                className="w-6 h-6 rounded-full border border-zinc-700 object-cover group-hover:border-red-500"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-black group-hover:border-red-500">
                {(profile?.username || user.displayName || "D").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-zinc-200 group-hover:text-white font-mono truncate max-w-[120px]">
                @{profile?.username || "driver"}
              </span>
              <span className="text-[9px] text-red-500 font-mono uppercase tracking-wider font-extrabold leading-none">
                Crew Connected
              </span>
            </div>
          </Link>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black uppercase tracking-wider px-4 py-2 rounded-md transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Connect Driver
          </button>
        )}
      </div>
    </header>
  );
}
