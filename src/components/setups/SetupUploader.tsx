import React, { useState, DragEvent, ChangeEvent } from "react";
import { Upload, X, AlertTriangle, FileCode, CheckCircle, FolderOpen, RefreshCw } from "lucide-react";
import { parseAccSetup, ACC_CARS, ACC_TRACKS, NormalizedAccSetup } from "../../utils/accParser";
import { SetupItem, dbSaveSetupsBatch } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { useSetups } from "../../context/SetupContext";

interface PendingSetup {
  id: string;
  fileName: string;
  customName: string;
  carKey: string;
  trackKey: string;
  notes: string;
  parsedData: NormalizedAccSetup;
  rawData: any;
}

interface SetupUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (setup: SetupItem) => void;
}

export default function SetupUploader({ isOpen, onClose, onSuccess }: SetupUploaderProps) {
  const { user, profile } = useAuth();
  const { refreshSetups, showToast } = useSetups();

  const [pendingSetups, setPendingSetups] = useState<PendingSetup[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    setUploadError(null);
    const newItems: PendingSetup[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith(".json")) continue;

      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const parsed = parseAccSetup(json, file.name);

        newItems.push({
          id: `pending_${Date.now()}_${i}`,
          fileName: file.name,
          customName: file.name.replace(".json", ""),
          carKey: parsed.carKey,
          trackKey: parsed.trackKey,
          notes: "",
          parsedData: parsed,
          rawData: json,
        });
      } catch (err) {
        console.warn(`Failed to parse file ${file.name}:`, err);
      }
    }

    if (newItems.length > 0) {
      setPendingSetups((prev) => [...prev, ...newItems]);
    } else {
      setUploadError("No valid ACC setup JSON files found.");
    }
    setIsProcessing(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDeploy = async () => {
    if (pendingSetups.length === 0) return;
    setIsSaving(true);
    setUploadError(null);

    const uploaderUID = user?.uid || "guest_driver";
    const uploaderName = profile?.username || user?.displayName || "Team Driver";

    try {
      const newSetups: SetupItem[] = pendingSetups.map((item) => ({
        id: `setup_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`,
        name: item.customName.trim() || item.fileName.replace(".json", ""),
        car: item.carKey,
        track: item.trackKey,
        notes: item.notes.trim() || "Uploaded to community registry.",
        rawData: item.rawData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: uploaderUID,
        uploadedByName: uploaderName,
      }));

      await dbSaveSetupsBatch(newSetups);
      await refreshSetups();

      showToast(`Uploaded ${newSetups.length} setup(s)!`, "success");
      if (onSuccess && newSetups.length > 0) {
        onSuccess(newSetups[0]);
      }
      setPendingSetups([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to save setups to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-fade-in text-left font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold uppercase font-mono tracking-wider text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-500" />
              Upload ACC Setup (.json)
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
              Drop setups from <code className="text-zinc-300">Documents\Assetto Corsa Competizione\Setups</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md bg-zinc-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-zinc-700 hover:border-red-500/80 rounded-xl p-6 text-center bg-zinc-950/60 hover:bg-zinc-950 transition-all flex flex-col items-center justify-center cursor-pointer relative"
        >
          <input
            type="file"
            multiple
            accept=".json"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="p-3 bg-red-500/10 text-red-500 rounded-full mb-2">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
            Drag & Drop setup JSON files here
          </span>
          <span className="text-[10px] text-zinc-400 mt-1">
            or click to browse your computer
          </span>
        </div>

        {uploadError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Pending Setups List */}
        {pendingSetups.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Ready to Deploy ({pendingSetups.length}):
              </span>
              <button
                type="button"
                onClick={() => setPendingSetups([])}
                className="text-[10px] text-zinc-500 hover:text-red-400 font-mono uppercase"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {pendingSetups.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">
                      {item.fileName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase">
                      {ACC_CARS[item.carKey]?.split(" ")[0] || item.carKey} · {ACC_TRACKS[item.trackKey] || item.trackKey}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Custom Setup Name (e.g. Q-Lap v1.2)"
                    value={item.customName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPendingSetups((prev) =>
                        prev.map((s, i) => (i === idx ? { ...s, customName: val } : s))
                      );
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                  />

                  <textarea
                    rows={2}
                    placeholder="Crew notes / driving advice..."
                    value={item.notes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPendingSetups((prev) =>
                        prev.map((s, i) => (i === idx ? { ...s, notes: val } : s))
                      );
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={isSaving}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer active:scale-98 transition-all"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deploying to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Deploy Setups to Registry</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
