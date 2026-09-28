import { useState, useCallback } from "react";
import { ACC_CARS, ACC_TRACKS, parseAccSetup } from "../utils/accParser";
import { SetupItem, dbSaveSetup, dbFetchSetups } from "../firebase";
import { getLapTimesText } from "../data/carNameMap";

// ─── Types ────────────────────────────────────────────────────────

export interface SetupFilenameMetadata {
  grade?: number;
  gradeLabel?: string;
  patch?: string;
  session?: string;
  sessionLabel?: string;
  temp?: string;
  isCustomFormat: boolean;
}

export interface GitHubMatchItem {
  path: string;
  fileName: string;
  carKey: string;
  trackKey: string;
  size: number;
  meta: SetupFilenameMetadata;
  repo: string;
  branch: string;
}

interface UseGitHubSyncOptions {
  /** Callback when a setup is successfully imported (live inspect or saved) */
  onSetupImported: (setup: SetupItem, action: "inspect" | "save") => void;
  /** Show toast notification */
  showToast: (message: string, type: "success" | "error" | "info") => void;
  /** Current authenticated user (for uploadedBy field) */
  user: { uid: string; displayName: string | null } | null;
  /** Refresh the setups list after saving */
  refreshSetupsList: (list: SetupItem[]) => void;
}

// ─── Pure Helpers ─────────────────────────────────────────────────

function parseSetupFilenameMetadata(fileName: string): SetupFilenameMetadata {
  const cleanName = fileName.replace(/\.json$/i, "").trim();

  let grade: number | undefined = undefined;
  let gradeLabel: string | undefined = undefined;
  let patch: string | undefined = undefined;
  let session: string | undefined = undefined;
  let sessionLabel: string | undefined = undefined;
  let temp: string | undefined = undefined;
  let isCustomFormat = false;

  const strictRegex = /^([0-3])\s+([\d\.]+)\s+([a-zA-Z0-9_\-]+)\s+(\d+c|C)$/i;
  const match = cleanName.match(strictRegex);

  if (match) {
    grade = parseInt(match[1], 10);
    patch = match[2];
    session = match[3];
    temp = match[4].toLowerCase();
    isCustomFormat = true;
  } else {
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      if (/^[0-3]$/.test(parts[0])) {
        grade = parseInt(parts[0], 10);
      }
      const foundPatch = parts.find(p => /^1\.\d+(\.\d+)?$/.test(p));
      if (foundPatch) patch = foundPatch;
      const foundSession = parts.find(p => /^(q|r|p|qualy|race|qualifying)$/i.test(p));
      if (foundSession) session = foundSession;
      const foundTemp = parts.find(p => /^\d+(c|C)$/.test(p));
      if (foundTemp) temp = foundTemp.toLowerCase();
      if (grade !== undefined || patch !== undefined || session !== undefined || temp !== undefined) {
        isCustomFormat = true;
      }
    }
  }

  if (grade !== undefined) {
    if (grade === 0) gradeLabel = "Mostly only pressures fixed. Literally aggro preset stuff";
    else if (grade === 1) gradeLabel = "Includes some basic aero and mechanical changes but overall not refined";
    else if (grade === 2) gradeLabel = "Considered a 'complete' set, but needs verification / WIP parts";
    else if (grade === 3) gradeLabel = "Proven league complete set. Proven in league competition";
  }

  if (session) {
    const sLower = session.toLowerCase();
    if (sLower === "q" || sLower.includes("qualy") || sLower.includes("qualifying")) sessionLabel = "Qualifying / Low Fuel Pace";
    else if (sLower === "r" || sLower.includes("race")) sessionLabel = "Race / Full Fuel Consistency";
    else if (sLower === "p" || sLower.includes("practice")) sessionLabel = "Practice Setup / Balanced";
    else sessionLabel = session.toUpperCase();
  }

  return { grade, gradeLabel, patch, session, sessionLabel, temp, isCustomFormat };
}

