import { useState, useEffect, useRef, DragEvent, ChangeEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Upload,
  FileText,
  Cpu,
  Wrench,
  BookOpen,
  Download,
  Trash2,
  Search,
  User,
  LogOut,
  AlertTriangle,
  Gauge,
  Activity,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  RefreshCw,
  Send,
  CloudLightning,
  Info,
  Folder,
  FolderOpen,
  Github,
  Link,
  Globe,
  CheckCircle,
  Terminal,
  Thermometer,
  Sun,
  Moon,
  Clock,
  Star,
  ThumbsUp,
  Minus,
  Plus
} from "lucide-react";
import {
  dbFetchSetups,
  dbSaveSetup,
  dbDeleteSetup,
  dbFetchGuide,
  dbSaveGuide,
  isCloudEnabled,
  SetupItem,
  dbCheckUsernameAvailable,
  dbSaveUserProfile,
  dbFetchUserProfile,
  dbSaveTunedSetup,
  dbFetchTunedSetups,
  dbDeleteTunedSetup,
  dbSaveSetupRating,
  dbFetchSetupRatings,
  dbFetchAllSetupRatings,
  SavedSetupItem,
  SetupRatingItem,
  UserProfile
} from "./firebase";
import { useAuth } from "./hooks/useAuth";
import { parseAccSetup, NormalizedAccSetup, ACC_CARS, ACC_TRACKS } from "./utils/accParser";
import { cars } from "./data/cars";
import { getLapTimesText } from "./data/carNameMap";
import LapTimesPage from "./components/LapTimesPage";
import GaragePage from "./components/GaragePage";
import AiRaceEngineer from "./components/AiRaceEngineer";

export interface PendingSetup {
  id: string;
  fileName: string;
  relativePath?: string;
  customName: string;
  carKey: string;
  trackKey: string;
  notes: string;
  parsedData: NormalizedAccSetup;
  rawData: any;
}

// Standard stabilization parameters and default guide info
const DEFAULT_TEXTBOOK_DESCRIPTION = "Standard ACC Race Engineering Telemetry & Adjustments Manual";

// Visual templates for preloaded/demo setups to guarantee a gorgeous populated view on launch
const DEMO_SETUPS: SetupItem[] = [
  {
    id: "demo_aston_monza",
    name: "Qualifying Hotlap (v1.9)",
    car: "amr_v8_vantage_gt3",
    track: "monza",
    notes: "Aggressive qualifying setup for low drag. Soft rear dampeners used to cushion the curbs at Ascari and Rettifilo. Target tyre pressure is 26.8 PSI hot under dry conditions. Aim for 1:46.8 laps.",
    uploadedBy: "system_ref_1",
    uploadedByName: "Lead Engineer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawData: {
      carName: "amr_v8_vantage_gt3",
      trackName: "monza",
      basicSetup: {
        tyres: { tyrePressure: [55, 57, 52, 54] },
        alignment: {
          camber: [-3.8, -3.8, -3.2, -3.2],
          toe: [-0.12, -0.12, 0.16, 0.16],
          caster: [8.6, 8.6]
        },
        electronics: { tc1: 2, tc2: 2, abs: 3, ecuMap: 1 }
      },
      advancedSetup: {
        mechanicalGrip: {
          antirollBarFront: 3,
          antirollBarRear: 1,
          wheelRate: [140000, 140000, 100000, 100000],
          bumpStopRate: [900, 900, 700, 700],
          bumpStopRange: [12, 12, 18, 18],
          preload: 140
        },
        aero: {
          rideHeight: [52, 64],
          rearWing: 1,
          splitter: 1,
          brakeDuct: [2, 2]
        },
        dampers: {
          bumpSlow: [7, 7, 6, 6],
          bumpFast: [9, 9, 8, 8],
          reboundSlow: [11, 11, 10, 10],
          reboundFast: [13, 13, 12, 12]
        }
      }
    }
  },
  {
    id: "demo_porsche_spa",
    name: "Spa 24h Wet Race",
    car: "porsche_992_gt3_r",
    track: "spa",
    notes: "Stable wet setup to handle severe water pooling around Eau Rouge and Pouhon. Front ride height is raised to avoid aquaplaning on standard curbing. Rain tyres requires high target air pressure (30.0 PSI hot).",
    uploadedBy: "system_ref_2",
    uploadedByName: "Co-Driver",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawData: {
      carName: "porsche_992_gt3_r",
      trackName: "spa",
      basicSetup: {
        tyres: { tyrePressure: [85, 87, 82, 84] },
        alignment: {
          camber: [-3.0, -3.0, -2.6, -2.6],
          toe: [-0.05, -0.05, 0.22, 0.22],
          caster: [9.0, 9.0]
        },
        electronics: { tc1: 5, tc2: 4, abs: 5, ecuMap: 3 }
      },
      advancedSetup: {
        mechanicalGrip: {
          antirollBarFront: 5,
          antirollBarRear: 3,
          wheelRate: [160000, 160000, 120000, 120000],
          bumpStopRate: [1100, 1100, 900, 900],
          bumpStopRange: [18, 18, 24, 24],
          preload: 90
        },
        aero: {
          rideHeight: [64, 78],
          rearWing: 8,
          splitter: 1,
          brakeDuct: [4, 4]
        },
        dampers: {
          bumpSlow: [9, 9, 8, 8],
          bumpFast: [11, 11, 10, 10],
          reboundSlow: [13, 13, 12, 12],
          reboundFast: [15, 15, 14, 14]
        }
      }
    }
  }
];

interface SetupFilenameMetadata {
  grade?: number;       // 0-3
  gradeLabel?: string;  // Detailed explanation of grade
  patch?: string;       // e.g. "1.8.18", "1.9"
  session?: string;     // "Q", "R" etc
  sessionLabel?: string; // e.g. "Qualifying", "Race"
  temp?: string;        // e.g. "23c"
  isCustomFormat: boolean;
}

function parseSetupFilenameMetadata(fileName: string): SetupFilenameMetadata {
  const cleanName = fileName.replace(/\.json$/i, "").trim();
  
  let grade: number | undefined = undefined;
  let gradeLabel: string | undefined = undefined;
  let patch: string | undefined = undefined;
  let session: string | undefined = undefined;
  let sessionLabel: string | undefined = undefined;
  let temp: string | undefined = undefined;
  let isCustomFormat = false;

  // Strict format matching: ^([0-3])\s+([\d\.]+)\s+([qQrRpP]+)\s+(\d+c|C)$
  const strictRegex = /^([0-3])\s+([\d\.]+)\s+([a-zA-Z0-9_\-]+)\s+(\d+c|C)$/i;
  const match = cleanName.match(strictRegex);

  if (match) {
    grade = parseInt(match[1], 10);
    patch = match[2];
    session = match[3];
    temp = match[4].toLowerCase();
    isCustomFormat = true;
  } else {
    // Heuristic/fuzzy splitting
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

  // Set precise Grade labels
  if (grade !== undefined) {
    if (grade === 0) {
      gradeLabel = "Mostly only pressures fixed. Literally aggro preset stuff";
    } else if (grade === 1) {
      gradeLabel = "Includes some basic aero and mechanical changes but overall not refined";
    } else if (grade === 2) {
      gradeLabel = "Considered a 'complete' set, but needs verification / WIP parts";
    } else if (grade === 3) {
      gradeLabel = "Proven league complete set. Proven in league competition";
    }
  }

  if (session) {
    const sLower = session.toLowerCase();
    if (sLower === "q" || sLower.includes("qualy") || sLower.includes("qualifying")) {
      sessionLabel = "Qualifying / Low Fuel Pace";
    } else if (sLower === "r" || sLower.includes("race")) {
      sessionLabel = "Race / Full Fuel Consistency";
    } else if (sLower === "p" || sLower.includes("practice")) {
      sessionLabel = "Practice Setup / Balanced";
    } else {
      sessionLabel = session.toUpperCase();
    }
  }

  return { grade, gradeLabel, patch, session, sessionLabel, temp, isCustomFormat };
}

function parseGithubPath(path: string): { carKey: string; trackKey: string; fileName: string; meta: SetupFilenameMetadata } {
  const segments = path.toLowerCase().split("/");
  const fileName = segments[segments.length - 1] || "";
  
  let carKey = "unknown";
  let trackKey = "unknown";
  
  // Try matching search mapping in segments
  for (const segment of segments) {
    // Check cars
    if (carKey === "unknown") {
      for (const [key, label] of Object.entries(ACC_CARS)) {
        if (segment === key || segment.includes(key) || label.toLowerCase().includes(segment) || segment.includes(label.toLowerCase())) {
          carKey = key;
          break;
        }
      }
    }
    // Check tracks
    if (trackKey === "unknown") {
      for (const [key, label] of Object.entries(ACC_TRACKS)) {
        const cleanLabel = label.toLowerCase();
        if (segment === key || segment.includes(key) || cleanLabel.includes(segment) || segment.includes(cleanLabel)) {
          trackKey = key;
          break;
        }
      }
    }
  }
  
  // If still unknown, scan filename
  const fnLower = fileName.toLowerCase();
  if (carKey === "unknown") {
    for (const [key, label] of Object.entries(ACC_CARS)) {
      if (fnLower.includes(key) || fnLower.includes(label.toLowerCase().replace(/[^a-z0-9]/g, "_"))) {
        carKey = key;
        break;
      }
    }
  }
  if (trackKey === "unknown") {
    for (const [key, label] of Object.entries(ACC_TRACKS)) {
      if (fnLower.includes(key) || fnLower.includes(label.toLowerCase().replace(/[^a-z0-9]/g, "_"))) {
        trackKey = key;
        break;
      }
    }
  }
  
  return { carKey, trackKey, fileName, meta: parseSetupFilenameMetadata(fileName) };
}

interface SetupSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  discreteArray?: number[];
}

