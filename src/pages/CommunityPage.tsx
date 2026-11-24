import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Folder, Github, Upload, Wrench, Trash2, RefreshCw, Layers } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSetups } from "../context/SetupContext";
import { useGitHubSync, parseGithubPath } from "../hooks/useGitHubSync";
import SetupHeader from "../components/setups/SetupHeader";
import SetupFilterBar from "../components/setups/SetupFilterBar";
import SetupCard from "../components/setups/SetupCard";
import SetupInspector from "../components/setups/SetupInspector";
import SetupUploader from "../components/setups/SetupUploader";
import { SetupItem, SavedSetupItem, dbDeleteSetup } from "../firebase";
import { ACC_CARS, ACC_TRACKS } from "../utils/accParser";

export default function CommunityPage() {
  const { setupId } = useParams<{ setupId?: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const {
    setupsList,
    refreshSetups,
    activeSetup,
    setActiveSetup,
    tunedSetupsList,
    refreshTunedSetups,
    deleteTunedSetup,
    allRatingsList,
    showToast,
    isMobile,
  } = useSetups();

  // Active tab within Community
  const [activeTab, setActiveTab] = useState<"shared" | "mytunes" | "team" | "github" | "upload">("shared");

  // Filters
  const [searchText, setSearchText] = useState("");
  const [carFilter, setCarFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [onlyPinnedCarsFilter, setOnlyPinnedCarsFilter] = useState(false);

  // Uploader modal state
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // Mobile view state
  const [mobileView, setMobileView] = useState<"registry" | "inspection">(
    setupId ? "inspection" : "registry"
  );

  // GitHub Sync hook
  const {
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
    handleScanGithubRepo,
    handleImportGithubSetup,
  } = useGitHubSync({
    onSetupImported: (setup) => {
      setActiveSetup(setup);
      navigate(`/setups/community/${setup.id}`);
      if (isMobile) setMobileView("inspection");
    },
    showToast,
    user,
    refreshSetupsList: refreshSetups,
  });

  // Sync setupId param
  useEffect(() => {
    if (setupId) {
      const found =
        setupsList.find((s) => s.id === setupId) ||
        tunedSetupsList.find((s) => s.id === setupId);

      if (found) {
        if ("rawData" in found) {
          setActiveSetup(found as SetupItem);
        }
        setMobileView("inspection");
      }
    }
  }, [setupId, setupsList, tunedSetupsList, setActiveSetup]);

  // Filter shared / team setups
  const filteredSharedSetups = useMemo(() => {
    return setupsList.filter((setup) => {
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matches =
          setup.name.toLowerCase().includes(q) ||
          (setup.car || "").toLowerCase().includes(q) ||
          (setup.track || "").toLowerCase().includes(q) ||
          (setup.notes || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (carFilter !== "all" && setup.car !== carFilter) return false;
      if (trackFilter !== "all" && setup.track !== trackFilter) return false;
      return true;
    });
  }, [setupsList, searchText, carFilter, trackFilter]);

  // Filter my tunes
  const filteredMyTunes = useMemo(() => {
    return tunedSetupsList.filter((tune) => {
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matches =
          (tune.versionNote || "").toLowerCase().includes(q) ||
          (tune.car || "").toLowerCase().includes(q) ||
          (tune.track || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (carFilter !== "all" && tune.car !== carFilter) return false;
      if (trackFilter !== "all" && tune.track !== trackFilter) return false;
      return true;
    });
  }, [tunedSetupsList, searchText, carFilter, trackFilter]);

  // GitHub matching files
  const githubMatches = useMemo(() => {
    return githubTree.filter((file) => {
      if (!file.path.toLowerCase().endsWith(".json")) return false;
      try {
        const parsed = parseGithubPath(file.path);
        if (carFilter !== "all" && parsed.carKey !== carFilter) return false;
        if (trackFilter !== "all" && parsed.trackKey !== trackFilter) return false;
        if (searchText.trim()) {
          const q = searchText.toLowerCase();
          if (!file.path.toLowerCase().includes(q)) return false;
        }
        return true;
      } catch {
        return false;
      }
    });
  }, [githubTree, carFilter, trackFilter, searchText]);

  const handleSelectSetup = (setup: SetupItem) => {
    setActiveSetup(setup);
    navigate(`/setups/community/${setup.id}`);
    if (isMobile) {
      setMobileView("inspection");
    }
  };

  const handleSelectTune = (tune: SavedSetupItem) => {
    const asSetupItem: SetupItem = {
      id: tune.id,
      name: tune.versionNote || `${ACC_CARS[tune.car] || tune.car} Tuned Variant`,
      car: tune.car,
      track: tune.track,
      notes: tune.versionNote,
      rawData: tune.rawData,
      createdAt: tune.createdAt,
      updatedAt: tune.updatedAt,
      uploadedBy: user?.uid || "me",
      uploadedByName: tune.authorUsername,
    };
    handleSelectSetup(asSetupItem);
  };

  const handleDeleteSharedSetup = async (id: string, e: React.MouseEvent) => {
    if (!window.confirm("Are you sure you want to delete this shared setup?")) return;
    try {
      await dbDeleteSetup(id);
      showToast("Setup removed from community", "success");
      await refreshSetups();
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6">
      {/* Segmented header: Jaxtune | Community */}
      <SetupHeader />

      {/* Main Grid: Left Navigation / Tabs & Lists (Col 5) + Right Inspector (Col 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            isMobile && mobileView === "inspection" ? "hidden" : "block"
          }`}
        >
          {/* Community Secondary Tabs */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 text-xs font-mono font-bold uppercase tracking-wider overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("shared")}
              className={`flex-1 py-2 px-3 rounded-lg transition-all whitespace-nowrap min-h-[40px] cursor-pointer ${
                activeTab === "shared"
                  ? "bg-zinc-800 text-red-500 font-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Shared ({filteredSharedSetups.length})
            </button>
            <button
              onClick={() => setActiveTab("mytunes")}
              className={`flex-1 py-2 px-3 rounded-lg transition-all whitespace-nowrap min-h-[40px] cursor-pointer ${
                activeTab === "mytunes"
                  ? "bg-zinc-800 text-red-500 font-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              My Tunes ({filteredMyTunes.length})
            </button>
            <button
              onClick={() => setActiveTab("github")}
              className={`flex-1 py-2 px-3 rounded-lg transition-all whitespace-nowrap min-h-[40px] cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "github"
                  ? "bg-zinc-800 text-red-500 font-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </button>
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="py-2 px-3 rounded-lg transition-all whitespace-nowrap min-h-[40px] bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 cursor-pointer flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </div>

          {/* Filter Bar */}
          <SetupFilterBar
            searchText={searchText}
            setSearchText={setSearchText}
            carFilter={carFilter}
            setCarFilter={setCarFilter}
            trackFilter={trackFilter}
            setTrackFilter={setTrackFilter}
            onlyPinnedCarsFilter={onlyPinnedCarsFilter}
            setOnlyPinnedCarsFilter={setOnlyPinnedCarsFilter}
          />

          {/* Tab 1: Shared Setups */}
          {activeTab === "shared" && (
            <div className="space-y-2.5">
              {filteredSharedSetups.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
                  <p className="text-xs font-mono">No shared community setups matched your filters.</p>
                </div>
              ) : (
                filteredSharedSetups.map((setup) => (
                  <SetupCard
                    key={setup.id}
                    setup={setup}
                    isActive={activeSetup?.id === setup.id}
                    onSelect={handleSelectSetup}
                    onDelete={handleDeleteSharedSetup}
                  />
                ))
              )}
            </div>
          )}

          {/* Tab 2: My Tunes */}
          {activeTab === "mytunes" && (
            <div className="space-y-2.5">
              {!user ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 space-y-2">
                  <p className="text-xs font-mono">Sign in to view and save your personal tuned variants.</p>
                </div>
              ) : filteredMyTunes.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 space-y-2">
                  <Wrench className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                  <p className="text-xs font-mono">No custom tuned variants saved yet.</p>
                  <p className="text-[10px] text-zinc-500">
                    Open any setup in the inspector, click "Tune Parameters", modify values, and click "Save Variant".
                  </p>
                </div>
              ) : (
                filteredMyTunes.map((tune) => (
                  <div
                    key={tune.id}
                    onClick={() => handleSelectTune(tune)}
                    className="p-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-all cursor-pointer text-left relative group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                        {ACC_CARS[tune.car]?.split(" ")[0] || tune.car} · {ACC_TRACKS[tune.track] || tune.track}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTunedSetup(tune.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400"
                        title="Delete variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {tune.versionNote || "Tuned Variant"}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                      Saved {new Date(tune.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: GitHub Sync */}
          {activeTab === "github" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-zinc-400" />
                  GitHub Repository Syncer
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {githubTree.length} files scanned
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="owner/repo (e.g. jaxtune/ACC_Setups)"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-red-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Branch (default: main)"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleScanGithubRepo()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Scan Repo
                  </button>
                </div>
              </div>

              {githubError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-mono">
                  {githubError}
                </div>
              )}

              {/* GitHub Matching Files List */}
              {githubMatches.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                    Matching Setup Files ({githubMatches.length}):
                  </span>
                  {githubMatches.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => handleImportGithubSetup(item.path, true)}
                      className="p-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono font-bold text-white truncate block">
                          {item.fileName}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {ACC_CARS[item.carKey]?.split(" ")[0]} · {ACC_TRACKS[item.trackKey]}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-red-500 font-bold shrink-0">
                        Inspect →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Setup Inspector */}
        <div
          className={`lg:col-span-7 ${
            isMobile && mobileView === "registry" ? "hidden" : "block"
          }`}
        >
          <SetupInspector
            setup={activeSetup}
            onBack={isMobile ? () => setMobileView("registry") : undefined}
          />
        </div>
      </div>

      {/* Setup Uploader Modal */}
      <SetupUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={(newSetup) => {
          handleSelectSetup(newSetup);
        }}
      />
    </div>
  );
}
