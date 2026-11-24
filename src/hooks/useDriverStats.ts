import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, isCloudEnabled } from "../firebase";

export type PaceTier = "Alien" | "Competitive" | "Good" | "Midpack" | "Developing";

export interface TrackPaceRecord {
  track: string;
  trackKey: string;
  bestLap: string;
  pacePercentage: number;
  tier: PaceTier;
}

export interface DriverHistoryRound {
  roundNumber: number;
  roundId: string;
  trackName: string;
  car: string;
  qualifyingPos: number;
  finishPos: number;
  points: number;
  penalties: number;
  status: "FINISHED" | "DNF" | "DNS" | "DSQ";
}

export interface TrackCarStatRecord {
  track: string;
  trackKey: string;
  car: string;
  races: number;
  wins: number;
  podiums: number;
  bestLap: string;
  pacePercentage: number;
  tier: PaceTier;
}

export interface DriverRecentFormRound {
  roundNumber: number;
  roundId: string;
  trackName: string;
  finishPos: number;
  points: number;
}

export interface DriverProfileStats {
  id: string;
  name: string;
  class: "pro" | "proam" | "am";
  car: string;
  bio?: string;
  avatarUrl?: string;
  linkedUserId?: string;
  rating?: string | number;
  seasonRecord: {
    races: number;
    wins: number;
    podiums: number;
    poles: number;
    fastestLaps: number;
    avgQuali: number;
    avgFinish: number;
    points: number;
    championshipPos: number;
  };
  overallPace: {
    percentage: number;
    tier: PaceTier;
    consistency: number;
    avgDeltaToPB: string;
  };
  trackPace: TrackPaceRecord[];
  trackCarStats?: TrackCarStatRecord[];
  recentForm?: DriverRecentFormRound[];
  history: DriverHistoryRound[];
}

export function getTierFromPercentage(pct: number): PaceTier {
  if (pct <= 101.5) return "Alien";
  if (pct <= 103.0) return "Competitive";
  if (pct <= 104.5) return "Good";
  if (pct <= 106.0) return "Midpack";
  return "Developing";
}

