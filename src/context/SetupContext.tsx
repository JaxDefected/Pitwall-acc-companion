import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  dbFetchSetups,
  dbSaveSetup,
  dbDeleteSetup,
  dbSaveTunedSetup,
  dbFetchTunedSetups,
  dbDeleteTunedSetup,
  dbSaveSetupRating,
  dbFetchAllSetupRatings,
  SetupItem,
  SavedSetupItem,
  SetupRatingItem,
  UserProfile,
} from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { parseAccSetup, NormalizedAccSetup, ACC_CARS, ACC_TRACKS } from "../utils/accParser";
import { cars } from "../data/cars";

export interface ToastInfo {
  message: string;
  type: "success" | "error" | "info";
}

interface SetupContextType {
  // Setups registry
  setupsList: SetupItem[];
  isLoadingSetups: boolean;
  refreshSetups: () => Promise<void>;
  
  // Active setup & inspection
  activeSetup: SetupItem | null;
  setActiveSetup: (setup: SetupItem | null) => void;
  parsedSetupData: NormalizedAccSetup | null;
  
  // Tuning state
  isTuneMode: boolean;
  setIsTuneMode: (mode: boolean) => void;
  tunedRawData: any;
  setTunedRawData: (data: any) => void;
  handleAdjustSetupValue: (field: string, delta: number, index?: number) => void;
  saveCustomTunedSetup: (customNote?: string, targetTrack?: string, isTeamWorkspace?: boolean) => Promise<void>;
  
  // Saved tuned setups (My Tunes)
  tunedSetupsList: SavedSetupItem[];
  isLoadingTunedSetups: boolean;
  refreshTunedSetups: () => Promise<void>;
  deleteTunedSetup: (id: string) => Promise<void>;

  // Ratings
  allRatingsList: SetupRatingItem[];
  refreshRatings: () => Promise<void>;
  saveRating: (setupId: string, rating: number, tags: string[]) => Promise<void>;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  closeToast: () => void;
  