function detectCarFromSegment(segment: string): string {
  const clean = segment.toLowerCase().trim();
  if (!clean) return "unknown";

  // Explicit overrides
  if (clean === "audi_r8_gt4" || clean === "r8_gt4" || clean === "audi_gt4" || clean.includes("audi_r8_gt4") || clean.includes("audir8gt4")) return "audi_r8_lms_gt4";
  if (clean === "audi_lms_gt2" || clean === "audi_gt2" || clean === "r8_gt2") return "audi_r8_lms_gt2";
  if (clean === "bmw_m6_gt3" || clean === "m6_gt3" || clean === "bmwm6") return "bmw_m6_gt3";

  const normClean = clean.replace(/[-_\s]/g, "");

  for (const [key, label] of Object.entries(ACC_CARS)) {
    const kLower = key.toLowerCase();
    const lLower = label.toLowerCase();
    const normKey = kLower.replace(/[-_\s]/g, "");
    const normLabel = lLower.replace(/[-_\s]/g, "");
    if (clean === kLower || normClean === normKey || normClean === normLabel) {
      if (normClean.length > 2 && normClean !== "sets" && normClean !== "setup" && normClean !== "setups") return key;
    }
  }

  for (const [key, label] of Object.entries(ACC_CARS)) {
    const kLower = key.toLowerCase();
    const lLower = label.toLowerCase();
    const normKey = kLower.replace(/[-_\s]/g, "");
    const normLabel = lLower.replace(/[-_\s]/g, "");
    if (kLower.includes(clean) || lLower.includes(clean) || clean.includes(kLower) || clean.includes(lLower) || normKey.includes(normClean) || normLabel.includes(normClean) || normClean.includes(normKey) || normClean.includes(normLabel)) {
      if (normClean.length > 2 && normClean !== "sets" && normClean !== "setup" && normClean !== "setups") return key;
    }
  }
  return "unknown";
}

function detectTrackFromSegment(segment: string): string {
  const clean = segment.toLowerCase().trim();
  if (!clean) return "unknown";
  const normClean = clean.replace(/[-_\s]/g, "");

  for (const [key, label] of Object.entries(ACC_TRACKS)) {
    const kLower = key.toLowerCase();
    const lLower = label.toLowerCase();
    const normKey = kLower.replace(/[-_\s]/g, "");
    const normLabel = lLower.replace(/[-_\s]/g, "");
    if (clean === kLower || normClean === normKey || normClean === normLabel) return key;
  }

  for (const [key, label] of Object.entries(ACC_TRACKS)) {
    const kLower = key.toLowerCase();
    const lLower = label.toLowerCase();
    const normKey = kLower.replace(/[-_\s]/g, "");
    const normLabel = lLower.replace(/[-_\s]/g, "");
    if (kLower.includes(clean) || lLower.includes(clean) || clean.includes(kLower) || clean.includes(lLower) || normKey.includes(normClean) || normLabel.includes(normClean) || normClean.includes(normKey) || normClean.includes(normLabel)) {
      if (normClean.length > 2) return key;
    }
  }
  return "unknown";
}

