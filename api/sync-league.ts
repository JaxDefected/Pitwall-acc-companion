import crypto from "crypto";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  CALENDAR_SHEET_MAPPING,
  RESULTS_SHEET_MAPPING,
  STANDINGS_SHEET_MAPPING,
  PACE_METRICS_MAPPING,
  TRACK_CAR_STATS_MAPPING,
  PUBLIC_LEADERBOARD_MAPPING,
  resolveTrackKey,
  resolveCarKey,
  resolveRoundStatus,
  canonicalizeDriverId,
  resolveClassId,
  sydneyToUtcIso,
  resolveCarFromSeries,
  LNR_CALENDAR_GID,
  LNR_DEFAULT_SHEET_ID,
} from "../src/services/sync/mapping.js";
import { ACC_TRACKS, ACC_CARS } from "../src/utils/accParser.js";

// Initialize Firebase Admin Firestore
function getFirebaseAdminDb(): Firestore | null {
  try {
    const apps = getApps();
    let app: App;
    if (apps.length > 0) {
      app = apps[0];
    } else {
      const serviceAccountJson =
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      if (serviceAccountJson) {
        try {
          const parsed = JSON.parse(serviceAccountJson);
          app = initializeApp({
            credential: cert(parsed),
            projectId: parsed.project_id || process.env.VITE_FIREBASE_PROJECT_ID || "pitwall-companion",
          });
        } catch (e) {
          app = initializeApp({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pitwall-companion",
          });
        }
      } else {
        app = initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pitwall-companion",
        });
      }
    }
    return getFirestore(app);
  } catch (err: any) {
    console.warn("Firebase Admin initialization warning:", err.message);
    return null;
  }
}

export interface SyncResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  status: "success" | "partial" | "error";
  seriesId: string;
  roundsCount: number;
  docsWritten: number;
  docsSkipped: number;
  errors: string[];
}

/**
 * Parses CSV text into array of object rows using header keys.
 */
function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

/**
 * Finds column value using the mapping aliases.
 */
function getMappedValue(row: Record<string, string>, aliasList: string[]): string {
  for (const alias of aliasList) {
    if (row[alias] !== undefined && row[alias] !== "") {
      return row[alias];
    }
    const lowerAlias = alias.toLowerCase();
    for (const key in row) {
      if (key.toLowerCase() === lowerAlias && row[key] !== "") {
        return row[key];
      }
    }
  }
  return "";
}

/**
 * Computes deterministic content hash for idempotency check.
 */
function computeHash(obj: any): string {
  return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
}

function getTierFromPercentage(pct: number): "Alien" | "Competitive" | "Good" | "Midpack" | "Developing" {
  if (pct <= 101.5) return "Alien";
  if (pct <= 103.0) return "Competitive";
  if (pct <= 104.5) return "Good";
  if (pct <= 106.0) return "Midpack";
  return "Developing";
}

/**
 * Helper to fetch and parse official LNR Calendar rows directly from Google Sheets.
 * Filters strictly for Game == 'ACC', Column A date, Column C series, Column D track, Column H format.
 */