const MOCK_DRIVERS: Record<string, DriverProfileStats> = {
  apexhunter: {
    id: "apexhunter",
    name: "ApexHunter",
    class: "pro",
    car: "Ferrari 296 GT3",
    bio: "Late Night Racing Season 18 Championship contender. Specialising in mid-engine balance and high-speed precision.",
    rating: "1942 ± 38",
    seasonRecord: {
      races: 4,
      wins: 2,
      podiums: 4,
      poles: 2,
      fastestLaps: 2,
      avgQuali: 1.5,
      avgFinish: 1.8,
      points: 142,
      championshipPos: 1,
    },
    overallPace: {
      percentage: 101.2,
      tier: "Alien",
      consistency: 98.4,
      avgDeltaToPB: "+0.28s",
    },
    trackPace: [
      { track: "Monza", trackKey: "monza", bestLap: "1:47.310", pacePercentage: 101.1, tier: "Alien" },
      { track: "Spa-Francorchamps", trackKey: "spa", bestLap: "2:16.890", pacePercentage: 101.3, tier: "Alien" },
      { track: "Mount Panorama", trackKey: "mount_panorama", bestLap: "2:01.420", pacePercentage: 100.9, tier: "Alien" },
      { track: "Silverstone", trackKey: "silverstone", bestLap: "1:58.214", pacePercentage: 101.2, tier: "Alien" },
    ],
    trackCarStats: [
      { track: "Monza", trackKey: "monza", car: "Ferrari 296 GT3", races: 1, wins: 0, podiums: 1, bestLap: "1:47.310", pacePercentage: 101.1, tier: "Alien" },
      { track: "Spa-Francorchamps", trackKey: "spa", car: "Ferrari 296 GT3", races: 1, wins: 0, podiums: 1, bestLap: "2:16.890", pacePercentage: 101.3, tier: "Alien" },
      { track: "Mount Panorama", trackKey: "mount_panorama", car: "Ferrari 296 GT3", races: 1, wins: 1, podiums: 1, bestLap: "2:01.420", pacePercentage: 100.9, tier: "Alien" },
      { track: "Silverstone", trackKey: "silverstone", car: "Ferrari 296 GT3", races: 1, wins: 1, podiums: 1, bestLap: "1:58.214", pacePercentage: 101.2, tier: "Alien" },
    ],
    recentForm: [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", finishPos: 2, points: 35 },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", finishPos: 2, points: 32 },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", finishPos: 1, points: 40 },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", finishPos: 1, points: 35 },
    ],
    history: [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", car: "Ferrari 296 GT3", qualifyingPos: 2, finishPos: 2, points: 35, penalties: 0, status: "FINISHED" },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", car: "Ferrari 296 GT3", qualifyingPos: 1, finishPos: 2, points: 32, penalties: 0, status: "FINISHED" },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", car: "Ferrari 296 GT3", qualifyingPos: 1, finishPos: 1, points: 40, penalties: 0, status: "FINISHED" },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", car: "Ferrari 296 GT3", qualifyingPos: 1, finishPos: 1, points: 35, penalties: 0, status: "FINISHED" },
    ],
  },
  turbotadpole: {
    id: "turbotadpole",
    name: "TurboTadpole",
    class: "pro",
    car: "BMW M4 GT3",
    bio: "Aggressive trail-braker with strong racecraft and endurance tyre management.",
    seasonRecord: {
      races: 4,
      wins: 1,
      podiums: 3,
      poles: 1,
      fastestLaps: 1,
      avgQuali: 2.3,
      avgFinish: 2.5,
      points: 128,
      championshipPos: 2,
    },
    overallPace: {
      percentage: 101.6,
      tier: "Alien",
      consistency: 97.9,
      avgDeltaToPB: "+0.34s",
    },
    trackPace: [
      { track: "Monza", trackKey: "monza", bestLap: "1:47.120", pacePercentage: 100.9, tier: "Alien" },
      { track: "Spa-Francorchamps", trackKey: "spa", bestLap: "2:17.300", pacePercentage: 101.7, tier: "Alien" },
      { track: "Mount Panorama", trackKey: "mount_panorama", bestLap: "2:01.890", pacePercentage: 101.4, tier: "Alien" },
      { track: "Silverstone", trackKey: "silverstone", bestLap: "1:58.405", pacePercentage: 101.5, tier: "Alien" },
    ],
    history: [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", car: "BMW M4 GT3", qualifyingPos: 1, finishPos: 1, points: 40, penalties: 0, status: "FINISHED" },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", car: "BMW M4 GT3", qualifyingPos: 3, finishPos: 4, points: 25, penalties: 0, status: "FINISHED" },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", car: "BMW M4 GT3", qualifyingPos: 2, finishPos: 2, points: 35, penalties: 0, status: "FINISHED" },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", car: "BMW M4 GT3", qualifyingPos: 3, finishPos: 2, points: 28, penalties: 0, status: "FINISHED" },
    ],
  },
  velocekev: {
    id: "velocekev",
    name: "VeloceKev",
    class: "pro",
    car: "Porsche 992 GT3 R",
    bio: "Porsche rear-engine specialist. Consistently quick in high-speed complexes and technical sectors.",
    seasonRecord: {
      races: 4,
      wins: 1,
      podiums: 2,
      poles: 1,
      fastestLaps: 1,
      avgQuali: 2.8,
      avgFinish: 3.2,
      points: 115,
      championshipPos: 3,
    },
    overallPace: {
      percentage: 102.1,
      tier: "Competitive",
      consistency: 96.8,
      avgDeltaToPB: "+0.45s",
    },
    trackPace: [
      { track: "Monza", trackKey: "monza", bestLap: "1:47.850", pacePercentage: 102.4, tier: "Competitive" },
      { track: "Spa-Francorchamps", trackKey: "spa", bestLap: "2:16.740", pacePercentage: 101.1, tier: "Alien" },
      { track: "Mount Panorama", trackKey: "mount_panorama", bestLap: "2:02.300", pacePercentage: 102.0, tier: "Competitive" },
      { track: "Silverstone", trackKey: "silverstone", bestLap: "1:58.330", pacePercentage: 101.4, tier: "Alien" },
    ],
    history: [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", car: "Porsche 992 GT3 R", qualifyingPos: 4, finishPos: 5, points: 22, penalties: 0, status: "FINISHED" },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", car: "Porsche 992 GT3 R", qualifyingPos: 2, finishPos: 1, points: 40, penalties: 0, status: "FINISHED" },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", car: "Porsche 992 GT3 R", qualifyingPos: 3, finishPos: 3, points: 28, penalties: 0, status: "FINISHED" },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", car: "Porsche 992 GT3 R", qualifyingPos: 2, finishPos: 3, points: 25, penalties: 0, status: "FINISHED" },
    ],
  },
  koalaracing: {
    id: "koalaracing",
    name: "KoalaRacing",
    class: "proam",
    car: "Porsche 992 GT3 R",
    bio: "Pro-Am championship leader with stellar tyre wear control and smooth inputs.",
    seasonRecord: {
      races: 4,
      wins: 2,
      podiums: 3,
      poles: 1,
      fastestLaps: 2,
      avgQuali: 1.8,
      avgFinish: 2.0,
      points: 135,
      championshipPos: 1,
    },
    overallPace: {
      percentage: 102.4,
      tier: "Competitive",
      consistency: 96.5,
      avgDeltaToPB: "+0.42s",
    },
    trackPace: [
      { track: "Monza", trackKey: "monza", bestLap: "1:48.100", pacePercentage: 102.6, tier: "Competitive" },
      { track: "Spa-Francorchamps", trackKey: "spa", bestLap: "2:17.800", pacePercentage: 102.1, tier: "Competitive" },
      { track: "Mount Panorama", trackKey: "mount_panorama", bestLap: "2:02.900", pacePercentage: 102.6, tier: "Competitive" },
      { track: "Silverstone", trackKey: "silverstone", bestLap: "1:59.102", pacePercentage: 102.2, tier: "Competitive" },
    ],
    history: [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", car: "Porsche 992 GT3 R", qualifyingPos: 2, finishPos: 2, points: 35, penalties: 0, status: "FINISHED" },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", car: "Porsche 992 GT3 R", qualifyingPos: 1, finishPos: 1, points: 40, penalties: 0, status: "FINISHED" },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", car: "Porsche 992 GT3 R", qualifyingPos: 4, finishPos: 4, points: 25, penalties: 0, status: "FINISHED" },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", car: "Porsche 992 GT3 R", qualifyingPos: 1, finishPos: 1, points: 35, penalties: 0, status: "FINISHED" },
    ],
  },
  rookieross: {
    id: "rookieross",
    name: "RookieRoss",
    class: "am",
    car: "Ferrari 296 GT3",
    bio: "Am category pace-setter. Highly determined and rapidly closing the gap to Pro-Am frontrunners.",
    seasonRecord: {
      races: 4,
      wins: 3,
      podiums: 4,
      poles: 3,
      fastestLaps: 3,
      avgQuali: 1.3,
      avgFinish: 1.5,
      points: 140,
      championshipPos: 1,
    },
    overallPace: {
      percentage: 103.2,
      tier: "Good",
      consistency: 94.8,
      avgDeltaToPB: "+0.62s",
    },
    trackPace: [
      { track: "Monza", trackKey: "monza", bestLap: "1:48.800", pacePercentage: 103.3, tier: "Good" },
      { track: "Spa-Francorchamps", trackKey: "spa", bestLap: "2:18.900", pacePercentage: 103.1, tier: "Good" },
      { track: "Mount Panorama", trackKey: "mount_panorama", bestLap: "2:03.800", pacePercentage: 103.4, tier: "Good" },
      { track: "Silverstone", trackKey: "silverstone", bestLap: "2:00.120", pacePercentage: 103.0, tier: "Good" },
    ],
    history: [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", car: "Ferrari 296 GT3", qualifyingPos: 1, finishPos: 1, points: 40, penalties: 0, status: "FINISHED" },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", car: "Ferrari 296 GT3", qualifyingPos: 1, finishPos: 2, points: 35, penalties: 0, status: "FINISHED" },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", car: "Ferrari 296 GT3", qualifyingPos: 2, finishPos: 4, points: 25, penalties: 0, status: "FINISHED" },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", car: "Ferrari 296 GT3", qualifyingPos: 1, finishPos: 1, points: 40, penalties: 0, status: "FINISHED" },
    ],
  },
};

