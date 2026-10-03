import { useState, useEffect, useMemo } from "react";
import { SavedSetupItem, UserProfile, SetupItem } from "../firebase";
import { ACC_CARS, ACC_TRACKS } from "../utils/accParser";
import { 
  Folder, 
  Search, 
  Trash2, 
  Wrench, 
  Activity, 
  Calendar, 
  RefreshCw,
  Gauge,
  User,
  Info,
  SlidersHorizontal,
  ExternalLink,
  Trophy,
  Clock,
  MapPin,
  Flag,
  Lock,
  ChevronRight
} from "lucide-react";

// LNR Race Calendar Google Sheets URLs
const LNR_CALENDAR_EDIT_URL =
  "https://docs.google.com/spreadsheets/d/1s9m3yWd-zBLKf4An5rAJ7sxHy9ouU4y8OZjnN9pXoEs/edit?gid=1362444445#gid=1362444445";

// Embed URL with hardset SQL filter: WHERE B = 'ACC' AND C IS NOT NULL (only ACC rounds)
const LNR_CALENDAR_ACC_HTML_EMBED =
  "https://docs.google.com/spreadsheets/d/1s9m3yWd-zBLKf4An5rAJ7sxHy9ouU4y8OZjnN9pXoEs/gviz/tq?tqx=out:html&sheet=LNR%20CAL%20v2&tq=SELECT%20A%2CB%2CC%2CD%2CE%2CF%2CH%20WHERE%20B%20%3D%20%27ACC%27%20AND%20C%20IS%20NOT%20NULL";

export interface AccCalendarEvent {
  id: string;
  dateTime: string;
  game: string;
  series: string;
  location: string;
  dow: string;
  notes?: string;
  format?: string;
  isUpcoming: boolean;
  isNext: boolean;
  trackKey?: string;
}

function matchTrackKey(locationName: string): string | undefined {
  if (!locationName) return undefined;
  const lower = locationName.toLowerCase().trim();
  if (lower.includes("bathurst") || lower.includes("panorama")) return "mount_panorama";
  if (lower.includes("nurburg") || lower.includes("nürburg")) return "nurburgring";
  if (lower.includes("cota") || lower.includes("americas")) return "cota";
  if (lower.includes("indy") || lower.includes("indianapolis")) return "indianapolis";
  if (lower.includes("brands")) return "brands_hatch";
  if (lower.includes("paul") || lower.includes("ricard")) return "paul_ricard";
  if (lower.includes("donington")) return "donington";
  if (lower.includes("oulton")) return "oulton_park";
  if (lower.includes("snetterton")) return "snetterton";
  if (lower.includes("zolder")) return "zolder";
  if (lower.includes("imola")) return "imola";
  if (lower.includes("monza")) return "monza";
  if (lower.includes("spa")) return "spa";
  if (lower.includes("silverstone")) return "silverstone";
  if (lower.includes("kyalami")) return "kyalami";
  if (lower.includes("misano")) return "misano";
  if (lower.includes("hungaroring")) return "hungaroring";
  if (lower.includes("valencia")) return "valencia";
  if (lower.includes("watkins")) return "watkins_glen";
  if (lower.includes("zandvoort")) return "zandvoort";
  if (lower.includes("barcelona") || lower.includes("catalunya")) return "barcelona";
  if (lower.includes("red bull") || lower.includes("spielberg")) return "red_bull_ring";
  if (lower.includes("suzuka")) return "suzuka";
  if (lower.includes("laguna")) return "laguna_seca";
  return undefined;
}

