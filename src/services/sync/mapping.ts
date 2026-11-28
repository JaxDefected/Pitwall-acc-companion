import { ACC_TRACKS, ACC_CARS } from "../../utils/accParser";

/**
 * Google Sheets column header mapping for LNR ACC Calendar & League Data.
 * 
 * If a column header is renamed in the Google Sheet, update ONLY this config object.
 * Logic uses the mapped keys, ensuring resilience to sheet header modifications.
 */
export const CALENDAR_SHEET_MAPPING = {
  sheetName: "Calendar",
  fallbackSheetNames: ["LNR CAL v2", "Calendar", "Schedule", "Rounds"],
  columns: {
    seriesId: ["seriesId", "Series ID", "series", "Series"],
    season: ["season", "Season", "seasonLabel", "Season Label"],
    round: ["round", "Round", "roundNumber", "Round Number", "Rnd", "R#"],
    trackKey: ["trackKey", "Track Key", "circuit", "Circuit", "location", "Location", "Track"],
    carKey: ["carKey", "Car Key", "car", "Car", "vehicle", "Vehicle", "Car Class"],
    classIds: ["classIds", "Classes", "class", "Class"],
    practiceAt: ["practiceAt", "Practice", "Practice Time", "practice"],
    qualifyingAt: ["qualifyingAt", "Qualifying", "Quali Time", "qualy", "Qualifying Time"],
    raceAt: ["raceAt", "Race", "Race 1", "Race Time", "race"],
    race2At: ["race2At", "Race 2", "Race 2 Time", "sprint"],
    status: ["status", "Status", "state", "State"],
    notes: ["notes", "Notes", "format", "Format", "Session Notes", "Details"]
  }
};

/**
 * Google Sheets column header mapping for Race Results.
 */
export const RESULTS_SHEET_MAPPING = {
  sheetName: "Results",
  fallbackSheetNames: ["RaceResults", "Results", "Official Results", "RoundResults"],
  columns: {
    round: ["round", "Round", "roundNumber", "Rnd", "R#"],
    position: ["position", "pos", "Pos", "Finish", "P", "Rank"],
    driver: ["driver", "Driver", "name", "Driver Name", "GamerTag", "Gamertag"],
    driverId: ["driverId", "driver_id", "id", "Driver ID"],
    class: ["class", "Class", "category", "Category", "Division"],
    car: ["car", "Car", "vehicle", "Vehicle"],
    points: ["points", "pts", "Points", "Score"],
    laps: ["laps", "Laps", "lapsCompleted", "Completed Laps"],
    totalTime: ["totalTime", "Time", "time", "Duration", "Gap", "Interval"],
    fastestLap: ["fastestLap", "Best Lap", "bestLap", "FL", "Fastest Lap"],
    qualifyingPos: ["qualifyingPos", "Quali", "Grid", "Quali Pos", "Q"],
    penalties: ["penalties", "Penalties", "penalty", "Penalty", "Incident Pts"],
    status: ["status", "Status", "DNF", "DNS", "DQ"]
  }
};

/**
 * Google Sheets column header mapping for Championship Standings.
 */
export const STANDINGS_SHEET_MAPPING = {
  sheetName: "Standings",
  fallbackSheetNames: ["Standings", "Championship", "DriverStandings", "Points"],
  columns: {
    position: ["position", "pos", "Pos", "Rank", "P"],
    driver: ["driver", "Driver", "name", "Driver Name", "GamerTag", "Gamertag"],
    driverId: ["driverId", "driver_id", "id"],
    class: ["class", "Class", "category", "Category", "Division"],
    car: ["car", "Car", "vehicle", "Vehicle"],
    points: ["points", "pts", "Points", "Total Points", "Total"],
    wins: ["wins", "Wins", "W"],
    podiums: ["podiums", "Podiums", "Pod", "Top 3"],
    poles: ["poles", "Poles", "Pole", "P1 Quali"],
    fastestLaps: ["fastestLaps", "FL", "Fastest Laps"],
    dropRound: ["dropRound", "Drop", "Dropped", "Dropped Points"]
  }
};

