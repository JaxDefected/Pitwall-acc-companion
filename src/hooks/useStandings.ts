import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, isCloudEnabled } from "../firebase";

export interface DriverStanding {
  position: number;
  driverId: string;
  name: string;
  class: "pro" | "proam" | "am";
  car: string;
  points: number;
  wins: number;
  podiums: number;
  poles?: number;
  fastestLaps?: number;
  roundScores?: Record<number, number>;
}

export interface SeasonStandings {
  seriesId: string;
  seasonLabel: string;
  classes: {
    pro: DriverStanding[];
    proam: DriverStanding[];
    am: DriverStanding[];
  };
  updatedAt?: string;
}

const DEFAULT_STANDINGS: SeasonStandings = {
  seriesId: "lnr-acc-s18",
  seasonLabel: "Season 18",
  classes: {
    pro: [
      { position: 1, driverId: "apexhunter", name: "ApexHunter", class: "pro", car: "Ferrari 296 GT3", points: 142, wins: 2, podiums: 4, poles: 2, fastestLaps: 2, roundScores: { 1: 35, 2: 32, 3: 40, 4: 35 } },
      { position: 2, driverId: "turbotadpole", name: "TurboTadpole", class: "pro", car: "BMW M4 GT3", points: 128, wins: 1, podiums: 3, poles: 1, fastestLaps: 1, roundScores: { 1: 40, 2: 25, 3: 35, 4: 28 } },
      { position: 3, driverId: "velocekev", name: "VeloceKev", class: "pro", car: "Porsche 992 GT3 R", points: 115, wins: 1, podiums: 2, poles: 1, fastestLaps: 1, roundScores: { 1: 22, 2: 40, 3: 28, 4: 25 } },
      { position: 4, driverId: "ozsimracer", name: "OzSimRacer", class: "pro", car: "Aston Martin Vantage V8", points: 104, wins: 0, podiums: 2, poles: 0, fastestLaps: 0, roundScores: { 1: 28, 2: 28, 3: 25, 4: 23 } },
      { position: 5, driverId: "trackphantom", name: "TrackPhantom", class: "pro", car: "McLaren 720S GT3 Evo", points: 92, wins: 0, podiums: 1, poles: 0, fastestLaps: 0, roundScores: { 1: 25, 2: 22, 3: 22, 4: 23 } },
      { position: 6, driverId: "sydneyapex", name: "SydneyApex", class: "pro", car: "Audi R8 LMS Evo II", points: 79, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, roundScores: { 1: 20, 2: 20, 3: 20, 4: 19 } },
      { position: 7, driverId: "shadowshift", name: "ShadowShift", class: "pro", car: "Mercedes-AMG GT3 Evo", points: 68, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, roundScores: { 1: 18, 2: 17, 3: 18, 4: 15 } },
    ],
    proam: [
      { position: 1, driverId: "koalaracing", name: "KoalaRacing", class: "proam", car: "Porsche 992 GT3 R", points: 135, wins: 2, podiums: 3, poles: 1, fastestLaps: 2, roundScores: { 1: 35, 2: 40, 3: 25, 4: 35 } },
      { position: 2, driverId: "shiftinggears", name: "ShiftingGears", class: "proam", car: "Ferrari 296 GT3", points: 120, wins: 1, podiums: 3, poles: 2, fastestLaps: 0, roundScores: { 1: 40, 2: 25, 3: 30, 4: 25 } },
      { position: 3, driverId: "downforcesam", name: "DownforceSam", class: "proam", car: "BMW M4 GT3", points: 108, wins: 1, podiums: 2, poles: 0, fastestLaps: 1, roundScores: { 1: 25, 2: 28, 3: 35, 4: 20 } },
      { position: 4, driverId: "slipstreamoz", name: "SlipstreamOz", class: "proam", car: "Audi R8 LMS Evo II", points: 95, wins: 0, podiums: 2, poles: 0, fastestLaps: 0, roundScores: { 1: 22, 2: 22, 3: 23, 4: 28 } },
      { position: 5, driverId: "bathurstbullet", name: "BathurstBullet", class: "proam", car: "Aston Martin Vantage V8", points: 84, wins: 0, podiums: 1, poles: 0, fastestLaps: 0, roundScores: { 1: 20, 2: 20, 3: 22, 4: 22 } },
    ],
    am: [
      { position: 1, driverId: "rookieross", name: "RookieRoss", class: "am", car: "Ferrari 296 GT3", points: 140, wins: 3, podiums: 4, poles: 3, fastestLaps: 3, roundScores: { 1: 40, 2: 35, 3: 25, 4: 40 } },
      { position: 2, driverId: "curbhopper", name: "CurbHopper", class: "am", car: "BMW M4 GT3", points: 118, wins: 1, podiums: 3, poles: 1, fastestLaps: 0, roundScores: { 1: 25, 2: 40, 3: 28, 4: 25 } },
      { position: 3, driverId: "latebraker99", name: "LateBraker99", class: "am", car: "Aston Martin Vantage V8", points: 105, wins: 0, podiums: 2, poles: 0, fastestLaps: 1, roundScores: { 1: 28, 2: 25, 3: 22, 4: 30 } },
      { position: 4, driverId: "gavelgard", name: "GavelGard", class: "am", car: "Porsche 992 GT3 R", points: 88, wins: 0, podiums: 1, poles: 0, fastestLaps: 0, roundScores: { 1: 22, 2: 22, 3: 24, 4: 20 } },
      { position: 5, driverId: "redlineracer", name: "RedlineRacer", class: "am", car: "McLaren 720S GT3 Evo", points: 76, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, roundScores: { 1: 18, 2: 19, 3: 20, 4: 19 } },
    ],
  },
};

export function useStandings(seriesId: string = "lnr-acc-s18") {
  const [standings, setStandings] = useState<SeasonStandings>(DEFAULT_STANDINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStandings() {
      if (!isCloudEnabled || !db) return;
      setLoading(true);
      try {
        const standingsDoc = await getDoc(doc(db, "series", seriesId, "standings", "all"));
        if (!cancelled && standingsDoc.exists()) {
          const data = standingsDoc.data() as SeasonStandings;
          setStandings(data);
          return;
        }

        // Try individual class docs
        const proDoc = await getDoc(doc(db, "series", seriesId, "standings", "pro"));
        const proamDoc = await getDoc(doc(db, "series", seriesId, "standings", "proam"));
        const amDoc = await getDoc(doc(db, "series", seriesId, "standings", "am"));

        if (!cancelled && (proDoc.exists() || proamDoc.exists() || amDoc.exists())) {
          setStandings({
            seriesId,
            seasonLabel: DEFAULT_STANDINGS.seasonLabel,
            classes: {
              pro: (proDoc.data()?.drivers as DriverStanding[]) || DEFAULT_STANDINGS.classes.pro,
              proam: (proamDoc.data()?.drivers as DriverStanding[]) || DEFAULT_STANDINGS.classes.proam,
              am: (amDoc.data()?.drivers as DriverStanding[]) || DEFAULT_STANDINGS.classes.am,
            },
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStandings();
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  return { standings, loading, error };
}
