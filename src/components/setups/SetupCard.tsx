import React from "react";
import { Trash2, Star, Gauge, MapPin } from "lucide-react";
import { SetupItem } from "../../firebase";
import { ACC_CARS, ACC_TRACKS } from "../../utils/accParser";
import { useAuth } from "../../hooks/useAuth";

interface SetupCardProps {
  setup: SetupItem;
  isActive: boolean;
  onSelect: (setup: SetupItem) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  avgRating?: number;
  reviewCount?: number;
}

export default function SetupCard({
  setup,
  isActive,
  onSelect,
  onDelete,
  avgRating,
  reviewCount,
}: SetupCardProps) {
  const { user } = useAuth();
  const isOwner = user && setup.uploadedBy === user.uid;

  const carName = ACC_CARS[setup.car] || setup.car;
  const trackName = ACC_TRACKS[setup.track] || setup.track;

  return (
    <div
      onClick={() => onSelect(setup)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group text-left ${
        isActive
          ? "bg-zinc-850 border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/50"
          : "bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800/80 hover:border-zinc-700"
      }`}
    >
      {/* Top row: Car name & Owner delete button */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 truncate">
          <Gauge className="w-3 h-3 shrink-0" />
          <span className="truncate">{carName}</span>
        </span>

        {isOwner && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(setup.id, e);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
            title="Delete setup"
            aria-label="Delete setup"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Setup Name */}
      <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 mb-1">
        {setup.name}
      </h3>

      {/* Circuit & Ratings */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-2">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
          <span className="truncate">{trackName}</span>
        </span>

        {avgRating !== undefined && avgRating > 0 && (
          <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px]">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{avgRating.toFixed(1)}</span>
            {reviewCount !== undefined && reviewCount > 0 && (
              <span className="text-zinc-500">({reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Notes preview */}
      {setup.notes && (
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed bg-zinc-950/40 p-2 rounded border border-zinc-800/50 mb-2">
          {setup.notes}
        </p>
      )}

      {/* Footer: Author & Date */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>By @{setup.uploadedByName || "engineer"}</span>
        <span>{setup.createdAt ? new Date(setup.createdAt).toLocaleDateString() : ""}</span>
      </div>
    </div>
  );
}