/**
 * Google Sheets column header mapping for Pace Metrics (PaceSpreadsheet).
 */
export const PACE_METRICS_MAPPING = {
  sheetName: "PaceMetrics",
  fallbackSheetNames: ["EventPace", "Pace", "Pace_Metrics", "PaceMetrics"],
  columns: {
    driver: ["driver", "Driver", "name", "Driver Name", "GamerTag"],
    driverId: ["driverId", "driver_id", "id"],
    class: ["class", "Class", "category"],
    car: ["car", "Car", "vehicle"],
    pacePercentage: ["pacePercentage", "Pace %", "Pace", "Overall Pace", "Race Pace"],
    consistency: ["consistency", "Consistency", "Consistency %", "Score"],
    avgDeltaToPB: ["avgDeltaToPB", "Delta to PB", "PB Delta", "Gap to PB"],
    glickoRating: ["glickoRating", "Glicko", "Rating", "Glicko2", "Glicko Rating"]
  }
};

/**
 * Google Sheets column header mapping for Track & Car Stats (PaceSpreadsheet).
 */
export const TRACK_CAR_STATS_MAPPING = {
  sheetName: "Driver_TrackCarStats",
  fallbackSheetNames: ["TrackCarStats", "Track_Car_Stats", "DriverStats", "Driver_Sessions"],
  columns: {
    driver: ["driver", "Driver", "name", "Driver Name", "GamerTag"],
    driverId: ["driverId", "driver_id", "id"],
    track: ["track", "Track", "circuit", "Circuit"],
    car: ["car", "Car", "vehicle"],
    races: ["races", "Races", "Starts", "Events"],
    wins: ["wins", "Wins", "W"],
    podiums: ["podiums", "Podiums", "Pod"],
    bestLap: ["bestLap", "Best Lap", "Fastest Lap", "PB"],
    pacePercentage: ["pacePercentage", "Pace %", "Pace"],
    tier: ["tier", "Tier", "Rating"]
  }
};

/**
 * Google Sheets column header mapping for Public Leaderboard.
 */
export const PUBLIC_LEADERBOARD_MAPPING = {
  sheetName: "Public_Leaderboard",
  fallbackSheetNames: ["Leaderboard", "PublicLeaderboard", "Overview"],
  columns: {
    rank: ["rank", "Rank", "pos", "Pos", "P"],
    driver: ["driver", "Driver", "name", "Driver Name", "GamerTag"],
    driverId: ["driverId", "driver_id", "id"],
    class: ["class", "Class", "category"],
    car: ["car", "Car", "vehicle"],
    paceRating: ["paceRating", "Pace Rating", "Pace"],
    consistency: ["consistency", "Consistency"],
    points: ["points", "Points", "pts"]
  }
};

/**
 * Canonicalizes a human-readable driver name into a URL-friendly driver slug.
 */
