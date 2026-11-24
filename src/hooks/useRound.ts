import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, isCloudEnabled } from "../firebase";
import { RoundSummary } from "./useSeries";
import { ACC_TRACKS, ACC_CARS } from "../utils/accParser";

export function useRound(seriesId: string = "lnr-acc-s18", roundId: string = "r05") {
  const [round, setRound] = useState<RoundSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRound() {
      setLoading(true);
      try {
        if (isCloudEnabled && db) {
          const snap = await getDoc(doc(db, "series", seriesId, "rounds", roundId));
          if (!cancelled && snap.exists()) {
            setRound(snap.data() as RoundSummary);
            setLoading(false);
            return;
          }
        }

        // Fallback round data
        const roundNum = parseInt(roundId.replace("r", ""), 10) || 5;
        const trackKey = roundNum === 1 ? "monza" : roundNum === 2 ? "spa" : roundNum === 3 ? "mount_panorama" : roundNum === 4 ? "silverstone" : "kyalami";

        if (!cancelled) {
          setRound({
            id: roundId,
            roundNumber: roundNum,
            trackKey,
            trackName: ACC_TRACKS[trackKey] || trackKey,
            carKey: "all_gt3",
            carName: "GT3 Class",
            startAt: "2026-11-26T09:00:00Z",
            sessions: {
              practiceAt: "2026-11-26T09:00:00Z",
              qualifyingAt: "2026-11-26T09:45:00Z",
              raceAt: "2026-11-26T10:05:00Z",
            },
            status: roundNum < 5 ? "completed" : roundNum === 5 ? "upcoming" : "upcoming",
            notes: "Standard 60-minute endurance with 1 mandatory pit stop for tyres & fuel.",
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRound();
    return () => {
      cancelled = true;
    };
  }, [seriesId, roundId]);

  return { round, loading, error };
}
