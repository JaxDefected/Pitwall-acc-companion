import { useState, useMemo, useEffect } from "react";
import laptimesDataImport from "../data/acc_laptimes.json";
import { Clock, Info, ShieldAlert, Award, Compass, Droplets, Flame, Wrench, Zap, BookOpen, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { CIRCUIT_NOTES } from "../data/circuitNotes";
import { CAR_NOTES_DATA, TRACKS_MAP_DATA } from "../data/carNotesData";

// Safe JSON casting to prevent type errors
const laptimesData = laptimesDataImport as any;

export function secondsToLapTime(secs: number | null | undefined): string {
  if (secs === null || secs === undefined) return "—";
  const minutes = Math.floor(secs / 60);
  const remaining = (secs - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${remaining}`;
}

const GT3_COLUMNS = [
  { label: "Qualy", key: "qualy", desc: "Benchmark lap time" },
  { label: "Race Pace (100%)", key: "p100", desc: "GT3 base race pace" },
  { label: "Race Pace (101%)", key: "p101", desc: "Alien" },
  { label: "Race Pace (102%)", key: "p102", desc: "Competitive" },
  { label: "Race Pace (103%)", key: "p103", desc: "Good" },
  { label: "Race Pace (104%)", key: "p104", desc: "Midpack" },
  { label: "Race Pace (105%)", key: "p105", desc: "—" },
  { label: "Race Pace (106%)", key: "p106", desc: "—" },
  { label: "Race Pace (107%)", key: "p107", desc: "Tail-ender" }
];

const GT4_COLUMNS = [
  { label: "Reference", key: "reference_time", desc: "Benchmark lap time" },
  { label: "Race Pace (101%)", key: "p101", desc: "Alien" },
  { label: "Race Pace (102%)", key: "p102", desc: "Competitive" },
  { label: "Race Pace (103%)", key: "p103", desc: "Good" },
  { label: "Race Pace (104%)", key: "p104", desc: "Midpack" },
  { label: "Race Pace (105%)", key: "p105", desc: "—" },
  { label: "Race Pace (106%)", key: "p106", desc: "—" },
  { label: "Race Pace (107%)", key: "p107", desc: "Tail-ender" }
];

export default function LapTimesPage() {
  const [selectedClass, setSelectedClass] = useState<"GT2" | "GT3" | "GT4">("GT3");
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [mapSrc, setMapSrc] = useState<string>("");

  // Track Map Dynamic Asset Recovery
  useEffect(() => {
    if (selectedTrack && TRACKS_MAP_DATA[selectedTrack]) {
      setMapSrc(TRACKS_MAP_DATA[selectedTrack].svg_url || "");
    } else {
      setMapSrc("");
    }
  }, [selectedTrack]);

  // Default close on mobile, open on desktop on track load/change
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsBriefingOpen(window.innerWidth >= 1024);
    }
  }, [selectedTrack]);

  // Get cars for selected class sorted alphabetically
  const availableCars = useMemo(() => {
    if (!laptimesData?.classes?.[selectedClass]?.cars) return [];
    return [...laptimesData.classes[selectedClass].cars].sort((a: any, b: any) =>
      a.car.localeCompare(b.car)
    );
  }, [selectedClass]);

  // Find the selected car object
  const activeCarObj = useMemo(() => {
    return availableCars.find((c: any) => c.car === selectedCar);
  }, [selectedCar, availableCars]);

  // Get track list sorted alphabetically for selected car or all available cars in class
  const availableTracks = useMemo(() => {
    if (activeCarObj?.tracks) {
      return Object.keys(activeCarObj.tracks).sort();
    }
    if (!availableCars) return [];
    const allTracksSet = new Set<string>();
    availableCars.forEach((c: any) => {
      if (c?.tracks) {
        Object.keys(c.tracks).forEach((t) => allTracksSet.add(t));
      }
    });
    return Array.from(allTracksSet).sort();
  }, [activeCarObj, availableCars]);

  // Handle class shift as clean reset
  const handleClassChange = (cls: "GT2" | "GT3" | "GT4") => {
    setSelectedClass(cls);
    setSelectedCar("");
    setSelectedTrack("");
  };

  // Get active track laptimes data
  const trackData = useMemo(() => {
    if (!activeCarObj || !selectedTrack) return null;
    return activeCarObj.tracks[selectedTrack];
  }, [activeCarObj, selectedTrack]);

  const columns = selectedClass === "GT3" ? GT3_COLUMNS : GT4_COLUMNS;

  // Detect whether all values for selected track are null
  const isAllNull = useMemo(() => {
    if (!trackData) return true;
    return columns.every(col => trackData[col.key] === null || trackData[col.key] === undefined);
  }, [trackData, columns]);

  return (
    <div id="laptimes-panel-container" className="col-span-12 bg-white border border-zinc-250 shadow-sm rounded-lg p-4 md:p-5 flex flex-col gap-6">
      
      {/* Top Header Card */}
      <div className="flex items-center gap-3 border-b border-zinc-150 pb-4">
        <Clock className="w-5 h-5 text-red-650 shrink-0" />
        <div>
          <h2 className="text-xs sm:text-sm md:text-md font-extrabold uppercase font-mono tracking-wider text-zinc-900">
            ACC LFM Lap Times Reference
          </h2>
          <p className="text-zinc-600 text-[11.5px] sm:text-xs font-medium">
            Review expected race pace benchmarks and qualifying targets across GT2, GT3, and GT4 configurations
          </p>
        </div>
      </div>

      {/* Selector Controls Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs sticky top-[48px] md:relative md:top-auto z-30 bg-white py-3 px-3 md:p-0 border border-zinc-200 md:border-none rounded-lg shadow-sm md:shadow-none">
        
        {/* Class selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-zinc-600 font-bold uppercase tracking-wide text-[10px]">1. Select Category</span>
          <div className="flex bg-zinc-100 p-1 rounded border border-zinc-200 gap-1">
            <button
              onClick={() => handleClassChange("GT2")}
              className={`flex-1 py-3 md:py-2 rounded transition-all cursor-pointer font-bold min-h-[44px] md:min-h-0 flex items-center justify-center ${selectedClass === "GT2" ? "bg-white text-red-655 shadow-3xs font-extrabold border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              GT2
            </button>
            <button
              onClick={() => handleClassChange("GT3")}
              className={`flex-1 py-3 md:py-2 rounded transition-all cursor-pointer font-bold min-h-[44px] md:min-h-0 flex items-center justify-center ${selectedClass === "GT3" ? "bg-white text-red-655 shadow-3xs font-extrabold border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              GT3
            </button>
            <button
              onClick={() => handleClassChange("GT4")}
              className={`flex-1 py-3 md:py-2 rounded transition-all cursor-pointer font-bold min-h-[44px] md:min-h-0 flex items-center justify-center ${selectedClass === "GT4" ? "bg-white text-red-655 shadow-3xs font-extrabold border border-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              GT4
            </button>
          </div>
        </div>

        {/* Car selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-zinc-600 font-bold uppercase tracking-wide text-[10px]">2. Vehicle Selector</span>
          <select
            className="w-full bg-white border border-zinc-250 hover:border-zinc-350 px-3 py-3 md:py-2 rounded text-zinc-850 font-mono text-base md:text-xs outline-none focus:ring-1 focus:ring-red-500 shadow-3xs min-h-[44px] md:min-h-0"
            value={selectedCar}
            onChange={(e) => {
              const newCar = e.target.value;
              setSelectedCar(newCar);
              if (newCar) {
                const carObj = availableCars.find((c: any) => c.car === newCar);
                const hasTrack = carObj && carObj.tracks && selectedTrack && (selectedTrack in carObj.tracks);
                if (!hasTrack) {
                  setSelectedTrack("");
                }
              }
            }}
          >
            <option value="">Select a car</option>
            {availableCars.map((c: any) => (
              <option key={c.car} value={c.car}>
                {c.car}
              </option>
            ))}
          </select>
        </div>

        {/* Track selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-zinc-600 font-bold uppercase tracking-wide text-[10px]">3. Circuit Selector</span>
          <select
            className="w-full bg-white border border-zinc-250 hover:border-zinc-350 px-3 py-3 md:py-2 rounded text-zinc-850 font-mono text-base md:text-xs outline-none focus:ring-1 focus:ring-red-500 shadow-3xs min-h-[44px] md:min-h-0"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="">Select a track</option>
            {availableTracks.map((track: string) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Display */}
      <div className="mt-4 border-t border-zinc-150 pt-5">
        
        {/* State 0: Neither selected */}
        {!selectedCar && !selectedTrack && (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-lg p-6 max-w-md mx-auto w-full animate-fadeIn">
            <Clock className="w-9 h-9 text-zinc-300 mb-3 animate-pulse" />
            <h3 className="text-xs font-black font-mono uppercase tracking-widest text-zinc-700">Explore LFM Targets</h3>
            <p className="text-zinc-550 text-xs mt-1.5 font-sans leading-relaxed max-w-sm">
              Choose a vehicle or circuit above to inspect professional BoP setups, 102% laptimes, and engineering telemetry.
            </p>
          </div>
        )}

        {/* State A: ONLY selectedCar (selectedTrack is empty) */}
        {selectedCar && !selectedTrack && (() => {
          const carNote = CAR_NOTES_DATA[selectedCar];
          if (!carNote) {
            return (
              <div className="text-center font-mono text-zinc-500 text-xs py-10">
                Engineering profile notes not registered for this vehicle.
              </div>
            );
          }
          return (
            <div id="car-engineering-profile" className="w-full flex flex-col gap-5 text-zinc-800 animate-fadeIn bg-white p-1 rounded-lg">
              {/* Header banner */}
              <div className="bg-zinc-800 border border-zinc-900 rounded-lg p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-3xs">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <h3 className="text-sm md:text-base font-black font-mono uppercase tracking-wider text-white">
                      {selectedCar}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest block mt-0.5">
                      Technical Specifications & Engineering Profile
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-white">
                  <span className="px-2.5 py-1 bg-zinc-700/65 border border-zinc-650 rounded text-[9.5px] font-extrabold font-mono uppercase tracking-wider">
                    Engine: {carNote.engine_layout || "Standard"} Layout
                  </span>
                  <span className={`px-2.5 py-1 rounded text-[9.5px] font-black font-mono uppercase tracking-wider border ${
                    carNote.difficulty.toLowerCase().includes("beginner") ? "bg-emerald-950/45 border-emerald-800 text-emerald-400" :
                    carNote.difficulty.toLowerCase().includes("advanced") ? "bg-red-950/45 border-red-800 text-red-400" :
                    "bg-amber-950/45 border-amber-800 text-amber-400"
                  }`}>
                    Class: {carNote.difficulty}
                  </span>
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Left Column: Summary and Driving characteristics */}
                <div className="flex flex-col gap-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 md:p-5 shadow-4xs">
                    <h4 className="font-extrabold font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5 border-b border-zinc-200 pb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-red-655" />
                      General Overview
                    </h4>
                    <p className="text-xs text-zinc-700 leading-relaxed font-sans font-medium whitespace-normal italic bg-white border border-zinc-150 p-3.5 rounded-lg shadow-5xs">
                      "{carNote.car_notes}"
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 md:p-5 shadow-4xs">
                    <h4 className="font-extrabold font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-zinc-200 pb-1.5">
                      <Compass className="w-3.5 h-3.5 text-zinc-700" />
                      Driving Style Adjustments
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {carNote.driving_style.map((style, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-zinc-150 text-zinc-800 text-[10.5px] font-bold font-mono rounded shadow-5xs uppercase tracking-wide">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 md:p-5 shadow-4xs">
                    <h4 className="font-extrabold font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5 border-b border-zinc-200 pb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Setup Sensitivity
                    </h4>
                    <p className="text-[11.5px] text-zinc-650 leading-relaxed font-sans font-medium bg-white border border-zinc-150 p-3.5 rounded-lg shadow-5xs whitespace-normal break-words">
                      {carNote.setup_sensitivity}
                    </p>
                  </div>
                </div>

                {/* Right Column: Strengths, Weaknesses, Best tracks */}
                <div className="flex flex-col gap-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 md:p-5 shadow-4xs">
                    <h4 className="font-extrabold font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-zinc-200 pb-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Strengths
                    </h4>
                    <ul className="flex flex-col gap-1.5 pl-0 text-xs font-semibold text-zinc-855 list-none">
                      {carNote.strengths.map((str, i) => (
                        <li key={i} className="flex gap-2 items-start text-[11.5px]">
                          <span className="text-emerald-700 shrink-0 font-bold">✓</span>
                          <span className="font-sans font-medium text-zinc-700">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 md:p-5 shadow-4xs">
                    <h4 className="font-extrabold font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-zinc-200 pb-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      Weaknesses & Constraints
                    </h4>
                    <ul className="flex flex-col gap-1.5 pl-0 text-xs font-semibold text-zinc-855 list-none">
                      {carNote.weaknesses.map((weak, i) => (
                        <li key={i} className="flex gap-2 items-start text-[11.5px]">
                          <span className="text-rose-500 shrink-0 font-bold">⚠️</span>
                          <span className="font-sans font-medium text-zinc-750">{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 md:p-5 shadow-4xs">
                    <h4 className="font-extrabold font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5 border-b border-zinc-200 pb-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      Recommended Circuits
                    </h4>
                    <div className="flex flex-wrap gap-1.5 bg-white border border-zinc-150 p-3 rounded-lg">
                      {carNote.best_tracks.map((track, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black font-mono uppercase tracking-wider rounded">
                          {track}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Competition Meta Note */}
              <div className="bg-red-50/45 border border-red-155 rounded-lg p-4 flex gap-3 text-xs text-zinc-700 shadow-5xs items-start mt-1">
                <Info className="w-4.5 h-4.5 text-red-650 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold font-mono uppercase tracking-widest text-[9.5px] text-red-700 block mb-0.5">COMPETITION OUTLOOK OVERVIEW:</span>
                  <p className="font-sans font-semibold text-zinc-750 leading-relaxed whitespace-normal break-words">{carNote.meta_note}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* State B: ONLY Track is selected (Car is empty/all) */}
        {!selectedCar && selectedTrack && (() => {
          const trackMap = TRACKS_MAP_DATA[selectedTrack];
          const leaderboard = availableCars
            .map((c: any) => {
              const p102 = c.tracks?.[selectedTrack]?.p102;
              return {
                carName: c.car,
                p102: p102,
              };
            })
            .filter(item => item.p102 !== null && item.p102 !== undefined)
            .sort((a, b) => (a.p102 as number) - (b.p102 as number));

          return (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Track Map Prominently */}
              {trackMap ? (
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg flex flex-col items-center justify-center max-w-md mx-auto w-full shadow-3xs group select-none">
                  <div className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-3 border-b border-zinc-150 pb-2">
                    <span className="uppercase tracking-widest font-bold">ACC CIRCUIT MAP</span>
                    <span className="uppercase bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-650 font-bold">SVG VECTORS</span>
                  </div>
                  <div className="bg-white p-4 rounded-md border border-zinc-150 w-full flex items-center justify-center min-h-[180px]">
                    {imageErrors[selectedTrack] || (!trackMap.svg_url && !mapSrc) ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
                        <svg className="w-16 h-16 text-zinc-300 animate-pulse mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="text-[11px] font-bold font-mono tracking-widest text-zinc-400 uppercase">Circuit Map Updating...</span>
                      </div>
                    ) : (
                      <img 
                        src={mapSrc || trackMap.svg_url} 
                        alt={`${selectedTrack} Track Outline`}
                        referrerPolicy="no-referrer"
                        onError={() => {
                          const notes = trackMap.notes || "";
                          const primaryUrl = trackMap.svg_url || "";
                          const currentSrc = mapSrc || primaryUrl;
                          
                          if (notes.includes("if 404, try ") && currentSrc === primaryUrl) {
                            const match = notes.match(/if 404, try\s+([^\s"';,]+)/i);
                            if (match && match[1]) {
                              let filename = match[1].trim();
                              filename = filename.replace(/^(file|File):/, "");
                              filename = filename.replace(/[.,;'"\s]+$/, "");
                              const fallbackUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
                              setMapSrc(fallbackUrl);
                              return;
                            }
                          }
                          setImageErrors(prev => ({ ...prev, [selectedTrack]: true }));
                        }}
                        className="max-h-[160px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="mt-3 text-center w-full">
                    <h4 className="text-zinc-900 font-extrabold font-mono text-xs uppercase tracking-wider">
                      {trackMap.full_name || selectedTrack}
                    </h4>
                    {trackMap.notes && (
                      <p className="text-[10px] text-zinc-500 font-medium tracking-tight mt-1 max-w-sm mx-auto leading-normal">
                        {trackMap.notes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg text-center max-w-md mx-auto w-full">
                  <h4 className="text-zinc-900 font-extrabold font-mono text-xs uppercase tracking-wider">
                    {selectedTrack} Circuit
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">Vector map outline not registered with public credentials.</p>
                </div>
              )}

              {/* 102% Target Laptime Table */}
              <div className="max-w-xl mx-auto w-full border border-zinc-200 rounded-lg overflow-hidden shadow-3xs bg-white text-zinc-805">
                <div className="bg-zinc-805 text-white font-mono font-bold text-[10px] sm:text-xs px-4 py-3 border-b border-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-500 shrink-0" />
                  <span>102% Target Competitiveness Leaderboard — {selectedTrack}</span>
                </div>
                <table className="w-full text-left border-collapse text-xs font-mono min-w-[320px]">
                  <thead>
                    <tr className="bg-zinc-100/75 border-b border-zinc-200 text-zinc-650 text-[10px] uppercase font-black tracking-wider">
                      <th className="px-5 py-3">Car</th>
                      <th className="px-5 py-3 text-right">102% Target Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((item, idx) => (
                        <tr key={item.carName} className="hover:bg-zinc-50/75 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-zinc-900 flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 font-extrabold w-4">{idx + 1}.</span>
                            {item.carName}
                          </td>
                          <td className="px-5 py-3.5 text-right font-black text-red-655 text-[12.5px]">
                            {secondsToLapTime(item.p102)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-5 py-8 text-center text-zinc-500 font-medium">
                          No 102% target pace data recorded for any {selectedClass} car at this circuit.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          );
        })()}

        {/* State C: BOTH selectedTrack and selectedCar are selected */}
        {selectedCar && selectedTrack && (
          isAllNull ? (
            <div className="flex flex-col items-center justify-center py-14 text-center bg-zinc-50 border border-dashed border-zinc-250 rounded-lg p-6 max-w-xl mx-auto w-full animate-fadeIn shadow-2xs">
              <Clock className="w-10 h-10 text-zinc-450 mb-3 animate-pulse" />
              <h3 className="text-xs font-black text-zinc-800 font-mono uppercase tracking-widest">
                ⏱️ {selectedClass} Target Lap Times
              </h3>
              <p className="text-zinc-650 text-xs mt-2.5 font-medium max-w-xs leading-relaxed font-sans">
                {selectedClass} target lap times are coming soon in a future update.
              </p>
            </div>
          ) : (
            trackData && (() => {
              const circ = CIRCUIT_NOTES[selectedTrack];
              const carNote = CAR_NOTES_DATA[selectedCar];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
                  
                  {/* Left Column: Lap Time Benchmarks */}
                  <div className="lg:col-span-6 flex flex-col gap-0 w-full min-w-0">
                    <div className="border border-zinc-200 rounded-lg overflow-x-auto shadow-3xs bg-white">
                      <table className="w-full text-left border-collapse text-xs font-mono min-w-[450px]">
                        <thead>
                          <tr className="bg-zinc-800 text-white font-black uppercase text-[10px] tracking-wider border-b border-zinc-300">
                            <th className="px-4 py-3 pl-5">Pace Label</th>
                            <th className="px-4 py-3">Estimated</th>
                            <th className="px-4 py-3 flex items-center gap-1.5 whitespace-nowrap">
                              <Award className="w-3.5 h-3.5 text-red-500" />
                              Target Tier
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-zinc-800">
                          {columns.map((col) => {
                            const value = trackData[col.key];
                            const timeStr = secondsToLapTime(value);
                            const isBenchmark = col.key === "qualy" || col.key === "reference_time";
                            const isBaseRatio = col.key === "p100";
                            
                            return (
                              <tr
                                key={col.key}
                                className={`transition-colors hover:bg-zinc-50/75 ${isBenchmark ? "bg-red-50/15" : ""}`}
                              >
                                <td className="px-4 py-3 pl-5 font-extrabold text-zinc-900 whitespace-nowrap">
                                  {col.label}
                                </td>
                                <td className={`px-4 py-3 text-[12.5px] ${isBenchmark || isBaseRatio ? "text-red-655 font-black" : "font-black"}`}>
                                  <div className="flex items-center gap-1.5">
                                    <span>{timeStr}</span>
                                    {trackData.estimated && (
                                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0 font-sans tracking-wide animate-pulse" title="Estimated BoP Lap Time">
                                        EST*
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-zinc-500 italic whitespace-nowrap">
                                  {col.desc === "—" ? (
                                    <span className="text-zinc-300 not-italic font-normal">—</span>
                                  ) : col.desc || (
                                    <span className="text-zinc-300 not-italic font-normal">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {trackData.estimated && (
                        <div className="bg-amber-50/50 border-t border-zinc-200 px-4 py-2.5 flex items-center gap-2 text-[10.5px] font-sans text-amber-850 font-medium text-left">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                          <span>* <strong>Estimated BoP Lap Time:</strong> This lap time is simulated using GT2/GT3 pace proportions and BoP offsets.</span>
                        </div>
                      )}
                    </div>

                    {/* GT4 BoP Ballast Note */}
                    {selectedClass === "GT4" && trackData.bop && trackData.bop !== "0" && trackData.bop !== "" && (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-zinc-600 mt-3 shadow-5xs text-left">
                        <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold uppercase font-mono tracking-widest text-[9.5px] text-zinc-500 block mb-0.5">BALANCE OF PERFORMANCE:</span>
                          <span className="whitespace-normal break-words">BoP ballast at time of data collection: <strong className="text-zinc-900 font-extrabold text-xs">{trackData.bop}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* GT3 Setup Typology Tag Note */}
                    {selectedClass === "GT3" && trackData.setup_tag && (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-zinc-650 mt-3 shadow-5xs text-left">
                        <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold uppercase font-mono tracking-widest text-[9.5px] text-zinc-500 block mb-0.5">SETUP SCHEMA:</span>
                          <span className="whitespace-normal break-words">Recommended setup type: <strong className="text-zinc-900 font-extrabold uppercase text-[11px] underline font-mono tracking-wider">{trackData.setup_tag}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* State C: Supplementary Car details list structured beautifully under the lap times table */}
                    {carNote && (
                      <div className="border border-zinc-200 rounded-lg overflow-hidden flex flex-col shadow-3xs bg-zinc-50/50 mt-5">
                        <div className="bg-zinc-800 text-white font-mono font-extrabold text-[10px] sm:text-xs px-4 py-3 border-b border-zinc-900 uppercase tracking-widest flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-red-500 shrink-0" />
                          <span>Engineering Profile: {selectedCar}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-xs text-left">
                          <div className="flex flex-col gap-2.5">
                            <div className="bg-white border border-zinc-200/65 rounded-lg p-3 shadow-5xs">
                              <strong className="text-zinc-500 font-extrabold uppercase font-mono text-[9px] tracking-wider block mb-1">General Car Character:</strong>
                              <span className="italic leading-relaxed font-sans text-xs text-zinc-700 font-medium block">
                                "{carNote.car_notes}"
                              </span>
                            </div>
                            <div className="bg-white border border-zinc-200/65 rounded-lg p-3 shadow-5xs">
                              <strong className="text-zinc-500 font-extrabold uppercase font-mono text-[9px] tracking-wider block mb-1">Recommended Driving Styles:</strong>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {carNote.driving_style.map((style, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-750 font-mono text-[9.5px] font-bold rounded uppercase tracking-wider">
                                    {style}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <div className="bg-white border border-zinc-200/65 rounded-lg p-3 shadow-5xs">
                              <strong className="text-zinc-500 font-extrabold uppercase font-mono text-[9px] tracking-wider block mb-1">Engine & Layout Profile:</strong>
                              <span className="text-zinc-750 font-mono text-xs uppercase font-extrabold tracking-wide block mt-1">
                                {carNote.engine_layout || "Standard"} Layout • {carNote.difficulty} class
                              </span>
                              <span className="text-[10px] text-zinc-500 leading-normal block mt-1">
                                Sensitivity Focus: <span className="font-semibold text-zinc-650">{carNote.setup_sensitivity}</span>
                              </span>
                            </div>

<div className="bg-white border border-zinc-250/65 rounded-lg p-3 shadow-5xs flex flex-col sm:grid sm:grid-cols-2 gap-3 h-auto min-h-0">
  <div className="flex flex-col h-auto">
    <strong className="text-zinc-500 font-extrabold uppercase font-mono text-[9px] tracking-wider block mb-1">Key Advantages:</strong>
    <ul className="pl-0 flex flex-col gap-1.5 text-[10.5px]">
      {carNote.strengths.slice(0, 2).map((s, idx) => (
        <li key={idx} className="text-zinc-650 font-medium font-sans leading-relaxed text-left flex gap-1.5 items-start break-words whitespace-normal" title={s}>
          <span className="text-emerald-700 font-bold shrink-0">✓</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  </div>
  
  <div className="flex flex-col h-auto">
    <strong className="text-zinc-550 font-extrabold uppercase font-mono text-[9px] tracking-wider block mb-1">Key Constraints:</strong>
    <ul className="pl-0 flex flex-col gap-1.5 text-[10.5px]">
      {carNote.weaknesses.slice(0, 2).map((w, idx) => (
        <li key={idx} className="text-zinc-650 font-medium font-sans leading-relaxed text-left flex gap-1.5 items-start break-words whitespace-normal" title={w}>
          <span className="text-rose-500 font-bold shrink-0">⚠️</span>
          <span>{w}</span>
        </li>
      ))}
    </ul>
  </div>
</div>

                  {/* Right Column: Dynamic Circuit Notes & Setup Briefing Panel */}
                  <div className="lg:col-span-6 flex flex-col gap-5 w-full min-w-0">
                    {circ ? (
                      <div className="bg-zinc-50/50 border border-zinc-200 rounded-lg overflow-hidden flex flex-col">
                        {/* Header with Title (Toggle Button for accordion) */}
                        <button
                          onClick={() => setIsBriefingOpen(!isBriefingOpen)}
                          className="w-full flex items-center justify-between p-4 md:p-5 bg-zinc-100 hover:bg-zinc-150/80 border-b border-zinc-200 transition-colors text-left outline-none cursor-pointer select-none border-t-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Compass className="w-5 h-5 text-red-655 shrink-0" />
                            <span className="font-extrabold font-mono text-xs sm:text-sm tracking-wide text-zinc-950 uppercase truncate">
                              Crew Briefing: {selectedTrack}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* Compact category bubble on desktop if closed */}
                            {!isBriefingOpen && (
                              <span className="hidden sm:inline-block px-2 py-0.5 bg-zinc-200 text-zinc-805 text-[8.5px] font-black font-mono rounded uppercase tracking-wider">
                                {circ.acc_speed_category.replace(/_/g, " ")}
                              </span>
                            )}
                            <ChevronDown className={`w-4.5 h-4.5 text-zinc-500 transition-transform duration-200 ${isBriefingOpen ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        {/* Accordion Content */}
                        {isBriefingOpen && (
                          <div className="p-4 md:p-5 flex flex-col gap-4 animate-fadeIn transition-all text-left">
                            {/* Interactive meta tags */}
                            <div className="flex flex-wrap gap-1.5 pb-1">
                              <span className="px-2 py-0.5 bg-zinc-200 text-zinc-800 text-[9px] font-black font-mono rounded uppercase tracking-wider whitespace-nowrap">
                                Speed: {circ.acc_speed_category.replace(/_/g, " ")}
                              </span>
                              <span className={`px-2 py-0.5 text-white text-[9px] font-black font-mono rounded uppercase tracking-wider whitespace-nowrap ${
                                circ.acc_overtaking_difficulty === "easy" ? "bg-emerald-650" :
                                circ.acc_overtaking_difficulty === "medium" ? "bg-amber-650" : "bg-red-700"
                              }`}>
                                Overtaking: {circ.acc_overtaking_difficulty}
                              </span>
                              <span className={`px-2 py-0.5 text-white text-[9px] font-black font-mono rounded uppercase tracking-wider whitespace-nowrap ${
                                circ.acc_wet_weather_risk === "low" ? "bg-blue-500" :
                                circ.acc_wet_weather_risk === "medium" ? "bg-blue-600 animate-pulse" : "bg-blue-800 animate-pulse font-extrabold"
                              }`}>
                                Wet Risk: {circ.acc_wet_weather_risk.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Circuit Summary Notes (Always readable, fully wrapped) */}
                            <div className="text-xs text-zinc-700 leading-relaxed bg-white border border-zinc-200 p-3 md:p-4 rounded-md italic whitespace-normal break-words">
                              "{circ.circuit_notes}"
                            </div>

                            {/* Setup Recommendations */}
                            <div className="flex flex-col gap-3 font-mono text-[11px] text-zinc-700">
                              
                              <div className="flex gap-2.5 items-start">
                                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <strong className="text-zinc-900 font-extrabold uppercase text-[10px] tracking-wider block mb-0.5">Aero & Downforce:</strong>
                                  <span className="text-zinc-650 leading-relaxed font-sans text-xs block whitespace-normal break-words">{circ.setup_notes.downforce}</span>
                                </div>
                              </div>

                              <div className="flex gap-2.5 items-start">
                                <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <strong className="text-zinc-900 font-extrabold uppercase text-[10px] tracking-wider block mb-0.5">Tyre Thermal Bounds:</strong>
                                  <span className="text-zinc-650 leading-relaxed font-sans text-xs block whitespace-normal break-words">{circ.setup_notes.tyres}</span>
                                </div>
                              </div>

                              <div className="flex gap-2.5 items-start">
                                <Wrench className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <strong className="text-zinc-900 font-extrabold uppercase text-[10px] tracking-wider block mb-0.5">Braking Strategy:</strong>
                                  <span className="text-zinc-650 leading-relaxed font-sans text-xs block whitespace-normal break-words">{circ.setup_notes.brakes}</span>
                                </div>
                              </div>

                              {circ.setup_notes.fuel?.stint_recommendation && (
                                <div className="flex gap-2.5 items-start">
                                  <Info className="w-4 h-4 text-emerald-505 shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <strong className="text-zinc-900 font-extrabold uppercase text-[10px] tracking-wider block mb-0.5">Race Stint Fuel:</strong>
                                    <span className="text-zinc-650 leading-relaxed font-sans text-xs block whitespace-normal break-words">{circ.setup_notes.fuel.stint_recommendation}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Crucial Corners Checklist */}
                            {circ.key_corners && circ.key_corners.length > 0 && (
                              <div className="border-t border-zinc-200 pt-3.5 flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Flame className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                                  <span className="font-extrabold font-mono text-[11px] tracking-widest text-zinc-900 uppercase">
                                    CRUCIAL CORNERS & TELEMETRY ALIGNMENTS:
                                  </span>
                                </div>
                                <ul className="flex flex-col gap-2 text-xs text-zinc-700 list-none pl-0">
                                  {circ.key_corners.map((corner, i) => (
                                    <li key={i} className="flex gap-2.5 items-start bg-white border border-zinc-150 p-2.5 rounded hover:shadow-4xs transition-all">
                                      <span className="font-mono text-[10px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded leading-none mt-0.5 shrink-0">
                                        0{i + 1}
                                      </span>
                                      <span className="leading-snug text-zinc-800 text-[11.5px] whitespace-normal break-words">{corner}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-lg p-5 text-center flex flex-col items-center justify-center py-12">
                        <BookOpen className="w-8 h-8 text-zinc-350 mb-2 animate-pulse" />
                        <h3 className="text-xs font-black font-mono uppercase tracking-wider text-zinc-700">No Briefing Loaded</h3>
                        <p className="text-zinc-650 text-xs mt-1 font-medium">Select a track circuit to unlock expert lap guidance notes.</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()
          )
        )}
      </div>
    </div>
  );
}