interface GaragePageProps {
  tunedSetupsList: SavedSetupItem[];
  profile: UserProfile | null;
  onInspect: (setup: SetupItem) => void;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export default function GaragePage({
  tunedSetupsList,
  profile,
  onInspect,
  onDelete,
  onRefresh,
  isLoading = false
}: GaragePageProps) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalCarFilter, setInternalCarFilter] = useState("all");
  const [internalTrackFilter, setInternalTrackFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [garageMode, setGarageMode] = useState<"setups" | "calendar">("setups");

  // ACC Race Calendar states - hardset to ACC
  const [accEvents, setAccEvents] = useState<AccCalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [calendarViewMode, setCalendarViewMode] = useState<"cards" | "embed">("cards");
  const [calendarSearch, setCalendarSearch] = useState("");
  const [calendarFilterUpcomingOnly, setCalendarFilterUpcomingOnly] = useState(true);
  const [isFetchingCalendar, setIsFetchingCalendar] = useState(false);



  // Filter only my setups
  const mySetupsRaw = profile
    ? tunedSetupsList.filter((s) => s.authorUsername === profile.username)
    : [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await onRefresh();
    } catch (e) {
      console.error(e);
      setRefreshError("Failed to synchronize with Cloud Storage. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAccEvents = async () => {
    setIsFetchingCalendar(true);
    setEventsError(null);
    try {
      const query = encodeURIComponent("SELECT A, B, C, D, E, F, H WHERE B = 'ACC' AND C IS NOT NULL ORDER BY A ASC");
      const url = `https://docs.google.com/spreadsheets/d/1s9m3yWd-zBLKf4An5rAJ7sxHy9ouU4y8OZjnN9pXoEs/gviz/tq?tqx=out:json&sheet=LNR%20CAL%20v2&tq=${query}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not reach Google Sheets API");
      const text = await res.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
      if (!match) throw new Error("Invalid response format");
      const data = JSON.parse(match[1]);

      const now = Date.now();
      let foundNext = false;
      const parsed: AccCalendarEvent[] = (data.table?.rows || []).map((row: any, idx: number) => {
        const rawDate = (row.c[0]?.f || row.c[0]?.v || "").replace(/\u00a0/g, " ");
        const game = row.c[1]?.v || "ACC";
        const series = row.c[2]?.v || "LNR Series";
        const location = row.c[3]?.v || "";
        const dow = row.c[4]?.v || "";
        const notes = row.c[5]?.v || "";
        const format = row.c[6]?.v || "";

        // Parse date for sorting & upcoming check (Sydney time UTC+10)
        let isUpcoming = false;
        try {
          const dateClean = rawDate.split(" ")[0];
          const timeClean = rawDate.split(" ")[1] || "21:00";
          if (dateClean) {
            const dateObj = new Date(`${dateClean}T${timeClean}:00+10:00`);
            isUpcoming = !isNaN(dateObj.getTime()) && dateObj.getTime() >= (now - 6 * 3600 * 1000);
          }
        } catch {
          isUpcoming = true;
        }

        let isNext = false;
        if (isUpcoming && !foundNext && series.toLowerCase() !== "break week") {
          isNext = true;
          foundNext = true;
        }

        const trackKey = matchTrackKey(location);

        return {
          id: `acc-round-${idx}`,
          dateTime: rawDate,
          game,
          series,
          location: location || "TBD",
          dow,
          notes,
          format: format || "-",
          isUpcoming,
          isNext,
          trackKey
        };
      });

      setAccEvents(parsed);
    } catch (err: any) {
      console.error("Error fetching ACC calendar events:", err);
      setEventsError("Live ACC calendar fetch was blocked. Displaying embedded table view.");
    } finally {
      setIsFetchingCalendar(false);
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (garageMode === "calendar" && accEvents.length === 0) {
      setEventsLoading(true);
      fetchAccEvents();
    }
  }, [garageMode]);

  // Filtered ACC events based on search & upcoming toggle
  const filteredAccEvents = useMemo(() => {
    return accEvents.filter((ev) => {
      if (calendarFilterUpcomingOnly && !ev.isUpcoming) {
        return false;
      }
      if (!calendarSearch.trim()) return true;
      const q = calendarSearch.toLowerCase().trim();
      const seriesMatch = ev.series.toLowerCase().includes(q);
      const trackMatch = ev.location.toLowerCase().includes(q);
      const notesMatch = (ev.notes || "").toLowerCase().includes(q);
      const dowMatch = ev.dow.toLowerCase().includes(q);
      return seriesMatch || trackMatch || notesMatch || dowMatch;
    });
  }, [accEvents, calendarFilterUpcomingOnly, calendarSearch]);

  const nextAccRace = useMemo(() => {
    return accEvents.find((e) => e.isNext);
  }, [accEvents]);


  const myFilteredSetups = mySetupsRaw.filter((setup) => {
    const searchLower = internalSearch.toLowerCase().trim();
    const carName = (ACC_CARS[setup.car] || setup.car || "").toLowerCase();
    const trackName = (ACC_TRACKS[setup.track] || setup.track || "").toLowerCase();
    const notesLower = (setup.versionNote || setup.notes || "").toLowerCase();

    const matchesSearch = searchLower === "" ||
                          carName.includes(searchLower) ||
                          trackName.includes(searchLower) ||
                          notesLower.includes(searchLower);

    const matchesCar = internalCarFilter === "all" || setup.car === internalCarFilter;
    const matchesTrack = internalTrackFilter === "all" || setup.track === internalTrackFilter;

    return matchesSearch && matchesCar && matchesTrack;
  });

  // Sort by date descending
  const sortedMySetups = [...myFilteredSetups].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const handleInspectClick = (variant: SavedSetupItem) => {
    const setupRepresentation: SetupItem = {
      id: variant.id,
      name: `${ACC_CARS[variant.car] || "GT3"} - Tuned by ${variant.authorUsername}`,
      car: variant.car,
      track: variant.track,
      notes: variant.versionNote || variant.notes || "Custom tuned setup variant.",
      rawData: variant.rawData,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      uploadedBy: "custom_variant",
      uploadedByName: variant.authorUsername
    };
    onInspect(setupRepresentation);
  };

  const getUniqueCarsInGarage = () => {
    return Array.from(
      new Set(
        mySetupsRaw.map((s) => s.car).filter((c): c is string => Boolean(c))
      )
    );
  };

  const getUniqueTracksInGarage = () => {
    return Array.from(
      new Set(
        mySetupsRaw.map((s) => s.track).filter((t): t is string => Boolean(t))
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-brand text-[10px] font-extrabold font-mono rounded tracking-widest text-white uppercase">PILOT PROFILE GARAGE</span>
              <span className="px-2.5 py-0.5 bg-zinc-800 text-[10px] font-bold font-mono rounded text-zinc-300">LNR EDITION</span>
            </div>
            <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Folder className="w-6 h-6 text-red-500 shrink-0" />
              <span>My Personalised Tunes &amp; Race Calendar</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-xl font-medium leading-relaxed">
              {garageMode === "setups"
                ? "Explore, search, and manage your cloud-synced personalised tune variants. Load any setup directly into the cockpit HUD for real-time analytics."
                : "View the LNR Race Calendar below — all upcoming rounds, dates, and session info in one place. Open in Google Sheets for full editing access."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {garageMode === "setups" && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-mono font-bold tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
                <span>SYNC CLOUD</span>
              </button>
            )}
            {garageMode === "calendar" && (
              <a
                href={LNR_CALENDAR_EDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-mono font-bold tracking-wider transition-all active:scale-95 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>OPEN FULL SHEET</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switch Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="inline-flex items-center bg-white border border-zinc-200 rounded-xl p-1 shadow-3xs gap-1">
          <button
            onClick={() => setGarageMode("setups")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              garageMode === "setups"
                ? "bg-zinc-950 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>MY TUNES</span>
          </button>
          <button
            onClick={() => setGarageMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              garageMode === "calendar"
                ? "bg-zinc-950 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>RACE CALENDAR</span>
          </button>
        </div>
        {garageMode === "calendar" && (
          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest">
            LNR Season Schedule · Powered by Google Sheets
          </span>
        )}
      </div>

      {/* ── CALENDAR MODE ───────────────────────────────────────────── */}
      {garageMode === "calendar" ? (
        <div className="space-y-4">
          {/* Calendar Top Control Header */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-zinc-900">
                  LNR Race Calendar
                </span>
              </div>

              {/* Hardset ACC Filter Indicator */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200/80 rounded-full text-red-700 text-[10px] font-mono font-extrabold tracking-wider shadow-3xs">
                <Lock className="w-3 h-3 text-red-600" />
                <span>ACC ONLY (HARDSET)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Switcher: Interactive Cards vs Google Sheets Embed */}
              <div className="inline-flex items-center bg-zinc-100 p-0.5 rounded-lg text-[10px] font-mono font-bold">
                <button
                  onClick={() => setCalendarViewMode("cards")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    calendarViewMode === "cards"
                      ? "bg-white text-zinc-900 shadow-3xs font-extrabold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Race Cards
                </button>
                <button
                  onClick={() => setCalendarViewMode("embed")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    calendarViewMode === "embed"
                      ? "bg-white text-zinc-900 shadow-3xs font-extrabold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Google Sheet
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAccEvents}
                disabled={isFetchingCalendar}
                title="Refresh Calendar"
                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingCalendar ? "animate-spin text-red-500" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Open in Google Sheets */}
              <a
                href={LNR_CALENDAR_EDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-mono font-bold transition-all shadow-3xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                <span>Open in Sheets ↗</span>
              </a>
            </div>
          </div>

          {/* Featured Hero Banner: Next Upcoming ACC Race */}
          {nextAccRace && calendarViewMode === "cards" && (
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-[10px] font-mono font-black rounded tracking-widest text-white uppercase flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      NEXT ACC ROUND
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 font-bold">
                      {nextAccRace.dow} · {nextAccRace.dateTime} (Sydney)
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
                    <span>{nextAccRace.series}</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-medium">
                    <span className="flex items-center gap-1 text-red-400 font-bold font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      {nextAccRace.location}
                    </span>
                    {nextAccRace.format && (
                      <span className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {nextAccRace.format}
                      </span>
                    )}
                  </div>
                </div>

                {nextAccRace.trackKey && (
                  <button
                    onClick={() => {
                      if (nextAccRace.trackKey) {
                        setInternalTrackFilter(nextAccRace.trackKey);
                        setGarageMode("setups");
                      }
                    }}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-black tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-center"
                  >
                    <Gauge className="w-4 h-4" />
                    <span>VIEW {nextAccRace.location.toUpperCase()} TUNES</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cards View */}
          {calendarViewMode === "cards" && (
            <div className="space-y-3">
              {/* Search & Upcoming Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-3xs">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search ACC rounds, series, or circuits..."
                    value={calendarSearch}
                    onChange={(e) => setCalendarSearch(e.target.value)}
                    className="w-full bg-zinc-50 text-zinc-900 pl-9 pr-4 py-2 border border-zinc-250 rounded-lg text-xs placeholder-zinc-400 font-semibold focus:outline-none focus:border-brand focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalendarFilterUpcomingOnly(!calendarFilterUpcomingOnly)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer border ${
                      calendarFilterUpcomingOnly
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-zinc-50 text-zinc-600 border-zinc-250 hover:bg-zinc-100"
                    }`}
                  >
                    {calendarFilterUpcomingOnly ? "Upcoming Only" : "All ACC Races (History)"}
                  </button>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold px-2">
                    {filteredAccEvents.length} events
                  </span>
                </div>
              </div>

              {/* Event Cards Grid */}
              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                      <div className="h-4 bg-zinc-200 rounded w-1/3" />
                      <div className="h-5 bg-zinc-200 rounded w-3/4" />
                      <div className="h-4 bg-zinc-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredAccEvents.length === 0 ? (
                <div className="bg-white border border-dashed border-zinc-300 p-12 text-center rounded-xl">
                  <p className="text-zinc-600 text-sm font-semibold">No ACC rounds match your filter.</p>
                  <button
                    onClick={() => {
                      setCalendarSearch("");
                      setCalendarFilterUpcomingOnly(false);
                    }}
                    className="mt-3 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-mono font-bold rounded-lg cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredAccEvents.map((event) => {
                    const isBreakWeek = event.series.toLowerCase().includes("break week");
                    const userTunesForTrack = event.trackKey
                      ? tunedSetupsList.filter((s) => s.track === event.trackKey && s.authorUsername === profile?.username)
                      : [];

                    return (
                      <div
                        key={event.id}
                        className={`bg-white border rounded-xl p-4 shadow-3xs flex flex-col justify-between transition-all ${
                          event.isNext
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : "border-zinc-250 hover:border-zinc-400"
                        }`}
                      >
                        <div>
                          {/* Card Header: Date & Status */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-150">
                            <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-red-500" />
                              {event.dow} · {event.dateTime}
                            </span>
                            {event.isNext && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-[9px] font-mono font-black text-white rounded uppercase tracking-widest">
                                NEXT
                              </span>
                            )}
                            {event.format && event.format !== "-" && !event.isNext && (
                              <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-mono font-bold rounded">
                                {event.format}
                              </span>
                            )}
                          </div>

                          {/* Series Title */}
                          <h3 className={`text-sm font-bold font-sans tracking-tight mt-2.5 ${isBreakWeek ? "text-zinc-500 italic" : "text-zinc-950"}`}>
                            {event.series}
                          </h3>

                          {/* Location / Track */}
                          <div className="mt-2 flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="font-semibold text-zinc-800">
                              {event.location}
                            </span>
                            {event.trackKey && (
                              <span className="text-[10px] font-mono text-zinc-400 ml-auto uppercase">
                                ACC Circuit
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer Action: Link directly to tunes in Garage */}
                        <div className="pt-3 mt-3 border-t border-zinc-150 flex items-center justify-between gap-2">
                          {event.trackKey ? (
                            <button
                              onClick={() => {
                                if (event.trackKey) {
                                  setInternalTrackFilter(event.trackKey);
                                  setGarageMode("setups");
                                }
                              }}
                              className="text-[10px] font-mono font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer group"
                            >
                              <span>
                                {userTunesForTrack.length > 0
                                  ? `⭐ View My ${userTunesForTrack.length} Tune${userTunesForTrack.length > 1 ? "s" : ""}`
                                  : `Search My Tunes`}
                              </span>
                              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-400">
                              {isBreakWeek ? "No official session" : "Circuit TBD"}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-zinc-400">
                            ACC
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Embedded Google Sheet Table (Filtered to ACC only via Google SQL) */}
          {calendarViewMode === "embed" && (
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-3xs space-y-0">
              <div className="border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between gap-3 bg-zinc-50 text-xs">
                <span className="font-mono text-zinc-600 text-[11px]">
                  <strong>ACC-Filtered Google Sheets View</strong> (via SQL: <code className="bg-zinc-200 px-1 py-0.5 rounded text-[10px]">WHERE Game = 'ACC'</code>)
                </span>
                <a
                  href={LNR_CALENDAR_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Full Spreadsheet
                </a>
              </div>
              <iframe
                src={LNR_CALENDAR_ACC_HTML_EMBED}
                title="LNR ACC Race Calendar"
                className="w-full border-0 bg-white"
                style={{ height: "680px" }}
                loading="lazy"
              />
            </div>
          )}
        </div>
      ) : (
        /* ── SETUPS MODE ── */
        <>
        {/* Profile check */}
        {!profile ? (
          <div className="bg-white border border-zinc-250 p-12 text-center rounded-xl shadow-sm max-w-lg mx-auto">
            <div className="bg-amber-100/55 text-amber-600 p-4 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 font-sans tracking-tight">Connect Driver Profile Needed</h3>
            <p className="text-zinc-500 text-xs mt-2 leading-relaxed font-semibold">
              To view, store, and manage your private garage and setup variants in the cloud, please log in and connect your Sim Racing Driver Profile via the header button.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Filter Sidebar (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-zinc-250 rounded-xl p-4 shadow-3xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-150 pb-2.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">GARAGE FILTERS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full font-bold">
                  {mySetupsRaw.length} total
                </span>
              </div>

              {/* Search Bar */}
              <div className="space-y-1.5">
                <label htmlFor="garage-search-input" className="text-[10px] font-mono font-extrabold text-zinc-450 uppercase">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    id="garage-search-input"
                    type="text"
                    placeholder="Search custom variants..."
                    value={internalSearch}
                    onChange={(e) => setInternalSearch(e.target.value)}
                    className="w-full bg-zinc-50 text-zinc-900 pl-9 pr-4 py-2 border border-zinc-250 rounded-lg text-xs placeholder-zinc-400 font-semibold focus:outline-none focus:border-brand focus:bg-white focus-visible:ring-2 focus-visible:ring-brand/40 transition-all"
                  />
                </div>
              </div>

              {/* Car Lookup Selector */}
              <div className="space-y-1.5">
                <label htmlFor="garage-car-filter" className="text-[10px] font-mono font-extrabold text-zinc-450 uppercase">Car Model</label>
                <select
                  id="garage-car-filter"
                  value={internalCarFilter}
                  onChange={(e) => setInternalCarFilter(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-brand focus:bg-white focus-visible:ring-2 focus-visible:ring-brand/40 transition-all cursor-pointer"
                >
                  <option value="all">🔍 All Cars ({getUniqueCarsInGarage().length})</option>
                  {(() => {
                    const uniqueCars = getUniqueCarsInGarage();
                    // Group cars by class
                    const groups: Record<string, string[]> = {
                      "GT3": [],
                      "GT4": [],
                      "GT2": [],
                      "TCX": [],
                      "Cup / Challenge (GTC)": []
                    };
                    const uncategorized: string[] = [];

                    uniqueCars.forEach((carKey) => {
                      const lower = carKey.toLowerCase();
                      if (lower.includes("gt4") || lower === "alpine_a110_gt4" || lower === "chevrolet_camaro_gt4r" || lower === "ktm_xbow_gt4" || lower === "maserati_mc_gt4" || lower === "ginetta_g55_gt4" || lower === "aston_martin_vantage_gt4") {
                        groups["GT4"].push(carKey);
                      } else if (lower.includes("gt2") || lower === "porsche_935") {
                        groups["GT2"].push(carKey);
                      } else if (lower.includes("gt3") || lower === "jaguar_g3" || lower.includes("audi_r8_lms") || lower.includes("bentley_continental") || lower.includes("lexus_rc_f") || lower.includes("lamborghini_gallardo_rex") || lower.includes("mclaren_650s") || lower === "mercedes_amg_gt3" || lower.includes("nissan_gt_r")) {
                        groups["GT3"].push(carKey);
                      } else if (lower.includes("m2_cs") || lower.includes("tcx")) {
                        groups["TCX"].push(carKey);
                      } else if (lower.includes("cup") || lower.includes("challenge") || lower.includes("st_evo")) {
                        groups["Cup / Challenge (GTC)"].push(carKey);
                      } else {
                        uncategorized.push(carKey);
                      }
                    });

                    // Sort each group alphabetically by display name
                    const sortByName = (list: string[]) => {
                      return list.sort((a, b) => {
                        const nameA = ACC_CARS[a] || a;
                        const nameB = ACC_CARS[b] || b;
                        return nameA.localeCompare(nameB);
                      });
                    };

                    const renderGroup = (label: string, carsList: string[]) => {
                      const sortedList = sortByName(carsList);
                      if (sortedList.length === 0) return null;
                      return (
                        <optgroup key={label} label={label}>
                          {sortedList.map((carKey) => (
                            <option key={carKey} value={carKey}>
                              {ACC_CARS[carKey] || carKey}
                            </option>
                          ))}
                        </optgroup>
                      );
                    };

                    return [
                      renderGroup("GT3", groups["GT3"]),
                      renderGroup("GT4", groups["GT4"]),
                      renderGroup("GT2", groups["GT2"]),
                      renderGroup("TCX", groups["TCX"]),
                      renderGroup("Cup / Challenge (GTC)", groups["Cup / Challenge (GTC)"]),
                      renderGroup("Uncategorized", uncategorized)
                    ];
                  })()}
                </select>
              </div>

              {/* Track Lookup Selector */}
              <div className="space-y-1.5">
                <label htmlFor="garage-track-filter" className="text-[10px] font-mono font-extrabold text-zinc-450 uppercase">Track Variant</label>
                <select
                  id="garage-track-filter"
                  value={internalTrackFilter}
                  onChange={(e) => setInternalTrackFilter(e.target.value)}
                  className="w-full bg-zinc-50 text-zinc-900 border border-zinc-250 rounded-lg py-2 px-2.5 text-xs font-semibold focus:outline-none focus:border-brand focus:bg-white focus-visible:ring-2 focus-visible:ring-brand/40 transition-all cursor-pointer"
                >
                  <option value="all">🔍 All Tracks ({getUniqueTracksInGarage().length})</option>
                  {getUniqueTracksInGarage().map((trackKey) => (
                    <option key={trackKey} value={trackKey}>
                      {ACC_TRACKS[trackKey] || trackKey}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-zinc-150">
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-[10px] text-zinc-500 leading-normal font-medium flex gap-2">
                  <Info className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>Only custom variants saved with your handle <strong>@{profile.username}</strong> are visible here.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: responsive grid list (Span 9) */}
          <div className="lg:col-span-9">
            {isLoading || isRefreshing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-3 shadow-3xs">
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-24 bg-zinc-200 rounded" />
                      <div className="h-4 w-16 bg-zinc-200 rounded" />
                    </div>
                    <div className="h-5 w-40 bg-zinc-200 rounded" />
                    <div className="h-10 w-full bg-zinc-100 rounded" />
                    <div className="flex gap-2 pt-2 border-t border-zinc-100">
                      <div className="h-8 flex-1 bg-zinc-200 rounded" />
                      <div className="h-8 w-16 bg-zinc-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : refreshError ? (
              <div className="bg-white border border-red-200 p-12 text-center rounded-xl flex flex-col items-center justify-center">
                <div className="bg-red-50 p-3 rounded-full w-12 h-12 mb-3 flex items-center justify-center text-red-500">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Sync Error</h3>
                <p className="text-zinc-600 text-xs mt-1 max-w-sm">{refreshError}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Retry Sync
                </button>
              </div>
            ) : sortedMySetups.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-300 p-16 text-center rounded-xl flex flex-col items-center justify-center">
                <div className="bg-zinc-100 p-4 rounded-full w-14 h-14 mb-4 flex items-center justify-center text-zinc-400">
                  <Activity className="w-7 h-7 opacity-50" />
                </div>
                <h3 className="text-base font-bold text-zinc-800">No Tuned Variants Found</h3>
                <p className="text-zinc-500 text-xs mt-1.5 max-w-sm font-semibold leading-relaxed">
                  {mySetupsRaw.length === 0 
                    ? "You haven't saved any customized variants yet! Click 'Tuning Workshop' in the Active HUD on any base setup to create and test custom variations with your notes." 
                    : "No setups match your selected search queries or track/car filters. Clear filters to see your variants."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedMySetups.map((setup) => {
                  const displayCar = ACC_CARS[setup.car] || setup.car || "GT3 Racing Car";
                  const displayTrack = ACC_TRACKS[setup.track] || setup.track || "World Circuit";
                  const showWorkspaceBadge = setup.isTeamWorkspace;
                  const dateString = setup.createdAt 
                    ? new Date(setup.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "Unknown date";

                  return (
                    <div 
                      key={setup.id}
                      className="bg-white border border-zinc-250 rounded-xl hover:border-zinc-400 shadow-3xs hover:shadow-2xs transition-all flex flex-col p-4 relative group"
                    >
                      {/* Top banner summary */}
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-brand bg-red-100/50 font-extrabold px-1.5 py-0.5 rounded whitespace-normal break-words block w-fit">
                              {displayTrack}
                            </span>
                            {(setup.notes?.includes('[Adapted from') || setup.versionNote?.includes('[Adapted from')) && (
                              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-650 bg-amber-100 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">
                                Adapted
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-zinc-950 font-sans tracking-tight mt-1 leading-snug whitespace-normal break-words">
                            {displayCar}
                          </h3>
                        </div>

                        {showWorkspaceBadge && (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-emerald-650 bg-emerald-100 font-extrabold px-1.5 py-0.5 rounded">
                            Shared Team
                          </span>
                        )}
                      </div>

                      {/* Notes Section with visual quote border */}
                      <div className="bg-zinc-50 border-l-2 border-red-500 p-2.5 rounded-r-lg text-xs text-zinc-650 whitespace-normal break-words min-w-0 mb-4 flex-1">
                        <strong className="text-zinc-800 text-xs">Version Note:</strong>{" "}
                        {setup.versionNote || setup.notes || "Custom telemetry adjusted parameters."}
                      </div>

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-150 text-[10px] font-mono text-zinc-450 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{dateString}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {confirmDeleteId === setup.id ? (
                            <div className="flex items-center gap-2 h-11 px-1">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await onDelete(setup.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 font-extrabold uppercase text-[10px] cursor-pointer py-1.5 px-2.5 rounded border border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-95 transition-all"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 font-bold text-[10px] cursor-pointer py-1.5 px-2.5 rounded border border-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-95 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(setup.id);
                              }}
                              className="text-zinc-400 hover:text-red-505 transition-colors w-11 h-11 flex items-center justify-center rounded-lg hover:bg-zinc-100 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                              title="Delete variant"
                              aria-label={`Delete custom setup variant for ${displayCar}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleInspectClick(setup)}
                            className="bg-zinc-950 hover:bg-brand-hover text-white hover:text-white font-mono font-bold px-4 py-2.5 sm:px-3 sm:py-1.5 rounded transition-all flex items-center gap-1.5 h-11 sm:h-auto cursor-pointer active:scale-95 text-[10px] uppercase tracking-wider shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            <Gauge className="w-3.5 h-3.5 text-red-500 group-hover:text-white shrink-0" />
                            <span>INSPECT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}
        </>
      )}
    </div>
  );
}
