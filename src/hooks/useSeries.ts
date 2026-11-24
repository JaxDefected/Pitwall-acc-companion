import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, isCloudEnabled } from "../firebase";

export interface RoundSummary {
  id: string;
  roundNumber: number;
  trackKey: string;
  trackName: string;
  carKey: string;
  carName: string;
  startAt: string;
  sessions: {
    practiceAt: string;
    qualifyingAt: string;
    raceAt: string;
    race2At?: string;
  };
  status: "upcoming" | "live" | "completed";
  notes?: string;
}

export interface SeriesDetails {
  id: string;
  name: string;
  shortName: string;
  seasonLabel: string;
  timezone: string;
  roundsCount: number;
  rounds: RoundSummary[];
}

const DEFAULT_SERIES: SeriesDetails = {
  id: "lnr-acc-s18",
  name: "Late Night Racing ACC Series",
  shortName: "LNR S18",
  seasonLabel: "Season 18",
  timezone: "Australia/Sydney",
  roundsCount: 10,
  rounds: [
    { id: "r01", roundNumber: 1, trackKey: "monza", trackName: "Monza", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-10-17T09:00:00Z", sessions: { practiceAt: "2026-10-17T09:00:00Z", qualifyingAt: "2026-10-17T09:45:00Z", raceAt: "2026-10-17T10:05:00Z" }, status: "completed" },
    { id: "r02", roundNumber: 2, trackKey: "spa", trackName: "Spa-Francorchamps", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-10-24T09:00:00Z", sessions: { practiceAt: "2026-10-24T09:00:00Z", qualifyingAt: "2026-10-24T09:45:00Z", raceAt: "2026-10-24T10:05:00Z" }, status: "completed" },
    { id: "r03", roundNumber: 3, trackKey: "mount_panorama", trackName: "Mount Panorama (Bathurst)", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-10-31T09:00:00Z", sessions: { practiceAt: "2026-10-31T09:00:00Z", qualifyingAt: "2026-10-31T09:45:00Z", raceAt: "2026-10-31T10:05:00Z" }, status: "completed" },
    { id: "r04", roundNumber: 4, trackKey: "silverstone", trackName: "Silverstone", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-11-07T09:00:00Z", sessions: { practiceAt: "2026-11-07T09:00:00Z", qualifyingAt: "2026-11-07T09:45:00Z", raceAt: "2026-11-07T10:05:00Z" }, status: "completed" },
    { id: "r05", roundNumber: 5, trackKey: "kyalami", trackName: "Kyalami", carKey: "ginetta_g55_gt4", carName: "GT3 Class + Ginetta GT4", startAt: "2026-11-26T09:00:00Z", sessions: { practiceAt: "2026-11-26T09:00:00Z", qualifyingAt: "2026-11-26T09:45:00Z", raceAt: "2026-11-26T10:05:00Z" }, status: "upcoming" },
    { id: "r06", roundNumber: 6, trackKey: "nurburgring", trackName: "Nürburgring GP", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-12-03T09:00:00Z", sessions: { practiceAt: "2026-12-03T09:00:00Z", qualifyingAt: "2026-12-03T09:45:00Z", raceAt: "2026-12-03T10:05:00Z" }, status: "upcoming" },
    { id: "r07", roundNumber: 7, trackKey: "barcelona", trackName: "Barcelona-Catalunya", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-12-10T09:00:00Z", sessions: { practiceAt: "2026-12-10T09:00:00Z", qualifyingAt: "2026-12-10T09:45:00Z", raceAt: "2026-12-10T10:05:00Z" }, status: "upcoming" },
    { id: "r08", roundNumber: 8, trackKey: "suzuka", trackName: "Suzuka", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-12-17T09:00:00Z", sessions: { practiceAt: "2026-12-17T09:00:00Z", qualifyingAt: "2026-12-17T09:45:00Z", raceAt: "2026-12-17T10:05:00Z" }, status: "upcoming" },
    { id: "r09", roundNumber: 9, trackKey: "watkins_glen", trackName: "Watkins Glen", carKey: "all_gt3", carName: "GT3 Class", startAt: "2026-12-24T09:00:00Z", sessions: { practiceAt: "2026-12-24T09:00:00Z", qualifyingAt: "2026-12-24T09:45:00Z", raceAt: "2026-12-24T10:05:00Z" }, status: "upcoming" },
    { id: "r10", roundNumber: 10, trackKey: "mount_panorama", trackName: "Mount Panorama Finale", carKey: "all_gt3", carName: "GT3 Class", startAt: "2027-01-07T09:00:00Z", sessions: { practiceAt: "2027-01-07T09:00:00Z", qualifyingAt: "2027-01-07T09:45:00Z", raceAt: "2027-01-07T10:05:00Z" }, status: "upcoming" },
  ],
};

export function useSeries(seriesId: string = "lnr-acc-s18") {
  const [series, setSeries] = useState<SeriesDetails>(DEFAULT_SERIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeries() {
      if (!isCloudEnabled || !db) return;
      setLoading(true);
      try {
        const seriesSnap = await getDoc(doc(db, "series", seriesId));
        const roundsSnap = await getDocs(collection(db, "series", seriesId, "rounds"));

        if (!cancelled && seriesSnap.exists()) {
          const sData = seriesSnap.data();
          const rData = roundsSnap.docs.map((d) => d.data() as RoundSummary);
          rData.sort((a, b) => a.roundNumber - b.roundNumber);

          setSeries({
            id: seriesId,
            name: sData.name || DEFAULT_SERIES.name,
            shortName: sData.shortName || DEFAULT_SERIES.shortName,
            seasonLabel: sData.seasonLabel || DEFAULT_SERIES.seasonLabel,
            timezone: sData.timezone || DEFAULT_SERIES.timezone,
            roundsCount: rData.length || DEFAULT_SERIES.roundsCount,
            rounds: rData.length > 0 ? rData : DEFAULT_SERIES.rounds,
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSeries();
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  return { series, loading, error };
}
