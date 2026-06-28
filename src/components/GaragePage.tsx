import { useState } from "react";
import { SavedSetupItem, UserProfile, SetupItem } from "../firebase";
import { ACC_CARS, ACC_TRACKS } from "../utils/accParser";
import { 
  Folder, 
  Search, 
  Trash2, 
  Wrench, 
  Activity, 
  Calendar, 
  RefreshCw,
  Gauge,
  User,
  Info
} from "lucide-react";

interface GaragePageProps {
  tunedSetupsList: SavedSetupItem[];
  profile: UserProfile | null;
  onInspect: (setup: SetupItem) => void;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function GaragePage({
  tunedSetupsList,
  profile,
  onInspect,
  onDelete,
  onRefresh
}: GaragePageProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalCarFilter, setInternalCarFilter] = useState("all");
  const [internalTrackFilter, setInternalTrackFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter only my setups
  const mySetupsRaw = profile
    ? tunedSetupsList.filter((s) => s.authorUsername === profile.username)
    : [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const myFilteredSetups = mySetupsRaw.filter((setup) => {
    const searchLower = internalSearch.toLowerCase().trim();
    const carName = (ACC_CARS[setup.car] || setup.car || "").toLowerCase();
    const trackName = (ACC_TRACKS[setup.track] || setup.track || "").toLowerCase();
    const notesLower = (setup.versionNote || setup.notes || "").toLowerCase();

    const matchesSearch = searchLower === "" ||
                          carName.includes(searchLower) ||
                          trackName.includes(searchLower) ||
                          notesLower.includes(searchLower);

    const matchesCar = internalCarFilter === "all" || setup.car === internalCarFilter;
    const matchesTrack = internalTrackFilter === "all" || setup.track === internalTrackFilter;

    return matchesSearch && matchesCar && matchesTrack;
  });

  // Sort by date descending
  const sortedMySetups = [...myFilteredSetups].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const handleInspectClick = (variant: SavedSetupItem) => {
    const setupRepresentation: SetupItem = {
      id: variant.id,
      name: `${ACC_CARS[variant.car] || "GT3"} - Tuned by ${variant.authorUsername}`,
      car: variant.car,
      track: variant.track,
      notes: variant.versionNote || variant.notes || "Custom tuned setup variant.",
      rawData: variant.rawData,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      uploadedBy: "custom_variant",
      uploadedByName: variant.authorUsername
    };
    onInspect(setupRepresentation);
  };

  const getUniqueCarsInGarage = () => {
    const cars = new Set<string>();
    mySetupsRaw.forEach((s) => s.car && cars.add(s.car));
    return Array.from(cars);
  };

  const getUniqueTracksInGarage = () => {
    const tracks = new Set<string>();
    mySetupsRaw.forEach((s) => s.track && tracks.add(s.track));
    return Array.from(tracks);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-red-650 text-[10px] font-extrabold font-mono rounded tracking-widest text-white uppercase">PILOT PROFILE GARAGE</span>
              <span className="px-2.5 py-0.5 bg-zinc-800 text-[10px] font-bold font-mono rounded text-zinc-300">SECURE STORAGE</span>
            </div>
            <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Folder className="w-6 h-6 text-red-500 shrink-0" />
              <span>My Custom Tuning Garage</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-xl font-medium leading-relaxed">
              Explore, search, and manage setups customized by you. Any saved variant here is safe in your secure Cloud-synced profile garage, and can be loaded back into the active cockpit HUD instantly with real-time analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-mono font-bold tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
              <span>SYNC CLOUD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile check */}
      {!profile ? (
        <div className="bg-white border border-zinc-250 p-12 text-center rounded-xl shadow-sm max-w-lg mx-auto">
          <div className="bg-amber-100/55 text-amber-600 p-4 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 font-sans tracking-tight">Connect Driver Profile Needed</h3>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed font-semibold">
            To view, store, and manage your private garage and setup variants in the cloud, please log in and connect your Sim Racing Driver Profile via the header button.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter Sidebar (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-zinc-250 rounded-xl p-4 shadow-3xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-150 pb-2.5">
                <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-500 uppercase">GARAGE FILTERS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full font-bold">
                  {mySetupsRaw.length} total
                </span>
              </div>

              {/* Search Bar */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-zinc-450 uppercase uppercase">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search custom variants..."
                    value={internalSearch}
                    onChange={(e) => setInternalSearch(e.target.value)}
                    className="w-full bg-zinc-50 text-zinc-900 pl-9 pr-4 py-2 border border-zinc-250 rounded-lg text-xs placeholder-zinc-400 font-semibold focus:outline-none focus:border-red-650 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Car Lookup Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-zinc-450 uppercase">Car Model</label>
                <select
                  value={internalCarFilter}
                  onChange={(e) => setInternalCarFilter(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-red-650 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="all">🔍 All Cars ({getUniqueCarsInGarage().length})</option>
                  {(() => {
                    const uniqueCars = getUniqueCarsInGarage();
                    // Group cars by class
                    const groups: Record<string, string[]> = {
                      "GT3": [],
                      "GT4": [],
                      "GT2": [],
                      "TCX": [],
                      "Cup / Challenge (GTC)": []
                    };
                    const uncategorized: string[] = [];

                    uniqueCars.forEach((carKey) => {
                      const lower = carKey.toLowerCase();
                      if (lower.includes("gt4") || lower === "alpine_a110_gt4" || lower === "chevrolet_camaro_gt4r" || lower === "ktm_xbow_gt4" || lower === "maserati_mc_gt4" || lower === "ginetta_g55_gt4" || lower === "aston_martin_vantage_gt4") {
                        groups["GT4"].push(carKey);
                      } else if (lower.includes("gt2") || lower === "porsche_935") {
                        groups["GT2"].push(carKey);
                      } else if (lower.includes("gt3") || lower === "jaguar_g3" || lower.includes("audi_r8_lms") || lower.includes("bentley_continental") || lower.includes("lexus_rc_f") || lower.includes("lamborghini_gallardo_rex") || lower.includes("mclaren_650s") || lower === "mercedes_amg_gt3" || lower.includes("nissan_gt_r")) {
                        groups["GT3"].push(carKey);
                      } else if (lower.includes("m2_cs") || lower.includes("tcx")) {
                        groups["TCX"].push(carKey);
                      } else if (lower.includes("cup") || lower.includes("challenge") || lower.includes("st_evo")) {
                        groups["Cup / Challenge (GTC)"].push(carKey);
                      } else {
                        uncategorized.push(carKey);
                      }
                    });

                    // Sort each group alphabetically by display name
                    const sortByName = (list: string[]) => {
                      return list.sort((a, b) => {
                        const nameA = ACC_CARS[a] || a;
                        const nameB = ACC_CARS[b] || b;
                        return nameA.localeCompare(nameB);
                      });
                    };

                    const renderGroup = (label: string, carsList: string[]) => {
                      const sortedList = sortByName(carsList);
                      if (sortedList.length === 0) return null;
                      return (
                        <optgroup key={label} label={label}>
                          {sortedList.map((carKey) => (
                            <option key={carKey} value={carKey}>
                              {ACC_CARS[carKey] || carKey}
                            </option>
                          ))}
                        </optgroup>
                      );
                    };

                    return [
                      renderGroup("GT3", groups["GT3"]),
                      renderGroup("GT4", groups["GT4"]),
                      renderGroup("GT2", groups["GT2"]),
                      renderGroup("TCX", groups["TCX"]),
                      renderGroup("Cup / Challenge (GTC)", groups["Cup / Challenge (GTC)"]),
                      renderGroup("Uncategorized", uncategorized)
                    ];
                  })()}
                </select>
              </div>

              {/* Track Lookup Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold text-zinc-450 uppercase">Track Variant</label>
                <select
                  value={internalTrackFilter}
                  onChange={(e) => setInternalTrackFilter(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-red-650 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="all">🔍 All Tracks ({getUniqueTracksInGarage().length})</option>
                  {getUniqueTracksInGarage().map((trackKey) => (
                    <option key={trackKey} value={trackKey}>
                      {ACC_TRACKS[trackKey] || trackKey}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-zinc-150">
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10px] text-zinc-500 leading-normal font-medium flex gap-2">
                  <Info className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>Only custom variants saved with your handle <strong>@{profile.username}</strong> are visible here.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: responsive grid list (Span 9) */}
          <div className="lg:col-span-9">
            {sortedMySetups.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-300 p-16 text-center rounded-xl flex flex-col items-center justify-center">
                <div className="bg-zinc-100 p-4 rounded-full w-14 h-14 mb-4 flex items-center justify-center text-zinc-400">
                  <Activity className="w-7 h-7 opacity-50" />
                </div>
                <h3 className="text-base font-bold text-zinc-800">No Tuned Variants Found</h3>
                <p className="text-zinc-500 text-xs mt-1.5 max-w-sm font-semibold leading-relaxed">
                  {mySetupsRaw.length === 0 
                    ? "You haven't saved any customized variants yet! Click 'Tuning Workshop' in the Active HUD on any base setup to create and test custom variations with your notes." 
                    : "No setups match your selected search queries or track/car filters. Clear filters to see your variants."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedMySetups.map((setup) => {
                  const displayCar = ACC_CARS[setup.car] || setup.car || "GT3 Racing Car";
                  const displayTrack = ACC_TRACKS[setup.track] || setup.track || "World Circuit";
                  const showWorkspaceBadge = setup.isTeamWorkspace;
                  const dateString = setup.createdAt 
                    ? new Date(setup.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "Unknown date";

                  return (
                    <div 
                      key={setup.id}
                      className="bg-white border border-zinc-250 rounded-xl hover:border-zinc-400 shadow-3xs hover:shadow-2xs transition-all flex flex-col p-4 relative group"
                    >
                      {/* Top banner summary */}
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-red-650 bg-red-100/50 font-extrabold px-1.5 py-0.5 rounded whitespace-normal break-words block w-fit">
                            {displayTrack}
                          </span>
                          <h3 className="text-[13.5px] font-bold text-zinc-950 font-sans tracking-tight mt-1 leading-snug whitespace-normal break-words">
                            {displayCar}
                          </h3>
                        </div>

                        {showWorkspaceBadge && (
                          <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wider text-emerald-650 bg-emerald-100 font-extrabold px-1.5 py-0.5 rounded">
                            Shared Team
                          </span>
                        )}
                      </div>

                      {/* Notes Section with visual quote border */}
                      <div className="bg-zinc-50 border-l-2 border-red-500 p-2.5 rounded-r-lg text-[10.5px] text-zinc-650 whitespace-normal break-words min-w-0 mb-4 flex-1">
                        <strong className="text-zinc-800 text-[10.5px]">Version Note:</strong>{" "}
                        {setup.versionNote || setup.notes || "Custom telemetry adjusted parameters."}
                      </div>

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-150 text-[10px] font-mono text-zinc-450 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{dateString}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {confirmDeleteId === setup.id ? (
                            <div className="flex items-center gap-1.5 h-11 px-2">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await onDelete(setup.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-red-600 hover:text-red-800 font-extrabold uppercase text-[9px] cursor-pointer py-2 px-1"
                              >
                                Confirm
                              </button>
                              <span className="text-zinc-300">|</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="text-zinc-500 hover:text-zinc-700 font-bold text-[9px] cursor-pointer py-2 px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(setup.id);
                              }}
                              className="text-zinc-400 hover:text-red-505 transition-colors w-11 h-11 flex items-center justify-center rounded-lg hover:bg-zinc-100 cursor-pointer shrink-0"
                              title="Delete variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleInspectClick(setup)}
                            className="bg-zinc-950 hover:bg-red-655 text-white hover:text-white font-mono font-bold px-4 py-2.5 sm:px-3 sm:py-1.5 rounded transition-all flex items-center gap-1.5 h-11 sm:h-auto cursor-pointer active:scale-95 text-[10px] uppercase tracking-wider shadow-sm shrink-0"
                          >
                            <Gauge className="w-3.5 h-3.5 text-red-500 group-hover:text-white shrink-0" />
                            <span>INSPECT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
