import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Trophy,
  Clock,
  Gauge,
  Wrench,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Car,
  Compass,
  Zap,
  Timer,
  Medal,
} from "lucide-react";
import { useRound } from "../hooks/useRound";
import { useRoundResults } from "../hooks/useRoundResults";
import { CIRCUIT_NOTES } from "../data/circuitNotes";

export default function RoundDetailPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const [classTab, setClassTab] = useState<"pro" | "proam" | "am">("pro");

  const normalizedRoundId = roundId || "r05";
  const { round, loading: roundLoading } = useRound("lnr-acc-s18", normalizedRoundId);
  const { result, loading: resultsLoading } = useRoundResults("lnr-acc-s18", normalizedRoundId);

  // Match circuit notes from dataset
  const circuitNoteEntry = Object.entries(CIRCUIT_NOTES).find(([name]) => {
    if (!round) return false;
    const cleanTrack = round.trackName.toLowerCase();
    const cleanKey = round.trackKey.toLowerCase().replace(/_/g, " ");
    const cleanName = name.toLowerCase();
    return cleanTrack.includes(cleanName) || cleanName.includes(cleanKey);
  });
  const circuitNote = circuitNoteEntry ? circuitNoteEntry[1] : null;

  const formatSessionTime = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const localStr = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    const sydneyStr =
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Australia/Sydney",
      }).format(date) + " Sydney";

    return { local: localStr, sydney: sydneyStr };
  };

  const practice = formatSessionTime(round?.sessions?.practiceAt);
  const qualifying = formatSessionTime(round?.sessions?.qualifyingAt);
  const race = formatSessionTime(round?.sessions?.raceAt);
  const race2 = formatSessionTime(round?.sessions?.race2At);

  const activeResults = result?.resultsByClass?.[classTab] || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6 text-left font-sans">
      {/* Back button */}
      <Link
        to="/series"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-500 hover:text-red-400"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Season Calendar
      </Link>

      {/* Round Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider">
              Round {round?.roundNumber || normalizedRoundId.replace("r", "")} of 10
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Late Night Racing ACC Series · Season 18
            </span>
          </div>

          {round?.status && (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                round.status === "completed"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                  : round.status === "live"
                  ? "bg-red-950/60 border-red-800 text-red-400 animate-pulse"
                  : "bg-amber-950/60 border-amber-800 text-amber-400"
              }`}
            >
              {round.status}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-3">
            {round?.trackName?.toUpperCase() || `ROUND ${normalizedRoundId.toUpperCase()}`}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 mt-2">
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-red-500" />
              {round?.carName || "GT3 Class"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              {round?.trackKey || "acc-circuit"}
            </span>
          </div>
        </div>

        {/* Action / Prep Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-4 border-t border-zinc-800">
          <Link
            to={`/setups/jaxtune?track=${round?.trackKey || ""}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-mono font-bold text-zinc-200 transition-colors"
          >
            <Gauge className="w-3.5 h-3.5 text-red-500" />
            <span>Round Setups</span>
          </Link>
          <Link
            to={`/lap-times?track=${round?.trackKey || ""}&car=${round?.carKey || ""}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-mono font-bold text-zinc-200 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>Target Lap Times</span>
          </Link>
          <Link
            to={`/engineer?track=${round?.trackKey || ""}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-mono font-bold text-zinc-200 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ask Race Engineer</span>
          </Link>
        </div>
      </div>

      {/* Session Times Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {practice && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
              Practice Session
            </span>
            <div className="text-sm font-mono font-bold text-white">{practice.local}</div>
            <div className="text-[11px] font-mono text-zinc-500">{practice.sydney}</div>
          </div>
        )}
        {qualifying && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
              Qualifying Session
            </span>
            <div className="text-sm font-mono font-bold text-white">{qualifying.local}</div>
            <div className="text-[11px] font-mono text-zinc-500">{qualifying.sydney}</div>
          </div>
        )}
        {race && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
              Race Session
            </span>
            <div className="text-sm font-mono font-bold text-white">{race.local}</div>
            <div className="text-[11px] font-mono text-zinc-500">{race.sydney}</div>
          </div>
        )}
      </div>

      {/* Circuit Intel & Notes */}
      {circuitNote && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-500" />
              Circuit Strategic Intel & ACC Characteristics
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded">
                Speed: {circuitNote.acc_speed_category}
              </span>
              <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded">
                Overtaking: {circuitNote.acc_overtaking_difficulty}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {circuitNote.circuit_notes}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Aerodynamics
              </span>
              <p className="text-xs text-zinc-300 leading-snug">
                {circuitNote.setup_notes.downforce}
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Tyres & Pressures
              </span>
              <p className="text-xs text-zinc-300 leading-snug">
                {circuitNote.setup_notes.tyres}
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Fuel & Strategy
              </span>
              <p className="text-xs text-zinc-300 leading-snug">
                {circuitNote.setup_notes.fuel.stint_recommendation}
              </p>
            </div>
          </div>

          {circuitNote.key_corners?.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-2">
                Key Corners to Master:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 font-mono">
                {circuitNote.key_corners.map((corner, idx) => (
                  <li
                    key={idx}
                    className="p-2 bg-zinc-950/60 border border-zinc-850 rounded flex items-start gap-2"
                  >
                    <span className="text-red-500 font-bold">›</span>
                    <span>{corner}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Results / Classification Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Official Classification
            </h2>
            {result?.fastestLap && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/50 border border-purple-800 text-purple-300 rounded text-[10px] font-mono">
                <Timer className="w-3 h-3 text-purple-400" />
                FL: {result.fastestLap.driver} ({result.fastestLap.lapTime})
              </span>
            )}
          </div>

          <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-lg gap-1 text-[10px] font-mono font-bold self-start sm:self-auto">
            {(["pro", "proam", "am"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setClassTab(c)}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  classTab === c ? "bg-zinc-800 text-red-500 font-black" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {activeResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">Pos</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Car</th>
                  <th className="py-2.5 px-3">Gap / Status</th>
                  <th className="py-2.5 px-3 text-center">Laps</th>
                  <th className="py-2.5 px-3">Best Lap</th>
                  <th className="py-2.5 px-3 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {activeResults.map((r) => {
                  const isPodium = r.position <= 3;
                  return (
                    <tr key={r.driverId} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                            r.position === 1
                              ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                              : r.position === 2
                              ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/40"
                              : r.position === 3
                              ? "bg-amber-700/20 text-amber-600 border border-amber-700/40"
                              : "text-zinc-500"
                          }`}
                        >
                          {r.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/drivers/${r.driverId}`}
                          className="font-bold text-white hover:text-red-400 transition-colors"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 text-[11px] truncate max-w-[150px]">
                        {r.car}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 font-medium">
                        {r.gap}
                      </td>
                      <td className="py-2.5 px-3 text-center text-zinc-400">
                        {r.laps}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-300">
                        {r.bestLap}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-red-400">
                        +{r.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : round?.status === "upcoming" ? (
          <div className="p-8 text-center text-zinc-400 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
            <Clock className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-mono font-bold text-white">
              Round {round.roundNumber} is Scheduled / Upcoming
            </p>
            <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
              Official race results and driver points will appear here immediately after race night
              finishes and the Google Sheet is synced.
            </p>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-400 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <p className="text-xs font-mono">
              Classification data ready for Google Sheets Results sync.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
