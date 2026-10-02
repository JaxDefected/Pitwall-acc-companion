import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { ACC_CARS } from "../utils/accParser";
import { dbCheckUsernameAvailable } from "../firebase";

export interface OnboardingModalProps {
  isOpen: boolean;
  user: {
    displayName?: string | null;
    email?: string | null;
  } | null;
  onDisconnect: () => Promise<void>;
  onSaveProfile: (username: string, pinnedCars: string[]) => Promise<void>;
  onSuccess: (username: string) => void;
  onError: (errorMsg: string) => void;
}

export default function OnboardingModal({
  isOpen,
  user,
  onDisconnect,
  onSaveProfile,
  onSuccess,
  onError,
}: OnboardingModalProps) {
  const [username, setUsername] = useState<string>("");
  const [pinnedCars, setPinnedCars] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCheckUsername = async (val: string) => {
    setUsername(val);
    if (val.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    try {
      const isOk = await dbCheckUsernameAvailable(val);
      setUsernameAvailable(isOk);
    } catch (err) {
      console.error(err);
      setUsernameAvailable(true); // default true for safety on connectivity limits
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cleanUsername = username.trim();
      await onSaveProfile(cleanUsername, pinnedCars);
      onSuccess(cleanUsername);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || err.toString() || "Server write failed.";
      onError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
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
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "");
                    handleCheckUsername(val);
                  }}
                  className={`w-full bg-zinc-50 text-zinc-950 pl-8 pr-12 py-2.5 md:py-2 border rounded font-semibold text-base md:text-sm min-h-[44px] md:min-h-0 focus:outline-none focus:ring-1 transition-all ${
                    usernameAvailable === true
                      ? "border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500"
                      : usernameAvailable === false
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500"
                      : "border-zinc-250 focus:border-red-650 focus:ring-red-650"
                  }`}
                />
                <div className="absolute right-3.5 top-2 flex items-center gap-1.5">
                  {isCheckingUsername ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
                  ) : usernameAvailable === true ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : usernameAvailable === false ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
              </div>

              {/* Status explanation line */}
              <span className="text-[10px] mt-1.5 block font-medium leading-normal">
                {username.trim().length === 0 ? (
                  <span className="text-zinc-500 italic">Usernames can contain letters, numbers, underscores, and dashes.</span>
                ) : username.trim().length < 3 ? (
                  <span className="text-amber-600 font-bold">Username must be at least 3 characters long.</span>
                ) : isCheckingUsername ? (
                  <span className="text-zinc-500">Checking registry database...</span>
                ) : usernameAvailable === true ? (
                  <span className="text-emerald-600 font-bold">✓ This handle is clear and authentic!</span>
                ) : usernameAvailable === false ? (
                  <span className="text-red-500 font-black">✕ This handle is already registered by another driver.</span>
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
                <span className="text-[10px] text-zinc-450 font-semibold font-mono font-bold">OPTIONAL FILTER</span>
              </div>
              <p className="text-xs text-zinc-500 leading-tight mb-3 font-medium">
                Select your current racing series cars to automatically pin them. Checking the "Series Only" toggle in the Main Registry will filter the setup list only to these choices!
              </p>

              <div className="space-y-3">
                {(() => {
                  const groups: Record<string, Array<[string, string]>> = {
                    "GT3 Class": [],
                    "GT4 Class": [],
                    "GT2 / GTC / Cup / Other": [],
                  };

                  Object.entries(ACC_CARS).forEach(([carKey, carName]) => {
                    const lowerKey = carKey.toLowerCase();
                    if (lowerKey.includes("gt4")) {
                      groups["GT4 Class"].push([carKey, carName]);
                    } else if (
                      lowerKey.includes("gt3") ||
                      lowerKey.includes("vantage") ||
                      lowerKey.includes("huracan") ||
                      lowerKey.includes("r8_lms") ||
                      lowerKey.includes("m6") ||
                      lowerKey.includes("991") ||
                      lowerKey.includes("992")
                    ) {
                      if (!lowerKey.includes("cup") && !lowerKey.includes("gt2") && !lowerKey.includes("challenge") && !lowerKey.includes("supertrofeo")) {
                        groups["GT3 Class"].push([carKey, carName]);
                      } else {
                        groups["GT2 / GTC / Cup / Other"].push([carKey, carName]);
                      }
                    } else {
                      groups["GT2 / GTC / Cup / Other"].push([carKey, carName]);
                    }
                  });

                  Object.keys(groups).forEach((key) => {
                    groups[key].sort((a, b) => a[1].localeCompare(b[1]));
                  });

                  return Object.entries(groups).map(([groupName, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={groupName} className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2 pb-1 border-b border-zinc-200">
                          {groupName} ({items.length})
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                          {items.map(([carKey, carName]) => {
                            const isChecked = pinnedCars.includes(carKey);
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
                                      setPinnedCars(pinnedCars.filter((k) => k !== carKey));
                                    } else {
                                      setPinnedCars([...pinnedCars, carKey]);
                                    }
                                  }}
                                  className="accent-red-650 w-3.5 h-3.5 cursor-pointer shrink-0"
                                />
                                <span className="truncate pr-1 text-xs font-sans font-semibold" title={carName}>
                                  {carName}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Onboarding buttons */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onDisconnect}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 font-bold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center shadow-3xs"
              >
                Disconnect Profile
              </button>
              <button
                type="button"
                disabled={
                  isSubmitting ||
                  isCheckingUsername ||
                  usernameAvailable !== true ||
                  username.trim().length < 3
                }
                onClick={handleSubmit}
                className="flex-1 bg-red-600 hover:bg-red-750 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-extrabold py-2.5 rounded cursor-pointer text-xs uppercase tracking-wider font-mono text-center flex items-center justify-center gap-2 shadow-md shadow-red-600/15 active:scale-95 select-none"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  "Initialize Pilot Profile"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
