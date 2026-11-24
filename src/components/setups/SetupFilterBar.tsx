import React from "react";
import { Search, Activity, Flame } from "lucide-react";
import { ACC_CARS, ACC_TRACKS } from "../../utils/accParser";
import { useAuth } from "../../hooks/useAuth";

interface SetupFilterBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  carFilter: string;
  setCarFilter: (car: string) => void;
  trackFilter: string;
  setTrackFilter: (track: string) => void;
  onlyPinnedCarsFilter: boolean;
  setOnlyPinnedCarsFilter: (val: boolean) => void;
  availableCars?: string[];
  availableTracks?: string[];
}

export default function SetupFilterBar({
  searchText,
  setSearchText,
  carFilter,
  setCarFilter,
  trackFilter,
  setTrackFilter,
  onlyPinnedCarsFilter,
  setOnlyPinnedCarsFilter,
  availableCars = [],
  availableTracks = [],
}: SetupFilterBarProps) {
  const { profile } = useAuth();

  // If availableCars not passed or empty, default to ACC_CARS
  const carKeys = availableCars.length > 0 ? availableCars : Object.keys(ACC_CARS);
  const trackKeys = availableTracks.length > 0 ? availableTracks : Object.keys(ACC_TRACKS);

  // Group cars by class
  const groups: Record<string, string[]> = {
    "GT3 Class": [],
    "GT4 Class": [],
    "GT2 Class": [],
    "Other": [],
  };

  carKeys.forEach((carKey) => {
    const lower = carKey.toLowerCase();
    if (lower.includes("gt4") || lower.includes("ginetta") || lower.includes("camaro") || lower.includes("alpine")) {
      groups["GT4 Class"].push(carKey);
    } else if (lower.includes("gt2")) {
      groups["GT2 Class"].push(carKey);
    } else if (lower.includes("gt3") || lower.includes("vantage") || lower.includes("ferrari") || lower.includes("porsche") || lower.includes("bmw") || lower.includes("audi")) {
      groups["GT3 Class"].push(carKey);
    } else {
      groups["Other"].push(carKey);
    }
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 shadow-md">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <label htmlFor="registry-search-input" className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
          Registry Search
        </label>
        <Activity className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          id="registry-search-input"
          type="text"
          placeholder="Search setups, notes, authors..."
          aria-label="Search setups"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-zinc-950 text-white pl-9 pr-4 py-2 border border-zinc-800 rounded-lg text-base md:text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>

      {/* Pinned Series Cars Toggle */}
      {profile?.pinnedSeriesCars && profile.pinnedSeriesCars.length > 0 && (
        <div className="flex items-center justify-between bg-red-950/20 border border-red-500/20 rounded-lg p-2.5 hover:bg-red-950/30 transition-all">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <div className="min-w-0">
              <p className="text-xs font-black text-red-400 tracking-tight leading-none">Series Vehicles Active</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-mono leading-none">
                Pin list: {profile.pinnedSeriesCars.length} cars
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-red-400 font-bold bg-zinc-900 border border-red-500/30 hover:border-red-500/50 px-2.5 py-1 rounded-md cursor-pointer select-none active:scale-95 transition-all h-8 shrink-0">
            <input
              type="checkbox"
              checked={onlyPinnedCarsFilter}
              onChange={(e) => setOnlyPinnedCarsFilter(e.target.checked)}
              className="accent-red-600 w-3.5 h-3.5 cursor-pointer block shrink-0"
            />
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">Series Only</span>
          </label>
        </div>
      )}

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <label htmlFor="filter-car-select" className="text-zinc-400 block font-mono uppercase text-[10px] font-bold mb-1">
            Vehicle
          </label>
          <select
            id="filter-car-select"
            value={carFilter}
            onChange={(e) => setCarFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-2.5 rounded-lg focus:outline-none focus:border-red-500 font-mono text-base md:text-xs font-semibold min-h-[44px] md:min-h-0 cursor-pointer"
          >
            <option value="all">All Vehicles</option>
            {Object.entries(groups).map(([groupName, items]) => {
              if (items.length === 0) return null;
              return (
                <optgroup key={groupName} label={groupName} className="bg-zinc-900 text-zinc-400 font-bold">
                  {items.map((k) => (
                    <option key={k} value={k} className="bg-zinc-950 text-white">
                      {ACC_CARS[k] || k}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor="filter-track-select" className="text-zinc-400 block font-mono uppercase text-[10px] font-bold mb-1">
            Circuit
          </label>
          <select
            id="filter-track-select"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-2.5 rounded-lg focus:outline-none focus:border-red-500 font-mono text-base md:text-xs font-semibold min-h-[44px] md:min-h-0 cursor-pointer"
          >
            <option value="all">All Circuits</option>
            {trackKeys.map((k) => (
              <option key={k} value={k} className="bg-zinc-950 text-white">
                {ACC_TRACKS[k] || k}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
