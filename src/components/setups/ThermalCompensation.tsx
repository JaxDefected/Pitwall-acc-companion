import React from "react";
import { Thermometer, Clock, Sun, Moon, Minus, Plus } from "lucide-react";
import { calculateTransitionCoolingModel } from "../../utils/thermalEngine";

interface ThermalCompensationProps {
  transitionTimeStart: string;
  setTransitionTimeStart: (val: string) => void;
  durationHours: number;
  setDurationHours: (val: number) => void;
  durationMinutes: number;
  setDurationMinutes: (val: number) => void;
  transitionAmbientTemp: number;
  setTransitionAmbientTemp: (updater: (prev: number) => number) => void;
  transitionTrackTemp: number;
  setTransitionTrackTemp: (updater: (prev: number) => number) => void;
  showCompensated: boolean;
  setShowCompensated: (val: boolean) => void;
}

export default function ThermalCompensation({
  transitionTimeStart,
  setTransitionTimeStart,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  transitionAmbientTemp,
  setTransitionAmbientTemp,
  transitionTrackTemp,
  setTransitionTrackTemp,
  showCompensated,
  setShowCompensated,
}: ThermalCompensationProps) {
  const durationTotalMinutes = durationHours * 60 + durationMinutes;

  // Run thermal model
  const coolingModel = calculateTransitionCoolingModel({
    startTime: transitionTimeStart,
    durationMinutes: durationTotalMinutes,
    startTrackTemp: transitionTrackTemp,
    startAmbientTemp: transitionAmbientTemp,
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4 font-sans text-left">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-500/10 text-red-500 rounded-lg">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Tyre Pressure & Ambient Thermal Compensation
            </h4>
            <p className="text-[10px] text-zinc-400">
              ACC Physics: Compensates initial cold pressures against weather & sunset transitions
            </p>
          </div>
        </div>

        {/* Toggle Compensated Button */}
        <button
          type="button"
          onClick={() => setShowCompensated(!showCompensated)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            showCompensated
              ? "bg-red-600 text-white shadow-md shadow-red-600/20"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          {showCompensated ? "✓ Pressures Compensated" : "Compensate Pressures"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time of Day */}
        <div>
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-bold">
            Session Start Time
          </label>
          <select
            value={transitionTimeStart}
            onChange={(e) => {
              setTransitionTimeStart(e.target.value);
              setShowCompensated(true);
            }}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-white p-2.5 focus:outline-none focus:border-red-500 cursor-pointer font-bold"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
              const isSunset = i === 17 || i === 18 || i === 19;
              return (
                <option key={hourStr} value={hourStr}>
                  {hourStr} {isSunset ? "🌅 (Sunset Transition)" : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-bold">
            Stint Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">HRS:</span>
              <input
                type="number"
                min={0}
                max={24}
                value={durationHours}
                onChange={(e) => {
                  setDurationHours(Math.max(0, parseInt(e.target.value) || 0));
                  setShowCompensated(true);
                }}
                className="bg-transparent text-white font-mono w-full text-xs text-center font-bold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">MINS:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)));
                  setShowCompensated(true);
                }}
                className="bg-transparent text-white font-mono w-full text-xs text-center font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Steppers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
        <div>
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-bold">
            Ambient Air Temperature
          </label>
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden h-9">
            <button
              type="button"
              onClick={() => {
                setTransitionAmbientTemp((prev) => Math.max(10, prev - 1));
                setShowCompensated(true);
              }}
              className="px-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800 h-full flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold text-white">
              {transitionAmbientTemp}°C
            </span>
            <button
              type="button"
              onClick={() => {
                setTransitionAmbientTemp((prev) => Math.min(45, prev + 1));
                setShowCompensated(true);
              }}
              className="px-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-l border-zinc-800 h-full flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-bold">
            Track Surface Temperature
          </label>
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden h-9">
            <button
              type="button"
              onClick={() => {
                setTransitionTrackTemp((prev) => Math.max(10, prev - 1));
                setShowCompensated(true);
              }}
              className="px-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800 h-full flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold text-white">
              {transitionTrackTemp}°C
            </span>
            <button
              type="button"
              onClick={() => {
                setTransitionTrackTemp((prev) => Math.min(60, prev + 1));
                setShowCompensated(true);
              }}
              className="px-3 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-l border-zinc-800 h-full flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Output Summary */}
      {coolingModel && (
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] uppercase">Calculated Delta:</span>
            <span
              className={`font-bold ${
                coolingModel.compensationPSI >= 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {coolingModel.compensationPSI >= 0 ? `+${coolingModel.compensationPSI.toFixed(1)}` : coolingModel.compensationPSI.toFixed(1)} PSI
            </span>
          </div>
          <div className="text-[10px] text-zinc-400">
            {coolingModel.thermalEffectDescription || "Optimal running pressures target ~26.8 PSI Hot"}
          </div>
        </div>
      )}
    </div>
  );
}
