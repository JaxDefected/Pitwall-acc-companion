import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart2,
  Lock,
  Search,
  LogIn,
  ArrowUpDown,
  Zap,
  Award,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDriverProfile, DriverProfileStats, PaceTier } from "../hooks/useDriverStats";

type SortField = "rank" | "name" | "pace" | "consistency" | "points" | "wins" | "avgFinish";

export default function StatsPage() {
  const { user, login } = useAuth();
  const { allMockDrivers } = useDriverProfile();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("points");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const processedDrivers = useMemo(() => {
    return allMockDrivers
      .filter((d) => {
        if (search.trim() && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (classFilter !== "all" && d.class !== classFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "rank" || sortField === "points") {
          diff = a.seasonRecord.points - b.seasonRecord.points;
        } else if (sortField === "name") {
          diff = a.name.localeCompare(b.name);
        } else if (sortField === "pace") {
          diff = a.overallPace.percentage - b.overallPace.percentage; // Lower percentage is faster
          return sortAsc ? -diff : diff;
        } else if (sortField === "consistency") {
          diff = a.overallPace.consistency - b.overallPace.consistency;
        } else if (sortField === "wins") {
          diff = a.seasonRecord.wins - b.seasonRecord.wins;
        } else if (sortField === "avgFinish") {
          diff = a.seasonRecord.avgFinish - b.seasonRecord.avgFinish;
          return sortAsc ? diff : -diff; // lower avg finish is better
        }
        return sortAsc ? diff : -diff;
      });
  }, [allMockDrivers, search, classFilter, sortField, sortAsc]);

  const getTierColor = (tier: PaceTier) => {
    switch (tier) {
      case "Alien":
        return "text-purple-400 bg-purple-950/40 border-purple-800/60";
      case "Competitive":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-800/60";
      case "Good":
        return "text-amber-400 bg-amber-950/40 border-amber-800/60";
      case "Midpack":
        return "text-blue-400 bg-blue-950/40 border-blue-800/60";
      default:
        return "text-zinc-400 bg-zinc-950 border-zinc-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6 text-left font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-red-500" />
            LNR DRIVER PACE & RACE LEADERBOARD
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Official pace metrics relative to ACC reference tiers, lap consistency, and season telemetry
          </p>
        </div>

        {!user && (
          <button
            onClick={login}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md self-start sm:self-auto cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In for Full Telemetry</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search driver gamertag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-zinc-500 uppercase">Class:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-xs font-mono text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Classes</option>
            <option value="pro">GT3 Pro</option>
            <option value="proam">GT3 Pro-Am</option>
            <option value="am">GT3 Am</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th
                  onClick={() => handleSort("rank")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <span className="flex items-center gap-1">Pos <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <span className="flex items-center gap-1">Driver <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="py-3 px-4">Class</th>
                <th
                  onClick={() => handleSort("pace")}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <span className="flex items-center gap-1">Headline Pace <ArrowUpDown className="w-3 h-3" /></span>
                </th>

                {user ? (
                  <>
                    <th className="py-3 px-4 text-center">Races</th>
                    <th
                      onClick={() => handleSort("wins")}
                      className="py-3 px-4 text-center cursor-pointer hover:text-white"
                    >
                      <span className="flex items-center justify-center gap-1">Wins <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th
                      onClick={() => handleSort("consistency")}
                      className="py-3 px-4 text-center cursor-pointer hover:text-white"
                    >
                      <span className="flex items-center justify-center gap-1">Consistency <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th
                      onClick={() => handleSort("avgFinish")}
                      className="py-3 px-4 text-center cursor-pointer hover:text-white"
                    >
                      <span className="flex items-center justify-center gap-1">Avg Pos <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th
                      onClick={() => handleSort("points")}
                      className="py-3 px-4 text-right cursor-pointer hover:text-white"
                    >
                      <span className="flex items-center justify-end gap-1">Points <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                  </>
                ) : (
                  <th className="py-3 px-4 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Full Breakdown (Sign in)
                    </span>
                  </th>
                )}
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {processedDrivers.map((d, index) => {
                const tierClass = getTierColor(d.overallPace.tier);

                return (
                  <tr key={d.id} className="hover:bg-zinc-850/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-400">
                      #{index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        to={`/drivers/${d.id}`}
                        className="font-bold text-white hover:text-red-400 transition-colors block"
                      >
                        @{d.name}
                      </Link>
                      <span className="text-[10px] text-zinc-500">{d.car}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-[10px] uppercase font-bold text-zinc-300">
                        {d.class.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${tierClass}`}>
                        {d.overallPace.percentage}% ({d.overallPace.tier})
                      </span>
                    </td>

                    {user ? (
                      <>
                        <td className="py-3 px-4 text-center text-zinc-300">
                          {d.seasonRecord.races}
                        </td>
                        <td className="py-3 px-4 text-center text-amber-400 font-bold">
                          {d.seasonRecord.wins}
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-bold">
                          {d.overallPace.consistency}%
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-300 font-bold">
                          {d.seasonRecord.avgFinish.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-red-500 text-sm">
                          {d.seasonRecord.points}
                        </td>
                      </>
                    ) : (
                      <td className="py-3 px-4 text-zinc-600 text-xs italic">
                        Sign in to view telemetry metrics
                      </td>
                    )}

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/drivers/${d.id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-400 font-bold"
                      >
                        Profile <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
