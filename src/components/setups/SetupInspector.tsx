import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Download,
  Gauge,
  Thermometer,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Minus,
  Plus,
  ArrowLeft,
  Cpu,
  Compass,
} from "lucide-react";
import { SetupItem } from "../../firebase";
import { ACC_CARS, ACC_TRACKS, NormalizedAccSetup } from "../../utils/accParser";
import { cars } from "../../data/cars";
import { CIRCUIT_NOTES } from "../../data/circuitNotes";
import { CAR_NOTES_DATA, TRACKS_MAP_DATA } from "../../data/carNotesData";
import { getPressureColor } from "../../utils/thermalEngine";
import { useAuth } from "../../hooks/useAuth";
import { useSetups } from "../../context/SetupContext";
import FuelStrategyTab from "../FuelStrategyTab";
import TuningWorkshopBanner from "../TuningWorkshopBanner";
import ThermalCompensation from "./ThermalCompensation";
import SetupRatingCard from "./SetupRatingCard";

interface SetupInspectorProps {
  setup: SetupItem | null;
  onBack?: () => void;
}

export default function SetupInspector({ setup, onBack }: SetupInspectorProps) {
  const { user, profile, login } = useAuth();
  const {
    parsedSetupData,
    isTuneMode,
    setIsTuneMode,
    tunedRawData,
    setTunedRawData,
    handleAdjustSetupValue,
    saveCustomTunedSetup,
    showToast,
  } = useSetups();

  const [selectedTab, setSelectedTab] = useState<
    "tyres" | "electronics" | "fuel" | "mechanical" | "aero" | "dampers"
  >("tyres");

  // Crew & Circuit notes accordions
  const [isCrewNotesOpen, setIsCrewNotesOpen] = useState(true);
  const [isCircuitBriefingOpen, setIsCircuitBriefingOpen] = useState(false);

  // Thermal compensation states
  const [transitionTimeStart, setTransitionTimeStart] = useState("17:00");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [transitionTrackTemp, setTransitionTrackTemp] = useState(32);
  const [transitionAmbientTemp, setTransitionAmbientTemp] = useState(24);
  const [showCompensated, setShowCompensated] = useState(false);

  if (!setup || !parsedSetupData) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800 mb-4 text-zinc-500">
          <Gauge className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider mb-1">
          No Setup Selected
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-4">
          Select a setup from the registry list or upload an ACC setup JSON file to inspect telemetry parameters.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Registry
          </button>
        )}
      </div>
    );
  }

  const carName = ACC_CARS[setup.car] || setup.car;
  const trackName = ACC_TRACKS[setup.track] || setup.track;
  const carConfig = cars[setup.car];
  const circuitNote = CIRCUIT_NOTES[setup.track];
  const carNote = CAR_NOTES_DATA[carName];
  const trackMap = TRACKS_MAP_DATA[setup.track];

  // Helper for downloading original JSON
  const handleDownloadOriginalJson = () => {
    const dataToExport = isTuneMode && tunedRawData ? tunedRawData : setup.rawData;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${setup.car}_${setup.track}_${setup.name.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Setup JSON exported", "success");
  };

  // Helper for Stepper Buttons
  const renderStepper = (field: string, delta: number, index?: number) => {
    if (!isTuneMode) return null;
    return (
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => handleAdjustSetupValue(field, -delta, index)}
          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 rounded flex items-center justify-center transition-all cursor-pointer text-xs font-bold"
          title="Decrease"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => handleAdjustSetupValue(field, delta, index)}
          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-zinc-300 rounded flex items-center justify-center transition-all cursor-pointer text-xs font-bold"
          title="Increase"
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-left">
      {/* Top Header & Action Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden flex items-center gap-1 text-xs font-mono font-bold text-red-500 hover:text-red-400 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to List
            </button>
          )}

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
              {carName}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {trackName}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {setup.name}
          </h2>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            By @{setup.uploadedByName || "engineer"} · {new Date(setup.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {profile ? (
            <button
              type="button"
              onClick={() => {
                if (!isTuneMode) {
                  const cloned = JSON.parse(JSON.stringify(setup.rawData || {}));
                  setTunedRawData(cloned);
                  setIsTuneMode(true);
                  showToast("Tune Sandbox activated", "info");
                } else {
                  setIsTuneMode(false);
                  setTunedRawData(null);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[40px] ${
                isTuneMode
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "bg-zinc-800 hover:bg-zinc-750 text-amber-400 border border-amber-500/30"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isTuneMode ? "Exit Tune Mode" : "Tune Parameters"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={login}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 min-h-[40px]"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Sign in to Tune</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadOriginalJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .json</span>
          </button>

          {/* Ask Engineer Link */}
          <Link
            to={`/engineer?setupId=${setup.id}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all min-h-[40px]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ask Engineer</span>
          </Link>
        </div>
      </div>

      {/* Tune Mode Banner */}
      {isTuneMode && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20">
          <TuningWorkshopBanner
            currentTrack={setup.track}
            variant="top"
            onSave={async (notes, targetTrack, isTeam) => {
              await saveCustomTunedSetup(notes, targetTrack, isTeam);
            }}
            onCancel={() => {
              setIsTuneMode(false);
              setTunedRawData(null);
            }}
          />
        </div>
      )}

      {/* Crew Notes Accordion */}
      {setup.notes && (
        <div className="border-b border-zinc-800 bg-zinc-950/40">
          <button
            type="button"
            onClick={() => setIsCrewNotesOpen(!isCrewNotesOpen)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Setup Crew Notes
              </span>
            </div>
            {isCrewNotesOpen ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>
          {isCrewNotesOpen && (
            <div className="px-4 sm:px-5 pb-4 pt-1 animate-fade-in">
              <p className="text-xs text-zinc-300 italic leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                "{setup.notes}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Circuit & Vehicle Notes Accordion */}
      {(circuitNote || carNote) && (
        <div className="border-b border-zinc-800 bg-zinc-950/20">
          <button
            type="button"
            onClick={() => setIsCircuitBriefingOpen(!isCircuitBriefingOpen)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Circuit Briefing & Vehicle Dynamics
              </span>
            </div>
            {isCircuitBriefingOpen ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {isCircuitBriefingOpen && (
            <div className="p-4 sm:p-5 space-y-4 border-t border-zinc-800 animate-fade-in">
              {circuitNote && (
                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 space-y-2">
                  <span className="font-mono font-bold text-red-500 uppercase tracking-widest text-[10px] block">
                    {trackName} Racing Notes:
                  </span>
                  <p className="leading-relaxed text-zinc-300">{circuitNote.circuit_notes}</p>
                  {circuitNote.setup_notes?.downforce && (
                    <p className="leading-relaxed text-zinc-400">
                      <strong>Aero:</strong> {circuitNote.setup_notes.downforce}
                    </p>
                  )}
                  {circuitNote.setup_notes?.tyres && (
                    <p className="leading-relaxed text-zinc-400">
                      <strong>Tyres:</strong> {circuitNote.setup_notes.tyres}
                    </p>
                  )}
                </div>
              )}

              {carNote && (
                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 space-y-2">
                  <span className="font-mono font-bold text-red-500 uppercase tracking-widest text-[10px] block">
                    {carName} Dynamics:
                  </span>
                  <p className="leading-relaxed text-zinc-300">{carNote.car_notes}</p>
                  <p className="text-zinc-400">
                    <strong>Sensitivity:</strong> {carNote.setup_sensitivity}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6 Inspection Navigation Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/80 overflow-x-auto scrollbar-none px-4 pt-2 gap-1 text-xs font-mono font-bold uppercase tracking-wider">
        {(
          [
            ["tyres", "Tyres & Alignment"],
            ["electronics", "Electronics"],
            ["fuel", "Fuel & Strategy"],
            ["mechanical", "Mechanical Grip"],
            ["aero", "Aero & Ducts"],
            ["dampers", "Dampers"],
          ] as const
        ).map(([tabKey, tabLabel]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setSelectedTab(tabKey)}
            className={`px-3.5 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              selectedTab === tabKey
                ? "border-red-500 text-white font-black bg-zinc-900/60"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tabLabel}
          </button>
        ))}
      </div>

      {/* Tab Panels Content */}
      <div className="p-4 sm:p-5 flex-1 space-y-6">
        {/* ═══════ TAB 1: TYRES & ALIGNMENT ═══════ */}
        {selectedTab === "tyres" && (
          <div className="space-y-6 animate-fade-in">
            {/* 4 Corner Tyres Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "FRONT LEFT (LF)", pIdx: 0, cIdx: 0, tIdx: 0, casIdx: 0 },
                { label: "FRONT RIGHT (RF)", pIdx: 1, cIdx: 1, tIdx: 1, casIdx: 1 },
                { label: "REAR LEFT (LR)", pIdx: 2, cIdx: 2, tIdx: 2, casIdx: undefined },
                { label: "REAR RIGHT (RR)", pIdx: 3, cIdx: 3, tIdx: 3, casIdx: undefined },
              ].map(({ label, pIdx, cIdx, tIdx, casIdx }) => {
                const psi = parsedSetupData.tyrePressures[pIdx] || 26.8;
                const camber = parsedSetupData.cambers[cIdx] || -3.5;
                const toe = parsedSetupData.toes[tIdx] || -0.1;
                const caster = casIdx !== undefined ? parsedSetupData.casters[casIdx] : null;

                return (
                  <div
                    key={label}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        {label}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Dry Slick
                      </span>
                    </div>

                    {/* Pressure */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-mono">Cold Pressure:</span>
                      <div className="flex items-center gap-2">
                        {renderStepper("tyrePressure", 1, pIdx)}
                        <span className="text-sm font-mono font-black text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {psi.toFixed(1)} PSI
                        </span>
                      </div>
                    </div>

                    {/* Camber */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-mono">Camber Angle:</span>
                      <div className="flex items-center gap-2">
                        {renderStepper("camber", 1, cIdx)}
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {camber.toFixed(1)}°
                        </span>
                      </div>
                    </div>

                    {/* Toe */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-mono">Toe Angle:</span>
                      <div className="flex items-center gap-2">
                        {renderStepper("toe", 1, tIdx)}
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {toe > 0 ? `+${toe.toFixed(2)}` : toe.toFixed(2)}°
                        </span>
                      </div>
                    </div>

                    {/* Caster if front */}
                    {caster !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-mono">Caster Angle:</span>
                        <div className="flex items-center gap-2">
                          {renderStepper("caster", 1, casIdx)}
                          <span className="text-xs font-mono font-bold text-zinc-200">
                            {caster.toFixed(1)}°
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Steer Ratio */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  Steering Ratio:
                </span>
                <span className="text-[10px] text-zinc-400">
                  Turns of wheel to lock (Default ~13:1)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderStepper("steerRatio", 1)}
                <span className="text-sm font-mono font-black text-red-500 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                  {parsedSetupData.steerRatio}:1
                </span>
              </div>
            </div>

            {/* Thermal Compensation Panel */}
            <ThermalCompensation
              transitionTimeStart={transitionTimeStart}
              setTransitionTimeStart={setTransitionTimeStart}
              durationHours={durationHours}
              setDurationHours={setDurationHours}
              durationMinutes={durationMinutes}
              setDurationMinutes={setDurationMinutes}
              transitionAmbientTemp={transitionAmbientTemp}
              setTransitionAmbientTemp={setTransitionAmbientTemp}
              transitionTrackTemp={transitionTrackTemp}
              setTransitionTrackTemp={setTransitionTrackTemp}
              showCompensated={showCompensated}
              setShowCompensated={setShowCompensated}
            />
          </div>
        )}

        {/* ═══════ TAB 2: ELECTRONICS ═══════ */}
        {selectedTab === "electronics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
            {[
              { label: "TC1 (Traction Control)", key: "tc1", val: parsedSetupData.tc1, unit: "", max: 12 },
              { label: "TC2 (Cut / Slip Level)", key: "tc2", val: parsedSetupData.tc2, unit: "", max: 12 },
              { label: "ABS (Anti-lock Brakes)", key: "abs", val: parsedSetupData.abs, unit: "", max: 12 },
              { label: "ECU Engine Map", key: "ecuMap", val: parsedSetupData.ecuMap, unit: "", max: 12 },
              { label: "Fuel Map", key: "fuelMap", val: parsedSetupData.fuelMap, unit: "", max: 5 },
              { label: "Telemetry Laps", key: "telemetryLaps", val: parsedSetupData.telemetryLaps, unit: "laps", max: 99 },
            ].map(({ label, key, val, unit }) => (
              <div
                key={key}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    {label}
                  </span>
                  <span className="text-base font-mono font-black text-white mt-1 block">
                    {val} {unit}
                  </span>
                </div>
                {renderStepper(key, 1)}
              </div>
            ))}
          </div>
        )}

        {/* ═══════ TAB 3: FUEL & STRATEGY ═══════ */}
        {selectedTab === "fuel" && (
          <div className="space-y-6 animate-fade-in">
            {/* Base Fuel In Tank */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  Initial Fuel Load:
                </span>
                <span className="text-[10px] text-zinc-400">
                  Liters onboard at race start
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderStepper("fuel", 5)}
                <span className="text-base font-mono font-black text-red-500 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                  {parsedSetupData.fuel} L
                </span>
              </div>
            </div>

            {/* Interactive Pit Strategy Calculator */}
            <FuelStrategyTab
              fuel={parsedSetupData.fuel}
              activeTrack={setup.track}
              isTuneMode={isTuneMode}
              onAdjustSetupValue={(field, delta) => handleAdjustSetupValue(field, delta)}
            />
          </div>
        )}

        {/* ═══════ TAB 4: MECHANICAL GRIP ═══════ */}
        {selectedTab === "mechanical" && (
          <div className="space-y-4 animate-fade-in">
            {/* ARB & Differential */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Front Anti-Roll Bar
                  </span>
                  <span className="text-sm font-mono font-black text-white mt-1 block">
                    Level {parsedSetupData.arbFront}
                  </span>
                </div>
                {renderStepper("arbFront", 1)}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Rear Anti-Roll Bar
                  </span>
                  <span className="text-sm font-mono font-black text-white mt-1 block">
                    Level {parsedSetupData.arbRear}
                  </span>
                </div>
                {renderStepper("arbRear", 1)}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Preload Differential
                  </span>
                  <span className="text-sm font-mono font-black text-white mt-1 block">
                    {parsedSetupData.preloadDifferential} Nm
                  </span>
                </div>
                {renderStepper("preloadDifferential", 1)}
              </div>
            </div>

            {/* Brakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Brake Power
                  </span>
                  <span className="text-sm font-mono font-black text-white mt-1 block">
                    {parsedSetupData.brakePower}%
                  </span>
                </div>
                {renderStepper("brakePower", 1)}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Brake Bias
                  </span>
                  <span className="text-sm font-mono font-black text-white mt-1 block">
                    {parsedSetupData.brakeBias.toFixed(1)}%
                  </span>
                </div>
                {renderStepper("brakeBias", 1)}
              </div>
            </div>

            {/* Wheel Rates (Springs) */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                Wheel Rates / Springs (N/m):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["LF", "RF", "LR", "RR"].map((corner, idx) => (
                  <div key={corner} className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">{corner}:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-xs font-bold text-white">
                        {parsedSetupData.wheelRates[idx] || "—"}
                      </span>
                      {renderStepper("wheelRate", 1, idx)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 5: AERO & DUCTS ═══════ */}
        {selectedTab === "aero" && (
          <div className="space-y-4 animate-fade-in">
            {/* Ride Heights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  Front Ride Height
                </span>
                <span className="text-lg font-mono font-black text-white mt-1 block">
                  {parsedSetupData.rideHeights[0]} mm
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  Rear Ride Height
                </span>
                <span className="text-lg font-mono font-black text-white mt-1 block">
                  {parsedSetupData.rideHeights[1]} mm
                </span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  Aerodynamic Rake
                </span>
                <span className="text-lg font-mono font-black text-emerald-400 mt-1 block">
                  +{parsedSetupData.rideHeights[1] - parsedSetupData.rideHeights[0]} mm
                </span>
              </div>
            </div>

            {/* Wing, Splitter, Ducts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Rear Wing Angle
                  </span>
                  <span className="text-base font-mono font-black text-white mt-1 block">
                    Level {parsedSetupData.rearWing}
                  </span>
                </div>
                {renderStepper("rearWing", 1)}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Front Brake Ducts
                  </span>
                  <span className="text-base font-mono font-black text-white mt-1 block">
                    Duct {parsedSetupData.brakeDucts[0]}
                  </span>
                </div>
                {renderStepper("brakeDuctFront", 1)}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Rear Brake Ducts
                  </span>
                  <span className="text-base font-mono font-black text-white mt-1 block">
                    Duct {parsedSetupData.brakeDucts[1]}
                  </span>
                </div>
                {renderStepper("brakeDuctRear", 1)}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 6: DAMPERS ═══════ */}
        {selectedTab === "dampers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {[
              { label: "FRONT LEFT (LF)", idx: 0 },
              { label: "FRONT RIGHT (RF)", idx: 1 },
              { label: "REAR LEFT (LR)", idx: 2 },
              { label: "REAR RIGHT (RR)", idx: 3 },
            ].map(({ label, idx }) => (
              <div
                key={label}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5"
              >
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block pb-1 border-b border-zinc-800">
                  {label}
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">Bump (Slow):</span>
                  <div className="flex items-center gap-2">
                    {renderStepper("bumpSlow", 1, idx)}
                    <span className="text-xs font-mono font-bold text-white">
                      {parsedSetupData.bumpSlow[idx]} clicks
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">Fast Bump:</span>
                  <div className="flex items-center gap-2">
                    {renderStepper("bumpFast", 1, idx)}
                    <span className="text-xs font-mono font-bold text-white">
                      {parsedSetupData.bumpFast[idx]} clicks
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">Rebound (Slow):</span>
                  <div className="flex items-center gap-2">
                    {renderStepper("reboundSlow", 1, idx)}
                    <span className="text-xs font-mono font-bold text-white">
                      {parsedSetupData.reboundSlow[idx]} clicks
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">Fast Rebound:</span>
                  <div className="flex items-center gap-2">
                    {renderStepper("reboundFast", 1, idx)}
                    <span className="text-xs font-mono font-bold text-white">
                      {parsedSetupData.reboundFast[idx]} clicks
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Setup Ratings & Handling Tags Card at Bottom of Inspector */}
        <SetupRatingCard setupId={setup.id} />
      </div>
    </div>
  );
}
