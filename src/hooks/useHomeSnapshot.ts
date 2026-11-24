import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, isCloudEnabled } from "../firebase";

export interface HomeSnapshot {
  seriesId: string;
  seasonLabel: string;
  nextRound: {
    roundNumber: number;
    roundId: string;
    trackKey: string;
    trackName: string;
    carName: string;
    startAt: string;
    sessions: {
      practiceAt: string;
      qualifyingAt: string;
      raceAt: string;
      race2At?: string;
    };
    status: "upcoming" | "live" | "completed";
  } | null;
  roundTimeline: Array<{
    roundNumber: number;
    roundId: string;
    trackKey: string;
    circuitName: string;
    status: "upcoming" | "next" | "completed" | "live";
  }>;
  upcomingRaces: Array<{
    roundNumber: number;
    roundId: string;
    trackKey: string;
    trackName: string;
    dateFormatted: string;
    car: string;
  }>;
  recentResults: {
    roundNumber: number;
    roundId: string;
    trackName: string;
    podium: Array<{ pos: number; name: string; car: string; gap: string }>;
    fastestLap?: { name: string; lapTime: string };
  } | null;
  standingsTop: Record<
    string,
    Array<{
      pos: number;
      name: string;
      points: number;
      wins: number;
      podiums: number;
      car: string;
    }>
  >;
  updatedAt: string;
}

const DEFAULT_SNAPSHOT: HomeSnapshot = {
  seriesId: "lnr-acc-s18",
  seasonLabel: "Season 18",
  nextRound: {
    roundNumber: 5,
    roundId: "r05",
    trackKey: "kyalami",
    trackName: "Kyalami Grand Prix Circuit",
    carName: "GT3 Class & Ginetta G55 GT4",
    startAt: "2026-11-26T09:00:00Z", // 20:00 AEDT
    sessions: {
      practiceAt: "2026-11-26T09:00:00Z",
      qualifyingAt: "2026-11-26T09:45:00Z",
      raceAt: "2026-11-26T10:05:00Z",
    },
    status: "upcoming",
  },
  roundTimeline: [
    { roundNumber: 1, roundId: "r01", trackKey: "monza", circuitName: "Monza", status: "completed" },
    { roundNumber: 2, roundId: "r02", trackKey: "spa", circuitName: "Spa-Francorchamps", status: "completed" },
    { roundNumber: 3, roundId: "r03", trackKey: "mount_panorama", circuitName: "Mount Panorama", status: "completed" },
    { roundNumber: 4, roundId: "r04", trackKey: "silverstone", circuitName: "Silverstone", status: "completed" },
    { roundNumber: 5, roundId: "r05", trackKey: "kyalami", circuitName: "Kyalami", status: "next" },
    { roundNumber: 6, roundId: "r06", trackKey: "nurburgring", circuitName: "Nürburgring GP", status: "upcoming" },
    { roundNumber: 7, roundId: "r07", trackKey: "barcelona", circuitName: "Barcelona", status: "upcoming" },
    { roundNumber: 8, roundId: "r08", trackKey: "suzuka", circuitName: "Suzuka", status: "upcoming" },
    { roundNumber: 9, roundId: "r09", trackKey: "watkins_glen", circuitName: "Watkins Glen", status: "upcoming" },
    { roundNumber: 10, roundId: "r10", trackKey: "mount_panorama", circuitName: "Mount Panorama", status: "upcoming" },
  ],
  upcomingRaces: [
    { roundNumber: 6, roundId: "r06", trackKey: "nurburgring", trackName: "Nürburgring GP", dateFormatted: "Dec 03", car: "GT3 Class" },
    { roundNumber: 7, roundId: "r07", trackKey: "barcelona", trackName: "Barcelona-Catalunya", dateFormatted: "Dec 10", car: "GT3 Class" },
    { roundNumber: 8, roundId: "r08", trackKey: "suzuka", trackName: "Suzuka", dateFormatted: "Dec 17", car: "GT3 Class" },
  ],
  recentResults: {
    roundNumber: 4,
    roundId: "r04",
    trackName: "Silverstone",
    podium: [
      { pos: 1, name: "ApexHunter", car: "Ferrari 296 GT3", gap: "Winner (28 Laps)" },
      { pos: 2, name: "TurboTadpole", car: "BMW M4 GT3", gap: "+1.842s" },
      { pos: 3, name: "VeloceKev", car: "Porsche 992 GT3 R", gap: "+4.120s" },
    ],
    fastestLap: { name: "ApexHunter", lapTime: "1:58.204" },
  },
  standingsTop: {
    pro: [
      { pos: 1, name: "ApexHunter", points: 148, wins: 3, podiums: 4, car: "Ferrari 296 GT3" },
      { pos: 2, name: "TurboTadpole", points: 135, wins: 1, podiums: 4, car: "BMW M4 GT3" },
      { pos: 3, name: "VeloceKev", points: 120, wins: 1, podiums: 3, car: "Porsche 992 GT3 R" },
      { pos: 4, name: "OzSimRacer", points: 104, wins: 0, podiums: 2, car: "Aston Martin Vantage V8" },
      { pos: 5, name: "TrackPhantom", points: 92, wins: 0, podiums: 1, car: "McLaren 720S GT3 Evo" },
    ],
    proam: [
      { pos: 1, name: "ShadowShift", points: 130, wins: 2, podiums: 4, car: "BMW M4 GT3" },
      { pos: 2, name: "RedlineRacer", points: 118, wins: 1, podiums: 3, car: "Audi R8 LMS Evo II" },
      { pos: 3, name: "DownforceDan", points: 105, wins: 1, podiums: 2, car: "Mercedes-AMG GT3 Evo" },
      { pos: 4, name: "ApexSeeker", points: 96, wins: 0, podiums: 2, car: "Ferrari 296 GT3" },
      { pos: 5, name: "KurbRider", points: 88, wins: 0, podiums: 1, car: "Porsche 992 GT3 R" },
    ],
    am: [
      { pos: 1, name: "RookieSpeed", points: 112, wins: 2, podiums: 3, car: "Aston Martin Vantage V8" },
      { pos: 2, name: "LateBraker99", points: 101, wins: 1, podiums: 3, car: "Ferrari 296 GT3" },
      { pos: 3, name: "PaddockGhost", points: 90, wins: 1, podiums: 2, car: "BMW M4 GT3" },
      { pos: 4, name: "ChicaneMaster", points: 79, wins: 0, podiums: 1, car: "McLaren 720S GT3" },
      { pos: 5, name: "ApexNovice", points: 71, wins: 0, podiums: 0, car: "Mercedes-AMG GT3" },
    ],
  },
  updatedAt: new Date().toISOString(),
};

const CACHE_KEY = "pitwall_home_snapshot_v1";

export function useHomeSnapshot(seriesId: string = "lnr-acc-s18") {
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`${CACHE_KEY}_${seriesId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_SNAPSHOT;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      if (!isCloudEnabled || !db) return;
      setLoading(true);
      try {
        const docRef = doc(db, "home", seriesId);
        const snap = await getDoc(docRef);
        if (!cancelled && snap.exists()) {
          const data = snap.data() as HomeSnapshot;
          setSnapshot(data);
          try {
            localStorage.setItem(`${CACHE_KEY}_${seriesId}`, JSON.stringify(data));
          } catch {}
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSnapshot();
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  return { snapshot, loading, error };
}