function SetupSlider({ label, value, min, max, step, unit = "", discreteArray }: SetupSliderProps) {
  let percentage = 0;
  if (discreteArray && discreteArray.length > 0) {
    const idx = discreteArray.indexOf(value);
    if (idx !== -1 && discreteArray.length > 1) {
      percentage = (idx / (discreteArray.length - 1)) * 100;
    } else {
      let closestIdx = 0;
      let minDiff = Math.abs(value - discreteArray[0]);
      for (let i = 1; i < discreteArray.length; i++) {
        const diff = Math.abs(value - discreteArray[i]);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      if (discreteArray.length > 1) {
        percentage = (closestIdx / (discreteArray.length - 1)) * 100;
      }
    }
  } else {
    const range = max - min;
    if (range > 0) {
      percentage = ((value - min) / range) * 100;
    }
  }
  
  percentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="bg-zinc-50 border border-zinc-200/60 rounded p-3 text-zinc-900 shadow-3xs hover:border-zinc-350 hover:bg-zinc-50/80 transition-all flex flex-col justify-between">
      <div className="flex justify-between items-start gap-1 pb-1.5 border-b border-zinc-150">
        <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">{label}</span>
        <span className="text-[11.5px] font-mono font-black text-red-655 bg-zinc-100/80 px-1.5 py-0.5 rounded border border-zinc-150">
          {value.toFixed(unit === "°" || unit === "%" ? 2 : unit === "PSI" ? 1 : 0)}
          <span className="text-[8px] font-bold text-zinc-400 ml-0.5">{unit}</span>
        </span>
      </div>

      <div className="mt-3">
        <div className="relative w-full h-2.5 bg-zinc-150 rounded-full overflow-hidden border border-zinc-200">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-650 rounded-full"
            style={{ width: `${percentage}%` }}
          />

          {discreteArray && discreteArray.map((_, i) => {
            const leftPct = (i / (discreteArray.length - 1)) * 100;
            return (
              <div
                key={i}
                className="absolute top-0 w-0.5 h-full bg-zinc-300 opacity-65"
                style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}
              />
            );
          })}
        </div>

        <div className="flex justify-between mt-1.5 text-[8.5px] font-mono text-zinc-400 font-bold">
          <span>{discreteArray ? "SEGMENTED" : `MIN: ${min}${unit}`}</span>
          {step > 0 && <span className="text-[7.5px] bg-zinc-100 px-1 rounded border border-zinc-200">STEP: {step}</span>}
          <span>{discreteArray ? `OPTS: ${discreteArray.length}` : `MAX: ${max}${unit}`}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Database status and Authentication state
  const { 
    user, 
    profile, 
    loading: authLoading, 
    needsOnboarding, 
    login: handleLoginWithHook, 
    logout: handleLogoutWithHook, 
    saveProfileData 
  } = useAuth();
  
  const isAdmin = user && user.email && user.email.toLowerCase() === "lowther.jack@gmail.com";
  const [setupsList, setSetupsList] = useState<SetupItem[]>([]);
  const [customGuideText, setCustomGuideText] = useState<string>("");
  const [activeSetup, setActiveSetup] = useState<SetupItem | null>(null);
  const [selectedTab, setSelectedTab] = useState<"tyres" | "electronics" | "fuel" | "mechanical" | "aero" | "dampers">("tyres");
  const [currentView, setCurrentView] = useState<"telemetry" | "laptimes" | "garage" | "engineer">("telemetry");
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isCrewNotesOpen, setIsCrewNotesOpen] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsCrewNotesOpen(window.innerWidth >= 1024);
    }
  }, [activeSetup]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Onboarding UI inputs state
  const [onboardingUsername, setOnboardingUsername] = useState<string>("");
  const [onboardingPinnedCars, setOnboardingPinnedCars] = useState<string[]>([]);
  const [onboardingCheckingUsername, setOnboardingCheckingUsername] = useState<boolean>(false);
  const [onboardingUsernameAvailable, setOnboardingUsernameAvailable] = useState<boolean | null>(null);
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Edit Profile UI inputs state
  const [editUsername, setEditUsername] = useState<string>("");
  const [editPinnedCars, setEditPinnedCars] = useState<string[]>([]);
  const [editCheckingUsername, setEditCheckingUsername] = useState<boolean>(false);
  const [editUsernameAvailable, setEditUsernameAvailable] = useState<boolean | null>(null);
  const [isSubmittingProfileEdit, setIsSubmittingProfileEdit] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username);
      setEditPinnedCars(profile.pinnedSeriesCars || []);
      setEditUsernameAvailable(true);
    }
  }, [profile, showProfileModal]);

  // Tuning raw data & options states
  const [isTuneMode, setIsTuneMode] = useState<boolean>(false);
  const [tunedRawData, setTunedRawData] = useState<any>(null);
  const [tuneVersionNote, setTuneVersionNote] = useState<string>("");
  const [tuneIsTeamWorkspace, setTuneIsTeamWorkspace] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveModalNote, setSaveModalNote] = useState<string>("");
  const [tunedSetupsList, setTunedSetupsList] = useState<SavedSetupItem[]>([]);

  // Setup quality star ratings & handling tags
  const [activeSetupRatings, setActiveSetupRatings] = useState<SetupRatingItem[]>([]);
  const [allRatingsList, setAllRatingsList] = useState<SetupRatingItem[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([]);
  const [isSavingRating, setIsSavingRating] = useState<boolean>(false);

  // Car registry filter configurations
  const [onlyPinnedCarsFilter, setOnlyPinnedCarsFilter] = useState<boolean>(false);

  // Premium Toast States and Helpers
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // GitHub Integration States
  const [activeGarageTab, setActiveGarageTab] = useState<"team" | "github">("github");
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
  
  // Interactive Race Fuel Calculator states
  const [fuelRaceTime, setFuelRaceTime] = useState<number>(20); // race duration in mins
  
  // Time of Day & Track Temperature Transition States
  const [transitionTimeStart, setTransitionTimeStart] = useState<string>("17:00");
  const [transitionDuration, setTransitionDuration] = useState<number>(45);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [transitionTrackTemp, setTransitionTrackTemp] = useState<number>(32);
  const [transitionAmbientTemp, setTransitionAmbientTemp] = useState<number>(24);
  const [showCompensated, setShowCompensated] = useState<boolean>(false);
  const [fuelLapTimeMin, setFuelLapTimeMin] = useState<number | "">(1);
  const [fuelLapTimeSec, setFuelLapTimeSec] = useState<number | "">(45);
  const [fuelPerLap, setFuelPerLap] = useState<number>(3.2); // litres consumed per lap
  const [fuelSafetyLaps, setFuelSafetyLaps] = useState<number>(2); // safety buffer laps
  
  // Interactive Pit & Stint Strategy Planner states
  const [pitMandatoryFuel, setPitMandatoryFuel] = useState<boolean>(true);
  const [pitMandatoryTyres, setPitMandatoryTyres] = useState<boolean>(true);
  const [pitMaxFuelCapacity, setPitMaxFuelCapacity] = useState<number>(120);
  const [pitNumberOfStops, setPitNumberOfStops] = useState<number>(1);
  const [pitStrategyPreference, setPitStrategyPreference] = useState<"balanced" | "undercut" | "overcut">("balanced");
  
  const [isUploaderPanelOpen, setIsUploaderPanelOpen] = useState<boolean>(false);
  const [isGuidePanelOpen, setIsGuidePanelOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with browser physical back button and popstate events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state === "object") {
        if ("view" in state) setCurrentView(state.view);
        if ("showProfile" in state) setShowProfileModal(state.showProfile);
        if ("showSave" in state) setIsSaveModalOpen(state.showSave);
        if ("showUploader" in state) setIsUploaderPanelOpen(state.showUploader);
        if ("showGuide" in state) setIsGuidePanelOpen(state.showGuide);
      } else {
        // Safe fallback to original state when history is blank
        setCurrentView("telemetry");
        setShowProfileModal(false);
        setIsSaveModalOpen(false);
        setIsUploaderPanelOpen(false);
        setIsGuidePanelOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentState = {
      view: currentView,
      showProfile: showProfileModal,
      showSave: isSaveModalOpen,
      showUploader: isUploaderPanelOpen,
      showGuide: isGuidePanelOpen,
    };

    const isInitial = 
      currentView === "telemetry" && 
      !showProfileModal && 
      !isSaveModalOpen && 
      !isUploaderPanelOpen && 
      !isGuidePanelOpen;

    if (isInitial) {
      window.history.replaceState(currentState, "");
    } else {
      const historyState = window.history.state;
      const isMatch = historyState && 
        historyState.view === currentView &&
        historyState.showProfile === showProfileModal &&
        historyState.showSave === isSaveModalOpen &&
        historyState.showUploader === isUploaderPanelOpen &&
        historyState.showGuide === isGuidePanelOpen;

      if (!isMatch) {
        window.history.pushState(currentState, "");
      }
    }
  }, [currentView, showProfileModal, isSaveModalOpen, isUploaderPanelOpen, isGuidePanelOpen]);

  // Drag and Drop files or parsing state
  const [parsedSetup, setParsedSetup] = useState<NormalizedAccSetup | null>(null);
  const [rawUploadData, setRawUploadData] = useState<any>(null);
  const [customSetupName, setCustomSetupName] = useState<string>("");
  const [customSetupNotes, setCustomSetupNotes] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New batch / folder uploader states
  const [pendingSetups, setPendingSetups] = useState<PendingSetup[]>([]);
  const [batchCar, setBatchCar] = useState<string>("");
  const [batchTrack, setBatchTrack] = useState<string>("");
  const [batchNotes, setBatchNotes] = useState<string>("");

  // Search/Filters states
  const [searchText, setSearchText] = useState<string>("");
  const [carFilter, setCarFilter] = useState<string>("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [githubGradeFilter, setGithubGradeFilter] = useState<string>("all");
  const [githubSessionFilter, setGithubSessionFilter] = useState<string>("all");

  // Chat interface
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: "Hello! I am your AI Race Engineer. Load any setup file on the left, and describe your handling feedback (e.g. 'I'm hitting exit oversteer out of Lesmo 2' or 'Turn-in is too sluggish'). I can analyze your active springs, rake, and roll bars dynamically to prescribe a precise adjustment!"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatAnalyzing, setIsChatAnalyzing] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load from Firestore / localStorage
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const fetchedSetups = await dbFetchSetups();
        if (fetchedSetups.length > 0) {
          setSetupsList(fetchedSetups);
          // Auto select first setup
          setActiveSetup(fetchedSetups[0]);
        } else {
          // If no setups in DB, use our visual demos so the UI looks active and fully formed!
          // We do NOT write demo setups to the cloud database to honor security rules and prevent permission errors.
          setSetupsList(DEMO_SETUPS);
          setActiveSetup(DEMO_SETUPS[0]);
        }

        const fetchedGuide = await dbFetchGuide();
        if (fetchedGuide) {
          setCustomGuideText(fetchedGuide);
        }

        // Non-blocking auto-population of GitHub community trees if empty
        const cachedTree = localStorage.getItem("jax_gh_cached_tree");
        if (!cachedTree) {
          handleScanMultipleRepos([
            { repo: "Temetias/acc-sets", branch: "master" },
            { repo: "JaxDefected/ACC_Setups", branch: "master" }
          ], true);
        }
      } catch (err) {
        console.error("Database initialization failed. Using memory demos.", err);
        setSetupsList(DEMO_SETUPS);
        setActiveSetup(DEMO_SETUPS[0]);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Reset tuning states, tags, and fetch stars on active setup change
  useEffect(() => {
    setIsTuneMode(false);
    setTunedRawData(null);
    setTuneVersionNote("");
    setTuneIsTeamWorkspace(false);
    setSelectedReviewTags([]);
    
    if (activeSetup) {
      loadActiveRatings(activeSetup.id);
    } else {
      setActiveSetupRatings([]);
    }
  }, [activeSetup]);

  // Load custom variants list on startup and profile changes
  useEffect(() => {
    loadTunedSetups();
  }, [profile]);

  const loadActiveRatings = async (setupId: string) => {
    try {
      const list = await dbFetchSetupRatings(setupId);
      setActiveSetupRatings(list);
    } catch (err) {
      console.error("Error loading pilot ratings:", err);
    }
  };

  const loadTunedSetups = async () => {
    try {
      const list = await dbFetchTunedSetups();
      setTunedSetupsList(list);
    } catch (err) {
      console.error("Error loading custom custom setups:", err);
    }
  };

  const handleSaveRating = async () => {
    if (!profile) {
      showToast("Please register or log in first to review setups.", "error");
      return;
    }
    if (!activeSetup) return;
    
    setIsSavingRating(true);
    try {
      const ratingId = `${activeSetup.id}_${profile.username}`;
      const newRatingItem: SetupRatingItem = {
        id: ratingId,
        setupId: activeSetup.id,
        rating: userRating,
        tags: selectedReviewTags,
        username: profile.username,
        createdAt: new Date().toISOString()
      };
      
      await dbSaveSetupRating(newRatingItem);
      showToast("Pilot review and handling rating submitted!", "success");
      loadActiveRatings(activeSetup.id);
    } catch (err) {
      console.error(err);
      showToast("Failed to submit setup review.", "error");
    } finally {
      setIsSavingRating(false);
    }
  };

  const handleAdjustSetupValue = (field: string, delta: number, index?: number) => {
    if (!isTuneMode || !tunedRawData) return;
    const cloned = JSON.parse(JSON.stringify(tunedRawData));
    const carKey = cloned.carName || (activeSetup ? activeSetup.car : "unknown");
    const carConfig = cars[carKey];
    
    // Ensure basic sections exist
    if (!cloned.basicSetup) cloned.basicSetup = {};
    if (!cloned.advancedSetup) cloned.advancedSetup = {};
    if (!cloned.basicSetup.tyres) cloned.basicSetup.tyres = { tyrePressure: [50, 50, 50, 50] };
    if (!cloned.basicSetup.electronics) cloned.basicSetup.electronics = { tc1: 3, tc2: 2, abs: 3, ecuMap: 1, fuelMap: 1 };
    if (!cloned.advancedSetup.mechanicalGrip) cloned.advancedSetup.mechanicalGrip = { antirollBarFront: 5, antirollBarRear: 3, preloadDifferential: 120 };
    if (!cloned.advancedSetup.aerodynamics) cloned.advancedSetup.aerodynamics = { rearWingSetting: 4, rearWing: 4 };

    if (field === "tyrePressure" && typeof index === "number") {
      const rawIndexMap = [0, 2, 1, 3];
      const rawIdx = rawIndexMap[index];
      cloned.basicSetup.tyres.tyrePressure[rawIdx] = Math.max(0, Math.min(100, (cloned.basicSetup.tyres.tyrePressure[rawIdx] || 50) + delta));
    } else if (field === "tc1") {
      cloned.basicSetup.electronics.tc1 = Math.max(0, Math.min(12, (cloned.basicSetup.electronics.tc1 || 3) + delta));
    } else if (field === "tc2") {
      cloned.basicSetup.electronics.tc2 = Math.max(0, Math.min(12, (cloned.basicSetup.electronics.tc2 || 2) + delta));
    } else if (field === "abs") {
      cloned.basicSetup.electronics.abs = Math.max(0, Math.min(12, (cloned.basicSetup.electronics.abs || 3) + delta));
    } else if (field === "ecuMap") {
      cloned.basicSetup.electronics.ecuMap = Math.max(1, Math.min(12, (cloned.basicSetup.electronics.ecuMap || 1) + delta));
    } else if (field === "fuelMap") {
      cloned.basicSetup.electronics.fuelMap = Math.max(1, Math.min(5, (cloned.basicSetup.electronics.fuelMap || 1) + delta));
    } else if (field === "fuel") {
      cloned.basicSetup.fuel = Math.max(2, Math.min(120, (cloned.basicSetup.fuel || 20) + delta));
    } else if (field === "arbFront") {
      const currentARB = cloned.advancedSetup.mechanicalGrip.antirollBarFront !== undefined 
        ? cloned.advancedSetup.mechanicalGrip.antirollBarFront 
        : (cloned.advancedSetup.mechanicalGrip.arbFront || 5);
      const minARB = carConfig?.antirollBarFrontRange ? carConfig.antirollBarFrontRange[0] : 1;
      const maxARB = carConfig?.antirollBarFrontRange ? carConfig.antirollBarFrontRange[1] : 10;
      cloned.advancedSetup.mechanicalGrip.antirollBarFront = Math.max(minARB, Math.min(maxARB, currentARB + delta));
      cloned.advancedSetup.mechanicalGrip.arbFront = cloned.advancedSetup.mechanicalGrip.antirollBarFront;
    } else if (field === "arbRear") {
      const currentARB = cloned.advancedSetup.mechanicalGrip.antirollBarRear !== undefined 
        ? cloned.advancedSetup.mechanicalGrip.antirollBarRear 
        : (cloned.advancedSetup.mechanicalGrip.arbRear || 3);
      const minARB = carConfig?.antirollBarRearRange ? carConfig.antirollBarRearRange[0] : 1;
      const maxARB = carConfig?.antirollBarRearRange ? carConfig.antirollBarRearRange[1] : 10;
      cloned.advancedSetup.mechanicalGrip.antirollBarRear = Math.max(minARB, Math.min(maxARB, currentARB + delta));
      cloned.advancedSetup.mechanicalGrip.arbRear = cloned.advancedSetup.mechanicalGrip.antirollBarRear;
    } else if (field === "preloadDifferential") {
      cloned.advancedSetup.mechanicalGrip.preloadDifferential = Math.max(20, Math.min(400, (cloned.advancedSetup.mechanicalGrip.preloadDifferential || 120) + delta * 10));
    } else if (field === "rearWing") {
      const cw = cloned.advancedSetup.aerodynamics.rearWingSetting !== undefined 
        ? cloned.advancedSetup.aerodynamics.rearWingSetting 
        : (cloned.advancedSetup.aerodynamics.rearWing || 4);
      cloned.advancedSetup.aerodynamics.rearWing = Math.max(0, Math.min(24, cw + delta));
      cloned.advancedSetup.aerodynamics.rearWingSetting = cloned.advancedSetup.aerodynamics.rearWing;
    } else if (field === "brakeDuctFront") {
      let aeroKey = "aero";
      if (cloned.advancedSetup.aeroSetup) aeroKey = "aeroSetup";
      else if (cloned.advancedSetup.aeroBalance) aeroKey = "aeroBalance";
      else if (cloned.advancedSetup.aerodynamics) aeroKey = "aerodynamics";
      if (!cloned.advancedSetup[aeroKey]) cloned.advancedSetup[aeroKey] = {};

      let dbKey = "brakeDuct";
      if (cloned.advancedSetup[aeroKey].brakeDucts !== undefined) dbKey = "brakeDucts";

      let arr = cloned.advancedSetup[aeroKey][dbKey];
      if (!Array.isArray(arr) || arr.length !== 2) arr = [3, 3];
      const minVal = carConfig?.brakeDuctRange ? carConfig.brakeDuctRange[0] : 0;
      const maxVal = carConfig?.brakeDuctRange ? carConfig.brakeDuctRange[1] : 6;
      arr[0] = Math.max(minVal, Math.min(maxVal, arr[0] + delta));
      cloned.advancedSetup[aeroKey][dbKey] = arr;
    } else if (field === "brakeDuctRear") {
      let aeroKey = "aero";
      if (cloned.advancedSetup.aeroSetup) aeroKey = "aeroSetup";
      else if (cloned.advancedSetup.aeroBalance) aeroKey = "aeroBalance";
      else if (cloned.advancedSetup.aerodynamics) aeroKey = "aerodynamics";
      if (!cloned.advancedSetup[aeroKey]) cloned.advancedSetup[aeroKey] = {};

      let dbKey = "brakeDuct";
      if (cloned.advancedSetup[aeroKey].brakeDucts !== undefined) dbKey = "brakeDucts";

      let arr = cloned.advancedSetup[aeroKey][dbKey];
      if (!Array.isArray(arr) || arr.length !== 2) arr = [3, 3];
      const minVal = carConfig?.brakeDuctRange ? carConfig.brakeDuctRange[0] : 0;
      const maxVal = carConfig?.brakeDuctRange ? carConfig.brakeDuctRange[1] : 6;
      arr[1] = Math.max(minVal, Math.min(maxVal, arr[1] + delta));
      cloned.advancedSetup[aeroKey][dbKey] = arr;
    }

    setTunedRawData(cloned);
  };

  const handleSaveCustomTunedSetup = async (customNote?: string) => {
    if (!profile) {
      showToast("Whoops! Connect Driver Profile first to claim ownership of tuned setups.", "error");
      return;
    }
    if (!activeSetup || !tunedRawData) return;
    
    try {
      const trimmedNote = (customNote || tuneVersionNote).trim() || "Tweaked custom parameters.";
      const revisionName = `${activeSetup.name} - Tuned by ${profile.username}`;
      const tunedItemId = `${activeSetup.id}_tune_${Date.now()}`;
      
      const payload: SavedSetupItem = {
        id: tunedItemId,
        parentSetupId: activeSetup.id,
        authorUsername: profile.username,
        versionNote: trimmedNote,
        isTeamWorkspace: tuneIsTeamWorkspace,
        car: activeSetup.car,
        track: activeSetup.track,
        notes: trimmedNote,
        rawData: tunedRawData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dbSaveTunedSetup(payload);
      showToast("Tuned custom variant successfully saved!", "success");
      
      if (tuneIsTeamWorkspace) {
        const standardSetup: SetupItem = {
          id: tunedItemId,
          name: revisionName,
          car: activeSetup.car,
          track: activeSetup.track,
          notes: `[Tuned Variant] ${trimmedNote}`,
          rawData: tunedRawData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: user?.uid || "custom",
          uploadedByName: profile.username
        };
        await dbSaveSetup(standardSetup);
        
        const refreshedList = await dbFetchSetups();
        setSetupsList(refreshedList);
      }
      
      setIsTuneMode(false);
      setTunedRawData(null);
      setTuneVersionNote("");
      loadTunedSetups();
    } catch (err) {
      console.error(err);
      showToast("Failed to write customized setup variance.", "error");
    }
  };

  const handleCheckUsername = async (val: string) => {
    setOnboardingUsername(val);
    if (val.trim().length < 3) {
      setOnboardingUsernameAvailable(null);
      return;
    }
    setOnboardingCheckingUsername(true);
    try {
      const isOk = await dbCheckUsernameAvailable(val);
      setOnboardingUsernameAvailable(isOk);
    } catch (err) {
      console.error(err);
      setOnboardingUsernameAvailable(true); // default true for safety on connectivity limits
    } finally {
      setOnboardingCheckingUsername(false);
    }
  };

  // Automatically sync both community repos when GITHUB CLOUD SYNC tab is selected
  useEffect(() => {
    if (activeGarageTab === "github") {
      handleScanMultipleRepos([
        { repo: "Temetias/acc-sets", branch: "master" },
        { repo: "JaxDefected/ACC_Setups", branch: "master" }
      ], true);
    }
  }, [activeGarageTab]);

  // Sync scroll on chat updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Auth logins
  const handleLogin = async () => {
    try {
      await handleLoginWithHook();
      showToast("Connected to team driver profile successfully!", "success");
    } catch (e: any) {
      console.error(e);
      const errMsg = e.message || e.toString() || "Failed to authenticate.";
      showToast(`Login failed: ${errMsg}`, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await handleLogoutWithHook();
      showToast("Logged out from driver profile. Local caching active.", "info");
    } catch (e: any) {
      console.error(e);
      showToast("Failed to sign out.", "error");
    }
  };

  // 2. Parse dropped or selected files (.json setup files)
  const processUploadedFiles = (files: FileList | File[]) => {
    setUploadError(null);
    const filesArray = Array.from(files).filter((file) => file.name.toLowerCase().endsWith(".json"));

    if (filesArray.length === 0) {
      setUploadError("No valid .json files selected or dropped.");
      return;
    }

    setIsLoading(true);

    const promises = filesArray.map((file) => {
      return new Promise<PendingSetup>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const rawJson = JSON.parse(e.target?.result as string);
            const parsed = parseAccSetup(rawJson, file.name);

            let carKey = parsed.carKey || "unknown";
            let trackKey = parsed.trackKey || "unknown";

            // Normalize path helper for Folder items
            const relPath = file.webkitRelativePath || "";
            if (relPath) {
              const pathLower = relPath.toLowerCase();
              for (const key of Object.keys(ACC_TRACKS)) {
                if (
                  pathLower.includes(`/${key}/`) || 
                  pathLower.includes(`/${key}_`) || 
                  pathLower.includes(`_${key}/`) || 
                  pathLower.startsWith(`${key}/`)
                ) {
                  trackKey = key;
                }
              }
              for (const key of Object.keys(ACC_CARS)) {
                if (
                  pathLower.includes(`/${key}/`) || 
                  pathLower.includes(`/${key}_`) || 
                  pathLower.includes(`_${key}/`) || 
                  pathLower.startsWith(`${key}/`)
                ) {
                  carKey = key;
                }
              }
            }

            // Fallbacks from filename
            const fnLower = file.name.toLowerCase();
            if (trackKey === "unknown") {
              for (const key of Object.keys(ACC_TRACKS)) {
                if (fnLower.includes(key)) {
                  trackKey = key;
                  break;
                }
              }
            }
            if (carKey === "unknown") {
              for (const key of Object.keys(ACC_CARS)) {
                if (fnLower.includes(key)) {
                  carKey = key;
                  break;
                }
              }
            }

            // Auto-clean name
            const cleanName = file.name.replace(".json", "").replace(/[-_]/g, " ");
            const customName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            const lapTimesText = getLapTimesText(carKey, trackKey);

            resolve({
              id: "pending_" + Math.random().toString(36).substring(2, 11),
              fileName: file.name,
              relativePath: file.webkitRelativePath || file.name,
              customName,
              carKey,
              trackKey,
              notes: lapTimesText || "",
              parsedData: parsed,
              rawData: rawJson,
            });
          } catch (err) {
            resolve(null as any);
          }
        };
        reader.readAsText(file);
      });
    });

    Promise.all(promises).then((results) => {
      const successful = results.filter((item) => item !== null) as PendingSetup[];
      
      if (successful.length < filesArray.length) {
        setUploadError(`Could not parse ${filesArray.length - successful.length} file(s). Ensure they are valid JSON setups.`);
      }

      if (successful.length > 0) {
        setPendingSetups((prev) => [...prev, ...successful]);
        setIsUploaderPanelOpen(true);
      }
      setIsLoading(false);
    });
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  };

  const handleFolderSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  };

  // Deploy setup to FireStore/Local
  const handleDeploySetup = async () => {
    if (pendingSetups.length === 0) return;

    // Check if any has unknown car or track
    const hasUnknown = pendingSetups.some((s) => s.carKey === "unknown" || s.trackKey === "unknown");
    if (hasUnknown) {
      if (!window.confirm("Some setups have an 'Unknown' car or track. Deploy anyway? (They might not show up under filter parameters)")) {
        return;
      }
    }

    setIsLoading(true);
    const uploaderUID = user?.uid || "guest_driver";
    const uploaderName = user?.displayName || "Team Driver";

    try {
      let lastSavedItem: SetupItem | null = null;
      for (const item of pendingSetups) {
        const cleanName = item.customName.trim() || item.fileName.replace(".json", "");
        const newSetupItem: SetupItem = {
          id: "setup_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36),
          name: cleanName,
          car: item.carKey,
          track: item.trackKey,
          notes: item.notes,
          rawData: item.rawData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: uploaderUID,
          uploadedByName: uploaderName,
        };
        await dbSaveSetup(newSetupItem);
        lastSavedItem = newSetupItem;
      }

      const list = await dbFetchSetups();
      setSetupsList(list);
      if (lastSavedItem) {
        setActiveSetup(lastSavedItem);
        const carName = ACC_CARS[lastSavedItem.car] || lastSavedItem.car || "GT3 Car";
        const trackName = ACC_TRACKS[lastSavedItem.track] || lastSavedItem.track || "Circuit";
        showToast(`${carName} setup for ${trackName} has been loaded.`, "success");
      }

      setPendingSetups([]);
      setIsUploaderPanelOpen(false);
    } catch (err) {
      setUploadError("Error saving setup to database.");
    }
    setIsLoading(false);
  };

  // Delete setup
  const handleDeleteSetup = async (id: string, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!window.confirm("Verify you want to delete this setup from the team workspace?")) return;

    setIsLoading(true);
    try {
      await dbDeleteSetup(id);
      const list = await dbFetchSetups();
      setSetupsList(list);
      if (activeSetup?.id === id) {
        setActiveSetup(list.length > 0 ? list[0] : null);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  // Upload/Save scenario guide manual
  const handleSaveCustomGuide = async () => {
    try {
      await dbSaveGuide(customGuideText, user?.uid || "guest");
      showToast("Troubleshooting Scenario Workbook saved successfully. The AI Engineer will now consult this file for diagnoses.", "success");
      setIsGuidePanelOpen(false);
    } catch (err) {
      showToast("Failed to save troubleshooting workbook.", "error");
    }
  };

  const handleCustomGuideFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomGuideText(event.target?.result as string);
        showToast("Scenario guidebook successfully imported in interface! Click 'Commit Workbook' below to save permanently.", "info");
      };
      reader.readAsText(file);
    }
  };

  // GitHub search, scan, and import handlers
  const handleScanMultipleRepos = async (reposList: { repo: string; branch: string }[], silenceError = false) => {
    setGithubStatus("loading");
    setGithubError("");

    const consolidatedTree: any[] = [];
    let hadError = false;
    let errorMessage = "";

    await Promise.all(
      reposList.map(async (item) => {
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
  };

  const handleScanGithubRepo = async (repoStr = githubRepo, branchStr = githubBranch, tokenStr = githubToken) => {
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
        if (res.status === 404) {
          throw new Error("Repository or branch not found. Check repository path or branch name.");
        } else if (res.status === 403) {
          throw new Error("API rate limits exceeded, or unauthorized. Try providing a GitHub Personal Access Token.");
        } else {
          throw new Error(`GitHub API Error: ${res.statusText} (${res.status})`);
        }
      }

      const data = await res.json();
      if (!data.tree || !Array.isArray(data.tree)) {
        throw new Error("Could not retrieve repository file structure.");
      }

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
  };

  const handleImportGithubSetup = async (path: string, liveInspectOnly = false, customRepo?: string, customBranch?: string) => {
    let targetRepo = customRepo || githubRepo;
    let targetBranch = customBranch || githubBranch;

    let cleanRepo = targetRepo.trim();
    if (cleanRepo.startsWith("https://github.com/")) {
      cleanRepo = cleanRepo.replace("https://github.com/", "").trim();
    }
    cleanRepo = cleanRepo.replace(/\/+$/, "");
    
    if (!cleanRepo) {
      showToast("Please configure and connect a GitHub repository first.", "info");
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
      if (!res.ok) {
        throw new Error(`Failed to download file from GitHub raw (Status ${res.status})`);
      }

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
        if (pathMeta.meta.grade !== undefined) {
          customNotes += `\n• Grade: ${pathMeta.meta.grade}/3 (${pathMeta.meta.gradeLabel})`;
        }
        if (pathMeta.meta.patch) {
          customNotes += `\n• Asset Version / Patch: v${pathMeta.meta.patch}`;
        }
        if (pathMeta.meta.session) {
          customNotes += `\n• Intent Session: ${pathMeta.meta.session} (${pathMeta.meta.sessionLabel})`;
        }
        if (pathMeta.meta.temp) {
          customNotes += `\n• Ambient Operating Temp: ${pathMeta.meta.temp.toUpperCase()}`;
        }
      }

      const lapTimesText = getLapTimesText(finalCar, finalTrack);
      if (lapTimesText) {
        if (customNotes) {
          customNotes += `\n\n${lapTimesText}`;
        } else {
          customNotes = lapTimesText;
        }
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
        setActiveSetup(mockSetupItem);
        const carName = ACC_CARS[finalCar] || finalCar || "GT3 Car";
        const trackName = ACC_TRACKS[finalTrack] || finalTrack || "Circuit";
        showToast(`${carName} setup for ${trackName} has been loaded.`, "success");
        if (window.innerWidth < 1024) {
          setTimeout(() => {
            document.getElementById("column-inspection-engineer")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else {
        await dbSaveSetup(mockSetupItem);
        const list = await dbFetchSetups();
        setSetupsList(list);
        setActiveSetup(mockSetupItem);
        const carName = ACC_CARS[finalCar] || finalCar || "GT3 Car";
        const trackName = ACC_TRACKS[finalTrack] || finalTrack || "Circuit";
        showToast(`${carName} setup for ${trackName} has been synchronized and loaded.`, "success");
        if (window.innerWidth < 1024) {
          setTimeout(() => {
            document.getElementById("column-inspection-engineer")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    } catch (err: any) {
      showToast(`GitHub Download Failed: ${err.message || err}`, "error");
    }
    setIsImportingFromGithub(null);
  };

  // 3. AI Race Engineering chat trigger
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    if (!presetText) setChatInput("");
    setIsChatAnalyzing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          setupData: activeSetup ? parseAccSetup(tunedRawData || activeSetup.rawData, activeSetup.name) : null,
          customGuideContent: customGuideText || null,
          chatHistory: chatMessages.slice(-6), // Send last few messages for continuity
          userProfile: profile ? {
            username: profile.username,
            pinnedSeriesCars: profile.pinnedSeriesCars || []
          } : null,
          garageSetups: profile ? tunedSetupsList.filter((s) => s.authorUsername === profile.username).map(s => ({
            car: s.car,
            track: s.track,
            versionNote: s.versionNote || s.notes || ""
          })) : [],
          isCustomTuned: isTuneMode && !!tunedRawData
        }),
      });

      const data = await response.json();
      if (data.error) {
        setChatMessages((prev) => [
          ...prev,
          { role: "model", content: `⚠️ **Engineering Radio Down:** ${data.error}` }
        ]);
      } else {
        setChatMessages((prev) => [...prev, { role: "model", content: data.reply }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "model", content: "⚠️ **Timeout Error:** Could not contact the pitwall. Ensure your dev server is active on Port 3000." }
      ]);
    }
    setIsChatAnalyzing(false);
  };

  // Helper download trigger
  const handleDownloadOriginalJson = (setup: SetupItem) => {
    const jsonStr = JSON.stringify(setup.rawData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    // Structure: track_car_desc.json
    const cleanFilename = `${setup.track}_${setup.car}_${setup.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.json`;
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter systems
  const filteredSetups = setupsList.filter((s) => {
    const searchLower = searchText.toLowerCase().trim();
    const carName = (ACC_CARS[s.car] || s.car || "").toLowerCase();
    const trackName = (ACC_TRACKS[s.track] || s.track || "").toLowerCase();
    const carKey = (s.car || "").toLowerCase();
    const trackKey = (s.track || "").toLowerCase();
    const nameLower = (s.name || "").toLowerCase();
    const notesLower = (s.notes || "").toLowerCase();

    const matchesSearch = searchLower === "" ||
                          nameLower.includes(searchLower) || 
                          notesLower.includes(searchLower) ||
                          carName.includes(searchLower) ||
                          carKey.includes(searchLower) ||
                          trackName.includes(searchLower) ||
                          trackKey.includes(searchLower);

    const matchesCar = carFilter === "all" || s.car === carFilter;
    const matchesTrack = trackFilter === "all" || s.track === trackFilter;
    const matchesPinned = !onlyPinnedCarsFilter || !profile?.pinnedSeriesCars || profile.pinnedSeriesCars.length === 0 || profile.pinnedSeriesCars.includes(s.car);
    return matchesSearch && matchesCar && matchesTrack && matchesPinned;
  });

  // Filter systems on GitHub Repository
  const githubMatches = githubTree.map(file => {
    const parsed = parseGithubPath(file.path);
    return {
      path: file.path,
      fileName: parsed.fileName,
      carKey: parsed.carKey,
      trackKey: parsed.trackKey,
      size: file.size,
      meta: parsed.meta,
      repo: file.repo || githubRepo,
      branch: file.branch || githubBranch,
    };
  }).filter(item => {
    const fnLower = item.fileName.toLowerCase();
    const pathLower = item.path.toLowerCase();
    const searchLower = searchText.toLowerCase().trim();
    
    const carName = (ACC_CARS[item.carKey] || item.carKey || "").toLowerCase();
    const trackName = (ACC_TRACKS[item.trackKey] || item.trackKey || "").toLowerCase();
    const carKey = (item.carKey || "").toLowerCase();
    const trackKey = (item.trackKey || "").toLowerCase();

    const matchesSearch = searchLower === "" || 
                          pathLower.includes(searchLower) || 
                          fnLower.includes(searchLower) ||
                          carName.includes(searchLower) ||
                          carKey.includes(searchLower) ||
                          trackName.includes(searchLower) ||
                          trackKey.includes(searchLower);
                          
    const matchesCar = carFilter === "all" || item.carKey === carFilter;
    const matchesTrack = trackFilter === "all" || item.trackKey === trackFilter;
    const matchesPinned = !onlyPinnedCarsFilter || !profile?.pinnedSeriesCars || profile.pinnedSeriesCars.length === 0 || profile.pinnedSeriesCars.includes(item.carKey);
    
    // Filter by grade
    let matchesGrade = true;
    if (githubGradeFilter !== "all") {
      if (item.meta.grade === undefined) {
        matchesGrade = false;
      } else {
        if (githubGradeFilter === "3") {
          matchesGrade = item.meta.grade === 3;
        } else if (githubGradeFilter === "2+") {
          matchesGrade = item.meta.grade >= 2;
        } else if (githubGradeFilter === "1+") {
          matchesGrade = item.meta.grade >= 1;
        } else {
          matchesGrade = item.meta.grade === parseInt(githubGradeFilter, 10);
        }
      }
    }

    // Filter by session
    let matchesSession = true;
    if (githubSessionFilter !== "all") {
      if (!item.meta.session) {
        matchesSession = false;
      } else {
        const sLower = item.meta.session.toLowerCase();
        if (githubSessionFilter === "q") {
          matchesSession = sLower === "q" || sLower.includes("qualy") || sLower.includes("qualifying");
        } else if (githubSessionFilter === "r") {
          matchesSession = sLower === "r" || sLower.includes("race");
        } else if (githubSessionFilter === "p") {
          matchesSession = sLower === "p" || sLower.includes("practice");
        }
      }
    }

    return matchesSearch && matchesCar && matchesTrack && matchesGrade && matchesSession && matchesPinned;
  });

  // Derived setup details
  const parsedActiveSetup = activeSetup 
    ? parseAccSetup(isTuneMode && tunedRawData ? tunedRawData : activeSetup.rawData, activeSetup.name) 
    : null;

  const handleSelectReferenceCar = (carKey: string) => {
    if (!carKey) return;
    const carConfig = cars[carKey];
    if (!carConfig) return;

    const defaultRaw: any = {
      carName: carKey,
      basicSetup: {
        tyres: {
          tyrePressures: [60, 60, 60, 60]
        },
        alignment: {
          camber: [0, 0, 0, 0],
          toe: [1, 1, 1, 1],
          caster: [0, 0]
        }
      },
      advancedSetup: {
        electronics: {
          tc1: 3,
          tc2: 3,
          abs: 3,
          ecuMap: carConfig.eCUMapRange ? carConfig.eCUMapRange[0] : 1,
          fuelMap: 1,
          telemetryLaps: 0
        },
        mechanicalGrip: {
          wheelRate: [0, 0, 0, 0],
          bumpStopRate: [0, 0, 0, 0],
          bumpStopWindow: [0, 0, 0, 0],
          preloadDifferential: 100
        },
        aeroBalance: {
          rideHeight: [60, 70],
          rearWing: 4,
          splitter: 1,
          brakeDuct: [1, 1]
        },
        dampers: {
          bumpSlow: [5, 5, 5, 5],
          reboundSlow: [8, 8, 8, 8],
          bumpFast: [10, 10, 10, 10],
          reboundFast: [12, 12, 12, 12]
        }
      }
    };

    const refSetup: SetupItem = {
      id: "ref_" + carKey,
      name: `Reference: ${carConfig.fullName}`,
      car: carKey,
      track: "monza",
      notes: `Official active limits reference for the ${carConfig.fullName}. Feel free to browse alignment values, aero settings, and spring rate bounds beneath.`,
      rawData: defaultRaw,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: "system",
      uploadedByName: "Reference Database"
    };

    setActiveSetup(refSetup);
  };

  // Track Temp Transition Calculator math
  const getTransitionCoolingModel = () => {
    const startHour = parseInt(transitionTimeStart.split(":")[0]) || 17;
    const durationHrs = transitionDuration / 60;
    
    let trackCoolingRate = 0; // °C per hour
    let ambientCoolingRate = 0; // °C per hour
    let coolingType = "Stable Ambient";
    
    if (startHour >= 12 && startHour < 16) {
      trackCoolingRate = 0.5;
      ambientCoolingRate = 0.2;
      coolingType = "Stable Peak Heat";
    } else if (startHour >= 16 && startHour < 18) {
      trackCoolingRate = 3.2;
      ambientCoolingRate = 1.2;
      coolingType = "Late Afternoon Golden Hour (High Cooling)";
    } else if (startHour >= 18 && startHour < 21) {
      trackCoolingRate = 5.0;
      ambientCoolingRate = 2.0;
      coolingType = "Sunset Dusk Transition (Severe Cooling)";
    } else if (startHour >= 21 || startHour < 5) {
      trackCoolingRate = 1.0;
      ambientCoolingRate = 0.5;
      coolingType = "Early Night/Midnight (Slow Cooling)";
    } else {
      trackCoolingRate = -2.0; // heats up!
      ambientCoolingRate = -1.0;
      coolingType = "Morning Transition (Warming Up)";
    }
    
    const trackDrop = trackCoolingRate * durationHrs;
    const ambientDrop = ambientCoolingRate * durationHrs;
    
    // In ACC, base cold pressures need to increase as temps drop
    // Factor: ~ +0.1 PSI for every 1°C of track drop, ~ +0.12 PSI for every 1°C of ambient drop
    const rawOffset = (trackDrop * 0.1) + (ambientDrop * 0.12);
    // Keep offset representation clean and rounded
    const compensationPSI = Math.round(rawOffset * 10) / 10;
    
    return {
      trackCoolingRate,
      ambientCoolingRate,
      coolingType,
      trackDrop,
      ambientDrop,
      compensationPSI,
    };
  };

  const coolingData = getTransitionCoolingModel();

  // Pit & Stint Strategy Model
  const getPitStrategyModel = () => {
    const minVal = fuelLapTimeMin === "" ? 0 : fuelLapTimeMin;
    const secVal = fuelLapTimeSec === "" ? 0 : fuelLapTimeSec;
    const lapTimeSec = (minVal * 60) + secVal;
    const totalRaceSecs = fuelRaceTime * 60;
    const estTotalLaps = lapTimeSec > 0 ? Math.ceil(totalRaceSecs / lapTimeSec) : 0;
    const safetyBufferLaps = fuelSafetyLaps;
    const totalLapsWithBuffer = estTotalLaps + safetyBufferLaps;
    const totalFuelNeeded = totalLapsWithBuffer * fuelPerLap;
    
    interface Stint {
      index: number;
      durationMins: number;
      laps: number;
      fuelNeeded: number;
      isOverfilled: boolean;
    }
    
    const stintsCount = pitNumberOfStops + 1;
    let stints: Stint[] = [];
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
        isOverfilled: overfill
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
        isOverfilled: stint1Overfilled
      });
      
      stints.push({
        index: 2,
        durationMins: Math.round(fuelRaceTime * ratio2 * 10) / 10,
        laps: laps2,
        fuelNeeded: stint2Overfilled ? pitMaxFuelCapacity : stint2Fuel,
        isOverfilled: stint2Overfilled
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
        isOverfilled: stint1Fuel > pitMaxFuelCapacity
      });
      stints.push({
        index: 2,
        durationMins: Math.round(fuelRaceTime * ratio2 * 10) / 10,
        laps: laps2,
        fuelNeeded: stint2Fuel > pitMaxFuelCapacity ? pitMaxFuelCapacity : stint2Fuel,
        isOverfilled: stint2Fuel > pitMaxFuelCapacity
      });
      stints.push({
        index: 3,
        durationMins: Math.round(fuelRaceTime * ratio3 * 10) / 10,
        laps: laps3,
        fuelNeeded: stint3Fuel > pitMaxFuelCapacity ? pitMaxFuelCapacity : stint3Fuel,
        isOverfilled: stint3Fuel > pitMaxFuelCapacity
      });
    }
    
    const standardMaxInitialFuel = Math.min(pitMaxFuelCapacity, totalFuelNeeded);
    const splitStartingFuel = stints.length > 0 ? stintsCount > 1 ? stints[0].fuelNeeded : totalFuelNeeded : totalFuelNeeded;
    const fuelWeightDifference = Math.max(0, (standardMaxInitialFuel - splitStartingFuel) * 0.74);
    const estimatedTimeGainPerLap = (fuelWeightDifference / 10) * 0.08;
    
    return {
      estTotalLaps,
      totalFuelNeeded,
      stints,
      msg,
      alertMsg,
      fuelWeightDifference,
      estimatedTimeGainPerLap
    };
  };

  const pitStrategy = getPitStrategyModel();
  const calculatedFuelLapTimeSec = (fuelLapTimeMin === "" ? 0 : fuelLapTimeMin) * 60 + (fuelLapTimeSec === "" ? 0 : fuelLapTimeSec);

  return (
    <div id="acc-app-root" className="min-h-screen bg-zinc-100/60 font-sans text-zinc-900 flex flex-col antialiased w-full max-w-full overflow-x-hidden">
      {/* 1. Header Navigation Bar */}
      <header 
        id="main-nav-bar" 
        className={`bg-zinc-950 border-b border-zinc-805 sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-row items-center justify-between w-full max-w-full box-border overflow-hidden gap-3 ${
          isScrolled 
            ? "py-1.5 px-3 md:py-2 md:px-6" 
            : "py-3 px-4 md:px-6"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="bg-red-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono font-black tracking-widest shadow-lg shadow-red-500/10 shrink-0 select-none">
            PITWALL
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-xs sm:text-sm md:text-lg font-bold tracking-tight text-white flex items-center gap-1 sm:gap-1.5 truncate">
              <Gauge className="text-red-500 w-3.5 h-3.5 md:w-5 md:h-5 animate-pulse shrink-0" />
              <span className="shrink-0">PitWall</span>
              <span className={`text-[9px] md:text-xs text-zinc-400 border-l border-zinc-800 pl-1 sm:pl-1.5 font-normal transition-all duration-300 ease-in-out overflow-hidden ${
                isScrolled ? "max-w-0 opacity-0 md:max-w-[240px] md:opacity-100" : "max-w-[240px] opacity-100"
              }`}>
                ACC Setup Lab
              </span>
            </h1>
            <p className={`text-[9px] md:text-xs text-zinc-500 truncate transition-all duration-300 ease-in-out ${
              isScrolled 
                ? "max-h-0 opacity-0 pr-0 mt-0 overflow-hidden" 
                : "max-h-4 opacity-100 mt-0.5"
            }`}>
              ACC Companion App
            </p>
          </div>
        </div>

        {/* Sync panel & Auth login block */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono shrink-0">
          {authLoading ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-400 font-bold select-none uppercase tracking-wider text-[10px] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              Syncing...
            </div>
          ) : user ? (
            <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 max-w-full rounded-md border transition-all duration-300 ${
              isScrolled 
                ? "bg-transparent border-transparent p-0" 
                : "bg-zinc-900 px-3.5 py-1.5 border-zinc-800"
            }`}>
              <button
                onClick={() => {
                  if (profile) {
                    setEditUsername(profile.username);
                    setEditPinnedCars(profile.pinnedSeriesCars || []);
                    setEditUsernameAvailable(true);
                    setShowProfileModal(true);
                  }
                }}
                className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
                title="Edit Username & Core Car Filter Pins"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    referrerPolicy="no-referrer"
                    alt={profile?.username || user.displayName || "Driver"}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border border-zinc-700 object-cover group-hover:border-red-500 transition-all opacity-95 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-black group-hover:border-red-500 transition-all shrink-0">
                    {(profile?.username || user.displayName || user.email || "D").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`flex flex-col min-w-0 transition-all duration-300 ease-in-out overflow-hidden origin-right ${
                  isScrolled 
                    ? "max-w-0 opacity-0 md:max-w-[124px] md:opacity-100" 
                    : "max-w-[124px] opacity-100"
                }`}>
                  <span className="text-zinc-200 group-hover:text-red-400 truncate font-semibold text-[11px] leading-tight flex items-center gap-1">
                    <span>{profile?.username ? `@${profile.username}` : (user.displayName || user.email)}</span>
                    <Wrench className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-100" />
                  </span>
                  <span className="text-[8px] text-red-500 font-black tracking-wider uppercase leading-none mt-0.5 animate-pulse">
                    TEAM CLOUD ACTIVE
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <button
              id="btn-google-sign-in"
              onClick={handleLogin}
              className={`flex items-center gap-2 bg-red-650 hover:bg-red-700 transition-all duration-300 text-white rounded font-black cursor-pointer font-mono uppercase tracking-wider shadow-md shadow-red-600/10 active:scale-95 shrink-0 ${
                isScrolled 
                  ? "px-2.5 py-1.5 text-[9px] max-w-[90px]" 
                  : "px-4 py-2.5 sm:py-1.5 text-[11px] max-w-[200px]"
              }`}
            >
              <span className="truncate">{isScrolled ? "Connect" : "Connect Driver"}</span>
            </button>
          )}
        </div>
      </header>

       {/* View Switcher Menu Bar */}
      <div 
        id="app-view-switcher" 
        className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-850 p-2 pb-[calc(8px+env(safe-area-inset-bottom,16px))] shadow-2xl md:static md:z-auto md:bg-transparent md:border-none md:p-0 md:shadow-none max-w-7xl w-full mx-auto md:px-4 lg:md:px-6 md:pt-3 md:sm:pt-5"
      >
        <div className="bg-transparent border-none p-0 flex gap-1 font-mono text-[9px] sm:text-[10px] md:text-xs md:bg-white md:border md:border-zinc-250 md:p-1.5 md:rounded-lg md:gap-2 md:shadow-3xs w-full max-w-full justify-around md:justify-start">
          <button
            id="view-btn-telemetry"
            onClick={() => setCurrentView("telemetry")}
            className={`flex-grow md:flex-1 py-1.5 md:py-2.5 rounded-md font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 cursor-pointer min-h-[46px] md:min-h-0 ${
              currentView === "telemetry"
                ? "bg-zinc-900 text-red-500 md:bg-zinc-900 md:text-white shadow-xs font-extrabold border border-zinc-800 md:border-none"
                : "text-zinc-400 hover:text-zinc-200 md:text-zinc-600 md:hover:text-zinc-900 md:hover:bg-zinc-50"
            }`}
          >
            <Gauge className="w-4 h-4 text-red-500" />
            <span className="hidden md:inline">SETUP LAB TELEMETRY ANALYZER</span>
            <span className="md:hidden">TELEMETRY</span>
          </button>
          <button
            id="view-btn-laptimes"
            onClick={() => setCurrentView("laptimes")}
            className={`flex-grow md:flex-1 py-1.5 md:py-2.5 rounded-md font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 cursor-pointer min-h-[46px] md:min-h-0 ${
              currentView === "laptimes"
                ? "bg-zinc-900 text-red-500 md:bg-zinc-900 md:text-white shadow-xs font-extrabold border border-zinc-800 md:border-none"
                : "text-zinc-400 hover:text-zinc-200 md:text-zinc-600 md:hover:text-zinc-900 md:hover:bg-zinc-50"
            }`}
          >
            <Clock className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="hidden md:inline">ACC LAP TIMES REFERENCE</span>
            <span className="md:hidden">LAP TIMES</span>
          </button>
          <button
            id="view-btn-garage"
            onClick={() => setCurrentView("garage")}
            className={`flex-grow md:flex-1 py-1.5 md:py-2.5 rounded-md font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 cursor-pointer min-h-[46px] md:min-h-0 ${
              currentView === "garage"
                ? "bg-zinc-900 text-red-500 md:bg-zinc-900 md:text-white shadow-xs font-extrabold border border-zinc-800 md:border-none"
                : "text-zinc-400 hover:text-zinc-200 md:text-zinc-650 md:hover:text-zinc-900 md:hover:bg-zinc-50"
            }`}
          >
            <Folder className="w-4 h-4 text-red-500" />
            <span>MY GARAGE</span>
          </button>
          <button
            id="view-btn-engineer"
            onClick={() => setCurrentView("engineer")}
            className={`flex-grow md:flex-1 py-1.5 md:py-2.5 rounded-md font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 cursor-pointer min-h-[46px] md:min-h-0 ${
              currentView === "engineer"
                ? "bg-zinc-900 text-red-500 md:bg-zinc-900 md:text-white shadow-xs font-extrabold border border-zinc-800 md:border-none"
                : "text-zinc-400 hover:text-zinc-200 md:text-zinc-650 md:hover:text-zinc-900 md:hover:bg-zinc-50"
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-450" />
            <span className="hidden md:inline">🔧 AI RACE ENGINEER</span>
            <span className="md:hidden">ENGINEER</span>
          </button>
        </div>
      </div>

      {currentView === "telemetry" ? (
        <main id="dashboard-workspace" className="flex-1 max-w-7xl w-full mx-auto p-4 pb-20 md:pb-6 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Team Registry, Filters, and Uploaders (Span 4) */}
        <section id="column-registry-controls" className="lg:col-span-4 flex flex-col gap-6 w-full">
          
          {/* A. Search and Filters */}
          <div className="bg-white border border-zinc-250 shadow-sm rounded-lg p-4 flex flex-col gap-3 sticky top-[48px] md:relative md:top-auto z-30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-widest text-red-655 uppercase">Registry Search</span>
              <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                id="registry-search-input"
                type="text"
                placeholder="Search setup notes..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-zinc-50 text-zinc-900 pl-9 pr-4 py-2 border border-zinc-250 rounded text-base md:text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            {profile?.pinnedSeriesCars && profile.pinnedSeriesCars.length > 0 && (
              <div className="flex items-center justify-between bg-red-50/45 border border-red-200/50 rounded-lg p-2.5 -mt-1 hover:bg-red-50/60 transition-all">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-red-700 tracking-tight leading-none">Series Vehicles Active</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5 font-mono leading-none">Pin list: {profile.pinnedSeriesCars.length} cars configured</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-red-600 font-bold bg-white border border-red-200 hover:border-red-350 shadow-3xs px-3 py-1.5 rounded-lg cursor-pointer select-none active:scale-95 transition-all h-9 shrink-0">
                  <input
                    type="checkbox"
                    checked={onlyPinnedCarsFilter}
                    onChange={(e) => setOnlyPinnedCarsFilter(e.target.checked)}
                    className="accent-red-650 w-4 h-4 cursor-pointer block shrink-0"
                  />
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider">Series Only</span>
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-500 block font-mono uppercase text-[9px] font-bold">Car Class</label>
                </div>
                <select
                  id="filter-car-select"
                  value={carFilter}
                  onChange={(e) => setCarFilter(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-250 text-zinc-850 p-3 md:p-2 rounded focus:outline-none font-mono text-base md:text-[11px] font-semibold min-h-[44px] md:min-h-0"
                >
                  <option value="all">All Cars</option>
                  {(() => {
                    const localCars = setupsList.map((s) => s.car);
                    const githubCars = githubTree.map(file => {
                      try {
                        return parseGithubPath(file.path).carKey;
                      } catch (e) {
                        return "unknown";
                      }
                    }).filter(c => c !== "unknown");
                    let allCars = Array.from(new Set([...localCars, ...githubCars])).sort((a, b) => {
                      const nameA = ACC_CARS[a] || a;
                      const nameB = ACC_CARS[b] || b;
                      return nameA.localeCompare(nameB);
                    });
                    if (profile?.pinnedSeriesCars && profile.pinnedSeriesCars.length > 0 && onlyPinnedCarsFilter) {
                      allCars = allCars.filter(carKey => profile.pinnedSeriesCars.includes(carKey));
                    }

                    // Group cars by class
                    const groups: Record<string, string[]> = {
                      "GT3": [],
                      "GT4": [],
                      "GT2": [],
                      "TCX": [],
                      "Cup / Challenge (GTC)": []
                    };
                    const uncategorized: string[] = [];

                    allCars.forEach((carKey) => {
                      const lower = carKey.toLowerCase();
                      if (lower.includes("gt4") || lower === "alpine_a110_gt4" || lower === "chevrolet_camaro_gt4r" || lower === "ktm_xbow_gt4" || lower === "maserati_mc_gt4" || lower === "ginetta_g55_gt4" || lower === "aston_martin_vantage_gt4") {
                        groups["GT4"].push(carKey);
                      } else if (lower.includes("gt2") || lower === "porsche_935") {
                        groups["GT2"].push(carKey);
                      } else if (lower.includes("gt3") || lower === "jaguar_g3" || lower.includes("audi_r8_lms") || lower.includes("bentley_continental") || lower.includes("lexus_rc_f") || lower.includes("lamborghini_gallardo_rex") || lower.includes("mclaren_650s") || lower === "mercedes_amg_gt3" || lower.includes("nissan_gt_r")) {
                        groups["GT3"].push(carKey);
                      } else if (lower.includes("m2_cs") || lower.includes("tcx")) {
                        groups["TCX"].push(carKey);
                      } else if (lower.includes("cup") || lower.includes("challenge") || lower.includes("st_evo")) {
                        groups["Cup / Challenge (GTC)"].push(carKey);
                      } else {
                        uncategorized.push(carKey);
                      }
                    });

                    const renderGroup = (label: string, carsList: string[]) => {
                      if (carsList.length === 0) return null;
                      return (
                        <optgroup key={label} label={label}>
                          {carsList.map((carKey) => (
                            <option key={carKey} value={carKey}>
                              {ACC_CARS[carKey] || carKey}
                            </option>
                          ))}
                        </optgroup>
                      );
                    };

                    return [
                      renderGroup("GT3", groups["GT3"]),
                      renderGroup("GT4", groups["GT4"]),
                      renderGroup("GT2", groups["GT2"]),
                      renderGroup("TCX", groups["TCX"]),
                      renderGroup("Cup / Challenge (GTC)", groups["Cup / Challenge (GTC)"]),
                      renderGroup("Uncategorized", uncategorized)
                    ];
                  })()}
                </select>
              </div>
              <div>
                <label className="text-zinc-500 block mb-1 font-mono uppercase text-[9px] font-bold">Track</label>
                <select
                  id="filter-track-select"
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-250 text-zinc-850 p-3 md:p-2 rounded focus:outline-none font-mono text-base md:text-[11px] font-semibold min-h-[44px] md:min-h-0"
                >
                  <option value="all">All Tracks</option>
                  {(() => {
                    const localTracks = setupsList.map((s) => s.track);
                    const githubTracks = githubTree.map(file => {
                      try {
                        return parseGithubPath(file.path).trackKey;
                      } catch (e) {
                        return "unknown";
                      }
                    }).filter(t => t !== "unknown");
                    const allTracks = Array.from(new Set([...localTracks, ...githubTracks])).sort((a, b) => {
                      const nameA = ACC_TRACKS[a] || a;
                      const nameB = ACC_TRACKS[b] || b;
                      return nameA.localeCompare(nameB);
                    });
                    return allTracks.map((trackKey) => (
                      <option key={trackKey} value={trackKey}>
                        {ACC_TRACKS[trackKey] || trackKey}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          </div>

          {/* B. Drag and Drop Uploader Area */}
          {isAdmin && (
            <div
              id="drop-zone-setup"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-zinc-300 hover:border-red-650 bg-white hover:bg-zinc-50 transition-all rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 group shadow-sm text-zinc-800"
            >
              <input
                id="file-input-setup"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
               {/* HTML5 folder support attributes */}
               <input
                 id="folder-input-setup"
                 type="file"
                 onChange={handleFolderSelect}
                 className="hidden"
                 multiple
                 {...({
                   webkitdirectory: "",
                   directory: ""
                 } as any)}
               />
              
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-red-600 mb-2 transition-colors" />
                <span className="text-sm font-bold text-zinc-900 tracking-tight">Upload Setup JSON(s)</span>
                <p className="text-xs text-zinc-500 mt-1 max-w-[250px] leading-relaxed">
                  Drag & drop `.json` files here, or choose your upload mode:
                </p>
                
                <div className="flex gap-2.5 mt-3.5">
                  <label
                    htmlFor="file-input-setup"
                    className="bg-white hover:bg-zinc-50 text-[11px] text-zinc-700 px-3 py-1.5 rounded border border-zinc-300 font-mono cursor-pointer transition-colors font-semibold shadow-sm"
                  >
                    Browse File(s)
                  </label>
                  <label
                    htmlFor="folder-input-setup"
                    className="bg-red-50 hover:bg-red-100 text-[11px] text-red-700 px-3 py-1.5 rounded border border-red-200 font-mono cursor-pointer transition-colors font-semibold shadow-sm"
                  >
                    Upload Folder
                  </label>
                </div>

                <span className="text-[10px] font-mono text-zinc-400 block mt-3">
                  Typically inside Documents/Assetto Corsa Competizione/Setups
                </span>
              </div>
            </div>
          )}

          {/* C. Popup dialog / Inline Panel for Setup Meta Deployment */}
          <AnimatePresence>
            {isUploaderPanelOpen && pendingSetups.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-4 shadow-lg text-zinc-800"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="text-red-650 w-4 h-4" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-red-650 uppercase">
                      Configure Setup Batch ({pendingSetups.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setPendingSetups([]);
                      setIsUploaderPanelOpen(false);
                      setUploadError(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-900 text-xs font-mono"
                  >
                    Cancel
                  </button>
                </div>

                {/* Bulk Actions Panel */}
                {pendingSetups.length > 1 && (
                  <div className="bg-zinc-50 p-3 rounded-md border border-zinc-200 space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-red-650">
                      Bulk Batch Settings (Apply to All in list)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] font-mono block">Apply Car Model to All</label>
                        <div className="flex gap-1">
                          <select
                            value={batchCar}
                            onChange={(e) => setBatchCar(e.target.value)}
                            className="bg-white border border-zinc-300 text-[10px] p-1.5 rounded text-zinc-700 focus:outline-none w-full"
                          >
                            <option value="">-- Choose Car --</option>
                            {Object.entries(ACC_CARS).map(([key, name]) => (
                              <option key={key} value={key}>{name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (batchCar) {
                                setPendingSetups(prev => prev.map(item => ({ ...item, carKey: batchCar })));
                              }
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-[10px] font-mono active:scale-95 transition-all shrink-0 cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 text-[10px] font-mono block">Apply Track to All</label>
                        <div className="flex gap-1">
                          <select
                            value={batchTrack}
                            onChange={(e) => setBatchTrack(e.target.value)}
                            className="bg-white border border-zinc-300 text-[10px] p-1.5 rounded text-zinc-700 focus:outline-none w-full"
                          >
                            <option value="">-- Choose Track --</option>
                            {Object.entries(ACC_TRACKS).map(([key, name]) => (
                              <option key={key} value={key}>{name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (batchTrack) {
                                setPendingSetups(prev => prev.map(item => ({ ...item, trackKey: batchTrack })));
                              }
                            }}
                            className="bg-zinc-800 hover:bg-zinc-900 text-white px-2 py-1 rounded text-[10px] font-mono active:scale-95 transition-all shrink-0 cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500 text-[10px] font-mono block">Apply Notes to All</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g., Monza race configuration hotlap setup..."
                          value={batchNotes}
                          onChange={(e) => setBatchNotes(e.target.value)}
                          className="bg-white border border-zinc-300 text-[10px] p-1.5 rounded text-zinc-800 focus:outline-none w-full pl-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (batchNotes.trim()) {
                              setPendingSetups(prev => prev.map(item => ({ ...item, notes: batchNotes })));
                            }
                          }}
                          className="bg-zinc-800 hover:bg-zinc-900 text-white px-2 py-1 rounded text-[10px] font-mono active:scale-95 transition-all shrink-0 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Setup Editors in Batch */}
                <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 divide-y divide-zinc-100">
                  {pendingSetups.map((setup) => {
                    const hasTrackUnknown = setup.trackKey === "unknown";
                    const hasCarUnknown = setup.carKey === "unknown";
                    
                    return (
                      <div key={setup.id} className="pt-3 first:pt-0 space-y-2 text-zinc-900">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            {/* Line 1: Identified Car Name Header */}
                            <div className="font-bold text-zinc-900 text-xs truncate max-w-[280px] tracking-tight">
                              {ACC_CARS[setup.carKey] || setup.parsedData.carName || "Unknown Car"}
                            </div>
                            {/* Line 2: Track / Circuit */}
                            <div className="text-[10px] text-zinc-600 font-medium truncate max-w-[280px] mt-0.5">
                              Circuit: {ACC_TRACKS[setup.trackKey] || setup.parsedData.trackName || "Unknown Track"}
                            </div>
                            {/* Line 3: Filename / Path */}
                            <div className="text-[9px] text-zinc-400 font-mono truncate max-w-[280px] mt-0.5" title={setup.relativePath || setup.fileName}>
                              File: {setup.relativePath || setup.fileName}
                            </div>
                            
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {hasTrackUnknown && (
                                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold">
                                  ⚠️ Circuit Unspecified
                                </span>
                              )}
                              {hasCarUnknown && (
                                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold">
                                  ⚠️ Car Unspecified
                                </span>
                              )}
                              {!hasTrackUnknown && !hasCarUnknown && (
                                <span className="bg-red-50 border border-red-200 text-red-655 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                                  ✓ Identified
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setPendingSetups(prev => prev.filter(item => item.id !== setup.id));
                            }}
                            className="text-zinc-400 hover:text-red-600 p-1 rounded hover:bg-zinc-50 transition-colors cursor-pointer shrink-0"
                            title="Discard from upload"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Edit Form Fields */}
                        <div className="grid grid-cols-1 gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-200 text-xs">
                          <div>
                            <label className="text-zinc-500 text-[9px] font-mono block uppercase">Friendly Setup Name</label>
                            <input
                              type="text"
                              value={setup.customName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPendingSetups(prev => prev.map(item => item.id === setup.id ? { ...item, customName: val } : item));
                              }}
                              className="bg-white border border-zinc-350 text-[11px] p-1.5 mt-0.5 rounded text-zinc-900 focus:outline-none focus:border-red-600 w-full"
                              placeholder="Setup Name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-zinc-500 text-[9px] font-mono block uppercase">Car Model</label>
                              <select
                                value={setup.carKey}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingSetups(prev => prev.map(item => item.id === setup.id ? { ...item, carKey: val } : item));
                                }}
                                className={`bg-white border text-[10px] p-1.5 mt-0.5 rounded focus:outline-none w-full ${hasCarUnknown ? "border-amber-500 text-amber-700" : "border-zinc-300 text-zinc-800"}`}
                              >
                                <option value="unknown">Unknown Car</option>
                                {Object.entries(ACC_CARS).map(([key, name]) => (
                                  <option key={key} value={key}>{name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-zinc-500 text-[9px] font-mono block uppercase">Track / Circuit</label>
                              <select
                                value={setup.trackKey}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingSetups(prev => prev.map(item => item.id === setup.id ? { ...item, trackKey: val } : item));
                                }}
                                className={`bg-white border text-[10px] p-1.5 mt-0.5 rounded focus:outline-none w-full ${hasTrackUnknown ? "border-amber-500 text-amber-700" : "border-zinc-300 text-zinc-800"}`}
                              >
                                <option value="unknown">Unknown Circuit</option>
                                {Object.entries(ACC_TRACKS).map(([key, name]) => (
                                  <option key={key} value={key}>{name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-zinc-500 text-[9px] font-mono block uppercase">Individual Notes</label>
                            <input
                              type="text"
                              value={setup.notes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPendingSetups(prev => prev.map(item => item.id === setup.id ? { ...item, notes: val } : item));
                              }}
                              className="bg-white border text-[10px] p-1.5 mt-0.5 rounded text-zinc-800 border-zinc-300 focus:outline-none focus:border-red-600 w-full"
                              placeholder="Setup notes (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {uploadError && (
                  <div className="text-xs bg-red-50 border border-red-200 text-red-700 p-2.5 rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <button
                  id="btn-deploy-setup"
                  onClick={handleDeploySetup}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded font-extrabold text-xs uppercase tracking-wider font-mono cursor-pointer shadow-md"
                >
                  Deploy {pendingSetups.length} Setup(s) to Team Registry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* D. Setup Registry Database List & GitHub Syncer */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
            {/* Header Tabs switcher */}
            <div className="flex bg-zinc-50 border-b border-zinc-200">
              <button
                id="tab-btn-github-sync"
                onClick={() => setActiveGarageTab("github")}
                className={`flex-1 text-center py-3 font-mono text-[10px] sm:text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeGarageTab === "github"
                    ? "bg-white text-red-655 border-b-2 border-red-600 font-extrabold"
                    : "text-zinc-550 hover:text-zinc-900 font-semibold"
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                GITHUB CLOUD SYNC {githubTree.length > 0 && `(${githubMatches.length})`}
              </button>
              <button
                id="tab-btn-team-garage"
                onClick={() => setActiveGarageTab("team")}
                className={`flex-1 text-center py-3 font-mono text-[10px] sm:text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeGarageTab === "team"
                    ? "bg-white text-red-655 border-b-2 border-red-600 font-extrabold"
                    : "text-zinc-550 hover:text-zinc-900 font-semibold"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                TEAM WORKSPACE ({filteredSetups.length})
              </button>
            </div>

            {activeGarageTab === "team" ? (
              <div id="setup-registry-list" className="max-h-[380px] overflow-y-auto divide-y divide-zinc-150">
                {filteredSetups.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No setups matched current filters.
                  </div>
                ) : (
                  filteredSetups.map((setup) => {
                    const isActive = activeSetup?.id === setup.id;
                    return (
                      <div
                        key={setup.id}
                        onClick={() => {
                          setActiveSetup(setup);
                          if (window.innerWidth < 1024) {
                            setTimeout(() => {
                              document.getElementById("column-inspection-engineer")?.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }
                        }}
                        className={`p-3.5 hover:bg-zinc-50 transition-all cursor-pointer flex items-start justify-between gap-2 group ${isActive ? "bg-red-50/60 border-l-4 border-red-600" : "bg-white"}`}
                      >
                        <div className="min-w-0 flex-1">
                          {/* Line 1: Identified Car Name Header */}
                          <div className={`font-bold text-xs truncate max-w-[280px] tracking-tight group-hover:text-red-650 ${isActive ? "text-red-750 font-black" : "text-zinc-900"}`}>
                            {ACC_CARS[setup.car] || setup.car || "Unknown Car"}
                          </div>
                          {/* Line 2: Track / Circuit */}
                          <div className={`text-[10px] font-semibold truncate max-w-[280px] mt-0.5 ${isActive ? "text-zinc-700" : "text-zinc-500"}`}>
                            Circuit: {ACC_TRACKS[setup.track] || setup.track || "Unknown Track"}
                          </div>
                          {/* Line 3: Filename / Name */}
                          <div className={`text-[9px] font-mono truncate max-w-[280px] mt-0.5 ${isActive ? "text-zinc-500" : "text-zinc-400"}`}>
                            Setup: {setup.name}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`download-setup-btn-${setup.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadOriginalJson(setup);
                            }}
                            title="Download source JSON"
                            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-500 hover:text-red-650 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Only original authors or lead uploader can delete setup records */}
                          <button
                            id={`delete-setup-btn-${setup.id}`}
                            onClick={(e) => handleDeleteSetup(setup.id, e)}
                            title="Delete from list"
                            className="p-1.5 rounded hover:bg-zinc-200 text-zinc-500 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-4 max-h-[500px] overflow-y-auto w-full">
                {githubStatus === "loading" && (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3 py-6 shadow-xs">
                    <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
                    <div className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                      Auto-Syncing Communities...
                    </div>
                    <p className="text-[10px] text-zinc-500 max-w-[220px]">
                      Fetching unified racing setups from Temetias (League) & Lon3035 (Community) repos.
                    </p>
                  </div>
                )}

                {githubStatus === "error" && githubError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-lg font-mono font-medium shadow-xs">
                    <div className="font-bold uppercase tracking-wider text-[9px] text-red-800 mb-1">⚠️ Community Sync Failed</div>
                    {githubError}
                  </div>
                )}

                {/* Scanned Setup Files list */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-200 pb-2">
                    <span className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-zinc-600 tracking-wider">
                      🌍 Remote Community Search Results
                      {githubStatus === "connected" && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Synchronized Live" />
                      )}
                    </span>
                    <span className="font-bold text-zinc-650">{githubMatches.length} items found</span>
                  </div>

                  {githubTree.length === 0 && githubStatus !== "loading" ? (
                    <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
                      <Terminal className="w-6 h-6 mx-auto mb-2 opacity-35 text-red-650 animate-pulse" />
                      <p className="text-[11px] leading-relaxed max-w-[240px] mx-auto font-medium text-zinc-600">
                        Select this tab to automatically sync ACC setups across all leading racing registries!
                      </p>
                    </div>
                  ) : githubMatches.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800/60 rounded">
                      <Info className="w-5 h-5 mx-auto mb-2 opacity-40 text-emerald-400" />
                      <p className="text-[10px] max-w-[240px] mx-auto leading-relaxed">
                        No setups match active filters (<strong className="text-zinc-400">{carFilter === "all" ? "All Cars" : ACC_CARS[carFilter] || carFilter}</strong> @ <strong className="text-zinc-400">{trackFilter === "all" ? "All Tracks" : ACC_TRACKS[trackFilter] || trackFilter}</strong>). Adjust filters to discover matches!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-zinc-850/50 max-h-[300px] overflow-y-auto w-full">
                      {githubMatches.map((item, index) => {
                        const isThisImporting = isImportingFromGithub === item.path;
                        const hasGrade = item.meta.grade !== undefined;
                        return (
                          <div key={index} className="py-2.5 flex items-start justify-between gap-3 group text-xs w-full min-w-0">
                            <div className="min-w-0 flex-1">
                              {/* 1. Header Line: Car Name parsed or from Path & Rating Display */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-zinc-900 text-[11px] truncate group-hover:text-red-655 tracking-tight">
                                  {ACC_CARS[item.carKey] || (item.carKey !== "unknown" ? item.carKey : "Unsorted Car")}
                                </span>
                                
                                {hasGrade && (
                                  <span
                                    className="font-mono text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-zinc-950 font-bold flex items-center gap-1 text-amber-500 shrink-0"
                                    title={item.meta.gradeLabel}
                                  >
                                    {item.meta.grade === 3 && "⭐⭐⭐ [LGE]"}
                                    {item.meta.grade === 2 && "⭐⭐☆ [WIP]"}
                                    {item.meta.grade === 1 && "⭐☆☆ [BAS]"}
                                    {item.meta.grade === 0 && "☆☆☆ [PRE]"}
                                  </span>
                                )}

                                {item.repo && (
                                  <span className={`font-mono text-[8.5px] px-1 rounded font-bold shrink-0 ${
                                    item.repo.toLowerCase().includes("temetias") 
                                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/35" 
                                      : item.repo.toLowerCase().includes("lon3035") 
                                      ? "bg-sky-950/40 text-sky-450 border border-sky-900/35"
                                      : "bg-zinc-850 text-zinc-350"
                                  }`}>
                                    {item.repo.split("/")[0]}
                                  </span>
                                )}
                              </div>

                              {/* 2. Track/Circuit line */}
                              <div className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                                Circuit: {ACC_TRACKS[item.trackKey] || (item.trackKey !== "unknown" ? item.trackKey : "Unsorted Circuit")}
                              </div>

                              {/* 3. Filename & Metadata badging */}
                              <div className="flex items-center gap-1 mx-0 flex-wrap mt-1 text-[9px]">
                                {item.meta.patch && (
                                  <span className="bg-zinc-850 text-zinc-400 font-mono px-1 rounded">
                                    v{item.meta.patch}
                                  </span>
                                )}
                                {item.meta.session && (
                                  <span
                                    className={`font-mono px-1 rounded font-bold ${
                                      item.meta.session.toLowerCase().includes("q")
                                        ? "bg-violet-950/40 text-violet-400 border border-violet-900/30"
                                        : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                                    }`}
                                    title={item.meta.sessionLabel}
                                  >
                                    {item.meta.session.toUpperCase()}
                                  </span>
                                )}
                                {item.meta.temp && (
                                  <span className="bg-amber-950/40 text-amber-400 border border-amber-900/25 font-mono px-1 rounded">
                                    {item.meta.temp.toUpperCase()}
                                  </span>
                                )}
                                <span className="text-zinc-500 font-mono truncate max-w-[150px] ml-0.5" title={item.path}>
                                  File: {item.fileName}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              {/* Live Inspect Button */}
                              <button
                                disabled={!!isImportingFromGithub}
                                onClick={() => handleImportGithubSetup(item.path, true, item.repo, item.branch)}
                                className="px-2 py-1 rounded bg-zinc-850 hover:bg-zinc-800 font-mono text-[9px] font-bold text-zinc-350 hover:text-white transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                              >
                                {isThisImporting ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Activity className="w-2.5 h-2.5 text-emerald-500" />
                                )}
                                INSPECT
                              </button>

                              {/* Secure Import Setup */}
                              <button
                                disabled={!!isImportingFromGithub}
                                onClick={() => handleImportGithubSetup(item.path, false, item.repo, item.branch)}
                                className="px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-950/40 font-mono text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                              >
                                {isThisImporting ? (
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Download className="w-2.5 h-2.5" />
                                )}
                                SYNC
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* E. Rule Sheets / Interactive Workbook Uploader */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsGuidePanelOpen(!isGuidePanelOpen)}
              className="w-full px-4 py-3 bg-zinc-800/40 flex items-center justify-between border-b border-zinc-800 hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Engineering Workbook</span>
              </div>
              {isGuidePanelOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {isGuidePanelOpen && (
              <div className="p-4 flex flex-col gap-4 bg-zinc-900/60">
                <div className="text-xs text-zinc-400 leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1 text-white font-semibold">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    How to Ground your pitwall:
                  </div>
                  Our AI resident engineer utilizes a core setup reference handbook of standard GT3 parameters. You can customize the AI guidance protocol by typing or importing your custom workbook file below!
                </div>

                <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded border border-zinc-850">
                  <span className="text-[10px] font-mono text-zinc-500">Workbook State</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${customGuideText ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    {customGuideText ? "CUSTOM SENSITIVITIES LOADED" : "ACC ENGINE DEFAULT ONLY"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-300 font-mono">Custom Ruleset Text</label>
                    <label className="text-[10px] text-emerald-400 underline cursor-pointer hover:text-emerald-300">
                      Import TXT
                      <input
                        type="file"
                        accept=".txt,.md"
                        onChange={handleCustomGuideFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    id="workbook-guide-textarea"
                    rows={6}
                    value={customGuideText}
                    onChange={(e) => setCustomGuideText(e.target.value)}
                    placeholder="Enter custom setup sensitivity rules, track tricks, throttle limit conditions, ARB guidelines, differential rules, etc..."
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs p-2 rounded text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-save-workbook"
                    onClick={handleSaveCustomGuide}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[11px] py-2 rounded font-bold cursor-pointer transition-colors"
                  >
                    Commit Workbook
                  </button>
                  {customGuideText && (
                    <button
                      onClick={() => {
                        setCustomGuideText("");
                        dbSaveGuide("", user?.uid || "guest");
                      }}
                      className="bg-red-950/25 hover:bg-red-950/60 border border-red-900/40 text-red-300 font-mono text-[11px] px-3 py-2 rounded transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Active Setup HTML representation & AI engineer (Span 8) */}
        <section id="column-inspection-engineer" className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          {/* Main Inspection Terminal */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden flex flex-col">
            
            {/* active setup selector header info */}
            <div className="p-5 md:p-6 bg-zinc-50 border-b border-zinc-200 flex flex-col xl:flex-row xl:items-start justify-between gap-5">
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200/60 px-2 py-0.5 rounded uppercase font-extrabold tracking-widest whitespace-nowrap inline-block">
                  ACTIVE HUD INSPECTION
                </span>
                <h2 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight leading-snug break-words">
                  {activeSetup ? activeSetup.name : "Select an ACC Setup to inspect"}
                </h2>
                <div className="text-[11.5px] text-zinc-650 font-mono font-semibold flex items-center flex-wrap gap-x-2.5 gap-y-1">
                  {activeSetup ? (
                    <>
                      <span className="text-zinc-500">Car: <strong className="text-zinc-900 font-extrabold">{ACC_CARS[activeSetup.car] || activeSetup.car}</strong></span>
                      <span className="text-zinc-300 hidden sm:inline">|</span>
                      <span className="text-zinc-500">Circuit: <strong className="text-zinc-900 font-extrabold">{ACC_TRACKS[setupFilterTrack(activeSetup.track)] || activeSetup.track}</strong></span>
                    </>
                  ) : (
                    "Upload or click a setup in the team garage registry to view telemetry analytics"
                  )}
                </div>
              </div>

              {activeSetup && (
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 xl:pt-0 border-t border-zinc-200/60 xl:border-none w-full xl:w-auto">
                  <div className="flex items-center gap-2 bg-white border border-zinc-250 px-3 py-1.5 rounded-lg shadow-3xs hover:border-zinc-350 transition-colors w-full sm:w-auto">
                    <span className="text-[10px] font-mono text-zinc-500 font-extrabold uppercase shrink-0">REF VEHICLE:</span>
                    <select
                      className="bg-transparent border-none text-zinc-905 font-mono font-bold text-[11px] cursor-pointer focus:ring-0 outline-none p-0 pr-6 w-full shadow-none"
                      value={activeSetup.car}
                      onChange={(e) => handleSelectReferenceCar(e.target.value)}
                    >
                      {Object.entries(cars).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {profile && (
                    <button
                      id="tune-mode-toggle"
                      onClick={() => {
                        if (!isTuneMode) {
                          const cloned = JSON.parse(JSON.stringify(activeSetup.rawData || {}));
                          setTunedRawData(cloned);
                          setTuneVersionNote("");
                          setTuneIsTeamWorkspace(false);
                          setIsTuneMode(true);
                          showToast("Tuning session active! Tweak parameters inside the dashboard panels below.", "info");
                        } else {
                          setIsTuneMode(false);
                          setTunedRawData(null);
                        }
                      }}
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3.5 sm:py-2 rounded-lg border text-[11px] font-mono font-black shadow-3xs transition-all cursor-pointer h-10 w-full sm:w-auto ${
                        isTuneMode 
                          ? "bg-amber-600 border-amber-700 text-white hover:bg-amber-700" 
                          : "bg-white border-zinc-250 text-amber-700 hover:border-amber-300 hover:bg-amber-50/20"
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5 mr-0.5" />
                      {isTuneMode ? "Exit Tune Mode" : "Tune Parameters"}
                    </button>
                  )}
                  <button
                    id="active-setup-download-original"
                    onClick={() => handleDownloadOriginalJson(activeSetup)}
                    className="flex items-center justify-center gap-1.5 bg-zinc-50 text-zinc-700 hover:text-red-655 px-4 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-zinc-250 hover:border-red-350 text-[11px] font-mono font-black shadow-3xs transition-all cursor-pointer h-10 w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5 mr-0.5" />
                    Extract Setup .json
                  </button>
                </div>
              )}
            </div>

            {activeSetup && parsedActiveSetup ? (
              <div className="flex-1 flex flex-col">
                
                {/* Active Tuning Workshop Save Banner */}
                {isTuneMode && (
                  <div className="bg-amber-500/10 border-b border-amber-500/30 p-4 shrink-0 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-500 text-black p-2 rounded-md shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-amber-600 uppercase tracking-wider text-[11px]">Active Tuning Workshop Mode</h4>
                        <p className="text-[10px] text-zinc-650 mt-0.5 leading-tight">Modify values using +/- controls inside the Tyre pressures, Electronics, and Mechanical sections.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Version note (e.g. Sunset cooling adjustment)"
                          value={tuneVersionNote}
                          onChange={(e) => setTuneVersionNote(e.target.value)}
                          className="w-full bg-white border border-zinc-250 text-zinc-900 px-3 py-1.5 rounded text-base md:text-[11.5px] min-h-[44px] md:min-h-0 placeholder-zinc-400 outline-none focus:border-amber-500 animate-pulse"
                        />
                      </div>
                      
                      <label className="flex items-center gap-1.5 text-[10.5px] text-zinc-650 cursor-pointer select-none font-bold">
                        <input
                          type="checkbox"
                          checked={tuneIsTeamWorkspace}
                          onChange={(e) => setTuneIsTeamWorkspace(e.target.checked)}
                          className="accent-amber-500 w-3.5 h-3.5 rounded border-zinc-300 focus:ring-amber-550"
                        />
                        Share to Team Workspace
                      </label>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSaveCustomTunedSetup()}
                          className="bg-amber-600 hover:bg-amber-750 text-white font-extrabold px-3 py-1.5 rounded cursor-pointer transition-colors text-[10.5px] uppercase tracking-wider shadow-md active:scale-95 text-center"
                        >
                          Save Variant
                        </button>
                        <button
                          onClick={() => {
                            setIsTuneMode(false);
                            setTunedRawData(null);
                          }}
                          className="bg-zinc-200 hover:bg-zinc-300 text-zinc-705 font-extrabold px-3 py-1.5 rounded cursor-pointer transition-colors text-[10.5px] active:scale-95 text-center"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Custom Uploader Notes Accordion */}
                {activeSetup.notes && (
                  <div className="bg-red-50/45 border-b border-zinc-200 flex flex-col text-xs text-zinc-700">
                    <button
                      onClick={() => setIsCrewNotesOpen(!isCrewNotesOpen)}
                      className="w-full flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-zinc-100/50 transition-colors text-left outline-none cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className={`w-4 h-4 text-red-650 shrink-0 ${isCrewNotesOpen ? "animate-pulse" : ""}`} />
                        <span className="text-zinc-550 font-extrabold font-mono uppercase tracking-wider text-[10px] truncate">
                          Uploaded by <strong className="text-zinc-800 font-extrabold">{activeSetup.uploadedByName || "Team Lead"}</strong> • Crew Notes
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${isCrewNotesOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isCrewNotesOpen && (
                      <div className="px-4 sm:px-5 pb-3.5 pt-0.5 animate-fadeIn">
                        <span className="italic leading-relaxed font-semibold md:font-medium whitespace-pre-wrap break-words block text-zinc-805 bg-white border border-zinc-200/65 rounded-lg p-3">
                          "{activeSetup.notes}"
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Community Crew Reviews Board */}
                <div className="bg-white border-b border-zinc-200 px-4 sm:px-5 py-3.5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Aggregate rating */}
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-semibold font-mono uppercase tracking-wider text-[9px] mb-1 leading-none font-bold">Community Rating</span>
                      {activeSetupRatings.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avg = activeSetupRatings.reduce((acc, r) => acc + r.rating, 0) / activeSetupRatings.length;
                              return (
                                <Star 
                                  key={star} 
                                  className={`w-3.5 h-3.5 ${star <= Math.round(avg) ? "fill-amber-500 text-amber-500" : "text-zinc-300"}`} 
                                />
                              );
                            })}
                          </div>
                          <strong className="text-zinc-[850] font-extrabold text-sm font-mono text-zinc-900">
                            {(activeSetupRatings.reduce((acc, r) => acc + r.rating, 0) / activeSetupRatings.length).toFixed(1)} 
                            <span className="text-zinc-550 font-medium text-[11px] font-sans"> ({activeSetupRatings.length} reviews)</span>
                          </strong>
                        </div>
                      ) : (
                        <span className="text-zinc-500 font-semibold italic text-[11px] block mt-0.5">Unrated</span>
                      )}
                    </div>
                    
                    {/* Computed Active Tags */}
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-semibold font-mono uppercase tracking-wider text-[9px] mb-1 leading-none font-bold">Active Handling Tags</span>
                      <div className="flex flex-wrap gap-1 mt-0.5 min-h-[22px]">
                        {(() => {
                          const tagCounts: { [key: string]: number } = {};
                          activeSetupRatings.forEach((item) => {
                            if (item.tags) {
                              item.tags.forEach((tag) => {
                                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                              });
                            }
                          });
                          
                          const uniqueTags = Object.keys(tagCounts);
                          if (uniqueTags.length === 0) {
                            return <span className="text-zinc-400 italic text-[11px] mt-0.5 block font-medium">No community tags submitted yet</span>;
                          }
                          
                          return uniqueTags.map((tag) => (
                            <span key={tag} className="bg-zinc-100 text-zinc-805 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase flex items-center gap-1 border border-zinc-200">
                              {tag}
                              <strong className="text-red-700 bg-zinc-200/80 px-1 rounded-sm text-[9px] font-black">{tagCounts[tag]}</strong>
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Submitting deck */}
                  {profile ? (
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-zinc-50 border border-zinc-250 p-2 rounded-md shadow-3xs">
                      {/* Star Picker */}
                      <div className="flex items-center gap-1.5 shrink-0 px-1">
                        <span className="text-zinc-505 font-extrabold font-mono uppercase text-[9px] tracking-wider block shrink-0">Your Assessment:</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className="text-zinc-350 hover:text-amber-500 cursor-pointer transition-all select-none focus:outline-none"
                            >
                              <Star className={`w-4 h-4 ${star <= userRating ? "text-amber-500 fill-amber-500" : "text-zinc-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Interactive Tags Selector */}
                      <div className="flex flex-wrap items-center gap-1">
                        {["Stable", "Loose", "Curb-Friendly"].map((tag) => {
                          const isSelected = selectedReviewTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedReviewTags(selectedReviewTags.filter((t) => t !== tag));
                                } else {
                                  setSelectedReviewTags([...selectedReviewTags, tag]);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase transition-all cursor-pointer ${
                                isSelected ? "bg-red-650 text-white" : "bg-white border border-zinc-250 hover:bg-zinc-100 text-zinc-700 font-semibold"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Save Rating trigger button */}
                      <button
                        onClick={handleSaveRating}
                        disabled={isSavingRating || userRating === 0}
                        className="bg-zinc-900 hover:bg-red-650 text-white font-extrabold px-3 py-1 rounded transition-all cursor-pointer text-[10px] uppercase tracking-wider disabled:opacity-50 inline-flex items-center justify-center gap-1"
                      >
                        {isSavingRating ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <ThumbsUp className="w-3 h-3 text-white" />
                        )}
                        Submit
                      </button>
                    </div>
                  ) : (
                    <div className="text-zinc-455 font-bold font-mono text-[9px] uppercase border border-dashed border-zinc-250 p-2 rounded shrink-0">
                      Sign in to rate or tag this setup
                    </div>
                  )}
                </div>

                {/* Dashboard Tabs */}
                <div className="bg-zinc-100/85 border-b border-zinc-200 flex font-mono text-xs overflow-x-auto">
                  <button
                    id="tab-btn-tyres"
                    onClick={() => setSelectedTab("tyres")}
                    className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 ${selectedTab === "tyres" ? "border-red-600 text-red-650 bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"}`}
                  >
                    Tyres & Alignment
                  </button>
                  <button
                    id="tab-btn-electronics"
                    onClick={() => setSelectedTab("electronics")}
                    className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 ${selectedTab === "electronics" ? "border-red-600 text-red-650 bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"}`}
                  >
                    Electronics
                  </button>
                  <button
                    id="tab-btn-fuel"
                    onClick={() => setSelectedTab("fuel")}
                    className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 ${selectedTab === "fuel" ? "border-red-600 text-red-650 bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"}`}
                  >
                    Fuel Strategy
                  </button>
                  <button
                    id="tab-btn-mechanical"
                    onClick={() => setSelectedTab("mechanical")}
                    className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 ${selectedTab === "mechanical" ? "border-red-600 text-red-650 bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"}`}
                  >
                    Mechanical Grip
                  </button>
                  <button
                    id="tab-btn-dampers"
                    onClick={() => setSelectedTab("dampers")}
                    className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 ${selectedTab === "dampers" ? "border-red-600 text-red-650 bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"}`}
                  >
                    Suspension Dampers
                  </button>
                  <button
                    id="tab-btn-aero"
                    onClick={() => setSelectedTab("aero")}
                    className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors shrink-0 ${selectedTab === "aero" ? "border-red-600 text-red-650 bg-white font-black" : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"}`}
                  >
                    Aero & Ducts
                  </button>
                </div>

                {/* Tab content viewer */}
                <div className="p-5 bg-zinc-55/15 flex-1">
                  
                  {/* TAB 1: TYRES */}
                  {selectedTab === "tyres" && (
                    <div className="space-y-6 py-2">
                       {/* High level Summary Banner / Notice */}
                      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-md">
                            <Gauge className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-mono font-black text-zinc-900 uppercase tracking-wider">Tyre Operating Window Upgraded</h4>
                            <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">
                              Optimal pressure targets has been adjusted to <strong className="text-emerald-700 font-extrabold">26.5 - 27.5 PSI</strong>. Target Racing Hot: <strong className="text-zinc-900 font-extrabold">27.0 PSI</strong>.
                            </p>
                          </div>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded text-zinc-600 text-left md:text-right font-mono text-[10px] max-w-xs leading-normal font-semibold">
                          Transitioning races (e.g., 30-45m sunset races) run colder, demanding higher starting garage pressures.
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 items-stretch">
                        
                        {/* Front tyres aligning card */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <div className="border-b border-zinc-200 pb-2 mb-3.5 flex justify-between items-center">
                            <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">FRONT TYRES & ALIGNMENT (LF/RF)</span>
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">PRESSURE & CAR OUTLINES</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs text-zinc-900">
                            {/* LF Tyre Block */}
                            {(() => {
                              const basePSI = parsedActiveSetup.tyrePressures[0];
                              const displayPSI = showCompensated ? (basePSI - coolingData.compensationPSI) : basePSI;
                              return (
                                <div className={`p-4 rounded-lg border hover:border-red-650 transition-colors ${showCompensated ? "border-amber-300 bg-amber-50/5" : "bg-zinc-50 border-zinc-200"} space-y-2.5`}>
                                  <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1.5 font-black tracking-wider">LF Front Wheel</div>
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 pb-1">
                                    <span className="text-zinc-550 font-semibold text-xs">Tyre Pressure:</span>
                                    <div className="flex items-center gap-1.5">
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", -1, 0)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Decrease Pressure 0.1 PSI"
                                        >
                                          -
                                        </button>
                                      )}
                                      <strong className={`font-mono font-bold text-sm ${getPressureColor(displayPSI)}`}>
                                        {displayPSI.toFixed(1)} PSI
                                      </strong>
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", 1, 0)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Increase Pressure 0.1 PSI"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Toe:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.toes[0]}°</strong>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Camber:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.cambers[0]}°</strong>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-550">Caster:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.casters[0]}°</strong>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* RF Tyre Block */}
                            {(() => {
                              const basePSI = parsedActiveSetup.tyrePressures[1];
                              const displayPSI = showCompensated ? (basePSI - coolingData.compensationPSI) : basePSI;
                              return (
                                <div className={`p-4 rounded-lg border hover:border-red-650 transition-colors ${showCompensated ? "border-amber-300 bg-amber-50/5" : "bg-zinc-50 border-zinc-200"} space-y-2.5`}>
                                  <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1.5 font-black tracking-wider">RF Front Wheel</div>
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 pb-1">
                                    <span className="text-zinc-550 font-semibold text-xs">Tyre Pressure:</span>
                                    <div className="flex items-center gap-1.5">
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", -1, 1)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Decrease Pressure 0.1 PSI"
                                        >
                                          -
                                        </button>
                                      )}
                                      <strong className={`font-mono font-bold text-sm ${getPressureColor(displayPSI)}`}>
                                        {displayPSI.toFixed(1)} PSI
                                      </strong>
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", 1, 1)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Increase Pressure 0.1 PSI"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Toe:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.toes[1]}°</strong>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Camber:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.cambers[1]}°</strong>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-555">Caster:</span>
                                    <strong className="text-zinc-955 font-extrabold">{parsedActiveSetup.casters[1]}°</strong>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Rear tyres aligning card */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <div className="border-b border-zinc-200 pb-2 mb-3.5 flex justify-between items-center">
                            <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">REAR TYRES & ALIGNMENT (LR/RR)</span>
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">PRESSURE & CAR OUTLINES</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs text-zinc-900">
                            {/* LR Tyre Block */}
                            {(() => {
                              const basePSI = parsedActiveSetup.tyrePressures[2];
                              const displayPSI = showCompensated ? (basePSI - coolingData.compensationPSI) : basePSI;
                              return (
                                <div className={`p-4 rounded-lg border hover:border-red-650 transition-colors ${showCompensated ? "border-amber-300 bg-amber-50/5" : "bg-zinc-50 border-zinc-200"} space-y-2.5`}>
                                  <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1.5 font-black tracking-wider">LR Rear Wheel</div>
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 pb-1">
                                    <span className="text-zinc-550 font-semibold text-xs">Tyre Pressure:</span>
                                    <div className="flex items-center gap-1.5">
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", -1, 2)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Decrease Pressure 0.1 PSI"
                                        >
                                          -
                                        </button>
                                      )}
                                      <strong className={`font-mono font-bold text-sm ${getPressureColor(displayPSI)}`}>
                                        {displayPSI.toFixed(1)} PSI
                                      </strong>
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", 1, 2)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Increase Pressure 0.1 PSI"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Toe:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.toes[2]}°</strong>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Camber:</span>
                                    <strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.cambers[2]}°</strong>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* RR Tyre Block */}
                            {(() => {
                              const basePSI = parsedActiveSetup.tyrePressures[3];
                              const displayPSI = showCompensated ? (basePSI - coolingData.compensationPSI) : basePSI;
                              return (
                                <div className={`p-4 rounded-lg border hover:border-red-650 transition-colors ${showCompensated ? "border-amber-300 bg-amber-50/5" : "bg-zinc-50 border-zinc-200"} space-y-2.5`}>
                                  <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1.5 font-black tracking-wider">RR Rear Wheel</div>
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 pb-1">
                                    <span className="text-zinc-550 font-semibold text-xs">Tyre Pressure:</span>
                                    <div className="flex items-center gap-1.5">
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", -1, 3)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Decrease Pressure 0.1 PSI"
                                        >
                                          -
                                        </button>
                                      )}
                                      <strong className={`font-mono font-bold text-sm ${getPressureColor(displayPSI)}`}>
                                        {displayPSI.toFixed(1)} PSI
                                      </strong>
                                      {isTuneMode && (
                                        <button
                                          onClick={() => handleAdjustSetupValue("tyrePressure", 1, 3)}
                                          className="w-11 h-11 flex items-center justify-center bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 rounded-lg text-sm font-black cursor-pointer active:scale-95 select-none text-zinc-800 font-mono"
                                          title="Increase Pressure 0.1 PSI"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Toe:</span>
                                    <strong className="text-zinc-955 font-extrabold">{parsedActiveSetup.toes[3]}°</strong>
                                  </div>
                                  <div className="flex flex-col sm:flex-row justify-between gap-1 text-xs">
                                    <span className="text-zinc-500">Camber:</span>
                                    <strong className="text-zinc-955 font-extrabold">{parsedActiveSetup.cambers[3]}°</strong>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Interactive Toggle for Display mode at bottom of grids */}
                        <div className="w-full bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <button
                            onClick={() => setShowCompensated(!showCompensated)}
                            className={`w-full py-2.5 px-3 rounded text-[10px] font-mono font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              showCompensated 
                                ? "bg-amber-50 text-amber-805 border border-amber-300 hover:bg-amber-100 font-black shadow-xs" 
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-805 border border-zinc-250 shadow-xs"
                            }`}
                          >
                            {showCompensated ? "Showing Simulated Transition Pressures" : "Showing Baseline Setup Pressures"}
                            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${showCompensated ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                          </button>

                          {showCompensated && (
                            <div className="text-[10px] text-center text-amber-900 mt-2 p-2 bg-amber-50/80 rounded border border-amber-200 font-mono font-semibold">
                              ⚠ Thermal pressure loss simulated. Notice tyres falling into the <strong className="text-sky-700">blue/underinflated</strong> zone as track temperature cools down.
                            </div>
                          )}
                        </div>

                        {/* Bottom: Night Transition and Cold Pressure Calculator (Full Width) */}
                        <div className="w-full space-y-5 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm text-zinc-900">
                          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="text-red-600 w-4 h-4" />
                              <h3 className="text-xs font-mono font-extrabold text-zinc-900 uppercase tracking-wider">
                                Transitional Sunset & Night Calculator
                              </h3>
                            </div>
                            <span className="text-[9px] font-mono bg-zinc-50 px-2 py-0.5 rounded text-zinc-600 border border-zinc-200 font-bold">
                              THERMAL BEHAVIOR ENGINE v1.9
                            </span>
                          </div>

                          {/* Interactive Controls Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Column 1: Time of Day Selector */}
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5 font-bold">
                                Race Starting Time Of Day
                              </label>
                              <select
                                value={transitionTimeStart}
                                onChange={(e) => {
                                  setTransitionTimeStart(e.target.value);
                                  setShowCompensated(true);
                                }}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded font-mono text-xs text-zinc-800 p-2 hover:border-zinc-350 focus:outline-none cursor-pointer font-bold shadow-xs"
                              >
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
                                  const isSunset = i === 17 || i === 18 || i === 19;
                                  return (
                                    <option key={hourStr} value={hourStr}>
                                      {hourStr} {isSunset ? "🌇 (Sunset Transition)" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Column 2: Race Duration */}
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5 font-bold">
                                Race Duration (Hours and Minutes)
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1.5 rounded border border-zinc-200 focus-within:border-red-250">
                                  <span className="text-[10px] font-mono text-zinc-500 font-bold">HRS:</span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={24}
                                    value={durationHours}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setDurationHours(val);
                                      setTransitionDuration(val * 60 + durationMinutes);
                                      setShowCompensated(true);
                                    }}
                                    className="bg-transparent text-zinc-900 font-mono w-full text-xs text-center font-bold focus:outline-none placeholder-zinc-350"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1.5 rounded border border-zinc-200 focus-within:border-red-250">
                                  <span className="text-[10px] font-mono text-zinc-500 font-bold">MINS:</span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={durationMinutes}
                                    onChange={(e) => {
                                      const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                      setDurationMinutes(val);
                                      setTransitionDuration(durationHours * 60 + val);
                                      setShowCompensated(true);
                                    }}
                                    className="bg-transparent text-zinc-900 font-mono w-full text-xs text-center font-bold focus:outline-none placeholder-zinc-350"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Race Start Temperatures Section Header */}
                          <div className="pt-2.5 border-t border-zinc-200">
                            <span className="text-[9.5px] font-mono font-extrabold text-zinc-550 uppercase tracking-wider block mb-2">
                              Race Start Temperatures
                            </span>
                          </div>

                          {/* Interactive Ambient/Track Temp Modifiers */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1 font-bold whitespace-nowrap">
                                <Thermometer className="w-3 h-3 text-red-600" />
                                Ambient Temp
                              </label>
                              <div className="flex items-center justify-between bg-white border border-zinc-250 rounded overflow-hidden h-9">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransitionAmbientTemp(prev => Math.max(10, prev - 1));
                                    setShowCompensated(true);
                                  }}
                                  className="px-2.5 py-2 hover:bg-zinc-100 text-zinc-500 hover:text-red-650 transition-colors border-r border-zinc-200 cursor-pointer focus:outline-none flex items-center justify-center h-full"
                                  title="Decrease ambient temperature"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="flex-1 text-center font-mono text-xs font-bold text-zinc-900 select-none">
                                  {transitionAmbientTemp}°C
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransitionAmbientTemp(prev => Math.min(40, prev + 1));
                                    setShowCompensated(true);
                                  }}
                                  className="px-2.5 py-2 hover:bg-zinc-105 text-zinc-500 hover:text-red-650 transition-colors border-l border-zinc-200 cursor-pointer focus:outline-none flex items-center justify-center h-full"
                                  title="Increase ambient temperature"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1 font-bold whitespace-nowrap">
                                <Thermometer className="w-3 h-3 text-blue-600" />
                                Track Temp
                              </label>
                              <div className="flex items-center justify-between bg-white border border-zinc-250 rounded overflow-hidden h-9">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransitionTrackTemp(prev => Math.max(10, prev - 1));
                                    setShowCompensated(true);
                                  }}
                                  className="px-2.5 py-2 hover:bg-zinc-100 text-zinc-500 hover:text-blue-650 transition-colors border-r border-zinc-200 cursor-pointer focus:outline-none flex items-center justify-center h-full"
                                  title="Decrease track temperature"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="flex-1 text-center font-mono text-xs font-bold text-zinc-900 select-none">
                                  {transitionTrackTemp}°C
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransitionTrackTemp(prev => Math.min(60, prev + 1));
                                    setShowCompensated(true);
                                  }}
                                  className="px-2.5 py-2 hover:bg-zinc-105 text-zinc-500 hover:text-blue-650 transition-colors border-l border-zinc-200 cursor-pointer focus:outline-none flex items-center justify-center h-full"
                                  title="Increase track temperature"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Calculator Results Board */}
                          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-3.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-200 pb-2">
                              <span className="text-[9.5px] font-mono text-zinc-650 uppercase font-bold">Session Thermal Evolution</span>
                              <span className="text-[10.5px] font-mono text-amber-800 font-extrabold flex items-center gap-1">
                                {parseInt(transitionTimeStart.split(":")[0]) >= 16 && parseInt(transitionTimeStart.split(":")[0]) < 21 ? (
                                  <>🌅 {coolingData.coolingType}</>
                                ) : parseInt(transitionTimeStart.split(":")[0]) >= 21 || parseInt(transitionTimeStart.split(":")[0]) < 5 ? (
                                  <>🌙 {coolingData.coolingType}</>
                                ) : (
                                  <>☀️ {coolingData.coolingType}</>
                                )}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                              {(() => {
                                const val = coolingData.ambientDrop;
                                const isLoss = val >= 0;
                                return (
                                  <div className="bg-white p-2.5 rounded border border-zinc-200 shadow-xs">
                                    <span className="text-[8.5px] font-mono text-zinc-550 uppercase block tracking-wider font-bold">
                                      {isLoss ? "Est. Ambient Drop" : "Est. Ambient Rise"}
                                    </span>
                                    <span className={`text-sm font-mono font-black ${isLoss ? "text-emerald-700" : "text-amber-600"}`}>
                                      {isLoss ? "-" : "+"}{Math.abs(val).toFixed(1)}°C
                                    </span>
                                    <span className="text-[8.5px] font-mono text-zinc-500 block mt-0.5">
                                      Finish: {(transitionAmbientTemp - val).toFixed(1)}°C
                                    </span>
                                  </div>
                                );
                              })()}

                              {(() => {
                                const val = coolingData.trackDrop;
                                const isLoss = val >= 0;
                                return (
                                  <div className="bg-white p-2.5 rounded border border-zinc-200 shadow-xs">
                                    <span className="text-[8.5px] font-mono text-zinc-550 uppercase block tracking-wider font-bold">
                                      {isLoss ? "Est. Track Drop" : "Est. Track Rise"}
                                    </span>
                                    <span className={`text-sm font-mono font-black ${isLoss ? "text-blue-700" : "text-orange-600"}`}>
                                      {isLoss ? "-" : "+"}{Math.abs(val).toFixed(1)}°C
                                    </span>
                                    <span className="text-[8.5px] font-mono text-zinc-500 block mt-0.5">
                                      Finish: {(transitionTrackTemp - val).toFixed(1)}°C
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Prescribed Action Block */}
                            {(() => {
                              const isWarming = coolingData.trackDrop < 0 || coolingData.ambientDrop < 0;
                              const isPositiveComp = coolingData.compensationPSI >= 0;
                              const compensationSign = isPositiveComp ? "+" : "-";
                              const absCompValue = Math.abs(coolingData.compensationPSI);
                              const absClicks = Math.round(absCompValue * 10);
                              
                              const actionWord = isPositiveComp ? "INCREASE" : "DECREASE";
                              const actionColorClass = isPositiveComp ? "text-red-655" : "text-blue-655";
                              
                              const trendTerm = isWarming ? "warm" : "cool";
                              const thermalEffect = isWarming 
                                ? "thermal expansion increases active tyre pressures" 
                                : "cold air contraction reduces dynamic thermal inflation";
                              
                              return (
                                <div className="bg-amber-50 border border-amber-250 rounded-md p-3.5">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <AlertTriangle className="text-amber-800 w-4 h-4 shrink-0" />
                                    <h4 className="text-[10px] font-mono font-black text-amber-900 uppercase tracking-wider">
                                      Prescribed starting cold inflation compensation ({isPositiveComp ? "Positive Offset" : "Negative Offset"})
                                    </h4>
                                  </div>
                                  <p className="text-[10px] text-zinc-805 leading-normal font-mono">
                                    In {transitionDuration}m races under {trendTerm}-trending track conditions, {thermalEffect}. To hit the optimal <strong className="text-emerald-700 font-extrabold text-[10.5px]">26.5 - 27.5 PSI</strong> sweet spot, you must <strong className={`${actionColorClass} font-black underline`}>{actionWord} cold inflations by {compensationSign}{absCompValue.toFixed(1)} PSI</strong> (or <strong className="text-zinc-900 font-black">{compensationSign}{absClicks} garage clicks</strong>) per tyre!
                                  </p>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Comparative Wheel Table */}
                          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                            <div className="text-[9.5px] font-mono text-zinc-600 font-bold uppercase mb-2 px-1">
                              Starting Cold Garage Card Pressures (Transitional Adjusted)
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                              <div className="bg-white p-2 rounded border border-zinc-200 shadow-xs">
                                <div className="text-[8px] text-zinc-500 font-black uppercase">LF Tyre</div>
                                <span className="text-zinc-400 mt-1 block text-[9.5px] line-through">Def: {parsedActiveSetup.tyrePressures[0].toFixed(1)}</span>
                                <div className="text-emerald-700 font-black mt-0.5 text-[11px]">Set: {(parsedActiveSetup.tyrePressures[0] + coolingData.compensationPSI).toFixed(1)}</div>
                                <div className="text-red-655 text-[8.5px] font-bold mt-0.5">+{Math.round(coolingData.compensationPSI * 10)} Clicks</div>
                              </div>

                              <div className="bg-white p-2 rounded border border-zinc-200 shadow-xs">
                                <div className="text-[8px] text-zinc-500 font-black uppercase">RF Tyre</div>
                                <span className="text-zinc-400 mt-1 block text-[9.5px] line-through">Def: {parsedActiveSetup.tyrePressures[1].toFixed(1)}</span>
                                <div className="text-emerald-700 font-black mt-0.5 text-[11px]">Set: {(parsedActiveSetup.tyrePressures[1] + coolingData.compensationPSI).toFixed(1)}</div>
                                <div className="text-red-655 text-[8.5px] font-bold mt-0.5">+{Math.round(coolingData.compensationPSI * 10)} Clicks</div>
                              </div>

                              <div className="bg-white p-2 rounded border border-zinc-200 shadow-xs">
                                <div className="text-[8px] text-zinc-500 font-black uppercase">LR Tyre</div>
                                <span className="text-zinc-400 mt-1 block text-[9.5px] line-through">Def: {parsedActiveSetup.tyrePressures[2].toFixed(1)}</span>
                                <div className="text-emerald-700 font-black mt-0.5 text-[11px]">Set: {(parsedActiveSetup.tyrePressures[2] + coolingData.compensationPSI).toFixed(1)}</div>
                                <div className="text-red-655 text-[8.5px] font-bold mt-0.5">+{Math.round(coolingData.compensationPSI * 10)} Clicks</div>
                              </div>

                              <div className="bg-white p-2 rounded border border-zinc-200 shadow-xs">
                                <div className="text-[8px] text-zinc-500 font-black uppercase">RR Tyre</div>
                                <span className="text-zinc-400 mt-1 block text-[9.5px] line-through">Def: {parsedActiveSetup.tyrePressures[3].toFixed(1)}</span>
                                <div className="text-emerald-700 font-black mt-0.5 text-[11px]">Set: {(parsedActiveSetup.tyrePressures[3] + coolingData.compensationPSI).toFixed(1)}</div>
                                <div className="text-red-655 text-[8.5px] font-bold mt-0.5">+{Math.round(coolingData.compensationPSI * 10)} Clicks</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ELECTRONICS */}
                  {selectedTab === "electronics" && (
                    <div className="space-y-4 py-2">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-zinc-200 rounded-lg p-5 text-center shadow-sm hover:border-red-655 transition-all">
                          <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase block font-bold">Traction Control 1 (TC1)</span>
                          <div className="text-4xl font-mono font-black text-red-650 mt-2 flex items-center justify-center gap-4">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("tc1", -1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-100 border border-zinc-250 hover:bg-zinc-250 rounded-lg text-sm font-black cursor-pointer active:scale-95 text-zinc-850"
                              >
                                -
                              </button>
                            )}
                            <span className="min-w-[40px] text-center">{parsedActiveSetup.tc1}</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("tc1", 1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-100 border border-zinc-250 hover:bg-zinc-250 rounded-lg text-sm font-black cursor-pointer active:scale-95 text-zinc-850"
                              >
                                +
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-2.5 leading-relaxed bg-zinc-50 p-2 rounded-lg font-medium">
                            Initial slip detection severity. Lower is more aggressive, permitting greater slide slip angle before deployment.
                          </p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-5 text-center shadow-sm hover:border-blue-500 transition-all">
                          <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase block font-bold">Traction Control 2 (TC2 / Cut)</span>
                          <div className="text-4xl font-mono font-black text-blue-700 mt-2 flex items-center justify-center gap-4">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("tc2", -1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-100 border border-zinc-250 hover:bg-zinc-250 rounded-lg text-sm font-black cursor-pointer active:scale-95 text-zinc-850"
                              >
                                -
                              </button>
                            )}
                            <span className="min-w-[40px] text-center">{parsedActiveSetup.tc2}</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("tc2", 1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-100 border border-zinc-250 hover:bg-zinc-250 rounded-lg text-sm font-black cursor-pointer active:scale-95 text-zinc-850"
                              >
                                +
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-2.5 leading-relaxed bg-zinc-50 p-2 rounded-lg font-medium">
                            Engine torque cut depth once traction loss occurs. Higher numbers initiate deeper fuel cuts to limit wheelspin.
                          </p>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-lg p-5 text-center shadow-sm hover:border-emerald-600 transition-all">
                          <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase block font-bold">Anti-Lock Braking System (ABS)</span>
                          <div className="text-4xl font-mono font-black text-emerald-700 mt-2 flex items-center justify-center gap-4">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("abs", -1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-100 border border-zinc-250 hover:bg-zinc-250 rounded-lg text-sm font-black cursor-pointer active:scale-95 text-zinc-850"
                              >
                                -
                              </button>
                            )}
                            <span className="min-w-[40px] text-center">{parsedActiveSetup.abs}</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("abs", 1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-100 border border-zinc-250 hover:bg-zinc-250 rounded-lg text-sm font-black cursor-pointer active:scale-95 text-zinc-850"
                              >
                                +
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-2.5 leading-relaxed bg-zinc-50 p-2 rounded-lg font-medium">
                            Wheel speed lock threshold limit. Lower limits create tighter threshold braking but raise the lock up risk on bumps.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center shadow-xs">
                          <span className="text-zinc-500 font-mono text-[10px] block font-bold">ECU Engine Map</span>
                          <div className="flex items-center justify-center gap-2 mt-1.5">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("ecuMap", -1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded-lg text-base font-black cursor-pointer text-zinc-800 select-none"
                              >
                                -
                              </button>
                            )}
                            <span className="text-sm font-mono font-black text-zinc-900 mx-1">Map {parsedActiveSetup.ecuMap}</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("ecuMap", 1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded-lg text-base font-black cursor-pointer text-zinc-800 select-none"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center shadow-xs">
                          <span className="text-zinc-500 font-mono text-[10px] block font-bold">Fuel Mixture Map</span>
                          <div className="flex items-center justify-center gap-2 mt-1.5">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("fuelMap", -1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded-lg text-base font-black cursor-pointer text-zinc-800 select-none"
                              >
                                -
                              </button>
                            )}
                            <span className="text-sm font-mono font-black text-zinc-900 mx-1">Map {parsedActiveSetup.fuelMap}</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("fuelMap", 1)}
                                className="w-11 h-11 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded-lg text-base font-black cursor-pointer text-zinc-800 select-none"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center shadow-xs flex flex-col justify-center items-center">
                          <span className="text-zinc-500 font-mono text-[10px] block font-bold">Recorded Telemetry Laps</span>
                          <span className="text-sm font-black text-zinc-750 mt-1.5 block">{parsedActiveSetup.telemetryLaps} Laps</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FUEL STRATEGY */}
                  {selectedTab === "fuel" && (
                    <div className="space-y-5 py-2">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                        
                        {/* Current Load display (4 cols) */}
                        <div className="md:col-span-4 bg-white border border-zinc-200 p-5 rounded-lg flex flex-col justify-between shadow-sm text-zinc-900">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Core Loaded Fuel</span>
                             <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-700 mt-3 flex items-center gap-3">
                              {isTuneMode && (
                                <button
                                  onClick={() => handleAdjustSetupValue("fuel", -2)}
                                  className="w-11 h-11 flex items-center justify-center bg-zinc-150 hover:bg-zinc-250 border border-zinc-250 rounded-lg text-base font-black cursor-pointer active:scale-95 text-zinc-900 select-none text-center"
                                  title="Decrease Fuel 2L"
                                >
                                  -
                                </button>
                              )}
                              <span>{parsedActiveSetup.fuel} L</span>
                              {isTuneMode && (
                                <button
                                  onClick={() => handleAdjustSetupValue("fuel", 2)}
                                  className="w-11 h-11 flex items-center justify-center bg-zinc-150 hover:bg-zinc-250 border border-zinc-250 rounded-lg text-base font-black cursor-pointer active:scale-95 text-zinc-900 select-none text-center"
                                  title="Increase Fuel 2L"
                                >
                                  +
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 mt-4 leading-relaxed font-medium">
                              This setup has standard <strong className="text-zinc-900 font-bold">{parsedActiveSetup.fuel} Litres</strong> saved in the config file. (ACC defaults simple setups to 20L).
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
                            <h4 className="text-xs font-mono font-bold tracking-widest text-red-655 uppercase flex items-center gap-1.5">
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
                                  max={125}
                                  step={5}
                                  value={fuelRaceTime}
                                  onChange={(e) => setFuelRaceTime(parseInt(e.target.value))}
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
                                  min={1.0}
                                  max={5.0}
                                  step={0.05}
                                  value={fuelPerLap}
                                  onChange={(e) => setFuelPerLap(parseFloat(e.target.value))}
                                  className="w-full accent-red-600 h-1 bg-zinc-100 rounded-lg cursor-pointer"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between text-xs mb-1 font-mono">
                                  <span className="text-zinc-550 font-bold">Safety Buffer</span>
                                  <span className="text-red-700 font-bold">+{fuelSafetyLaps} Laps</span>
                                </div>
                                <div className="flex gap-1.5">
                                  {[1, 2, 3, 4].map((num) => (
                                    <button
                                      key={num}
                                      onClick={() => setFuelSafetyLaps(num)}
                                      className={`flex-1 py-1 rounded border text-xs font-mono font-bold transition-all cursor-pointer ${fuelSafetyLaps === num ? "bg-red-50 border-red-500 text-red-700 shadow-xs" : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:text-zinc-900"}`}
                                    >
                                      {num} L
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
                              <span className="text-sm sm:text-lg font-black text-zinc-900">{calculatedFuelLapTimeSec > 0 ? Math.ceil((fuelRaceTime * 60) / calculatedFuelLapTimeSec) : 0}</span>
                            </div>
                            <div className="border-r border-zinc-200 px-1">
                              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Total Laps</span>
                              <span className="text-sm sm:text-lg font-black text-red-655">
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
                            *Pit strategy recommendation: {((((calculatedFuelLapTimeSec > 0 ? Math.ceil((fuelRaceTime * 60) / calculatedFuelLapTimeSec) : 0) + fuelSafetyLaps) * fuelPerLap) > pitMaxFuelCapacity) ? `⚠️ Refuel pitstop needed: Minimum load exceeds your customized ${pitMaxFuelCapacity}L tank limit.` : "✓ Optimal run capacity: No physical mid-session refuelling breaks strictly required by tank volume."}
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
                            <p className="text-[11px] text-zinc-650 mt-0.5 font-medium">
                              Optimize starting fuel weight loadouts, stint timing, and MFD presets for 45m - 2h endurance sessions.
                            </p>
                          </div>
                          <div className="bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-220 rounded font-mono text-[10px] uppercase font-bold tracking-wider shrink-0 flex items-center gap-1.5 self-start sm:self-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            {pitStrategy.fuelWeightDifference > 0 ? `Est. Pace Advantage: -${pitStrategy.estimatedTimeGainPerLap.toFixed(2)}s/Lap` : "Optimized Fuel-Weight Profile"}
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
                                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-1 font-bold">
                                  Max Tank Capacity
                                </label>
                                <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded px-2.5 py-1 focus-within:border-red-250">
                                  <input
                                    type="number"
                                    min="20"
                                    max="140"
                                    value={pitMaxFuelCapacity}
                                    onChange={(e) => setPitMaxFuelCapacity(Math.max(20, parseInt(e.target.value) || 120))}
                                    className="w-full bg-transparent font-mono text-xs focus:outline-none text-zinc-900 text-center font-bold"
                                  />
                                  <span className="text-[10px] text-zinc-500 font-mono font-bold">L</span>
                                </div>
                              </div>

                              {/* Strategy Preference */}
                              <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-1 font-bold">
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
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5 font-bold">
                                Target Number of Pitstops
                              </span>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { label: "0 Stops", val: 0 },
                                  { label: "1 Stop", val: 1 },
                                  { label: "2 Stops", val: 2 },
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
                              <div className="bg-red-55 px-3.5 py-2.5 rounded-lg border border-red-200 text-red-750 text-[11px] font-mono font-bold flex items-center gap-2.5 shadow-sm">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                                <span>{pitStrategy.alertMsg}</span>
                              </div>
                            )}

                            {/* Visual Timeline */}
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-2.5 shadow-xs">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Planned Session Timeline</span>
                              
                              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                {pitStrategy.stints.map((stint, sIdx) => {
                                  const pct = (stint.durationMins / fuelRaceTime) * 100;
                                  return (
                                    <div key={stint.index} className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full">
                                      {/* One Stint Box */}
                                      <div className={`flex-1 p-3 rounded-lg border text-left font-mono transition-all shadow-xs ${
                                        stint.isOverfilled
                                          ? "bg-red-50 border-red-300 text-red-800"
                                          : "bg-emerald-50 border-emerald-200 text-emerald-850"
                                      }`}>
                                        <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase">
                                          <span>Stint {stint.index}</span>
                                          <span className={stint.isOverfilled ? "text-red-700" : "text-emerald-700"}>
                                            {pct.toFixed(0)}% of race
                                          </span>
                                        </div>
                                        <div className="text-sm font-black text-zinc-900 mt-1">
                                          {stint.durationMins.toFixed(0)} mins
                                        </div>
                                        <div className="text-[10px] text-zinc-600 mt-1 space-y-0.5 font-bold">
                                          <div>Laps: <strong className="text-zinc-900">{stint.laps} Laps</strong></div>
                                          <div>Fuel Onboard: <strong className={stint.isOverfilled ? "text-red-700 font-extrabold":"text-emerald-705 font-black"}>{stint.fuelNeeded.toFixed(1)} L</strong></div>
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
                                <div className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider pb-1.5 border-b border-zinc-200 flex items-center justify-between">
                                  <span>GARAGE FUEL SETUP</span>
                                  <span className="font-semibold text-emerald-700 text-[9px]">BEFORE GREEN LIGHT</span>
                                </div>
                                <div className="text-[11px] text-zinc-600 space-y-1.5 font-bold">
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
                                <div className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider pb-1.5 border-b border-zinc-200 flex items-center justify-between">
                                  <span>MFD PITSTOP PRESETS</span>
                                  <span className="font-semibold text-red-600 text-[9px]">ACC IN-CAR PRESET</span>
                                </div>
                                <div className="text-[11px] text-zinc-600 space-y-1.5 font-bold">
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
                                <div className="text-[10.5px] font-mono leading-relaxed space-y-1 text-zinc-700">
                                  <h5 className="font-black text-emerald-805 uppercase tracking-widest text-[9.5px]">
                                    ENDURANCE FUEL-WEIGHT PACE DIVIDEND
                                  </h5>
                                  <p className="font-medium">
                                    {pitStrategy.fuelWeightDifference > 0 ? (
                                      <>By splitting your race fuel into multiple stints, you avoid carrying a completely full tank of fuel. This saves <strong className="text-zinc-900 font-extrabold">{pitStrategy.fuelWeightDifference.toFixed(1)} kg</strong> of load, increasing corner roll speeds, lowering brake wear, and shaving up to <strong className="text-emerald-705 font-black">-{pitStrategy.estimatedTimeGainPerLap.toFixed(2)}s per lap</strong> off your base lap time!</>
                                    ) : (
                                      <>For short sessions or when running without pitstops, fill the tank completely with a comfort-led safety cushion. But for races 45m - 2h, selecting the 1-Stop Strategy will unleash immediate pace gains!</>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: MECHANICAL GRIP */}
                  {selectedTab === "mechanical" && (
                    <div className="space-y-4 py-2">
                      {/* Top chassis setup bar */}
                      <div className="bg-white border border-zinc-200 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-center shadow-sm text-zinc-900">
                        <div className="border-r border-zinc-200 last:border-0 pr-2 flex flex-col items-center justify-center">
                          <span className="text-zinc-500 font-mono text-[10px] uppercase block tracking-wider font-bold">Front ARB</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("arbFront", -1)}
                                className="w-4 h-4 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-black cursor-pointer text-zinc-800 select-none text-center"
                              >
                                -
                              </button>
                            )}
                            <span className="text-2xl font-mono font-extrabold text-zinc-900">{parsedActiveSetup.arbFront}</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("arbFront", 1)}
                                className="w-4 h-4 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-black cursor-pointer text-zinc-800 select-none text-center"
                              >
                                +
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5 font-medium">Anti-Roll Bar Steps</span>
                        </div>
                        <div className="border-r border-zinc-200 last:border-0 px-2">
                          <span className="text-zinc-500 font-mono text-[10px] uppercase block tracking-wider font-bold">Brake Power</span>
                          <span className="text-2xl font-mono font-extrabold text-emerald-600">{parsedActiveSetup.brakePower}%</span>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5 font-medium">Max Decel Torque</span>
                        </div>
                        <div className="border-r border-zinc-200 last:border-0 px-2">
                          <span className="text-zinc-500 font-mono text-[10px] uppercase block tracking-wider font-bold">Brake Bias</span>
                          <span className="text-2xl font-mono font-extrabold text-blue-600">{parsedActiveSetup.brakeBias}%</span>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5 font-medium">Front Offset Balance</span>
                        </div>
                        <div className="px-2 flex flex-col items-center justify-center">
                          <span className="text-zinc-500 font-mono text-[10px] uppercase block tracking-wider font-bold">Steer Ratio</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("steerRatio", -1)}
                                className="w-4 h-4 flex items-center justify-center bg-zinc-205 border hover:bg-zinc-350 rounded text-[10px] font-black cursor-pointer text-zinc-800"
                              >
                                -
                              </button>
                            )}
                            <span className="text-2xl font-mono font-extrabold text-amber-600">{parsedActiveSetup.steerRatio}:1</span>
                            {isTuneMode && (
                              <button
                                onClick={() => handleAdjustSetupValue("steerRatio", 1)}
                                className="w-4 h-4 flex items-center justify-center bg-zinc-205 border hover:bg-zinc-350 rounded text-[10px] font-black cursor-pointer text-zinc-800"
                              >
                                +
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5 font-medium">Lock-to-Lock ratio</span>
                        </div>
                      </div>

                      {/* 4 Corners Grid representing wheels rates, bumpstop rate and bumpstop range */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <div className="border-b border-zinc-200 pb-2 mb-3 flex justify-between items-center">
                            <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">FRONT WHEELS (LF/RF)</span>
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">FRONT AXLE SPRING RATES</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200">
                              <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">LF Wheel</span>
                              <div className="mt-1.5 space-y-1 font-mono text-xs font-semibold">
                                <div className="flex justify-between"><span className="text-zinc-600 font-normal">Wheel Rate:</span><strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.wheelRates[0]} N/m</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-600 font-normal">Bumpstop Rate:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpstopRates[0]} N/mm</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-650 font-normal">Bumpstop Range:</span><strong className="text-amber-700 font-bold">{parsedActiveSetup.bumpstopRanges[0]} mm</strong></div>
                              </div>
                            </div>
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200">
                              <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">RF Wheel</span>
                              <div className="mt-1.5 space-y-1 font-mono text-xs font-semibold">
                                <div className="flex justify-between"><span className="text-zinc-600 font-normal">Wheel Rate:</span><strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.wheelRates[1]} N/m</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-600 font-normal">Bumpstop Rate:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpstopRates[1]} N/mm</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-650 font-normal">Bumpstop Range:</span><strong className="text-amber-700 font-bold">{parsedActiveSetup.bumpstopRanges[1]} mm</strong></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <div className="border-b border-zinc-200 pb-2 mb-3 flex justify-between items-center">
                            <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">REAR WHEELS (LR/RR)</span>
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">REAR AXLE SPRING RATES</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200">
                              <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">LR Wheel</span>
                              <div className="mt-1.5 space-y-1 font-mono text-xs font-semibold">
                                <div className="flex justify-between"><span className="text-zinc-655 font-normal">Wheel Rate:</span><strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.wheelRates[2]} N/m</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-655 font-normal">Bumpstop Rate:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpstopRates[2]} N/mm</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-655 font-normal text-amber-700">Bumpstop Range:</span><strong className="text-amber-700 font-bold">{parsedActiveSetup.bumpstopRanges[2]} mm</strong></div>
                              </div>
                            </div>
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200">
                              <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">RR Wheel</span>
                              <div className="mt-1.5 space-y-1 font-mono text-xs font-semibold">
                                <div className="flex justify-between"><span className="text-zinc-650 font-normal">Wheel Rate:</span><strong className="text-zinc-950 font-extrabold">{parsedActiveSetup.wheelRates[3]} N/m</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-650 font-normal">Bumpstop Rate:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpstopRates[3]} N/mm</strong></div>
                                <div className="flex justify-between"><span className="text-zinc-650 font-normal text-amber-700">Bumpstop Range:</span><strong className="text-amber-700 font-bold">{parsedActiveSetup.bumpstopRanges[3]} mm</strong></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rear stabilizers and Diff Preload */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg flex justify-between items-center font-mono shadow-sm">
                          <div>
                            <span className="text-zinc-500 text-[10px] uppercase block font-bold">Rear Anti-Roll Bar (Rear ARB)</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isTuneMode && (
                                <button
                                  onClick={() => handleAdjustSetupValue("arbRear", -1)}
                                  className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                >
                                  -
                                </button>
                              )}
                              <span className="text-xl font-extrabold text-zinc-900">{parsedActiveSetup.arbRear}</span>
                              {isTuneMode && (
                                <button
                                  onClick={() => handleAdjustSetupValue("arbRear", 1)}
                                  className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 max-w-[200px] text-right font-medium font-sans">Rear lateral roll resistance step settings.</span>
                        </div>
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg flex justify-between items-center font-mono shadow-sm">
                          <div>
                            <span className="text-zinc-500 text-[10px] uppercase block font-bold">Diff Preload Torque</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isTuneMode && (
                                <button
                                  onClick={() => handleAdjustSetupValue("preloadDifferential", -10)}
                                  className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                  title="Decrease Preload 10 Nm"
                                >
                                  -
                                </button>
                              )}
                              <span className="text-xl font-extrabold text-amber-705">{parsedActiveSetup.preloadDifferential} Nm</span>
                              {isTuneMode && (
                                <button
                                  onClick={() => handleAdjustSetupValue("preloadDifferential", 10)}
                                  className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                  title="Increase Preload 10 Nm"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-505 max-w-[200px] text-right font-medium font-sans">Clutch spring threshold to lock the rear differential.</span>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5: AERO & DUCTS */}
                  {selectedTab === "aero" && (
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Front Aero */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="border-b border-zinc-200 pb-2 mb-3 flex justify-between items-center">
                              <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">FRONT AERODYNAMICS & DUCTS</span>
                              <span className="text-[10px] font-mono font-bold text-zinc-400">GRIP INPUTS</span>
                            </div>
                            <div className="space-y-3 font-mono text-xs">
                              <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-semibold items-center">
                                <span className="text-zinc-500 font-sans font-medium">Front Ride Height:</span>
                                <strong className="text-base text-emerald-700 font-extrabold">{parsedActiveSetup.rideHeights[0]} mm</strong>
                              </div>
                              <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-semibold items-center">
                                <span className="text-zinc-500 font-sans font-medium">Front Splitter:</span>
                                <strong className="text-zinc-900 text-sm font-extrabold">{parsedActiveSetup.splitter}°</strong>
                              </div>
                              <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-bold items-center">
                                <span className="text-zinc-500 font-sans font-medium">Front Brake Duct:</span>
                                <div className="flex items-center gap-1.5">
                                  {isTuneMode && (
                                    <button
                                      onClick={() => handleAdjustSetupValue("brakeDuctFront", -1)}
                                      className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                    >
                                      -
                                    </button>
                                  )}
                                  <strong className="text-blue-700 text-sm font-extrabold">Size {parsedActiveSetup.brakeDucts[0]} / 6</strong>
                                  {isTuneMode && (
                                    <button
                                      onClick={() => handleAdjustSetupValue("brakeDuctFront", 1)}
                                      className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-3 pt-3 border-t border-zinc-200 font-sans leading-relaxed font-semibold">
                            Lowers static nose height to force air over hood creating downforce, cooling tires via Front Brake Ducts.
                          </div>
                        </div>

                        {/* Rear Aero */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="border-b border-zinc-200 pb-2 mb-3 flex justify-between items-center">
                              <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">REAR AERODYNAMICS & DUCTS</span>
                              <span className="text-[10px] font-mono font-bold text-zinc-400">DOWNFORCE STABILITY</span>
                            </div>
                            <div className="space-y-3 font-mono text-xs">
                              <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-semibold items-center">
                                <span className="text-zinc-500 font-sans font-medium">Rear Ride Height:</span>
                                <strong className="text-base text-orange-600 font-extrabold">{parsedActiveSetup.rideHeights[1]} mm</strong>
                              </div>
                              <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-semibold items-center">
                                <span className="text-zinc-500 font-sans font-medium">Aero (Rear Wing Angle):</span>
                                <div className="flex items-center gap-1.5">
                                  {isTuneMode && (
                                    <button
                                      onClick={() => handleAdjustSetupValue("rearWing", -1)}
                                      className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                    >
                                      -
                                    </button>
                                  )}
                                  <strong className="text-zinc-900 text-sm font-extrabold">{parsedActiveSetup.rearWing}°</strong>
                                  {isTuneMode && (
                                    <button
                                      onClick={() => handleAdjustSetupValue("rearWing", 1)}
                                      className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between bg-zinc-50 border border-zinc-200 p-2 rounded text-zinc-900 font-bold items-center">
                                <span className="text-zinc-500 font-sans font-medium">Rear Brake Duct:</span>
                                <div className="flex items-center gap-1.5">
                                  {isTuneMode && (
                                    <button
                                      onClick={() => handleAdjustSetupValue("brakeDuctRear", -1)}
                                      className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                    >
                                      -
                                    </button>
                                  )}
                                  <strong className="text-blue-700 text-sm font-extrabold font-bold">Size {parsedActiveSetup.brakeDucts[1]} / 6</strong>
                                  {isTuneMode && (
                                    <button
                                      onClick={() => handleAdjustSetupValue("brakeDuctRear", 1)}
                                      className="w-5 h-5 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] font-bold cursor-pointer text-zinc-805 select-none"
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-3 pt-3 border-t border-zinc-200 font-sans leading-relaxed font-semibold">
                            High tail heights combined with rear wing angles generate exponential suction drag (ground effect rake).
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-zinc-200 p-3 rounded font-mono text-xs text-center flex justify-between items-center shadow-sm">
                        <span className="text-zinc-550 uppercase text-[10px] font-bold">Aero Rake Height Difference</span>
                        <span className="font-black text-emerald-755 text-sm">{(parsedActiveSetup.rideHeights[1] - parsedActiveSetup.rideHeights[0]).toFixed(0)} mm Nose-Down angle</span>
                      </div>

                    </div>
                  )}

                  {/* TAB 6: SUSPENSION DAMPERS */}
                  {selectedTab === "dampers" && (
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-1 gap-4">
                        
                        {/* Front dampers (L/R) */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <div className="border-b border-zinc-200 pb-2 mb-3.5 flex justify-between items-center">
                            <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">FRONT DAMPERS (LF/RF)</span>
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">BUMP / REBOUND</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs text-zinc-900">
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2">
                              <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1 font-bold">LF WHEEL</div>
                              <div className="flex justify-between"><span className="text-zinc-500">Bump (Slow):</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpSlow[0]}</strong></div>
                              <div className="flex justify-between"><span className="text-orange-600 font-semibold">Fast Bump:</span><strong className="text-orange-600 font-bold">{parsedActiveSetup.bumpFast[0]}</strong></div>
                              <div className="flex justify-between"><span className="text-zinc-550 font-semibold">Rebound:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.reboundSlow[0]}</strong></div>
                              <div className="flex justify-between"><span className="text-teal-600 font-semibold">Fast Rebound:</span><strong className="text-teal-600 font-bold">{parsedActiveSetup.reboundFast[0]}</strong></div>
                            </div>
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2">
                              <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1 font-bold">RF WHEEL</div>
                              <div className="flex justify-between"><span className="text-zinc-500">Bump (Slow):</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpSlow[1]}</strong></div>
                              <div className="flex justify-between"><span className="text-orange-600 font-semibold">Fast Bump:</span><strong className="text-orange-600 font-bold">{parsedActiveSetup.bumpFast[1]}</strong></div>
                              <div className="flex justify-between"><span className="text-zinc-550 font-semibold">Rebound:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.reboundSlow[1]}</strong></div>
                              <div className="flex justify-between"><span className="text-teal-600 font-semibold">Fast Rebound:</span><strong className="text-teal-600 font-bold">{parsedActiveSetup.reboundFast[1]}</strong></div>
                            </div>
                          </div>
                        </div>

                        {/* Rear dampers (L/R) */}
                        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
                          <div className="border-b border-zinc-200 pb-2 mb-3.5 flex justify-between items-center">
                            <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-700 uppercase">REAR DAMPERS (LR/RR)</span>
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">BUMP / REBOUND</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs text-zinc-900">
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2">
                              <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1 font-bold">LR WHEEL</div>
                              <div className="flex justify-between"><span className="text-zinc-500">Bump (Slow):</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpSlow[2]}</strong></div>
                              <div className="flex justify-between"><span className="text-orange-600 font-semibold">Fast Bump:</span><strong className="text-orange-600 font-bold">{parsedActiveSetup.bumpFast[2]}</strong></div>
                              <div className="flex justify-between"><span className="text-zinc-550 font-semibold">Rebound:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.reboundSlow[2]}</strong></div>
                              <div className="flex justify-between"><span className="text-teal-600 font-semibold">Fast Rebound:</span><strong className="text-teal-600 font-bold">{parsedActiveSetup.reboundFast[2]}</strong></div>
                            </div>
                            <div className="bg-zinc-50 p-3 rounded border border-zinc-200 space-y-2">
                              <div className="text-[10px] text-zinc-500 uppercase border-b border-zinc-200 pb-1 font-bold">RR WHEEL</div>
                              <div className="flex justify-between"><span className="text-zinc-505">Bump (Slow):</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.bumpSlow[3]}</strong></div>
                              <div className="flex justify-between"><span className="text-orange-600 font-semibold">Fast Bump:</span><strong className="text-orange-600 font-bold">{parsedActiveSetup.bumpFast[3]}</strong></div>
                              <div className="flex justify-between"><span className="text-zinc-505 font-semibold">Rebound:</span><strong className="text-zinc-900 font-bold">{parsedActiveSetup.reboundSlow[3]}</strong></div>
                              <div className="flex justify-between"><span className="text-teal-600 font-semibold">Fast Rebound:</span><strong className="text-teal-600 font-bold">{parsedActiveSetup.reboundFast[3]}</strong></div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {isTuneMode && (
                    <div className="mt-6 p-4 md:p-5 bg-amber-500/5 border border-amber-500/25 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 shrink-0 mt-0.5">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-zinc-900 font-sans tracking-wider uppercase">Active Tuning Sandbox Modded</p>
                          <p className="text-[10.5px] text-zinc-600 leading-normal mt-1 font-medium max-w-xl">
                            Parameters edited in Tyre pressures, Electronics, or Mechanical. Save variant to preserve changes.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
                        <label className="flex items-center justify-center sm:justify-start gap-2.5 text-[11px] text-zinc-700 bg-white/60 hover:bg-white border border-zinc-200 hover:border-zinc-300 px-3.5 py-2 rounded-lg cursor-pointer select-none font-bold shadow-3xs transition-all active:scale-[0.98] h-11 shrink-0">
                          <input
                            type="checkbox"
                            checked={tuneIsTeamWorkspace}
                            onChange={(e) => setTuneIsTeamWorkspace(e.target.checked)}
                            className="accent-amber-600 w-4.5 h-4.5 rounded border-zinc-300 focus:ring-amber-500 cursor-pointer"
                          />
                          <span>Share to Team Workspace</span>
                        </label>

                        <button
                          onClick={() => {
                            setSaveModalNote("");
                            setIsSaveModalOpen(true);
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-black px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 h-11 w-full sm:w-auto"
                        >
                          <span>💾 Save Custom Variant</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-4">
                <Gauge className="w-16 h-16 text-zinc-400" />
                <div>
                  <h3 className="text-zinc-900 font-extrabold text-sm tracking-tight">Virtual Garage Sandbox Standby</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed font-semibold">
                    Select a setup from the library on the left, load a `.json` file, or pick a car model reference below to view all setup boundaries.
                  </p>
                </div>

                <div className="mt-4 w-full max-w-xs bg-zinc-50 p-4 border border-zinc-200 rounded-lg text-left shadow-xs">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider mb-2">
                    Quick Reference Car Selector:
                  </label>
                  <select
                    className="w-full bg-white border border-zinc-250 hover:border-zinc-350 p-2 text-zinc-805 rounded font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none cursor-pointer"
                    onChange={(e) => handleSelectReferenceCar(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>--- Select Car Model ---</option>
                    {Object.entries(cars).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.fullName} ({config.year})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      ) : currentView === "laptimes" ? (
        <main id="laptimes-workspace" className="flex-1 max-w-7xl w-full mx-auto p-4 pb-20 md:pb-6 lg:p-6">
          <LapTimesPage />
        </main>
      ) : currentView === "garage" ? (
        <main id="garage-workspace" className="flex-1 max-w-7xl w-full mx-auto p-4 pb-20 md:pb-6 lg:p-6">
          <GaragePage
            tunedSetupsList={tunedSetupsList}
            profile={profile}
            onInspect={(setupRep) => {
              setActiveSetup(setupRep);
              setCurrentView("telemetry");
              showToast("Loaded tuned variant into Active HUD!", "success");
              setTimeout(() => {
                document.getElementById("column-inspection-engineer")?.scrollIntoView({ behavior: "smooth" });
              }, 120);
            }}
            onDelete={async (id) => {
              try {
                await dbDeleteTunedSetup(id);
                showToast("Successfully deleted custom variant.", "success");
                loadTunedSetups();
              } catch (err) {
                console.error(err);
                showToast("Failed to delete variant.", "error");
              }
            }}
            onRefresh={async () => {
              await loadTunedSetups();
              showToast("Garage list synchronized with Cloud Storage.", "info");
            }}
          />
        </main>
      ) : (
        <main id="engineer-workspace" className="flex-1 max-w-7xl w-full mx-auto p-4 pb-20 md:pb-6 lg:p-6">
          <AiRaceEngineer
            activeSetup={activeSetup}
            parsedSetupData={activeSetup ? parseAccSetup(tunedRawData || activeSetup.rawData, activeSetup.name) : null}
          />
        </main>
      )}

      {/* 3. Footer indicator metadata */}
      <footer id="visual-garage-footer" className="bg-zinc-950 border-t border-zinc-900 py-4 px-6 text-center mt-auto font-mono text-[10px] text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>PITWALL COMPANION APP V1.9 • POWERED BY JAXTUNE</span>
          <span>CRAFTED FOR ACC AND LATE NIGHT RACING</span>
        </div>
      </footer>

      {/* Floating Premium Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-4 py-3.5 rounded-lg shadow-2xl max-w-sm font-sans"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-red-500" : "bg-cyan-500"}`} />
            <span className="text-xs font-semibold leading-relaxed text-zinc-200">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:text-white text-zinc-400 text-sm font-bold cursor-pointer transition-colors shrink-0">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Onboarding Interceptor Modal */}
      <AnimatePresence>
        {needsOnboarding && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-[150] flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-zinc-900 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <span className="text-[10px] font-mono font-black text-red-650 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-2 animate-pulse">
                  Driver Onboarding Required
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 mt-1">
                  Connect Driver Profile
                </h2>
                <p className="text-zinc-650 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                  Hi <strong className="text-zinc-800 font-bold">{user.displayName || user.email}</strong>, let's configure your central Sim Racing telemetry handle and class rules.
                </p>
              </div>

              <div className="space-y-5">
                {/* 1. Username Input with real-time validation */}
                <div>
                  <label className="block text-zinc-650 text-xs font-mono uppercase font-black tracking-wider mb-2">
                    Sim Racing Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-zinc-400 font-mono text-sm">@</span>
                    <input
                      type="text"
                      placeholder="e.g. Apex_Driver"
                      value={onboardingUsername}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "");
                        handleCheckUsername(val);
                      }}
                      className={`w-full bg-zinc-50 text-zinc-950 pl-8 pr-12 py-2.5 md:py-2 border rounded font-semibold text-base md:text-sm min-h-[44px] md:min-h-0 focus:outline-none focus:ring-1 transition-all ${
                        onboardingUsernameAvailable === true
                          ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500"
                          : onboardingUsernameAvailable === false
                          ? "border-red-500 focus:border-red-600 focus:ring-red-500"
                          : "border-zinc-250 focus:border-red-650 focus:ring-red-650"
                      }`}
                    />
                    <div className="absolute right-3.5 top-2 flex items-center gap-1.5">
                      {onboardingCheckingUsername ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                      ) : onboardingUsernameAvailable === true ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : onboardingUsernameAvailable === false ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Status explanation line */}
                  <span className="text-[10px] mt-1.5 block font-medium leading-normal">
                    {onboardingUsername.trim().length === 0 ? (
                      <span className="text-zinc-500 italic">Usernames can contain letters, numbers, underscores, and dashes.</span>
                    ) : onboardingUsername.trim().length < 3 ? (
                      <span className="text-amber-600 font-bold">Username must be at least 3 characters long.</span>
                    ) : onboardingCheckingUsername ? (
                      <span className="text-zinc-500">Checking registry database...</span>
                    ) : onboardingUsernameAvailable === true ? (
                      <span className="text-emerald-600 font-bold">✓ This handle is clear and authentic!</span>
                    ) : onboardingUsernameAvailable === false ? (
                      <span className="text-red-500 font-black">✗ This handle is already registered by another driver.</span>
                    ) : (
                      <span className="text-zinc-500 italic font-bold">Perfect fit.</span>
                    )}
                  </span>
                </div>

                {/* 2. Pinned Series Cars Multi-Select Selector */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-zinc-650 text-xs font-mono uppercase font-black tracking-wider">
                      Pinned Series Cars
                    </label>
                    <span className="text-[9px] text-zinc-450 font-semibold font-mono font-bold">OPTIONAL FILTER</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight mb-2.5 font-medium">
                    Select your current racing series cars to automatically pin them. Checking the "Series Only" toggle in the Main Registry will filter the setup list only to these choices!
                  </p>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded p-3 h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {Object.entries(ACC_CARS).map(([carKey, carName]) => {
                      const isChecked = onboardingPinnedCars.includes(carKey);
                      return (
                        <label
                          key={carKey}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-all ${
                            isChecked
                              ? "bg-red-50 border-red-200 text-red-700 font-bold"
                              : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setOnboardingPinnedCars(onboardingPinnedCars.filter((k) => k !== carKey));
                              } else {
                                setOnboardingPinnedCars([...onboardingPinnedCars, carKey]);
                              }
                            }}
                            className="accent-red-650 w-3.5 h-3.5 cursor-pointer shrink-0"
                          />
                          <span className="truncate pr-1 text-[11px] font-sans font-semibold" title={carName}>
                            {carName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Onboarding buttons */}
                <div className="pt-3 flex gap-3">
                  <button
                    onClick={async () => {
                      await handleLogout();
                    }}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 font-bold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center shadow-3xs"
                  >
                    Disconnect Profile
                  </button>
                  <button
                    disabled={
                      isSubmittingOnboarding ||
                      onboardingCheckingUsername ||
                      onboardingUsernameAvailable !== true ||
                      onboardingUsername.trim().length < 3
                    }
                    onClick={async () => {
                      setIsSubmittingOnboarding(true);
                      try {
                        await saveProfileData(onboardingUsername.trim(), onboardingPinnedCars);
                        showToast(`Profile initialized as @${onboardingUsername.trim()}! Welcome to the squad.`, "success");
                      } catch (err: any) {
                        console.error(err);
                        const msg = err.message || err.toString() || "Server write failed.";
                        showToast(`Connection failed: ${msg}`, "error");
                      } finally {
                        setIsSubmittingOnboarding(false);
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-750 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-extrabold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center flex items-center justify-center gap-2 shadow-md shadow-red-600/15 active:scale-95 select-none"
                  >
                    {isSubmittingOnboarding ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      "Initialize Pilot Profile"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings / Edit Profile Modal */}
      <AnimatePresence>
        {showProfileModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[140] flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-zinc-200 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-zinc-900 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute right-4 top-4 hover:text-zinc-800 text-zinc-400 text-xl font-bold cursor-pointer transition-colors p-1"
              >
                ×
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] font-mono font-black text-red-650 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-1">
                  Edit Crew Profile
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 mt-1">
                  Driver Settings
                </h2>
                <p className="text-zinc-655 text-xs mt-1 px-4 leading-normal">
                  Update your active telemetry callsign and pinned car selections for BoP class matching.
                </p>
              </div>

              <div className="space-y-5">
                {/* 1. Username input with uniqueness validation if changed */}
                <div>
                  <label className="block text-zinc-650 text-xs font-mono uppercase font-black tracking-wider mb-2">
                    Sim Racing Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-zinc-400 font-mono text-sm">@</span>
                    <input
                      type="text"
                      placeholder="e.g. Apex_Driver"
                      value={editUsername}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "");
                        setEditUsername(val);
                        if (val.trim().toLowerCase() === profile.username.toLowerCase()) {
                          setEditUsernameAvailable(true);
                          return;
                        }
                        if (val.trim().length < 3) {
                          setEditUsernameAvailable(null);
                          return;
                        }
                        setEditCheckingUsername(true);
                        dbCheckUsernameAvailable(val.trim())
                          .then((isOk) => setEditUsernameAvailable(isOk))
                          .catch(() => setEditUsernameAvailable(true))
                          .finally(() => setEditCheckingUsername(false));
                      }}
                      className={`w-full bg-zinc-50 text-zinc-950 pl-8 pr-12 py-2.5 md:py-2 border rounded font-semibold text-base md:text-sm min-h-[44px] md:min-h-0 focus:outline-none focus:ring-1 transition-all ${
                        editUsernameAvailable === true
                          ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500"
                          : editUsernameAvailable === false
                          ? "border-red-500 focus:border-red-600 focus:ring-red-500"
                          : "border-zinc-250 focus:border-zinc-705 focus:ring-zinc-705"
                      }`}
                    />
                    <div className="absolute right-3.5 top-2 flex items-center gap-1.5">
                      {editCheckingUsername ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                      ) : editUsernameAvailable === true ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : editUsernameAvailable === false ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Status explanation */}
                  <span className="text-[10px] mt-1.5 block font-medium leading-normal">
                    {editUsername.trim().toLowerCase() === profile.username.toLowerCase() ? (
                      <span className="text-emerald-600 font-bold">✓ This is your current active callsigned username.</span>
                    ) : editUsername.trim().length < 3 ? (
                      <span className="text-amber-600 font-bold">Username must be at least 3 characters.</span>
                    ) : editCheckingUsername ? (
                      <span className="text-zinc-505">Checking username registry...</span>
                    ) : editUsernameAvailable === true ? (
                      <span className="text-emerald-600 font-bold">✓ This handle is clear and authentic!</span>
                    ) : editUsernameAvailable === false ? (
                      <span className="text-red-500 font-black">✗ This handle is already registered by another driver.</span>
                    ) : null}
                  </span>
                </div>

                {/* 2. Pinned Series Cars Selector */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-zinc-650 text-xs font-mono uppercase font-black tracking-wider">
                      Pinned Series Cars
                    </label>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight mb-2.5 font-medium font-sans">
                    Pin your current racing series cars to toggle layout-wide filters for quick grid assessments.
                  </p>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded p-3 h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {Object.entries(ACC_CARS).map(([carKey, carName]) => {
                      const isChecked = editPinnedCars.includes(carKey);
                      return (
                        <label
                          key={carKey}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-all ${
                            isChecked
                              ? "bg-red-50 border-red-200 text-red-700 font-bold"
                              : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setEditPinnedCars(editPinnedCars.filter((k) => k !== carKey));
                              } else {
                                setEditPinnedCars([...editPinnedCars, carKey]);
                              }
                            }}
                            className="accent-red-655 w-3.5 h-3.5 cursor-pointer shrink-0"
                          />
                          <span className="truncate pr-1 text-[11px] font-sans font-semibold" title={carName}>
                            {carName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Modal Submit Action Panel */}
                <div className="pt-3 flex flex-col gap-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-705 font-bold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center shadow-3xs"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={
                        isSubmittingProfileEdit ||
                        editCheckingUsername ||
                        editUsernameAvailable !== true ||
                        editUsername.trim().length < 3
                      }
                      onClick={async () => {
                        setIsSubmittingProfileEdit(true);
                        try {
                          await saveProfileData(editUsername.trim(), editPinnedCars);
                          showToast("Crew driver profile updated successfully!", "success");
                          setShowProfileModal(false);
                        } catch (err: any) {
                          console.error(err);
                          const msg = err.message || err.toString() || "Server write failed.";
                          showToast(`Update failed: ${msg}`, "error");
                        } finally {
                          setIsSubmittingProfileEdit(false);
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-755 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-extrabold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center flex items-center justify-center gap-2 shadow-md shadow-red-600/15 active:scale-95"
                    >
                      {isSubmittingProfileEdit ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        "Save Profile Edits"
                      )}
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      setShowProfileModal(false);
                      await handleLogout();
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 font-bold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center shadow-3xs transition-all"
                  >
                    Disconnect Profile / Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Custom Variant Tuning Notes Overlay Dialog Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl w-full max-w-md p-6 text-white shadow-2xl relative">
            <h3 className="text-lg font-black font-sans tracking-tight text-white mb-2 flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-500" />
              <span>Label Your Tuning Variant</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-mono">
              Saved custom variant is stored in your private garage and synchronizes automatically on the cloud.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Version Note / Changelog</label>
                <textarea
                  placeholder="e.g., Softer rear ARB for better curb stability..."
                  value={saveModalNote}
                  onChange={(e) => setSaveModalNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-550 font-medium focus:outline-none focus:border-amber-550 focus:ring-1 focus:ring-amber-550 min-h-[90px]"
                  autoFocus
                />
              </div>

              {/* Redundant workspace info label */}
              <div className="bg-zinc-900/65 border border-zinc-850 p-3 rounded-lg text-[10.5px] font-mono text-zinc-400 leading-normal flex gap-2">
                <Wrench className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-200">Workspace Status: </span>
                  {tuneIsTeamWorkspace ? (
                    <span className="text-emerald-400 font-extrabold uppercase">SHARED - WILL MAP TO TEAM PANEL</span>
                  ) : (
                    <span className="text-zinc-500 font-bold uppercase">PRIVATE PILOT GARAGE ONLY</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 bg-zinc-90 w bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-mono font-bold tracking-wider cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const finalNotes = saveModalNote.trim() || "Tweaked custom parameters.";
                    await handleSaveCustomTunedSetup(finalNotes);
                    setIsSaveModalOpen(false);
                  }}
                  className="px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-mono font-bold tracking-wider cursor-pointer transition-all active:scale-95 shadow-md uppercase"
                >
                  CONFIRM SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Visual helper helper functions
function getPressureColor(psi: number): string {
  // Optimal range in dry slick tyres is updated to 26.5 - 27.5 PSI for transition races
  if (psi >= 26.5 && psi <= 27.5) return "text-emerald-400";
  // Rain setups are standard between 29.5 - 30.5
  if (psi >= 29.5 && psi <= 30.5) return "text-cyan-400";
  // Cold tyres underinflated
  if (psi < 26.5) return "text-sky-400 shadow-sm shadow-sky-500/10";
  // Hot/overinflated blistered tyres
  return "text-red-400 shadow-sm shadow-red-500/10";
}

// Clean mapping of raw track values
function setupFilterTrack(t: string): string {
  return ACC_TRACKS[t] ? t : "monza";
}
