import React, { useState } from "react";
import {
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Check,
  X,
  FileSpreadsheet,
  AlertTriangle,
  Database,
  Hash,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSetups } from "../context/SetupContext";

interface SyncResponse {
  runId?: string;
  startedAt?: string;
  completedAt?: string;
  status: "success" | "partial" | "error";
  seriesId?: string;
  roundsCount?: number;
  hash?: string;
  changed?: boolean;
  errors?: string[];
  error?: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { showToast } = useSetups();
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetId, setSheetId] = useState("1s9m3yWd-zBLKf4An5rAJ7sxHy9ouU4y8OZjnN9pXoEs");
  const [seriesId, setSeriesId] = useState("lnr-acc-s18");
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);

  // Jack Lowther administrator verification
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "lowther.jack@gmail.com").toLowerCase();
  const isAdmin = user?.email?.toLowerCase() === adminEmail;

  // Pending claims for review
  const [pendingClaims, setPendingClaims] = useState([
    { id: "claim_1", gamertag: "TurboTadpole", userEmail: "turbotadpole@example.com", submittedAt: "10 mins ago" },
    { id: "claim_2", gamertag: "ShadowShift", userEmail: "shadowshift@example.com", submittedAt: "2 hours ago" },
  ]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-3 font-sans">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-full w-fit mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
          Access Denied
        </h2>
        <p className="text-xs text-zinc-400">
          Administrator privileges ({adminEmail}) are required to access this control interface.
        </p>
      </div>
    );
  }

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-league", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheetId: sheetId.trim() || undefined,
          seriesId: seriesId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sync request failed with status " + res.status);
      }

      setSyncResult(data);
      if (data.status === "success") {
        showToast(
          `Sync succeeded: ${data.roundsCount} rounds processed (Changed: ${data.changed ? "Yes" : "No"})`,
          "success"
        );
      } else {
        showToast(`Sync completed with issues: check logs`, "info");
      }
    } catch (err: any) {
      setSyncResult({
        status: "error",
        error: err.message || "Failed to execute sync",
      });
      showToast(`Sync failed: ${err.message}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApprove = (id: string, gamertag: string) => {
    setPendingClaims((prev) => prev.filter((c) => c.id !== id));
    showToast(`Approved claim for @${gamertag}`, "success");
  };

  const handleReject = (id: string, gamertag: string) => {
    setPendingClaims((prev) => prev.filter((c) => c.id !== id));
    showToast(`Rejected claim for @${gamertag}`, "info");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            ADMINISTRATOR CONTROL PANEL
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            LNR Google Sheets sync execution, Firestore precomputed snapshots, and driver claims
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing Sheets..." : "Sync Sheets Now"}</span>
        </button>
      </div>

      {/* Sync Configuration Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Google Sheets Sync Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="text-zinc-400 block mb-1">Target Google Workbook ID</label>
            <input
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-red-500 outline-none"
              placeholder="Google Sheet ID"
            />
          </div>
          <div>
            <label className="text-zinc-400 block mb-1">Target Series ID</label>
            <input
              type="text"
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-red-500 outline-none"
              placeholder="e.g. lnr-acc-s18"
            />
          </div>
        </div>

        {/* Sync Result Banner */}
        {syncResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
              syncResult.status === "success"
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                : syncResult.status === "partial"
                ? "bg-amber-950/40 border-amber-800 text-amber-200"
                : "bg-red-950/40 border-red-800 text-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                {syncResult.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                Sync Status: {syncResult.status.toUpperCase()}
              </span>
              {syncResult.runId && (
                <span className="text-[10px] text-zinc-400 font-mono">ID: {syncResult.runId}</span>
              )}
            </div>

            {syncResult.roundsCount !== undefined && (
              <div>
                Rounds Processed: <span className="font-bold">{syncResult.roundsCount}</span> · Hash Changed:{" "}
                <span className="font-bold">{syncResult.changed ? "Yes (Updated)" : "No (Idempotent)"}</span>
              </div>
            )}

            {syncResult.hash && (
              <div className="text-[10px] text-zinc-400 truncate">SHA256: {syncResult.hash}</div>
            )}

            {syncResult.error && (
              <div className="text-red-400 font-bold">{syncResult.error}</div>
            )}

            {syncResult.errors && syncResult.errors.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/60 space-y-1 text-[11px] text-amber-300">
                {syncResult.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Driver Claims */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
          Pending Driver Identity Claims ({pendingClaims.length})
        </h3>

        {pendingClaims.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-950 rounded-xl">
            No pending driver claims to review.
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div>
                  <span className="font-bold text-white text-sm block">@{claim.gamertag}</span>
                  <span className="text-zinc-500 text-[10px]">{claim.userEmail} · {claim.submittedAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(claim.id, claim.gamertag)}
                    className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg cursor-pointer"
                    title="Approve Claim"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(claim.id, claim.gamertag)}
                    className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg cursor-pointer"
                    title="Reject Claim"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
