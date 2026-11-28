import React, { useState, useEffect } from "react";
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
  Clock,
  History,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSetups } from "../context/SetupContext";
import {
  dbFetchPendingClaims,
  dbUpdateClaimStatus,
  dbFetchRecentSyncRuns,
  recordLocalSyncRun,
  DriverClaimItem,
  SyncRunLog,
} from "../firebase";

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
  const [pendingClaims, setPendingClaims] = useState<DriverClaimItem[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRunLog[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);

  // Load pending claims and sync run history
  useEffect(() => {
    async function loadAdminData() {
      try {
        const claims = await dbFetchPendingClaims();
        setPendingClaims(claims);
      } catch (err) {
        console.warn("Failed to load claims:", err);
      } finally {
        setIsLoadingClaims(false);
      }

      try {
        const runs = await dbFetchRecentSyncRuns();
        setSyncRuns(runs);
      } catch (err) {
        console.warn("Failed to load sync runs:", err);
      }
    }

    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

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
      recordLocalSyncRun({
        runId: data.runId || `sync_${Date.now()}`,
        startedAt: data.startedAt || new Date().toISOString(),
        completedAt: data.completedAt || new Date().toISOString(),
        status: data.status,
        seriesId: data.seriesId || seriesId,
        roundsCount: data.roundsCount,
        changed: data.changed,
        hash: data.hash,
        errors: data.errors,
      });

      // Refresh runs
      const updatedRuns = await dbFetchRecentSyncRuns();
      setSyncRuns(updatedRuns);

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

  const handleApprove = async (claim: DriverClaimItem) => {
    try {
      await dbUpdateClaimStatus(claim.id, claim.driverId, claim.userId, "approved");
      setPendingClaims((prev) => prev.filter((c) => c.id !== claim.id));
      showToast(`Approved claim for @${claim.driverName}`, "success");
    } catch (err: any) {
      showToast(`Approval failed: ${err.message}`, "error");
    }
  };

  const handleReject = async (claim: DriverClaimItem) => {
    try {
      await dbUpdateClaimStatus(claim.id, claim.driverId, claim.userId, "rejected");
      setPendingClaims((prev) => prev.filter((c) => c.id !== claim.id));
      showToast(`Rejected claim for @${claim.driverName}`, "info");
    } catch (err: any) {
      showToast(`Rejection failed: ${err.message}`, "error");
    }
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
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Pending Driver Identity Claims ({pendingClaims.length})
          </h3>
          {isLoadingClaims && (
            <span className="text-[10px] text-zinc-500 font-mono animate-pulse">Loading claims...</span>
          )}
        </div>

        {pendingClaims.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-950 rounded-xl">
            No pending driver claims to review. Competitor claims submitted from /me will appear here.
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">@{claim.driverName}</span>
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[9px] uppercase">
                      ID: {claim.driverId}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[10px] block mt-0.5">
                    User: {claim.userEmail} · Created: {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(claim)}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg cursor-pointer transition-colors"
                    title="Approve Claim"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(claim)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg cursor-pointer transition-colors"
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

      {/* Sync Runs History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Recent Sync Runs ({syncRuns.length})
        </h3>

        {syncRuns.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-950 rounded-xl">
            No sync runs recorded yet. Use "Sync Sheets Now" above or wait for the daily midnight cron trigger.
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {syncRuns.map((run) => (
              <div
                key={run.runId}
                className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      run.status === "success"
                        ? "bg-emerald-950/60 border border-emerald-800 text-emerald-400"
                        : run.status === "partial"
                        ? "bg-amber-950/60 border border-amber-800 text-amber-400"
                        : "bg-red-950/60 border border-red-800 text-red-400"
                    }`}
                  >
                    {run.status}
                  </span>
                  <div>
                    <span className="text-zinc-300 font-bold text-xs block">
                      {run.seriesId || "lnr-acc-s18"}
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      {new Date(run.startedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                  {run.roundsCount !== undefined && (
                    <span>{run.roundsCount} rounds</span>
                  )}
                  {run.docsWritten !== undefined && (
                    <span>Written: {run.docsWritten}</span>
                  )}
                  {run.docsSkipped !== undefined && (
                    <span>Skipped: {run.docsSkipped}</span>
                  )}
                  {run.changed !== undefined && (
                    <span className="text-zinc-500">Changed: {run.changed ? "Yes" : "No"}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
