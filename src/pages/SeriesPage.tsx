import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, MapPin, ChevronRight, Award, Medal, Flag } from "lucide-react";
import { useSeries } from "../hooks/useSeries";
import { useStandings } from "../hooks/useStandings";

export default function SeriesPage() {
  const [selectedSeason, setSelectedSeason] = useState("lnr-acc-s18");
  const [classTab, setClassTab] = useState<"pro" | "proam" | "am">("pro");
  const { series, loading: seriesLoading } = useSeries(selectedSeason);
  const { standings, loading: standingsLoading } = useStandings(selectedSeason);

  const activeStandings = standings.classes[classTab] || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-8 text-left font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2 uppercase">
            <Trophy className="w-5 h-5 text-amber-400" />
            {series.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full championship schedule, session times ({series.timezone}), and round briefings
          </p>
        </div>

        {/* Season Selector */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-zinc-500 font-bold">SEASON:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            <option value="lnr-acc-s18" className="bg-zinc-950">Season 18 (Current)</option>
            <option value="lnr-acc-s17" className="bg-zinc-950">Season 17</option>
            <option value="lnr-acc-s16" className="bg-zinc-950">Season 16</option>
          </select>
        </div>
      </div>

      {/* Full Season Calendar Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            Championship Calendar ({series.rounds.length} Rounds)
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Click round for briefing & prep
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {series.rounds.map((r) => {
            const isCompleted = r.status === "completed";
            const isNext = r.status === "live" || (r.status === "upcoming" && r.roundNumber === 5);
            const dateStr = r.startAt
              ? new Date(r.startAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "";

            return (
              <Link
                key={r.id}
                to={`/series/round/${r.id}`}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                  isNext
                    ? "bg-red-950/25 border-red-500/80 shadow-lg shadow-red-500/10"
                    : "bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      isNext
                        ? "bg-red-600 text-white"
                        : isCompleted
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-zinc-950 text-zinc-600"
                    }`}
                  >
                    R{r.roundNumber}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono truncate">
                        {r.trackName}
                      </span>
                      {isNext && (
                        <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[9px] font-mono font-black uppercase">
                          NEXT
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-mono font-bold">
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                      <span>{r.carName}</span>
                      <span>•</span>
                      <span className="text-zinc-300 font-bold">{dateStr}</span>
                    </div>

                    {r.notes && (
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-sm">
                        {r.notes}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Season Standings Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Official Championship Standings
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Accumulated driver points and round-by-round points distribution
            </p>
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

        {/* Standings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500 font-bold">
                <th className="py-2.5 px-3 w-12 text-center">Pos</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3 text-center">Wins</th>
                <th className="py-2.5 px-3 text-center">Pod</th>
                <th className="py-2.5 px-3 text-center">R1</th>
                <th className="py-2.5 px-3 text-center">R2</th>
                <th className="py-2.5 px-3 text-center">R3</th>
                <th className="py-2.5 px-3 text-center">R4</th>
                <th className="py-2.5 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {activeStandings.map((d) => (
                <tr key={d.driverId} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                        d.position === 1
                          ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                          : d.position === 2
                          ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/40"
                          : d.position === 3
                          ? "bg-amber-700/20 text-amber-600 border border-amber-700/40"
                          : "text-zinc-500"
                      }`}
                    >
                      {d.position}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      to={`/drivers/${d.driverId}`}
                      className="font-bold text-white hover:text-red-400 transition-colors"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 text-[11px] truncate max-w-[150px]">
                    {d.car}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400">
                    {d.wins}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400">
                    {d.podiums}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400 text-[11px]">
                    {d.roundScores?.[1] || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400 text-[11px]">
                    {d.roundScores?.[2] || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400 text-[11px]">
                    {d.roundScores?.[3] || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400 text-[11px]">
                    {d.roundScores?.[4] || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-red-500 text-sm">
                    {d.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
