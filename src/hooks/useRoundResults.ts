import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, isCloudEnabled } from "../firebase";

export interface RoundDriverResult {
  position: number;
  driverId: string;
  name: string;
  class: "pro" | "proam" | "am";
  car: string;
  gap: string;
  laps: number;
  bestLap: string;
  points: number;
  qualifyingPos?: number;
  penalties?: string;
  status: "FINISHED" | "DNF" | "DNS" | "DSQ";
}

export interface RoundResultSummary {
  roundId: string;
  roundNumber: number;
  trackName: string;
  status: "completed" | "upcoming" | "live";
  resultsByClass: {
    pro: RoundDriverResult[];
    proam: RoundDriverResult[];
    am: RoundDriverResult[];
  };
  fastestLap?: {
    driver: string;
    lapTime: string;
    car: string;
  };
}

const DEFAULT_RESULTS: Record<string, RoundResultSummary> = {
  r04: {
    roundId: "r04",
    roundNumber: 4,
    trackName: "Silverstone",
    status: "completed",
    resultsByClass: {
      pro: [
        { position: 1, driverId: "apexhunter", name: "ApexHunter", class: "pro", car: "Ferrari 296 GT3", gap: "Winner (28 Laps)", laps: 28, bestLap: "1:58.214", points: 35, qualifyingPos: 1, status: "FINISHED" },
        { position: 2, driverId: "turbotadpole", name: "TurboTadpole", class: "pro", car: "BMW M4 GT3", gap: "+1.842s", laps: 28, bestLap: "1:58.405", points: 28, qualifyingPos: 3, status: "FINISHED" },
        { position: 3, driverId: "velocekev", name: "VeloceKev", class: "pro", car: "Porsche 992 GT3 R", gap: "+4.120s", laps: 28, bestLap: "1:58.330", points: 25, qualifyingPos: 2, status: "FINISHED" },
        { position: 4, driverId: "ozsimracer", name: "OzSimRacer", class: "pro", car: "Aston Martin Vantage V8", gap: "+8.915s", laps: 28, bestLap: "1:58.740", points: 23, qualifyingPos: 5, status: "FINISHED" },
        { position: 5, driverId: "trackphantom", name: "TrackPhantom", class: "pro", car: "McLaren 720S GT3 Evo", gap: "+12.440s", laps: 28, bestLap: "1:58.910", points: 21, qualifyingPos: 4, status: "FINISHED" },
      ],
      proam: [
        { position: 1, driverId: "koalaracing", name: "KoalaRacing", class: "proam", car: "Porsche 992 GT3 R", gap: "Winner (28 Laps)", laps: 28, bestLap: "1:59.102", points: 35, qualifyingPos: 1, status: "FINISHED" },
        { position: 2, driverId: "slipstreamoz", name: "SlipstreamOz", class: "proam", car: "Audi R8 LMS Evo II", gap: "+3.210s", laps: 28, bestLap: "1:59.450", points: 28, qualifyingPos: 2, status: "FINISHED" },
        { position: 3, driverId: "shiftinggears", name: "ShiftingGears", class: "proam", car: "Ferrari 296 GT3", gap: "+7.800s", laps: 28, bestLap: "1:59.620", points: 25, qualifyingPos: 3, status: "FINISHED" },
      ],
      am: [
        { position: 1, driverId: "rookieross", name: "RookieRoss", class: "am", car: "Ferrari 296 GT3", gap: "Winner (27 Laps)", laps: 27, bestLap: "2:00.120", points: 40, qualifyingPos: 1, status: "FINISHED" },
        { position: 2, driverId: "latebraker99", name: "LateBraker99", class: "am", car: "Aston Martin Vantage V8", gap: "+5.400s", laps: 27, bestLap: "2:00.540", points: 30, qualifyingPos: 2, status: "FINISHED" },
        { position: 3, driverId: "curbhopper", name: "CurbHopper", class: "am", car: "BMW M4 GT3", gap: "+11.200s", laps: 27, bestLap: "2:00.890", points: 25, qualifyingPos: 3, status: "FINISHED" },
      ],
    },
    fastestLap: {
      driver: "ApexHunter",
      lapTime: "1:58.214",
      car: "Ferrari 296 GT3",
    },
  },
};

export function useRoundResults(seriesId: string = "lnr-acc-s18", roundId: string = "r04") {
  const [result, setResult] = useState<RoundResultSummary | null>(DEFAULT_RESULTS[roundId] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      if (!isCloudEnabled || !db) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "series", seriesId, "results", roundId));
        if (!cancelled && snap.exists()) {
          setResult(snap.data() as RoundResultSummary);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResult();
    return () => {
      cancelled = true;
    };
  }, [seriesId, roundId]);

  return { result, loading, error };
}