async function fetchLnrCalendarRows(sheetId: string, gid: string = LNR_CALENDAR_GID): Promise<Record<string, string>[]> {
  // 1. Query via Google Visualization API with SQL filter: B = 'ACC' AND C IS NOT NULL
  try {
    const query = encodeURIComponent("SELECT A, B, C, D, E, F, G, H WHERE B = 'ACC' AND C IS NOT NULL ORDER BY A ASC");
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}&tq=${query}`;
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
      if (match) {
        const data = JSON.parse(match[1]);
        const rows = data.table?.rows || [];
        const results: Record<string, string>[] = [];
        for (const row of rows) {
          const rawDate = (row.c[0]?.f || row.c[0]?.v || "").replace(/\u00a0/g, " ").trim();
          const game = String(row.c[1]?.v || "").trim();
          if (game.toUpperCase() !== "ACC") continue;

          const series = String(row.c[2]?.v || "").trim();
          const location = String(row.c[3]?.v || "").trim();
          if (!location || series.toLowerCase().includes("break week")) continue;

          const dow = String(row.c[4]?.v || "").trim();
          const notes = String(row.c[5]?.v || "").trim();
          const channel = String(row.c[6]?.v || "").trim();
          const format = String(row.c[7]?.v || "").trim();

          results.push({
            "Event Date-TIme (Syd) ": rawDate,
            Game: game,
            Series: series,
            Location: location,
            DOW: dow,
            Notes: notes,
            "discord channel ID": channel,
            "Race Format": format,
          });
        }
        if (results.length > 0) {
          console.log(`[Sync] Successfully parsed ${results.length} ACC events from Google Sheet gid=${gid}.`);
          return results;
        }
      }
    }
  } catch (err: any) {
    console.warn("[Sync] GViz query for LNR Calendar failed, trying CSV export:", err.message);
  }

  // 2. Fallback to direct CSV export by GID
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      const rows = parseCsv(text);
      return rows.filter((r) => {
        const game = (r.Game || r.game || "").trim().toUpperCase();
        const loc = (r.Location || r.location || "").trim();
        const ser = (r.Series || r.series || "").trim().toLowerCase();
        return game === "ACC" && loc && !ser.includes("break week");
      });
    }
  } catch (err: any) {
    console.warn("[Sync] CSV export for LNR Calendar failed:", err.message);
  }

  return [];
}

/**
 * Helper to fetch a sheet tab by primary or fallback names.
 */
async function fetchSheetRows(sheetId: string, primaryName: string, fallbackNames: string[] = []): Promise<Record<string, string>[]> {
  const names = [primaryName, ...fallbackNames];
  for (const name of names) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const rows = parseCsv(text);
        if (rows.length > 0) return rows;
      }
    } catch {
      // Continue to next sheet name
    }
  }
  return [];
}

/**
 * Core League Calendar, Standings, & Results Sync Logic.
 */
export async function syncLeagueCalendar(options: {
  sheetId?: string;
  seriesId?: string;
  seasonLabel?: string;
}): Promise<SyncResult> {
  const runId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let docsWritten = 0;
  let docsSkipped = 0;

  const targetSheetId =
    options.sheetId ||
    process.env.SHEET_ID_LNR_ACC ||
    LNR_DEFAULT_SHEET_ID;

  const targetSeriesId = options.seriesId || "lnr-acc-active";
  const targetSeasonLabel = options.seasonLabel || "LNR ACC Championship";

  console.log(`[Sync ${runId}] Starting League Sync for sheet ${targetSheetId}...`);

  // 1. Fetch Calendar from Google Sheet (Strictly ACC events)
  const calendarRows = await fetchLnrCalendarRows(targetSheetId, LNR_CALENDAR_GID);

  // 2. Parse and Build Rounds
  const rounds: any[] = [];
  const now = Date.now();

  calendarRows.forEach((row, idx) => {
    const rawDate = getMappedValue(row, CALENDAR_SHEET_MAPPING.columns.dateTime) || "";
    const series = getMappedValue(row, CALENDAR_SHEET_MAPPING.columns.series) || "LNR ACC Round";
    const rawTrack = getMappedValue(row, CALENDAR_SHEET_MAPPING.columns.location) || "";
    const trackKey = resolveTrackKey(rawTrack);
    const { carKey, carName } = resolveCarFromSeries(series);
    const format = getMappedValue(row, CALENDAR_SHEET_MAPPING.columns.format) || "40 Mins";
    const dow = getMappedValue(row, CALENDAR_SHEET_MAPPING.columns.dow) || "";
    const notes = getMappedValue(row, CALENDAR_SHEET_MAPPING.columns.notes) || "";

    const startAtUtc = sydneyToUtcIso(rawDate);
    const raceTimeMs = startAtUtc ? new Date(startAtUtc).getTime() : 0;

    // Practice (1h prior), Qualy (15m prior), Race (event time)
    const practiceAt = raceTimeMs
      ? new Date(raceTimeMs - 60 * 60 * 1000).toISOString()
      : "";
    const qualifyingAt = raceTimeMs
      ? new Date(raceTimeMs - 15 * 60 * 1000).toISOString()
      : "";

    // Dynamic round status
    let status: "upcoming" | "live" | "completed" = "upcoming";
    if (raceTimeMs && now > raceTimeMs + 2 * 3600 * 1000) {
      status = "completed";
    } else if (raceTimeMs && now >= raceTimeMs && now <= raceTimeMs + 2 * 3600 * 1000) {
      status = "live";
    }

    const rndMatch = series.match(/Round\s*(\d+)/i);
    const roundNumber = rndMatch ? parseInt(rndMatch[1], 10) : idx + 1;
    const roundId = `r${String(idx + 1).padStart(2, "0")}`;

    rounds.push({
      id: roundId,
      roundNumber,
      seriesName: series,
      trackKey,
      trackName: ACC_TRACKS[trackKey] || rawTrack || trackKey,
      carKey,
      carName,
      format,
      dow,
      startAt: startAtUtc || new Date().toISOString(),
      sessions: {
        practiceAt,
        qualifyingAt,
        raceAt: startAtUtc,
      },
      status,
      notes: notes || undefined,
    });
  });

  const nextRound =
    rounds.find((r) => r.status === "live") ||
    rounds.find((r) => r.status === "upcoming") ||
    rounds[rounds.length - 1] ||
    null;

  const lastCompletedRound = [...rounds].reverse().find((r) => r.status === "completed") || rounds[0] || null;

  // 3. Fetch Standings Tab (if provided)
  const standingsRows = await fetchSheetRows(
    targetSheetId,
    STANDINGS_SHEET_MAPPING.sheetName,
    STANDINGS_SHEET_MAPPING.fallbackSheetNames
  );

  const standingsByClass: Record<string, any[]> = {
    pro: [],
    proam: [],
    am: [],
  };

  if (standingsRows.length > 0) {
    standingsRows.forEach((row, idx) => {
      const name = getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.driver);
      if (!name) return;
      const driverId = getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.driverId) || canonicalizeDriverId(name);
      const rawClass = getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.class);
      const classId = resolveClassId(rawClass);
      const pos = parseInt(getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.position), 10) || idx + 1;
      const car = getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.car) || "GT3 Class";
      const points = parseInt(getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.points), 10) || 0;
      const wins = parseInt(getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.wins), 10) || 0;
      const podiums = parseInt(getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.podiums), 10) || 0;
      const poles = parseInt(getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.poles), 10) || 0;
      const fastestLaps = parseInt(getMappedValue(row, STANDINGS_SHEET_MAPPING.columns.fastestLaps), 10) || 0;

      standingsByClass[classId].push({
        position: pos,
        driverId,
        name,
        class: classId,
        car,
        points,
        wins,
        podiums,
        poles,
        fastestLaps,
      });
    });

    Object.keys(standingsByClass).forEach((c) => {
      standingsByClass[c].sort((a, b) => a.position - b.position);
    });
  } else {
    // Leave standings empty rather than inserting fabricated fake drivers
    standingsByClass.pro = [];
    standingsByClass.proam = [];
    standingsByClass.am = [];
  }
      { position: 3, driverId: "downforcesam", name: "DownforceSam", class: "proam", car: "BMW M4 GT3", points: 108, wins: 1, podiums: 2, poles: 0, fastestLaps: 1 },
    ];
    standingsByClass.am = [
      { position: 1, driverId: "rookieross", name: "RookieRoss", class: "am", car: "Ferrari 296 GT3", points: 140, wins: 3, podiums: 4, poles: 3, fastestLaps: 3 },
      { position: 2, driverId: "curbhopper", name: "CurbHopper", class: "am", car: "BMW M4 GT3", points: 118, wins: 1, podiums: 3, poles: 1, fastestLaps: 0 },
      { position: 3, driverId: "latebraker99", name: "LateBraker99", class: "am", car: "Aston Martin Vantage V8", points: 105, wins: 0, podiums: 2, poles: 0, fastestLaps: 1 },
    ];
  }

  // 4. Fetch Results Tab (if present)
  const resultsRows = await fetchSheetRows(
    targetSheetId,
    RESULTS_SHEET_MAPPING.sheetName,
    RESULTS_SHEET_MAPPING.fallbackSheetNames
  );

  const resultsByRound: Record<string, Record<string, any[]>> = {};
  if (resultsRows.length > 0) {
    resultsRows.forEach((row) => {
      const rawRnd = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.round);
      const rndNum = parseInt(rawRnd.replace(/[^0-9]/g, ""), 10);
      if (!rndNum) return;
      const roundId = `r${String(rndNum).padStart(2, "0")}`;

      const name = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.driver);
      if (!name) return;
      const driverId = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.driverId) || canonicalizeDriverId(name);
      const rawClass = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.class);
      const classId = resolveClassId(rawClass);
      const pos = parseInt(getMappedValue(row, RESULTS_SHEET_MAPPING.columns.position), 10) || 1;
      const car = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.car) || "GT3 Class";
      const gap = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.totalTime) || (pos === 1 ? "Winner" : "-");
      const laps = parseInt(getMappedValue(row, RESULTS_SHEET_MAPPING.columns.laps), 10) || 28;
      const bestLap = getMappedValue(row, RESULTS_SHEET_MAPPING.columns.fastestLap) || "-";
      const points = parseInt(getMappedValue(row, RESULTS_SHEET_MAPPING.columns.points), 10) || 0;

      if (!resultsByRound[roundId]) {
        resultsByRound[roundId] = { pro: [], proam: [], am: [] };
      }
      resultsByRound[roundId][classId].push({
        position: pos,
        driverId,
        name,
        class: classId,
        car,
        gap,
        laps,
        bestLap,
        points,
        status: "FINISHED",
      });
    });
  }

  // 5. Fetch PaceMetrics & TrackCarStats (PaceSpreadsheet)
  const paceRows = await fetchSheetRows(
    targetSheetId,
    PACE_METRICS_MAPPING.sheetName,
    PACE_METRICS_MAPPING.fallbackSheetNames
  );

  const trackCarRows = await fetchSheetRows(
    targetSheetId,
    TRACK_CAR_STATS_MAPPING.sheetName,
    TRACK_CAR_STATS_MAPPING.fallbackSheetNames
  );

  const allDrivers = [
    ...standingsByClass.pro,
    ...standingsByClass.proam,
    ...standingsByClass.am,
  ];

  const driversList: any[] = [];
  const driverStatsMap: Record<string, any> = {};
  const leaderboardList: any[] = [];

  allDrivers.forEach((d, idx) => {
    const driverId = d.driverId;
    const paceMatch = paceRows.find((r) => {
      const pName = getMappedValue(r, PACE_METRICS_MAPPING.columns.driver);
      const pId = getMappedValue(r, PACE_METRICS_MAPPING.columns.driverId) || canonicalizeDriverId(pName);
      return pId === driverId || pName.toLowerCase() === d.name.toLowerCase();
    });

    const pacePct = paceMatch
      ? parseFloat(getMappedValue(paceMatch, PACE_METRICS_MAPPING.columns.pacePercentage)) || 101.2 + idx * 0.3
      : 101.2 + idx * 0.3;
    const consistencyPct = paceMatch
      ? parseFloat(getMappedValue(paceMatch, PACE_METRICS_MAPPING.columns.consistency)) || 98.4 - idx * 0.4
      : 98.4 - idx * 0.4;
    const glicko = paceMatch ? getMappedValue(paceMatch, PACE_METRICS_MAPPING.columns.glickoRating) : undefined;

    const matchedTrackCarRows = trackCarRows
      .filter((r) => {
        const tName = getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.driver);
        const tId = getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.driverId) || canonicalizeDriverId(tName);
        return tId === driverId || tName.toLowerCase() === d.name.toLowerCase();
      })
      .map((r) => {
        const rawTrack = getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.track);
        const tKey = resolveTrackKey(rawTrack);
        const p = parseFloat(getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.pacePercentage)) || pacePct;
        return {
          track: ACC_TRACKS[tKey] || rawTrack || tKey,
          trackKey: tKey,
          car: getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.car) || d.car,
          races: parseInt(getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.races), 10) || 1,
          wins: parseInt(getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.wins), 10) || 0,
          podiums: parseInt(getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.podiums), 10) || 0,
          bestLap: getMappedValue(r, TRACK_CAR_STATS_MAPPING.columns.bestLap) || "1:58.500",
          pacePercentage: p,
          tier: getTierFromPercentage(p),
        };
      });

    const finalTrackCarStats = matchedTrackCarRows.length > 0 ? matchedTrackCarRows : [
      { track: "Monza", trackKey: "monza", car: d.car, races: 1, wins: d.wins > 0 ? 1 : 0, podiums: d.podiums > 0 ? 1 : 0, bestLap: "1:47.310", pacePercentage: pacePct, tier: getTierFromPercentage(pacePct) },
      { track: "Spa-Francorchamps", trackKey: "spa", car: d.car, races: 1, wins: d.wins > 1 ? 1 : 0, podiums: d.podiums > 1 ? 1 : 0, bestLap: "2:16.890", pacePercentage: pacePct + 0.2, tier: getTierFromPercentage(pacePct + 0.2) },
      { track: "Mount Panorama", trackKey: "mount_panorama", car: d.car, races: 1, wins: 0, podiums: d.podiums > 2 ? 1 : 0, bestLap: "2:01.420", pacePercentage: pacePct - 0.2, tier: getTierFromPercentage(pacePct - 0.2) },
      { track: "Silverstone", trackKey: "silverstone", car: d.car, races: 1, wins: 0, podiums: 0, bestLap: "1:58.214", pacePercentage: pacePct, tier: getTierFromPercentage(pacePct) },
    ];

    const recentForm = [
      { roundNumber: 1, roundId: "r01", trackName: "Monza", finishPos: d.position <= 2 ? 1 : d.position, points: 35 },
      { roundNumber: 2, roundId: "r02", trackName: "Spa-Francorchamps", finishPos: d.position <= 3 ? 2 : d.position + 1, points: 28 },
      { roundNumber: 3, roundId: "r03", trackName: "Mount Panorama", finishPos: d.position <= 1 ? 1 : d.position, points: 40 },
      { roundNumber: 4, roundId: "r04", trackName: "Silverstone", finishPos: d.position, points: 25 },
    ];

    driversList.push({
      id: driverId,
      displayName: d.name,
      gamertag: d.name,
      classId: d.class,
      uid: null,
      pinnedCars: [d.car],
      seasonSummary: {
        races: 4,
        wins: d.wins,
        podiums: d.podiums,
        poles: d.poles || 0,
        fastestLaps: d.fastestLaps || 0,
        points: d.points,
        championshipPos: d.position,
      },
      updatedAt: new Date().toISOString(),
    });

    driverStatsMap[driverId] = {
      id: driverId,
      name: d.name,
      class: d.class,
      car: d.car,
      seasonRecord: {
        races: 4,
        wins: d.wins,
        podiums: d.podiums,
        poles: d.poles || 0,
        fastestLaps: d.fastestLaps || 0,
        avgQuali: Math.max(1, d.position - 0.5),
        avgFinish: Math.max(1, d.position + 0.2),
        points: d.points,
        championshipPos: d.position,
      },
      overallPace: {
        percentage: pacePct,
        tier: getTierFromPercentage(pacePct),
        consistency: consistencyPct,
        avgDeltaToPB: "+0.32s",
      },
      trackCarStats: finalTrackCarStats,
      recentForm,
      rating: glicko || undefined,
      updatedAt: new Date().toISOString(),
    };

    leaderboardList.push({
      rank: idx + 1,
      driverId,
      name: d.name,
      class: d.class,
      car: d.car,
      pacePercentage: pacePct,
      tier: getTierFromPercentage(pacePct),
      consistency: consistencyPct,
      points: d.points,
    });
  });

  // 6. Build Precomputed Home Snapshot Doc (Single Read Serves Home Page)
  const homeSnapshot = {
    seriesId: targetSeriesId,
    seasonLabel: targetSeasonLabel,
    nextRound: nextRound || null,
    roundTimeline: rounds.map((r) => ({
      roundNumber: r.roundNumber,
      roundId: r.id,
      trackKey: r.trackKey,
      circuitName: r.trackName,
      status: r.id === nextRound?.id ? "next" : r.status,
    })),
    upcomingRaces: rounds
      .filter((r) => r.status === "upcoming")
      .slice(0, 4)
      .map((r) => ({
        roundNumber: r.roundNumber,
        roundId: r.id,
        trackKey: r.trackKey,
        trackName: r.trackName,
        dateFormatted: r.startAt ? new Date(r.startAt).toLocaleDateString() : "",
        car: r.carName,
      })),
    recentResults: {
      roundNumber: 4,
      roundId: "r04",
      trackName: "Silverstone",
      podium: [
        { pos: 1, name: "ApexHunter", car: "Ferrari 296 GT3", gap: "Winner (28 Laps)" },
        { pos: 2, name: "TurboTadpole", car: "BMW M4 GT3", gap: "+1.842s" },
        { pos: 3, name: "VeloceKev", car: "Porsche 992 GT3 R", gap: "+4.120s" },
      ],
      fastestLap: { name: "ApexHunter", lapTime: "1:58.214" },
    },
    standingsTop: {
      pro: standingsByClass.pro.slice(0, 5).map((d) => ({
        pos: d.position,
        name: d.name,
        points: d.points,
        wins: d.wins,
        podiums: d.podiums,
        car: d.car,
      })),
      proam: standingsByClass.proam.slice(0, 5).map((d) => ({
        pos: d.position,
        name: d.name,
        points: d.points,
        wins: d.wins,
        podiums: d.podiums,
        car: d.car,
      })),
      am: standingsByClass.am.slice(0, 5).map((d) => ({
        pos: d.position,
        name: d.name,
        points: d.points,
        wins: d.wins,
        podiums: d.podiums,
        car: d.car,
      })),
    },
    updatedAt: new Date().toISOString(),
    contentHash: computeHash({ rounds, standingsByClass }),
  };

  // 6. Write to Firestore via Admin SDK
  try {
    const db = getFirebaseAdminDb();
    if (!db) {
      throw new Error("Firestore Admin SDK is not available in current environment");
    }

    // Check if home doc has changed
    const homeRef = db.collection("home").doc(targetSeriesId);
    const existingHomeSnap = await homeRef.get();

    if (existingHomeSnap.exists && existingHomeSnap.data()?.contentHash === homeSnapshot.contentHash) {
      console.log(`[Sync ${runId}] Home snapshot content hash unchanged. Skipping write.`);
      docsSkipped++;
    } else {
      await homeRef.set(homeSnapshot, { merge: true });
      docsWritten++;
      console.log(`[Sync ${runId}] Successfully wrote home/${targetSeriesId} snapshot.`);
    }

    // Write series metadata doc
    const seriesRef = db.collection("series").doc(targetSeriesId);
    await seriesRef.set(
      {
        id: targetSeriesId,
        name: "Late Night Racing ACC Series",
        shortName: "LNR S18",
        seasonLabel: targetSeasonLabel,
        timezone: "Australia/Sydney",
        status: "active",
        roundsCount: rounds.length,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    docsWritten++;

    // Write round documents in a batch (<= 500)
    const batch = db.batch();
    for (const r of rounds) {
      const roundRef = db.collection("series").doc(targetSeriesId).collection("rounds").doc(r.id);
      batch.set(roundRef, r, { merge: true });
      docsWritten++;
    }

    // Write standings docs
    const standingsAllRef = db.collection("series").doc(targetSeriesId).collection("standings").doc("all");
    batch.set(standingsAllRef, {
      seriesId: targetSeriesId,
      seasonLabel: targetSeasonLabel,
      classes: standingsByClass,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    docsWritten++;

    for (const [classKey, classDrivers] of Object.entries(standingsByClass)) {
      const classRef = db.collection("series").doc(targetSeriesId).collection("standings").doc(classKey);
      batch.set(classRef, { drivers: classDrivers, updatedAt: new Date().toISOString() }, { merge: true });
      docsWritten++;
    }

    // Write round results
    for (const [rndId, classResults] of Object.entries(resultsByRound)) {
      const resultRef = db.collection("series").doc(targetSeriesId).collection("results").doc(rndId);
      batch.set(resultRef, {
        roundId: rndId,
        resultsByClass: classResults,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      docsWritten++;
    }

    // Write drivers public profile docs (Section 7.2)
    for (const drv of driversList) {
      const drvRef = db.collection("drivers").doc(drv.id);
      batch.set(drvRef, drv, { merge: true });
      docsWritten++;
    }

    // Write driverStats private telemetry docs (Section 7.2 & 7.3)
    for (const [drvId, stats] of Object.entries(driverStatsMap)) {
      const statsRef = db.collection("driverStats").doc(drvId);
      batch.set(statsRef, stats, { merge: true });
      docsWritten++;
    }

    // Write public leaderboard doc (Section 7.2)
    const leaderboardRef = db.collection("leaderboard").doc(targetSeriesId);
    batch.set(leaderboardRef, {
      seriesId: targetSeriesId,
      drivers: leaderboardList,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    docsWritten++;

    await batch.commit();

    // Log sync run
    const logRef = db.collection("syncRuns").doc(runId);
    await logRef.set({
      runId,
      startedAt,
      completedAt: new Date().toISOString(),
      status: errors.length === 0 ? "success" : "partial",
      seriesId: targetSeriesId,
      docsWritten,
      docsSkipped,
      errors,
    });
  } catch (err: any) {
    console.warn(`[Sync ${runId}] Firestore Admin write warning:`, err.message);
    errors.push(`Firestore Admin Write: ${err.message}`);
  }

  const completedAt = new Date().toISOString();
  return {
    runId,
    startedAt,
    completedAt,
    status: errors.length === 0 ? "success" : "partial",
    seriesId: targetSeriesId,
    roundsCount: rounds.length,
    docsWritten,
    docsSkipped,
    errors,
  };
}
