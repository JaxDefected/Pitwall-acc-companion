import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { ACC_TRACKS } from "../utils/accParser";

export interface TuningWorkshopBannerProps {
  currentTrack?: string;
  variant?: "top" | "bottom";
  onSave: (note: string, targetTrack: string, isTeamWorkspace: boolean) => Promise<void>;
  onCancel?: () => void;
}

export default function TuningWorkshopBanner({
  currentTrack = "monza",
  variant = "top",
  onSave,
  onCancel,
}: TuningWorkshopBannerProps) {
  const [versionNote, setVersionNote] = useState<string>("");
  const [targetTrack, setTargetTrack] = useState<string>(currentTrack);
  const [isTeamWorkspace, setIsTeamWorkspace] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (currentTrack) {
      setTargetTrack(currentTrack);
    }
  }, [currentTrack]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const finalNote = versionNote.trim() || "Tweaked custom parameters.";
      await onSave(finalNote, targetTrack || currentTrack, isTeamWorkspace);
    } finally {
      setIsSaving(false);
    }
  };

  if (variant === "bottom") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mt-6 font-mono text-zinc-900">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 shrink-0 mt-0.5">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-900 font-sans tracking-wider uppercase">Active Tuning Sandbox Modded</p>
            <p className="text-[10.5px] text-zinc-600 leading-normal mt-1 font-medium max-w-xl">
              Parameters edited in Tyre pressures, Alignment, Electronics, Mechanical, or Dampers. Save variant to preserve changes.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Version note (e.g. Sunset cooling adjustment)"
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              className="w-full bg-white border border-zinc-250 text-zinc-900 px-3 py-2.5 rounded-lg text-[11px] placeholder-zinc-400 outline-none focus:border-amber-500 h-11"
            />
          </div>

          <select
            value={targetTrack}
            onChange={(e) => setTargetTrack(e.target.value)}
            className="bg-white border border-zinc-200 text-zinc-900 text-[11px] px-3 py-2 rounded-lg cursor-pointer font-sans focus:outline-none focus:border-amber-500 h-11 shrink-0 w-full sm:w-auto font-mono"
          >
            {Object.entries(ACC_TRACKS).map(([key, name]) => (
              <option key={key} value={key}>
                {key === currentTrack ? `${name} (Current Track)` : name}
              </option>
            ))}
          </select>

          <label className="flex items-center justify-center sm:justify-start gap-2.5 text-[11px] text-zinc-700 bg-white/60 hover:bg-white border border-zinc-200 hover:border-zinc-300 px-3.5 py-2 rounded-lg cursor-pointer select-none font-bold shadow-3xs transition-all active:scale-[0.98] h-11 shrink-0 w-full sm:w-auto">
            <input
              type="checkbox"
              checked={isTeamWorkspace}
              onChange={(e) => setIsTeamWorkspace(e.target.checked)}
              className="accent-amber-600 w-4.5 h-4.5 rounded border-zinc-300 focus:ring-amber-500 cursor-pointer"
            />
            <span>Share to Team Workspace</span>
          </label>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 h-11 w-full sm:w-auto"
          >
            <span>{isSaving ? "Saving..." : "💾 Save Custom Variant"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 p-4 shrink-0 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs font-mono">
      <div className="flex items-center gap-2.5">
        <div className="bg-amber-500 text-black p-2 rounded-md shrink-0">
          <Wrench className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-extrabold text-amber-600 uppercase tracking-wider text-[11px]">Active Tuning Workshop Mode</h4>
          <p className="text-[10px] text-zinc-650 mt-0.5 leading-tight">
            Modify values using +/- controls inside the Tyre pressures, Electronics, and Mechanical sections.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Version note (e.g. Sunset cooling adjustment)"
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            className="w-full bg-white border border-zinc-250 text-zinc-900 px-3 py-1.5 rounded text-base md:text-[11.5px] min-h-[44px] md:min-h-0 placeholder-zinc-400 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1 shrink-0 min-w-[150px]">
          <select
            value={targetTrack}
            onChange={(e) => setTargetTrack(e.target.value)}
            className="w-full bg-white border border-zinc-250 text-zinc-900 px-3 py-1.5 rounded text-base md:text-[11.5px] min-h-[44px] md:min-h-0 outline-none focus:border-amber-500 cursor-pointer font-sans"
          >
            {Object.entries(ACC_TRACKS).map(([key, name]) => (
              <option key={key} value={key}>
                {key === currentTrack ? `${name} (Current Track)` : name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-[10.5px] text-zinc-650 cursor-pointer select-none font-bold">
          <input
            type="checkbox"
            checked={isTeamWorkspace}
            onChange={(e) => setIsTeamWorkspace(e.target.checked)}
            className="accent-amber-500 w-3.5 h-3.5 rounded border-zinc-300 focus:ring-amber-550"
          />
          Share to Team Workspace
        </label>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-750 disabled:opacity-50 text-white font-extrabold px-3 py-1.5 rounded cursor-pointer transition-colors text-[10.5px] uppercase tracking-wider shadow-md active:scale-95 text-center"
          >
            {isSaving ? "Saving..." : "Save Variant"}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-705 font-extrabold px-3 py-1.5 rounded cursor-pointer transition-colors text-[10.5px] active:scale-95 text-center"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
