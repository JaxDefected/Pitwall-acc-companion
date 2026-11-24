import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, Activity } from "lucide-react";
import { useSetups } from "../context/SetupContext";
import SetupHeader from "../components/setups/SetupHeader";
import SetupFilterBar from "../components/setups/SetupFilterBar";
import SetupCard from "../components/setups/SetupCard";
import SetupInspector from "../components/setups/SetupInspector";
import { SetupItem } from "../firebase";

export default function JaxtunePage() {
  const { setupId } = useParams<{ setupId?: string }>();
  const navigate = useNavigate();
  const {
    setupsList,
    activeSetup,
    setActiveSetup,
    allRatingsList,
    isMobile,
  } = useSetups();

  // Filters
  const [searchText, setSearchText] = useState("");
  const [carFilter, setCarFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [onlyPinnedCarsFilter, setOnlyPinnedCarsFilter] = useState(false);

  // Mobile view mode: 'registry' or 'inspection'
  const [mobileView, setMobileView] = useState<"registry" | "inspection">(
    setupId ? "inspection" : "registry"
  );

  // If setupId param is present, sync with activeSetup
  useEffect(() => {
    if (setupId && setupsList.length > 0) {
      const found = setupsList.find((s) => s.id === setupId);
      if (found) {
        setActiveSetup(found);
        setMobileView("inspection");
      }
    }
  }, [setupId, setupsList, setActiveSetup]);

  // Filter curated setups
  const filteredSetups = useMemo(() => {
    return setupsList.filter((setup) => {
      // Search text
      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        const matchesName = setup.name.toLowerCase().includes(query);
        const matchesCar = (setup.car || "").toLowerCase().includes(query);
        const matchesTrack = (setup.track || "").toLowerCase().includes(query);
        const matchesNotes = (setup.notes || "").toLowerCase().includes(query);
        if (!matchesName && !matchesCar && !matchesTrack && !matchesNotes) {
          return false;
        }
      }

      // Car filter
      if (carFilter !== "all" && setup.car !== carFilter) {
        return false;
      }

      // Track filter
      if (trackFilter !== "all" && setup.track !== trackFilter) {
        return false;
      }

      return true;
    });
  }, [setupsList, searchText, carFilter, trackFilter]);

  const handleSelectSetup = (setup: SetupItem) => {
    setActiveSetup(setup);
    navigate(`/setups/jaxtune/${setup.id}`);
    if (isMobile) {
      setMobileView("inspection");
    }
  };

  const handleBackToList = () => {
    setMobileView("registry");
    navigate("/setups/jaxtune");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6">
      {/* Segmented header: Jaxtune | Community */}
      <SetupHeader />

      {/* Main Grid: Registry List (left) + Inspection Panel (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter & Setup List (Col span 5 on desktop) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            isMobile && mobileView === "inspection" ? "hidden" : "block"
          }`}
        >
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

          {/* Setups List Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
              <span className="font-bold uppercase tracking-wider">
                Curated Setups ({filteredSetups.length})
              </span>
              <span className="text-[10px] text-zinc-500">ACC v1.9+ Physics</span>
            </div>

            {filteredSetups.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
                <p className="text-xs font-mono">No setups matched your filter parameters.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredSetups.map((setup) => {
                  const setupRatings = allRatingsList.filter((r) => r.setupId === setup.id);
                  const avg =
                    setupRatings.length > 0
                      ? setupRatings.reduce((sum, r) => sum + r.rating, 0) / setupRatings.length
                      : 0;

                  return (
                    <SetupCard
                      key={setup.id}
                      setup={setup}
                      isActive={activeSetup?.id === setup.id}
                      onSelect={handleSelectSetup}
                      avgRating={avg}
                      reviewCount={setupRatings.length}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Setup Inspector (Col span 7 on desktop) */}
        <div
          className={`lg:col-span-7 ${
            isMobile && mobileView === "registry" ? "hidden" : "block"
          }`}
        >
          <SetupInspector
            setup={activeSetup}
            onBack={isMobile ? handleBackToList : undefined}
          />
        </div>
      </div>
    </div>
  );
}
