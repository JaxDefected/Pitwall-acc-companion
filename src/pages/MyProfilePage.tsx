import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  LogOut,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Flame,
  Search,
  Award,
  Clock,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSetups } from "../context/SetupContext";
import { useDriverProfile } from "../hooks/useDriverStats";
import { ACC_CARS } from "../utils/accParser";
import { dbCheckUsernameAvailable, dbCreateClaim } from "../firebase";

export default function MyProfilePage() {
  const { user, profile, loading, login, logout, saveProfileData } = useAuth();
  const { showToast } = useSetups();
  const { allMockDrivers } = useDriverProfile();

  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [pinnedCars, setPinnedCars] = useState<string[]>(profile?.pinnedSeriesCars || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(true);

  // Driver Claim Flow State
  const [claimSearch, setClaimSearch] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isClaiming, setIsClaiming] = useState(false);

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-400 font-mono text-xs">
        Loading driver profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 font-sans">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full w-fit mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wide">
          Connect Driver Profile
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Sign in to link your sim racing gamertag, claim your Late Night Racing identity, and save custom tuned setups.
        </p>
        <button
          onClick={login}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer"
        >
          Connect with Google
        </button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!username.trim() || username.length < 3) {
      showToast("Username must be at least 3 characters", "error");
      return;
    }
    setIsSaving(true);
    try {
      await saveProfileData(username.trim(), pinnedCars, { bio: bio.trim() });
      showToast("Profile updated successfully", "success");
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!selectedDriverId) {
      showToast("Please select a driver from the roster", "error");
      return;
    }

    setIsClaiming(true);
    try {
      // Auto-approve if user's email matches admin or driver slug matches username
      const isAutoApprove =
        user.email?.toLowerCase().includes("jack") ||
        username.toLowerCase() === selectedDriverId.toLowerCase();

      const status = isAutoApprove ? "approved" : "pending";

      await saveProfileData(username, pinnedCars, {
        claimedDriverId: selectedDriverId,
        claimStatus: status,
      });

      if (isAutoApprove) {
        showToast(`Linked profile to @${selectedDriverId}!`, "success");
      } else {
        showToast(
          `Claim for @${selectedDriverId} submitted! An administrator will review your request.`,
          "info"
        );
      }
    } catch (err: any) {
      showToast(`Claim submission failed: ${err.message}`, "error");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleUnlink = async () => {
    await saveProfileData(username, pinnedCars, {
      claimedDriverId: "",
      claimStatus: "none",
    });
    showToast("Driver profile unlinked", "info");
  };

  const togglePinnedCar = (carKey: string) => {
    if (pinnedCars.includes(carKey)) {
      setPinnedCars(pinnedCars.filter((c) => c !== carKey));
    } else {
      if (pinnedCars.length >= 3) {
        showToast("Maximum of 3 pinned series cars allowed", "info");
        return;
      }
      setPinnedCars([...pinnedCars, carKey]);
    }
  };

  // Filter roster for claiming
  const matchingDrivers = allMockDrivers.filter(
    (d) =>
      !claimSearch.trim() ||
      d.name.toLowerCase().includes(claimSearch.toLowerCase()) ||
      d.id.toLowerCase().includes(claimSearch.toLowerCase())
  );

  const claimedDriver = allMockDrivers.find((d) => d.id === profile?.claimedDriverId);

  // Group cars by category
  const groups: Record<string, Array<[string, string]>> = {
    "GT3 Class": [],
    "GT4 Class": [],
    "GT2 & Cup": [],
  };

  Object.entries(ACC_CARS).forEach(([carKey, carName]) => {
    const lower = carKey.toLowerCase();
    if (lower.includes("gt4") || lower.includes("ginetta") || lower.includes("camaro")) {
      groups["GT4 Class"].push([carKey, carName]);
    } else if (lower.includes("gt2") || lower.includes("cup") || lower.includes("challenge")) {
      groups["GT2 & Cup"].push([carKey, carName]);
    } else {
      groups["GT3 Class"].push([carKey, carName]);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6 text-left font-sans">
      {/* Profile Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              referrerPolicy="no-referrer"
              alt="Avatar"
              className="w-16 h-16 rounded-2xl border-2 border-red-500 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-red-500 flex items-center justify-center font-bold text-white text-xl">
              {(profile?.username || user.email || "D").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold text-lg">
                @{profile?.username || "Driver"}
              </span>
              <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[10px] font-mono">
                {user.email}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Late Night Racing Member Account
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Driver Identity Claim Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              LNR Championship Driver Identity
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Link your web account to your official championship driver telemetry profile
            </p>
          </div>

          {profile?.claimStatus === "approved" && (
            <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Linked
            </span>
          )}
          {profile?.claimStatus === "pending" && (
            <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800 text-amber-400 rounded text-[10px] font-mono font-bold uppercase">
              Pending Review
            </span>
          )}
        </div>

        {profile?.claimStatus === "approved" && claimedDriver ? (
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-mono font-bold text-red-400">
                {claimedDriver.name.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-bold text-white font-mono block">
                  @{claimedDriver.name}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {claimedDriver.class.toUpperCase()} · P{claimedDriver.seasonRecord.championshipPos} ({claimedDriver.seasonRecord.points} pts)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/drivers/${claimedDriver.id}`}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1"
              >
                View Public Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleUnlink}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                Unlink
              </button>
            </div>
          </div>
        ) : profile?.claimStatus === "pending" ? (
          <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2 font-mono text-xs">
            <div className="text-amber-400 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" /> Claim Pending Administrator Approval
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Your claim for @{profile?.claimedDriverId} has been registered. Once approved by an LNR admin, your stats and badge will update automatically.
            </p>
            <button
              onClick={handleUnlink}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
            >
              Cancel Claim
            </button>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <p className="text-zinc-400 text-xs">
              Search the championship roster to claim your competitor profile:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter roster by gamertag..."
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs font-mono text-white rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="">Select your driver profile...</option>
                {matchingDrivers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-zinc-950">
                    @{d.name} ({d.class.toUpperCase()})
                  </option>
                ))}
              </select>

              <button
                onClick={handleClaimSubmit}
                disabled={!selectedDriverId || isClaiming}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                {isClaiming ? "Claiming..." : "Claim Profile"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Edit */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 font-mono text-xs">
        <h3 className="font-bold uppercase tracking-wider text-white pb-3 border-b border-zinc-800">
          Driver Details & Vehicle Preferences
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-zinc-400 block mb-1">Sim Racing Gamertag / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-red-500 outline-none"
              placeholder="e.g. ApexHunter"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Driver Bio / Team Notes</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-red-500 outline-none resize-none"
              placeholder="Tell other competitors about your racing background..."
            />
          </div>

          {/* Pinned Series Cars */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">
                Pinned Series Cars (Up to 3)
              </label>
              <span className="text-zinc-500 text-[10px]">
                {pinnedCars.length} of 3 selected
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(groups).map(([groupTitle, cars]) => (
                <div key={groupTitle} className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    {groupTitle}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {cars.slice(0, 6).map(([carKey, carName]) => {
                      const isPinned = pinnedCars.includes(carKey);
                      return (
                        <button
                          key={carKey}
                          type="button"
                          onClick={() => togglePinnedCar(carKey)}
                          className={`p-2 rounded-lg border text-left text-[11px] truncate transition-colors cursor-pointer ${
                            isPinned
                              ? "bg-red-600/20 border-red-500 text-white font-bold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {carName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