  // Mobile responsive helper
  isMobile: boolean;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

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
    id: "demo_ferrari_spa",
    name: "24h Endurance Safe Pace",
    car: "ferrari_296_gt3",
    track: "spa",
    notes: "High downforce, stable kerb compliance for Raidillon, Pouhon and Blanchimont. High mechanical grip setup tuned for high track temperatures and tyre longevity across multi-hour stints.",
    uploadedBy: "system_ref_2",
    uploadedByName: "Jaxtune Tech",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawData: {
      carName: "ferrari_296_gt3",
      trackName: "spa",
      basicSetup: {
        tyres: { tyrePressure: [58, 60, 54, 56] },
        alignment: {
          camber: [-3.5, -3.5, -3.0, -3.0],
          toe: [-0.1, -0.1, 0.15, 0.15],
          caster: [9.2, 9.2]
        },
        electronics: { tc1: 3, tc2: 3, abs: 4, ecuMap: 1 }
      },
      advancedSetup: {
        mechanicalGrip: {
          antirollBarFront: 4,
          antirollBarRear: 2,
          wheelRate: [155000, 155000, 115000, 115000],
          bumpStopRate: [1000, 1000, 800, 800],
          bumpStopRange: [10, 10, 15, 15],
          preload: 120
        },
        aero: {
          rideHeight: [54, 68],
          rearWing: 6,
          splitter: 1,
          brakeDuct: [3, 3]
        },
        dampers: {
          bumpSlow: [8, 8, 7, 7],
          bumpFast: [10, 10, 9, 9],
          reboundSlow: [12, 12, 11, 11],
          reboundFast: [14, 14, 13, 13]
        }
      }
    }
  }
];

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [setupsList, setSetupsList] = useState<SetupItem[]>(DEMO_SETUPS);
  const [isLoadingSetups, setIsLoadingSetups] = useState<boolean>(true);
  const [activeSetup, setActiveSetupState] = useState<SetupItem | null>(DEMO_SETUPS[0]);
  
  // Tuning state
  const [isTuneMode, setIsTuneMode] = useState<boolean>(false);
  const [tunedRawData, setTunedRawData] = useState<any>(null);
  
  // Tuned setups list (My Tunes)
  const [tunedSetupsList, setTunedSetupsList] = useState<SavedSetupItem[]>([]);
  const [isLoadingTunedSetups, setIsLoadingTunedSetups] = useState<boolean>(true);

  // Ratings
  const [allRatingsList, setAllRatingsList] = useState<SetupRatingItem[]>([]);

  // Toast
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Responsive breakpoint
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Wrap setActiveSetup to also initialize or reset tunedRawData
  const setActiveSetup = useCallback((setup: SetupItem | null) => {
    setActiveSetupState(setup);
    setIsTuneMode(false);
    if (setup && setup.rawData) {
      setTunedRawData(JSON.parse(JSON.stringify(setup.rawData)));
    } else {
      setTunedRawData(null);
    }
  }, []);

  // Compute normalized parsed setup data
  const parsedSetupData = useMemo(() => {
    if (!activeSetup) return null;
    const rawToParse = isTuneMode && tunedRawData ? tunedRawData : activeSetup.rawData;
    return parseAccSetup(rawToParse, activeSetup.name);
  }, [activeSetup, isTuneMode, tunedRawData]);

  // Initial data loading
  const refreshSetups = useCallback(async () => {
    setIsLoadingSetups(true);
    try {
      const cloudSetups = await dbFetchSetups();
      if (cloudSetups && cloudSetups.length > 0) {
        setSetupsList(cloudSetups);
        if (!activeSetup) {
          setActiveSetup(cloudSetups[0]);
        }
      } else {
        setSetupsList(DEMO_SETUPS);
      }
    } catch (err) {
      console.warn("Using fallback demo setups:", err);
      setSetupsList(DEMO_SETUPS);
    } finally {
      setIsLoadingSetups(false);
    }
  }, [activeSetup, setActiveSetup]);

  const refreshTunedSetups = useCallback(async () => {
    setIsLoadingTunedSetups(true);
    try {
      const saved = await dbFetchTunedSetups();
      setTunedSetupsList(saved);
    } catch (err) {
      console.error("Failed to fetch tuned setups:", err);
    } finally {
      setIsLoadingTunedSetups(false);
    }
  }, []);

  const refreshRatings = useCallback(async () => {
    try {
      const ratings = await dbFetchAllSetupRatings();
      setAllRatingsList(ratings);
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
    }
  }, []);

  useEffect(() => {
    refreshSetups();
    refreshTunedSetups();
    refreshRatings();
  }, [refreshSetups, refreshTunedSetups, refreshRatings]);

  // Adjust parameter value in tune mode
  const handleAdjustSetupValue = useCallback((field: string, delta: number, index?: number) => {
    if (!isTuneMode || !tunedRawData) return;
    const cloned = JSON.parse(JSON.stringify(tunedRawData));
    const carKey = cloned.carName || (activeSetup ? activeSetup.car : "unknown");
    const carConfig = cars[carKey];
    
    if (!cloned.basicSetup) cloned.basicSetup = {};
    if (!cloned.advancedSetup) cloned.advancedSetup = {};
    if (!cloned.basicSetup.tyres) cloned.basicSetup.tyres = { tyrePressure: [50, 50, 50, 50] };
    if (!cloned.basicSetup.electronics) cloned.basicSetup.electronics = { tc1: 3, tc2: 2, abs: 3, ecuMap: 1, fuelMap: 1 };
    if (!cloned.basicSetup.alignment) {
      cloned.basicSetup.alignment = {
        camber: [32, 32, 26, 26],
        toe: [20, 20, 30, 30],
        casterLF: 30,
        casterRF: 30
      };
    }
    if (!cloned.advancedSetup.mechanicalGrip) cloned.advancedSetup.mechanicalGrip = { antirollBarFront: 5, antirollBarRear: 3, preloadDifferential: 120 };
    if (!cloned.advancedSetup.aerodynamics) cloned.advancedSetup.aerodynamics = { rearWingSetting: 4, rearWing: 4 };
    if (!cloned.advancedSetup.dampers) {
      cloned.advancedSetup.dampers = {
        bumpSlow: [8, 8, 8, 8],
        bumpFast: [10, 10, 10, 10],
        reboundSlow: [12, 12, 12, 12],
        reboundFast: [14, 14, 14, 14]
      };
    }

    if (field === "tyrePressure" && typeof index === "number") {
      cloned.basicSetup.tyres.tyrePressure[index] = Math.max(0, Math.min(100, (cloned.basicSetup.tyres.tyrePressure[index] || 50) + delta));
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
    } else if (field === "camber" && typeof index === "number") {
      const arr = cloned.basicSetup.alignment.camber;
      const current = arr[index] !== undefined ? arr[index] : (index < 2 ? 32 : 26);
      if (current < 0) {
        const step = carConfig?.camberStep || 0.1;
        arr[index] = Math.round((current + delta * step) * 100) / 100;
      } else {
        arr[index] = Math.max(0, Math.min(100, current + delta));
      }
      cloned.basicSetup.alignment.camber = arr;
    } else if (field === "toe" && typeof index === "number") {
      const arr = cloned.basicSetup.alignment.toe;
      const current = arr[index] !== undefined ? arr[index] : (index < 2 ? 20 : 30);
      if (!Number.isInteger(current)) {
        const step = carConfig?.toeStep || 0.01;
        arr[index] = Math.round((current + delta * step) * 100) / 100;
      } else {
        arr[index] = Math.max(0, Math.min(100, current + delta));
      }
      cloned.basicSetup.alignment.toe = arr;
    } else if (field === "caster" && typeof index === "number") {
      const isLF = index === 0;
      const casterKey = isLF ? "casterLF" : "casterRF";
      const current = cloned.basicSetup.alignment[casterKey] !== undefined
        ? cloned.basicSetup.alignment[casterKey]
        : (Array.isArray(cloned.basicSetup.alignment.caster) ? cloned.basicSetup.alignment.caster[index] : 30);
      
      let nextVal = current;
      if (typeof current === "number" && current < 45) {
        nextVal = Math.max(0, Math.min(100, current + delta));
      } else if (typeof current === "number") {
        const step = carConfig?.casterStep || 0.1;
        nextVal = Math.round((current + delta * step) * 100) / 100;
      }
      cloned.basicSetup.alignment[casterKey] = nextVal;
      if (Array.isArray(cloned.basicSetup.alignment.caster)) {
        cloned.basicSetup.alignment.caster[index] = nextVal;
      }
    } else if (field === "steerRatio") {
      const currentSR = cloned.advancedSetup.mechanicalGrip.steerRatio !== undefined
        ? cloned.advancedSetup.mechanicalGrip.steerRatio
        : 3;
      cloned.advancedSetup.mechanicalGrip.steerRatio = Math.max(0, Math.min(30, currentSR + delta));
    } else if (field === "brakePower") {
      const currentTorque = cloned.advancedSetup.mechanicalGrip.brakeTorque !== undefined
        ? cloned.advancedSetup.mechanicalGrip.brakeTorque
        : 0;
      cloned.advancedSetup.mechanicalGrip.brakeTorque = Math.max(0, Math.min(20, currentTorque - delta));
    } else if (field === "brakeBias") {
      if (!cloned.basicSetup.electronics) cloned.basicSetup.electronics = {};
      const currentBB = cloned.basicSetup.electronics.brakeBias !== undefined
        ? cloned.basicSetup.electronics.brakeBias
        : 10;
      const minVal = carConfig?.brakeBiasRange ? carConfig.brakeBiasRange[0] : 40;
      const maxVal = carConfig?.brakeBiasRange ? carConfig.brakeBiasRange[1] : 75;
      const step = carConfig?.brakeBiasStep || 0.2;
      const maxSteps = Math.round((maxVal - minVal) / step);
      cloned.basicSetup.electronics.brakeBias = Math.max(0, Math.min(maxSteps > 0 ? maxSteps : 150, currentBB + delta));
    } else if (field === "wheelRate" && typeof index === "number") {
      if (!cloned.advancedSetup.mechanicalGrip.wheelRate) {
        cloned.advancedSetup.mechanicalGrip.wheelRate = [0, 0, 0, 0];
      }
      const arr = cloned.advancedSetup.mechanicalGrip.wheelRate;
      arr[index] = Math.max(0, Math.min(80, (arr[index] !== undefined ? arr[index] : 0) + delta));
      cloned.advancedSetup.mechanicalGrip.wheelRate = arr;
    } else if (field === "bumpStopRate" && typeof index === "number") {
      if (!cloned.advancedSetup.mechanicalGrip.bumpStopRate) {
        cloned.advancedSetup.mechanicalGrip.bumpStopRate = [0, 0, 0, 0];
      }
      const arr = cloned.advancedSetup.mechanicalGrip.bumpStopRate;
      arr[index] = Math.max(0, Math.min(100, (arr[index] !== undefined ? arr[index] : 0) + delta));
      cloned.advancedSetup.mechanicalGrip.bumpStopRate = arr;
    } else if (field === "bumpStopRange" && typeof index === "number") {
      if (!cloned.advancedSetup.mechanicalGrip.bumpStopRange) {
        cloned.advancedSetup.mechanicalGrip.bumpStopRange = [0, 0, 0, 0];
      }
      if (!cloned.advancedSetup.mechanicalGrip.bumpStopWindow) {
        cloned.advancedSetup.mechanicalGrip.bumpStopWindow = [0, 0, 0, 0];
      }
      const arr1 = cloned.advancedSetup.mechanicalGrip.bumpStopRange;
      const arr2 = cloned.advancedSetup.mechanicalGrip.bumpStopWindow;
      const currentVal = arr1[index] !== undefined ? arr1[index] : (arr2[index] !== undefined ? arr2[index] : 0);
      const newVal = Math.max(0, Math.min(100, currentVal + delta));
      arr1[index] = newVal;
      arr2[index] = newVal;
      cloned.advancedSetup.mechanicalGrip.bumpStopRange = arr1;
      cloned.advancedSetup.mechanicalGrip.bumpStopWindow = arr2;
    } else if (field === "bumpSlow" && typeof index === "number") {
      const arr = cloned.advancedSetup.dampers.bumpSlow;
      arr[index] = Math.max(0, Math.min(40, (arr[index] !== undefined ? arr[index] : 8) + delta));
      cloned.advancedSetup.dampers.bumpSlow = arr;
    } else if (field === "bumpFast" && typeof index === "number") {
      const arr = cloned.advancedSetup.dampers.bumpFast;
      arr[index] = Math.max(0, Math.min(49, (arr[index] !== undefined ? arr[index] : 10) + delta));
      cloned.advancedSetup.dampers.bumpFast = arr;
    } else if (field === "reboundSlow" && typeof index === "number") {
      const arr = cloned.advancedSetup.dampers.reboundSlow;
      arr[index] = Math.max(0, Math.min(40, (arr[index] !== undefined ? arr[index] : 12) + delta));
      cloned.advancedSetup.dampers.reboundSlow = arr;
    } else if (field === "reboundFast" && typeof index === "number") {
      const arr = cloned.advancedSetup.dampers.reboundFast;
      arr[index] = Math.max(0, Math.min(49, (arr[index] !== undefined ? arr[index] : 14) + delta));
      cloned.advancedSetup.dampers.reboundFast = arr;
    }

    setTunedRawData(cloned);
  }, [isTuneMode, tunedRawData, activeSetup]);

  // Save tuned setup
  const saveCustomTunedSetup = useCallback(async (customNote?: string, targetTrack?: string, isTeamWorkspace = false) => {
    if (!profile) {
      showToast("Sign in to save tuned setups", "error");
      return;
    }
    if (!activeSetup || !tunedRawData) return;
    
    try {
      const destinationTrack = targetTrack || activeSetup.track;
      const isAdapted = destinationTrack !== activeSetup.track;
      
      const sourceTrackLabel = ACC_TRACKS[activeSetup.track] || activeSetup.track;
      const targetTrackLabel = ACC_TRACKS[destinationTrack] || destinationTrack;
      
      let finalNote = customNote?.trim() || "Tweaked custom parameters.";
      if (isAdapted) {
        finalNote = `[Adapted from ${sourceTrackLabel}] ${finalNote}`;
      }
      
      const revisionName = isAdapted 
        ? `${activeSetup.name} (Adapted to ${targetTrackLabel}) - Tuned by ${profile.username}`
        : `${activeSetup.name} - Tuned by ${profile.username}`;
        
      const tunedItemId = `${activeSetup.id}_tune_${Date.now()}`;
      
      const payload: SavedSetupItem = {
        id: tunedItemId,
        parentSetupId: activeSetup.id,
        authorUsername: profile.username,
        versionNote: finalNote,
        isTeamWorkspace: isTeamWorkspace,
        car: activeSetup.car,
        track: destinationTrack,
        notes: finalNote,
        rawData: tunedRawData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dbSaveTunedSetup(payload);
      showToast("Variant saved to garage", "success");
      
      if (isTeamWorkspace) {
        const standardSetup: SetupItem = {
          id: tunedItemId,
          name: revisionName,
          car: activeSetup.car,
          track: destinationTrack,
          notes: `[Tuned Variant] ${finalNote}`,
          rawData: tunedRawData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: user?.uid || "unknown",
          uploadedByName: profile.username
        };
        await dbSaveSetup(standardSetup);
        showToast("Synced to Team Workspace!", "success");
        await refreshSetups();
      }
      
      await refreshTunedSetups();
    } catch (err: any) {
      console.error(err);
      showToast(`Save failed: ${err.message || "Network error"}`, "error");
    }
  }, [profile, activeSetup, tunedRawData, user, showToast, refreshSetups, refreshTunedSetups]);

  const deleteTunedSetup = useCallback(async (id: string) => {
    try {
      await dbDeleteTunedSetup(id);
      showToast("Variant deleted", "success");
      await refreshTunedSetups();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  }, [showToast, refreshTunedSetups]);

  const saveRating = useCallback(async (setupId: string, rating: number, tags: string[]) => {
    if (!user || !profile) {
      showToast("Sign in to rate setups", "error");
      return;
    }
    try {
      const ratingId = `${setupId}_${user.uid}`;
      const payload: SetupRatingItem = {
        id: ratingId,
        setupId,
        userId: user.uid,
        uid: user.uid,
        username: profile.username,
        rating,
        tags,
        createdAt: new Date().toISOString(),
      };
      await dbSaveSetupRating(payload);
      showToast("Rating submitted!", "success");
      await refreshRatings();
    } catch (err: any) {
      console.error(err);
      showToast(`Rating failed: ${err.message || "Network error"}`, "error");
    }
  }, [user, profile, showToast, refreshRatings]);

  return (
    <SetupContext.Provider
      value={{
        setupsList,
        isLoadingSetups,
        refreshSetups,
        activeSetup,
        setActiveSetup,
        parsedSetupData,
        isTuneMode,
        setIsTuneMode,
        tunedRawData,
        setTunedRawData,
        handleAdjustSetupValue,
        saveCustomTunedSetup,
        tunedSetupsList,
        isLoadingTunedSetups,
        refreshTunedSetups,
        deleteTunedSetup,
        allRatingsList,
        refreshRatings,
        saveRating,
        toast,
        showToast,
        closeToast,
        isMobile,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useSetups() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetups must be used within a SetupProvider");
  }
  return context;
}