export function canonicalizeDriverId(name: string): string {
  if (!name) return "unknown-driver";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalizes class strings into standard 'pro' | 'proam' | 'am'.
 */
export function resolveClassId(rawClass: string): "pro" | "proam" | "am" {
  if (!rawClass) return "pro";
  const lower = rawClass.toLowerCase().trim();
  if (lower.includes("pro-am") || lower.includes("proam") || lower.includes("silver")) return "proam";
  if (lower.includes("am") || lower.includes("bronze")) return "am";
  return "pro";
}

/**
 * Matches human-readable track names or aliases to official ACC track keys.
 */
export function resolveTrackKey(rawTrack: string): string {
  if (!rawTrack) return "monza";
  const lower = rawTrack.toLowerCase().trim();

  // Direct match in ACC_TRACKS
  if (ACC_TRACKS[lower]) return lower;

  // Fuzzy keyword matching (check specific variants like 24h before general ring)
  if (lower.includes("bathurst") || lower.includes("panorama") || lower.includes("mount")) return "mount_panorama";
  if (lower.includes("nordschleife") || lower.includes("24h")) return "nurburgring_24h";
  if (lower.includes("nurburg") || lower.includes("nürburg") || lower.includes("ring gp")) return "nurburgring";
  if (lower.includes("spa") || lower.includes("francorchamps")) return "spa";
  if (lower.includes("monza")) return "monza";
  if (lower.includes("silverstone")) return "silverstone";
  if (lower.includes("kyalami")) return "kyalami";
  if (lower.includes("barcelona") || lower.includes("catalunya")) return "barcelona";
  if (lower.includes("brands") || lower.includes("hatch")) return "brands_hatch";
  if (lower.includes("imola")) return "imola";
  if (lower.includes("misano")) return "misano";
  if (lower.includes("paul") || lower.includes("ricard")) return "paul_ricard";
  if (lower.includes("zandvoort")) return "zandvoort";
  if (lower.includes("zolder")) return "zolder";
  if (lower.includes("hungaroring") || lower.includes("budapest")) return "hungaroring";
  if (lower.includes("donington")) return "donington";
  if (lower.includes("oulton")) return "oulton_park";
  if (lower.includes("snetterton")) return "snetterton";
  if (lower.includes("laguna") || lower.includes("seca")) return "laguna_seca";
  if (lower.includes("watkins") || lower.includes("glen")) return "watkins_glen";
  if (lower.includes("cota") || lower.includes("americas")) return "cota";
  if (lower.includes("indianapolis") || lower.includes("indy")) return "indianapolis";
  if (lower.includes("suzuka")) return "suzuka";
  if (lower.includes("red bull") || lower.includes("spielberg")) return "red_bull_ring";
  if (lower.includes("valencia")) return "valencia";

  return "monza";
}

/**
 * Matches human-readable car names to official ACC car keys.
 */
export function resolveCarKey(rawCar: string): string {
  if (!rawCar) return "amr_v8_vantage_gt3";
  const lower = rawCar.toLowerCase().trim();

  if (ACC_CARS[lower]) return lower;

  if (lower.includes("ginetta")) return "ginetta_g55_gt4";
  if (lower.includes("ferrari 296") || lower.includes("296")) return "ferrari_296_gt3";
  if (lower.includes("bmw m4") || lower.includes("m4 gt3")) return "bmw_m4_gt3";
  if (lower.includes("porsche 992") || lower.includes("992")) return "porsche_992_gt3_r";
  if (lower.includes("aston") || lower.includes("vantage")) return "amr_v8_vantage_gt3";
  if (lower.includes("audi") || lower.includes("r8")) return "audi_r8_lms_evo_ii";
  if (lower.includes("mercedes") || lower.includes("amg")) return "mercedes_amg_gt3_evo";
  if (lower.includes("mclaren 720") || lower.includes("720s")) return "mclaren_720s_gt3_evo";
  if (lower.includes("huracan") || lower.includes("lamborghini")) return "lamborghini_huracan_gt3_evo2";
  if (lower.includes("mustang")) return "ford_mustang_gt3";

  return "all_gt3";
}

/**
 * Normalizes status strings from sheets (e.g. 'Completed', 'Done', 'Live', 'Next', 'Upcoming').
 */
export function resolveRoundStatus(rawStatus: string, raceDateUtc?: string): "upcoming" | "live" | "completed" {
  if (rawStatus) {
    const s = rawStatus.toLowerCase().trim();
    if (s.includes("complete") || s.includes("done") || s.includes("past")) return "completed";
    if (s.includes("live") || s.includes("current") || s.includes("now") || s.includes("active")) return "live";
    if (s.includes("upcoming") || s.includes("next") || s.includes("future")) return "upcoming";
  }

  // Automatic determination based on date if status not provided
  if (raceDateUtc) {
    const raceTime = new Date(raceDateUtc).getTime();
    const now = Date.now();
    const twoHoursAfter = raceTime + 2 * 60 * 60 * 1000;
    if (now > twoHoursAfter) return "completed";
    if (now >= raceTime && now <= twoHoursAfter) return "live";
    return "upcoming";
  }

  return "upcoming";
}
