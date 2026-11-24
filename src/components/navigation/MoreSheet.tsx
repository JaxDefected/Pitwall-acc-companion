import React from "react";
import { Link } from "react-router-dom";
import { Clock, Wrench, User, Shield, MessageSquare, BookOpen, Download, X, ExternalLink, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
}

export default function MoreSheet({ isOpen, onClose, onOpenGuide }: MoreSheetProps) {
  const { user, profile, login } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-5 pb-[calc(20px+env(safe-area-inset-bottom,16px))] max-h-[85vh] overflow-y-auto z-10 space-y-4 animate-fade-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
              Pitwall Tools & Community
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md bg-zinc-800/60"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        {user ? (
          <Link
            to="/me"
            onClick={onClose}
            className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                referrerPolicy="no-referrer"
                alt="Driver"
                className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white">
                {(profile?.username || "D").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-white truncate font-mono">
                @{profile?.username || "driver"}
              </span>
              <span className="text-[10px] text-zinc-400">View driver claim & pinned cars →</span>
            </div>
          </Link>
        ) : (
          <button
            onClick={() => {
              onClose();
              login();
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Connect Driver Account
          </button>
        )}

        {/* Navigation Grid */}
        <div className="space-y-2">
          <Link
            to="/lap-times"
            onClick={onClose}
            className="flex items-center gap-3 p-3.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl transition-colors"
          >
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                ACC Lap Times Reference
              </div>
              <div className="text-[10px] text-zinc-400">Pace tiers & track benchmark targets</div>
            </div>
          </Link>

          <Link
            to="/engineer"
            onClick={onClose}
            className="flex items-center gap-3 p-3.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl transition-colors"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                AI Race Engineer
              </div>
              <div className="text-[10px] text-zinc-400">Setup diagnostics & live telemetry assistant</div>
            </div>
          </Link>

          {/* LNR Discord Link */}
          <a
            href="https://discord.gg/SX2hjFAZj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-xl transition-colors"
          >
            <div className="p-2 bg-[#5865F2]/20 rounded-lg text-[#7983F5]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                Join Late Night Racing Discord
                <ExternalLink className="w-3 h-3 text-[#7983F5]" />
              </div>
              <div className="text-[10px] text-zinc-400">League briefings, stewarding, and community chat</div>
            </div>
          </a>

          <button
            onClick={() => {
              onClose();
              onOpenGuide();
            }}
            className="w-full flex items-center gap-3 p-3.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl transition-colors text-left cursor-pointer"
          >
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Master ACC Tuning Manual
              </div>
              <div className="text-[10px] text-zinc-400">Tyre pressure compensation & damper workbook</div>
            </div>
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors"
            >
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Admin Control Panel
                </div>
                <div className="text-[10px] text-zinc-400">Review driver claims & manual sync runs</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