export function useDriverProfile(driverId?: string) {
  const normalizedId = (driverId || "").toLowerCase().trim();
  const [profile, setProfile] = useState<DriverProfileStats | null>(
    MOCK_DRIVERS[normalizedId] || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDriver() {
      if (!normalizedId) return;

      if (isCloudEnabled && db) {
        setLoading(true);
        try {
          const snap = await getDoc(doc(db, "driverStats", normalizedId));
          if (!cancelled && snap.exists()) {
            setProfile(snap.data() as DriverProfileStats);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          if (!cancelled) setError(err.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      // Fallback generator for unmapped driver IDs
      if (!cancelled && !MOCK_DRIVERS[normalizedId]) {
        const capitalName = normalizedId.charAt(0).toUpperCase() + normalizedId.slice(1);
        setProfile({
          id: normalizedId,
          name: capitalName,
          class: "pro",
          car: "Ferrari 296 GT3",
          bio: "Late Night Racing ACC Series Driver.",
          seasonRecord: {
            races: 4,
            wins: 0,
            podiums: 1,
            poles: 0,
            fastestLaps: 0,
            avgQuali: 4.5,
            avgFinish: 4.8,
            points: 88,
            championshipPos: 6,
          },
          overallPace: {
            percentage: 102.8,
            tier: "Competitive",
            consistency: 95.2,
            avgDeltaToPB: "+0.55s",
          },
          trackPace: [
            { track: "Monza", trackKey: "monza", bestLap: "1:48.400", pacePercentage: 102.5, tier: "Competitive" },
            { track: "Spa-Francorchamps", trackKey: "spa", bestLap: "2:18.500", pacePercentage: 102.9, tier: "Competitive" },
            { track: "Mount Panorama", trackKey: "mount_panorama", bestLap: "2:03.200", pacePercentage: 102.7, tier: "Competitive" },
            { track: "Silverstone", trackKey: "silverstone", bestLap: "1:59.800", pacePercentage: 102.6, tier: "Competitive" },
          ],
          history: [
            { roundNumber: 1, roundId: "r01", trackName: "Monza", car: "Ferrari 296 GT3", qualifyingPos: 5, finishPos: 4, points: 25, penalties: 0, status: "FINISHED" },
            { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", car: "Ferrari 296 GT3", qualifyingPos: 4, finishPos: 5, points: 22, penalties: 0, status: "FINISHED" },
            { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", car: "Ferrari 296 GT3", qualifyingPos: 6, finishPos: 6, points: 19, penalties: 0, status: "FINISHED" },
            { roundNumber: 4, roundId: "r04", trackName: "Silverstone", car: "Ferrari 296 GT3", qualifyingPos: 5, finishPos: 5, points: 22, penalties: 0, status: "FINISHED" },
          ],
        });
      }
    }

    loadDriver();
    return () => {
      cancelled = true;
    };
  }, [normalizedId]);

  return { profile, loading, error, allMockDrivers: Object.values(MOCK_DRIVERS) };
}