export function parseGithubPath(path: string): { carKey: string; trackKey: string; fileName: string; meta: SetupFilenameMetadata } {
  const segments = path.toLowerCase().replace(/\\/g, "/").split("/");
  const fileName = segments[segments.length - 1] || "";

  let carKey = "unknown";
  let trackKey = "unknown";

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (carKey === "unknown") carKey = detectCarFromSegment(segment);
    if (trackKey === "unknown") trackKey = detectTrackFromSegment(segment);
    if (carKey !== "unknown" && trackKey !== "unknown") break;
  }

  if (carKey === "unknown") carKey = detectCarFromSegment(fileName);
  if (trackKey === "unknown") trackKey = detectTrackFromSegment(fileName);

  return { carKey, trackKey, fileName, meta: parseSetupFilenameMetadata(fileName) };
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useGitHubSync({ onSetupImported, showToast, user, refreshSetupsList }: UseGitHubSyncOptions) {
  // ── State ──
  const [githubRepo, setGithubRepo] = useState<string>(() => localStorage.getItem("jax_gh_repo") || "");
  const [githubBranch, setGithubBranch] = useState<string>(() => localStorage.getItem("jax_gh_branch") || "main");
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem("jax_gh_token") || "");
  const [githubTree, setGithubTree] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("jax_gh_cached_tree");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [githubStatus, setGithubStatus] = useState<"idle" | "loading" | "connected" | "error">(
    localStorage.getItem("jax_gh_cached_tree") ? "connected" : "idle"
  );
  const [githubError, setGithubError] = useState<string>("");
  const [isImportingFromGithub, setIsImportingFromGithub] = useState<string | null>(null);

  // ── Handlers ──

  const handleScanMultipleRepos = useCallback(async (reposList: { repo: string; branch: string }[], silenceError = false) => {
    setGithubStatus("loading");
    setGithubError("");

    const consolidatedTree: any[] = [];
    let hadError = false;
    let errorMessage = "";

    const CONCURRENCY_LIMIT = 5;
    for (let i = 0; i < reposList.length; i += CONCURRENCY_LIMIT) {
      const chunk = reposList.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(
        chunk.map(async (item) => {
          const cleanRepo = item.repo.trim().replace("https://github.com/", "").replace(/\/+$/, "");
          const branchStr = item.branch || "master";
          const url = `https://api.github.com/repos/${cleanRepo}/git/trees/${branchStr}?recursive=1`;

          try {
            const headers: Record<string, string> = {
              "Accept": "application/vnd.github.v3+json",
            };
            if (githubToken.trim()) {
              headers["Authorization"] = `token ${githubToken.trim()}`;
            }

            const res = await fetch(url, { headers });
            if (res.ok) {
              const data = await res.json();
              if (data.tree && Array.isArray(data.tree)) {
                const jsonFiles = data.tree
                  .filter((f: any) => f.type === "blob" && f.path.toLowerCase().endsWith(".json"))
                  .map((f: any) => ({
                    ...f,
                    repo: cleanRepo,
                    branch: branchStr,
                  }));
                consolidatedTree.push(...jsonFiles);
              }
            } else {
              hadError = true;
              if (res.status === 403) {
                errorMessage = "GitHub API rate limit exceeded. Please configure a Personal Access Token in setting inputs.";
              } else {
                errorMessage = `Error scanning ${cleanRepo} (${res.status})`;
              }
            }
          } catch (e: any) {
            hadError = true;
            errorMessage = e.message || "Failed to scan remote repository.";
          }
        })
      );
    }

    if (consolidatedTree.length > 0) {
      setGithubTree(consolidatedTree);
      setGithubStatus("connected");
      try {
        localStorage.setItem("jax_gh_cached_tree", JSON.stringify(consolidatedTree));
      } catch (e) {
        console.warn("Could not cache tree state:", e);
      }
    } else {
      if (hadError && !silenceError) {
        setGithubStatus("error");
        setGithubError(errorMessage);
      } else {
        setGithubStatus("idle");
      }
    }
  }, [githubToken]);

  const handleScanGithubRepo = useCallback(async (repoStr = githubRepo, branchStr = githubBranch, tokenStr = githubToken) => {
    let cleanRepo = repoStr.trim();
    if (!cleanRepo) {
      setGithubStatus("error");
      setGithubError("Please specify a GitHub repository name (e.g. owner/repo).");
      return;
    }

    if (cleanRepo.startsWith("https://github.com/")) {
      cleanRepo = cleanRepo.replace("https://github.com/", "").trim();
    }
    cleanRepo = cleanRepo.replace(/\/+$/, "");

    setGithubStatus("loading");
    setGithubError("");

    try {
      const url = `https://api.github.com/repos/${cleanRepo}/git/trees/${branchStr || "main"}?recursive=1`;

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
      };
      if (tokenStr.trim()) {
        headers["Authorization"] = `token ${tokenStr.trim()}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Repository or branch not found. Check repository path or branch name.");
        else if (res.status === 403) throw new Error("API rate limits exceeded, or unauthorized. Try providing a GitHub Personal Access Token.");
        else throw new Error(`GitHub API Error: ${res.statusText} (${res.status})`);
      }

      const data = await res.json();
      if (!data.tree || !Array.isArray(data.tree)) throw new Error("Could not retrieve repository file structure.");

      const jsonFiles = data.tree
        .filter((item: any) => item.type === "blob" && item.path.toLowerCase().endsWith(".json"))
        .map((f: any) => ({
          ...f,
          repo: cleanRepo,
          branch: branchStr || "main",
        }));

      setGithubTree(jsonFiles);
      setGithubStatus("connected");

      localStorage.setItem("jax_gh_repo", cleanRepo);
      localStorage.setItem("jax_gh_branch", branchStr);
      localStorage.setItem("jax_gh_token", tokenStr);

      try {
        localStorage.setItem("jax_gh_cached_tree", JSON.stringify(jsonFiles));
      } catch (e) {
        console.warn("Could not cache tree state:", e);
      }
    } catch (err: any) {
      console.error(err);
      setGithubStatus("error");
      setGithubError(err.message || "Failed to establish connection.");
    }
  }, [githubRepo, githubBranch, githubToken]);

  const handleImportGithubSetup = useCallback(async (path: string, liveInspectOnly = false, customRepo?: string, customBranch?: string) => {
    let targetRepo = customRepo || githubRepo;
    let targetBranch = customBranch || githubBranch;

    let cleanRepo = targetRepo.trim();
    if (cleanRepo.startsWith("https://github.com/")) {
      cleanRepo = cleanRepo.replace("https://github.com/", "").trim();
    }
    cleanRepo = cleanRepo.replace(/\/+$/, "");

    if (!cleanRepo) {
      showToast("Connect a GitHub repo first", "info");
      return;
    }

    setIsImportingFromGithub(path);
    try {
      const rawUrl = `https://raw.githubusercontent.com/${cleanRepo}/${targetBranch || "main"}/${path}`;
      const headers: Record<string, string> = {};
      if (githubToken.trim()) {
        headers["Authorization"] = `token ${githubToken.trim()}`;
      }

      const res = await fetch(rawUrl, { headers });
      if (!res.ok) throw new Error(`Failed to download file from GitHub raw (Status ${res.status})`);

      const rawJson = await res.json();
      const parsed = parseAccSetup(rawJson, path);

      const pathMeta = parseGithubPath(path);
      const finalCar = pathMeta.carKey !== "unknown" ? pathMeta.carKey : (parsed.carKey || "unknown");
      const finalTrack = pathMeta.trackKey !== "unknown" ? pathMeta.trackKey : (parsed.trackKey || "unknown");

      const setupName = pathMeta.fileName.replace(".json", "").replace(/[-_]/g, " ");
      const prettyName = setupName.charAt(0).toUpperCase() + setupName.slice(1);

      let customNotes = "";
      if (pathMeta.meta.isCustomFormat) {
        customNotes += `=== SETUP SPECIFICATION METADATA ===`;
        if (pathMeta.meta.grade !== undefined) customNotes += `\n• Grade: ${pathMeta.meta.grade}/3 (${pathMeta.meta.gradeLabel})`;
        if (pathMeta.meta.patch) customNotes += `\n• Asset Version / Patch: v${pathMeta.meta.patch}`;
        if (pathMeta.meta.session) customNotes += `\n• Intent Session: ${pathMeta.meta.session} (${pathMeta.meta.sessionLabel})`;
        if (pathMeta.meta.temp) customNotes += `\n• Ambient Operating Temp: ${pathMeta.meta.temp.toUpperCase()}`;
      }

      const lapTimesText = getLapTimesText(finalCar, finalTrack);
      if (lapTimesText) {
        customNotes = customNotes ? `${customNotes}\n\n${lapTimesText}` : lapTimesText;
      }

      const mockSetupItem: SetupItem = {
        id: "gh_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36),
        name: prettyName,
        car: finalCar,
        track: finalTrack,
        notes: customNotes,
        rawData: rawJson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: user?.uid || "guest_driver",
        uploadedByName: user?.displayName || "GitHub Link",
      };

      if (liveInspectOnly) {
        onSetupImported(mockSetupItem, "inspect");
        const carName = ACC_CARS[finalCar] || finalCar || "GT3 Car";
        const trackName = ACC_TRACKS[finalTrack] || finalTrack || "Circuit";
        showToast(`${carName} · ${trackName} loaded`, "success");
      } else {
        await dbSaveSetup(mockSetupItem);
        const list = await dbFetchSetups();
        refreshSetupsList(list);
        onSetupImported(mockSetupItem, "save");
        const carName = ACC_CARS[finalCar] || finalCar || "GT3 Car";
        const trackName = ACC_TRACKS[finalTrack] || finalTrack || "Circuit";
        showToast(`${carName} · ${trackName} synced`, "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(`GitHub error: ${err.message || err}`, "error");
    }
    setIsImportingFromGithub(null);
  }, [githubRepo, githubBranch, githubToken, showToast, user, onSetupImported, refreshSetupsList]);

  return {
    // State
    githubRepo,
    setGithubRepo,
    githubBranch,
    setGithubBranch,
    githubToken,
    setGithubToken,
    githubTree,
    githubStatus,
    githubError,
    isImportingFromGithub,
    // Handlers
    handleScanMultipleRepos,
    handleScanGithubRepo,
    handleImportGithubSetup,
  };
}
