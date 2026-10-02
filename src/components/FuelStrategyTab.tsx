import { useState, useMemo, useEffect } from "react";
import { Sparkles, Wrench, AlertTriangle, Gauge } from "lucide-react";
import { TRACK_FUEL_RANGES, DEFAULT_FUEL_RANGE } from "../utils/accParser";

export interface FuelStrategyTabProps {
  fuel: number;
  activeTrack?: string;
  isTuneMode: boolean;
  onAdjustSetupValue: (field: string, delta: number) => void;
}

interface Stint {
  index: number;
  durationMins: number;
  laps: number;
  fuelNeeded: number;
  isOverfilled: boolean;
}

export default function FuelStrategyTab({
  fuel,
  activeTrack,
  isTuneMode,
  onAdjustSetupValue,
}: FuelStrategyTabProps) {
  // Interactive Race Fuel Calculator states
  const [fuelRaceTime, setFuelRaceTime] = useState<number>(20); // race duration in mins
  const [fuelLapTimeMin, setFuelLapTimeMin] = useState<number | "">(1);
  const [fuelLapTimeSec, setFuelLapTimeSec] = useState<number | "">(45);
  const [fuelPerLap, setFuelPerLap] = useState<number>(3.2); // litres consumed per lap
  const [fuelSafetyLaps, setFuelSafetyLaps] = useState<number>(2); // safety buffer laps

  // Track-aware consumption ranges
  const activeFuelRange = useMemo(() => {
    return TRACK_FUEL_RANGES[activeTrack || ""] || DEFAULT_FUEL_RANGE;
  }, [activeTrack]);

  // Auto-update fuelPerLap to the track-appropriate default when setup changes
  useEffect(() => {
    if (activeTrack) {
      const range = TRACK_FUEL_RANGES[activeTrack] || DEFAULT_FUEL_RANGE;
      setFuelPerLap(range.default);
    }
  }, [activeTrack]);

  // Pit Window & Stint Strategy Planner states
  const [pitMandatoryFuel, setPitMandatoryFuel] = useState<boolean>(true);
  const [pitMandatoryTyres, setPitMandatoryTyres] = useState<boolean>(true);
  const [pitMaxFuelCapacity, setPitMaxFuelCapacity] = useState<number>(120);
  const [pitNumberOfStops, setPitNumberOfStops] = useState<number>(1);
  const [pitStrategyPreference, setPitStrategyPreference] = useState<"balanced" | "undercut" | "overcut">("balanced");

  // Pit & Stint Strategy Model calculations
  const getPitStrategyModel = () => {
    const minVal = fuelLapTimeMin === "" ? 0 : fuelLapTimeMin;
    const secVal = fuelLapTimeSec === "" ? 0 : fuelLapTimeSec;
    const lapTimeSec = minVal * 60 + secVal;
    const totalRaceSecs = fuelRaceTime * 60;
    const estTotalLaps = lapTimeSec > 0 ? Math.ceil(totalRaceSecs / lapTimeSec) : 0;
    const safetyBufferLaps = fuelSafetyLaps;
    const totalLapsWithBuffer = estTotalLaps + safetyBufferLaps;
    const totalFuelNeeded = totalLapsWithBuffer * fuelPerLap;

    const stintsCount = pitNumberOfStops + 1;
    const stints: Stint[] = [];
    let msg = "";
    let alertMsg = "";

    if (pitNumberOfStops === 0) {
      // 0 stops = 1 single stint
      const overfill = totalFuelNeeded > pitMaxFuelCapacity;
      stints.push({
        index: 1,
        durationMins: fuelRaceTime,
        laps: estTotalLaps,
        fuelNeeded: totalFuelNeeded,
        isOverfilled: overfill,
      });
      if (overfill) {
        alertMsg = `⚠️ Critical: Total fuel required (${totalFuelNeeded.toFixed(1)}L) exceeds max tank capacity (${pitMaxFuelCapacity}L). You MUST plan at least 1 pitstop!`;
      } else {
        msg = "✓ Standard single stint. No pitstop required.";
      }
    } else if (pitNumberOfStops === 1) {
      // 1 stop = 2 stints
      let ratio1 = 0.5;
      let ratio2 = 0.5;

      if (pitStrategyPreference === "undercut") {
        ratio1 = 0.4;
        ratio2 = 0.6;
      } else if (pitStrategyPreference === "overcut") {
        ratio1 = 0.6;
        ratio2 = 0.4;
      }

      const laps1 = Math.ceil(estTotalLaps * ratio1);
      const laps2 = estTotalLaps - laps1;

      const stint1Fuel = (laps1 + Math.ceil(safetyBufferLaps / 2)) * fuelPerLap;
      const stint2Fuel = (laps2 + Math.floor(safetyBufferLaps / 2)) * fuelPerLap;

      const stint1Overfilled = stint1Fuel > pitMaxFuelCapacity;
      const stint2Overfilled = stint2Fuel > pitMaxFuelCapacity;

      stints.push({
        index: 1,
        durationMins: Math.round(fuelRaceTime * ratio1 * 10) / 10,
        laps: laps1,
        fuelNeeded: stint1Overfilled ? pitMaxFuelCapacity : stint1Fuel,
        isOverfilled: stint1Overfilled,
      });

      stints.push({
        index: 2,
        durationMins: Math.round(fuelRaceTime * ratio2 * 10) / 10,
        laps: laps2,
        fuelNeeded: stint2Overfilled ? pitMaxFuelCapacity : stint2Fuel,
        isOverfilled: stint2Overfilled,
      });

      if (stint1Overfilled || stint2Overfilled) {
        alertMsg = `⚠️ Tank limitation reached! One of your stints exceeds ${pitMaxFuelCapacity}L capacity. Consider planning 2 stops or shifting the stint balance.`;
      }
    } else if (pitNumberOfStops === 2) {
      // 2 stops = 3 stints
      let ratio1 = 0.33;
      let ratio2 = 0.33;
      let ratio3 = 0.34;

      if (pitStrategyPreference === "undercut") {
        ratio1 = 0.25;
        ratio2 = 0.35;
        ratio3 = 0.4;
      } else if (pitStrategyPreference === "overcut") {
        ratio1 = 0.4;
        ratio2 = 0.35;
        ratio3 = 0.25;
      }

      const laps1 = Math.ceil(estTotalLaps * ratio1);
      const laps2 = Math.ceil(estTotalLaps * ratio2);
      const laps3 = estTotalLaps - laps1 - laps2;

      const stint1Fuel = (laps1 + 1) * fuelPerLap;
      const stint2Fuel = (laps2 + 1) * fuelPerLap;
      const stint3Fuel = (laps3 + (safetyBufferLaps - 2)) * fuelPerLap;

      stints.push({
        index: 1,
        durationMins: Math.round(fuelRaceTime * ratio1 * 10) / 10,
        laps: laps1,
        fuelNeeded: stint1Fuel > pitMaxFuelCapacity ? pitMaxFuelCapacity : stint1Fuel,
        isOverfilled: stint1Fuel > pitMaxFuelCapacity,
      });
      stints.push({
        index: 2,
        durationMins: Math.round(fuelRaceTime * ratio2 * 10) / 10,
        laps: laps2,
        fuelNeeded: stint2Fuel > pitMaxFuelCapacity ? pitMaxFuelCapacity : stint2Fuel,
        isOverfilled: stint2Fuel > pitMaxFuelCapacity,
      });
      stints.push({
        index: 3,
        durationMins: Math.round(fuelRaceTime * ratio3 * 10) / 10,
        laps: laps3,
        fuelNeeded: stint3Fuel > pitMaxFuelCapacity ? pitMaxFuelCapacity : stint3Fuel,
        isOverfilled: stint3Fuel > pitMaxFuelCapacity,
      });
    }

    const standardMaxInitialFuel = Math.min(pitMaxFuelCapacity, totalFuelNeeded);
    const splitStartingFuel =
      stints.length > 0
        ? stintsCount > 1
          ? stints[0].fuelNeeded
          : totalFuelNeeded
        : totalFuelNeeded;
    const fuelWeightDifference = Math.max(0, (standardMaxInitialFuel - splitStartingFuel) * 0.74);
    const estimatedTimeGainPerLap = (fuelWeightDifference / 10) * 0.08;

    return {
      estTotalLaps,
      totalFuelNeeded,
      stints,
      msg,
      alertMsg,
      fuelWeightDifference,
      estimatedTimeGainPerLap,
    };
  };

  const pitStrategy = getPitStrategyModel();
  const calculatedFuelLapTimeSec =
    (fuelLapTimeMin === "" ? 0 : fuelLapTimeMin) * 60 +
    (fuelLapTimeSec === "" ? 0 : fuelLapTimeSec);

  return (
    <div id="tabpanel-fuel" role="tabpanel" aria-labelledby="tab-btn-fuel" className="space-y-5 py-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Current Load display (4 cols) */}
        <div className="md:col-span-4 bg-white border border-zinc-200 p-5 rounded-lg flex flex-col justify-between shadow-sm text-zinc-900">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              Core Loaded Fuel
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-700 mt-3 flex items-center gap-3">
              {isTuneMode && (
                <button
                  onClick={() => onAdjustSetupValue("fuel", -2)}
                  className="w-11 h-11 flex items-center justify-center bg-zinc-150 hover:bg-zinc-250 border border-zinc-250 rounded-lg text-base font-black cursor-pointer active:scale-95 text-zinc-900 select-none text-center"
                  title="Decrease Fuel 2L"
                >
                  -
                </button>
              )}
              <span>{fuel} L</span>
              {isTuneMode && (
                <button
                  onClick={() => onAdjustSetupValue("fuel", 2)}
                  className="w-11 h-11 flex items-center justify-center bg-zinc-150 hover:bg-zinc-250 border border-zinc-250 rounded-lg text-base font-black cursor-pointer active:scale-95 text-zinc-900 select-none text-center"
                  title="Increase Fuel 2L"
                >
                  +
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-600 mt-4 leading-relaxed font-medium">
              This setup has standard <strong className="text-zinc-900 font-bold">{fuel} Litres</strong> saved in the config file. (ACC defaults simple setups to 20L).
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200 text-xs text-zinc-500 font-mono flex items-center gap-1.5 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
            Maximum Tank: ~120L (GT3 average)
          </div>
        </div>

        {/* Race Fuel Tool calculator console (8 cols) */}
        <div className="md:col-span-8 bg-white border border-zinc-200 p-5 rounded-lg shadow-sm space-y-4 text-zinc-900">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
            <h4 className="text-xs font-mono font-bold tracking-widest text-brand uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
              Interactive Race Fuel Tool
            </h4>
            <span className="text-[10px] font-mono text-zinc-550 font-bold">DYNAMIC CALCULATOR</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left sliders */}
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-550 font-bold">Race Duration</span>
                  <span className="text-zinc-900 font-extrabold">{fuelRaceTime} Mins</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={180}
                  step={5}
                  value={fuelRaceTime}
                  onChange={(e) => setFuelRaceTime(parseInt(e.target.value, 10))}
                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg cursor-pointer animate-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-550 font-bold">Average Lap Time</span>
                  <span className="text-zinc-900 font-extrabold">
                    {fuelLapTimeMin === "" ? 0 : fuelLapTimeMin}m {fuelLapTimeSec === "" ? 0 : fuelLapTimeSec < 10 ? `0${fuelLapTimeSec}` : fuelLapTimeSec}s
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded border border-zinc-200 focus-within:border-red-250">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">MIN:</span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={fuelLapTimeMin}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setFuelLapTimeMin("");
                        } else {
                          const parsed = parseInt(val, 10);
                          if (!isNaN(parsed)) {
                            setFuelLapTimeMin(Math.max(0, parsed));
                          }
                        }
                      }}
                      onBlur={() => {
                        if (fuelLapTimeMin === "") {
                          setFuelLapTimeMin(1);
                        }
                      }}
                      className="bg-transparent text-zinc-900 font-mono w-full text-xs text-center font-bold focus:outline-none placeholder-zinc-350"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded border border-zinc-200 focus-within:border-red-250">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">SEC:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={fuelLapTimeSec}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setFuelLapTimeSec("");
                        } else {
                          const parsed = parseInt(val, 10);
                          if (!isNaN(parsed)) {
                            setFuelLapTimeSec(Math.max(0, Math.min(59, parsed)));
                          }
                        }
                      }}
                      onBlur={() => {
                        if (fuelLapTimeSec === "") {
                          setFuelLapTimeSec(45);
                        }
                      }}
                      className="bg-transparent text-zinc-900 font-mono w-full text-xs text-center font-bold focus:outline-none placeholder-zinc-350"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right sliders */}
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-550 font-bold">Consumption Per Lap</span>
                  <span className="text-emerald-700 font-extrabold">{fuelPerLap.toFixed(2)} L/Lap</span>
                </div>
                <input
                  type="range"
                  min={activeFuelRange.min}
                  max={activeFuelRange.max}
                  step={0.05}
                  value={fuelPerLap}
                  onChange={(e) => setFuelPerLap(parseFloat(e.target.value))}
                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
                  <span>{activeFuelRange.min.toFixed(1)}L</span>
                  <span>{activeFuelRange.max.toFixed(1)}L</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-zinc-550 font-bold">Safety Buffer</span>
                  <span className="text-red-700 font-bold">+{fuelSafetyLaps} Laps</span>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFuelSafetyLaps(num)}
                      className={`flex-1 py-1 rounded border text-xs font-mono font-bold transition-all cursor-pointer ${
                        fuelSafetyLaps === num
                          ? "bg-red-50 border-red-500 text-red-700 shadow-xs"
                          : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:text-zinc-900"
                      }`}
                    >
                      {num} Laps
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Calculations outcome box */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg grid grid-cols-3 gap-2 text-center font-mono hover:border-zinc-300 transition-colors shadow-xs">
            <div className="border-r border-zinc-200 pr-1">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Est Laps</span>
              <span className="text-sm sm:text-lg font-black text-zinc-900">
                {calculatedFuelLapTimeSec > 0 ? Math.ceil((fuelRaceTime * 60) / calculatedFuelLapTimeSec) : 0}
              </span>
            </div>
            <div className="border-r border-zinc-200 px-1">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Total Laps</span>
              <span className="text-sm sm:text-lg font-black text-brand">
                {(calculatedFuelLapTimeSec > 0 ? Math.ceil((fuelRaceTime * 60) / calculatedFuelLapTimeSec) : 0) + fuelSafetyLaps}
              </span>
            </div>
            <div className="pl-1">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">MIN FUEL REQ</span>
              <span className="text-sm sm:text-lg font-black text-emerald-700 tracking-tight">
                {(((calculatedFuelLapTimeSec > 0 ? Math.ceil((fuelRaceTime * 60) / calculatedFuelLapTimeSec) : 0) + fuelSafetyLaps) * fuelPerLap).toFixed(1)} L
              </span>
            </div>
          </div>

          <span className="text-[10px] block text-zinc-550 leading-relaxed italic text-center font-sans font-medium">
            *Pit strategy recommendation:{" "}
            {(((calculatedFuelLapTimeSec > 0 ? Math.ceil((fuelRaceTime * 60) / calculatedFuelLapTimeSec) : 0) + fuelSafetyLaps) * fuelPerLap) > pitMaxFuelCapacity
              ? `⚠️ Refuel pitstop needed: Minimum load exceeds your customized ${pitMaxFuelCapacity}L tank limit.`
              : "✓ Optimal run capacity: No physical mid-session refuelling breaks strictly required by tank volume."}
          </span>
        </div>
      </div>

      {/* PIT & STINT STRATEGY PLANNER SECTION */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm space-y-5 text-zinc-905">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-xs font-mono font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-red-600 shrink-0" />
              ACC Pit & Stint Strategy Planner
            </h3>
            <p className="text-xs text-zinc-650 mt-0.5 font-medium">
              Optimize starting fuel weight loadouts, stint timing, and MFD presets for 45m - 2h endurance sessions.
            </p>
          </div>
          <div className="bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-220 rounded font-mono text-[10px] uppercase font-bold tracking-wider shrink-0 flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            {pitStrategy.fuelWeightDifference > 0
              ? `Est. Pace Advantage: -${pitStrategy.estimatedTimeGainPerLap.toFixed(2)}s/Lap`
              : "Optimized Fuel-Weight Profile"}
          </div>
        </div>

        {/* Interactive Pit Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Config Controls (Col Span 5) */}
          <div className="lg:col-span-5 space-y-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-550 uppercase mb-2">Race Pit Rules & Settings</h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Fuel capacity */}
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1 font-bold">
                  Max Tank Capacity
                </label>
                <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded px-2.5 py-1 focus-within:border-red-250">
                  <input
                    type="number"
                    min="20"
                    max="140"
                    value={pitMaxFuelCapacity}
                    onChange={(e) => setPitMaxFuelCapacity(Math.max(20, parseInt(e.target.value, 10) || 120))}
                    className="w-full bg-transparent font-mono text-xs focus:outline-none text-zinc-900 text-center font-bold"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">L</span>
                </div>
              </div>

              {/* Strategy Preference */}
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1 font-bold">
                  Stint Strategy Style
                </label>
                <select
                  value={pitStrategyPreference}
                  onChange={(e) => setPitStrategyPreference(e.target.value as any)}
                  className="w-full bg-white border border-zinc-200 rounded font-mono text-xs text-zinc-800 p-1.5 hover:border-zinc-350 focus:outline-none cursor-pointer font-bold shadow-xs"
                >
                  <option value="balanced">Balanced (Equal stints)</option>
                  <option value="undercut">Undercut (Early pitstop)</option>
                  <option value="overcut">Overcut (Late pitstop)</option>
                </select>
              </div>
            </div>

            {/* Mandatory Rules Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPitMandatoryFuel(!pitMandatoryFuel)}
                className={`py-1.5 px-3 rounded text-[10px] font-mono font-black uppercase transition-all border cursor-pointer text-center shadow-xs ${
                  pitMandatoryFuel
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {pitMandatoryFuel ? "✓ Mandatory Fuel Stop" : "⚡ Refueling Optional"}
              </button>

              <button
                onClick={() => setPitMandatoryTyres(!pitMandatoryTyres)}
                className={`py-1.5 px-3 rounded text-[10px] font-mono font-black uppercase transition-all border cursor-pointer text-center shadow-xs ${
                  pitMandatoryTyres
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {pitMandatoryTyres ? "✓ Mandatory Tyre Swap" : "⚡ Tyres Optional"}
              </button>
            </div>

            {/* Plan Pitstops Selection Tabs */}
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                Target Number of Pitstops
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "0 Stops", val: 0 },
                  { label: "1 Stop", val: 1 },
                  { label: "2 Stops", val: 2 },
                  { label: "3 Stops", val: 3 },
                ].map((tab) => {
                  const isSelected = pitNumberOfStops === tab.val;
                  return (
                    <button
                      key={tab.val}
                      onClick={() => setPitNumberOfStops(tab.val)}
                      className={`py-1.5 rounded text-[10px] font-mono font-black transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-600 text-white shadow-md shadow-red-500/10"
                          : "bg-white text-zinc-650 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-350 shadow-xs"
                      }`}
                    >
                      {tab.val} Stop{tab.val !== 1 ? "s" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual Timeline and MFD Presets (Col Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            {pitStrategy.alertMsg && (
              <div className="bg-red-55 px-3.5 py-2.5 rounded-lg border border-red-200 text-red-750 text-xs font-mono font-bold flex items-center gap-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{pitStrategy.alertMsg}</span>
              </div>
            )}

            {/* Visual Timeline */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-2.5 shadow-xs">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Planned Session Timeline</span>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                {pitStrategy.stints.map((stint, sIdx) => {
                  const pct = (stint.durationMins / fuelRaceTime) * 100;
                  return (
                    <div key={stint.index} className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full">
                      {/* One Stint Box */}
                      <div
                        className={`flex-1 p-3 rounded-lg border text-left font-mono transition-all shadow-xs ${
                          stint.isOverfilled
                            ? "bg-red-50 border-red-300 text-red-800"
                            : "bg-emerald-50 border-emerald-200 text-emerald-850"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                          <span>Stint {stint.index}</span>
                          <span className={stint.isOverfilled ? "text-red-700" : "text-emerald-700"}>
                            {pct.toFixed(0)}% of race
                          </span>
                        </div>
                        <div className="text-sm font-black text-zinc-900 mt-1">
                          {stint.durationMins.toFixed(0)} mins
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-1 space-y-0.5 font-bold">
                          <div>
                            Laps: <strong className="text-zinc-900">{stint.laps} Laps</strong>
                          </div>
                          <div>
                            Fuel Onboard:{" "}
                            <strong className={stint.isOverfilled ? "text-red-700 font-extrabold" : "text-emerald-705 font-black"}>
                              {stint.fuelNeeded.toFixed(1)} L
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Pitstop Marker (except after last stint) */}
                      {sIdx < pitStrategy.stints.length - 1 && (
                        <div className="flex flex-row md:flex-col items-center justify-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-[10px] font-mono rounded-lg font-black uppercase text-center tracking-wider max-w-xs mx-auto md:mx-0 shrink-0 select-none shadow-xs">
                          <span>Pitstop</span>
                          <span className="hidden md:inline">➔</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MFD / Pitstop Setup Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Starting Settings Panel */}
              <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 font-mono space-y-2 shadow-xs">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pb-1.5 border-b border-zinc-200 flex items-center justify-between">
                  <span>GARAGE FUEL SETUP</span>
                  <span className="font-semibold text-emerald-700 text-[10px]">BEFORE GREEN LIGHT</span>
                </div>
                <div className="text-xs text-zinc-600 space-y-1.5 font-bold">
                  <div className="flex justify-between">
                    <span>Starting Fuel:</span>
                    <strong className="text-emerald-700 font-black text-xs">
                      {pitStrategy.stints.length > 0 ? pitStrategy.stints[0].fuelNeeded.toFixed(1) : pitStrategy.totalFuelNeeded.toFixed(1)} Litres
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tyre Set Selector:</span>
                    <strong className="text-zinc-900">Tyre Set #1 (Fresh Slicks)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Starting Weight Saved:</span>
                    <strong className="text-red-600 font-bold">
                      {pitStrategy.fuelWeightDifference > 0 ? `-${pitStrategy.fuelWeightDifference.toFixed(1)} kg` : "N/A (Standard Tank)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Multi-Functional Display Preset Profile */}
              <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 font-mono space-y-2 shadow-xs">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pb-1.5 border-b border-zinc-200 flex items-center justify-between">
                  <span>MFD PITSTOP PRESETS</span>
                  <span className="font-semibold text-red-600 text-[10px]">ACC IN-CAR PRESET</span>
                </div>
                <div className="text-xs text-zinc-600 space-y-1.5 font-bold">
                  <div className="flex justify-between">
                    <span>Refueling Strategy:</span>
                    {pitMandatoryFuel && pitNumberOfStops > 0 ? (
                      <strong className="text-emerald-700 font-black">
                        Refuel +{(pitStrategy.stints[1]?.fuelNeeded || 0).toFixed(1)} L
                      </strong>
                    ) : (
                      <strong className="text-zinc-450 italic">No Refuel (Sprint)</strong>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Tyres Strategy:</span>
                    {pitMandatoryTyres ? (
                      <strong className="text-red-600">Change Set #2</strong>
                    ) : (
                      <strong className="text-zinc-450 italic">No Tyre Swap</strong>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Brake Pads Choice:</span>
                    <strong className="text-zinc-900 font-bold">Pad #1 (Standard GT3)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Efficiency Advice Alert */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3.5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <Gauge className="text-emerald-755 w-4.5 h-4.5 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs font-mono leading-relaxed space-y-1 text-zinc-700">
                  <h5 className="font-black text-emerald-805 uppercase tracking-widest text-[10px]">
                    ENDURANCE FUEL-WEIGHT PACE DIVIDEND
                  </h5>
                  <p className="font-medium">
                    {pitStrategy.fuelWeightDifference > 0 ? (
                      <>
                        By splitting your race fuel into multiple stints, you avoid carrying a completely full tank of fuel. This saves{" "}
                        <strong className="text-zinc-900 font-extrabold">{pitStrategy.fuelWeightDifference.toFixed(1)} kg</strong> of load, increasing corner roll speeds, lowering brake wear, and shaving up to{" "}
                        <strong className="text-emerald-705 font-black">-{pitStrategy.estimatedTimeGainPerLap.toFixed(2)}s per lap</strong> off your base lap time!
                      </>
                    ) : (
                      <>
                        For short sessions or when running without pitstops, fill the tank completely with a comfort-led safety cushion. But for races 45m - 2h, selecting the 1-Stop Strategy will unleash immediate pace gains!
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
