import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Trophy,
  Award,
  Gauge,
  ArrowLeft,
  Lock,
  LogIn,
  Clock,
  Zap,
  Target,
  Swords,
  ChevronRight,
  ShieldAlert,
  TrendingUp,
  FileCode,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDriverProfile, DriverProfileStats, PaceTier } from "../hooks/useDriverStats";
import { useSetups } from "../context/SetupContext";

export default function DriverProfilePage() {
  const { driverId } = useParams<{ driverId: string }>();
  const { user, login } = useAuth();
  const { profile, loading, allMockDrivers } = useDriverProfile(driverId);
  const { setupsList } = useSetups();

  const [rivalId, setRivalId] = useState<string>("turbotadpole");

  // Sign-in gate as specified in Section 2.1 & 6.2
  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 my-16 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 font-sans">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-full w-fit mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wide">
          Driver Telemetry Profile Locked
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Detailed driver telemetry profiles, pace consistency indexes, and stint records require driver sign-in.
        </p>
        <button
          onClick={login}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="p-16 text-center text-zinc-400 font-mono text-xs">
        Loading driver telemetry...
      </div>
    );
  }

  const rivalDriver = allMockDrivers.find((d) => d.id === rivalId) || allMockDrivers[1];

  // Authored tunes by this driver
  const driverTunes = setupsList.filter(
    (s) =>
      s.uploadedByName?.toLowerCase() === profile.name.toLowerCase() ||
      s.uploadedBy === profile.linkedUserId
  );

  const getTierBadge = (tier: PaceTier) => {
    switch (tier) {
      case "Alien":
        return "text-purple-400 bg-purple-950/50 border-purple-800";
      case "Competitive":
        return "text-emerald-400 bg-emerald-950/50 border-emerald-800";
      case "Good":
        return "text-amber-400 bg-amber-950/50 border-amber-800";
      default:
        return "text-blue-400 bg-blue-950/50 border-blue-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6 text-left font-sans">
      <Link
        to="/stats"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-500 hover:text-red-400"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Driver Leaderboard
      </Link>

      {/* Driver Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-red-500/60 flex items-center justify-center font-mono font-black text-2xl text-white shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-[10px] font-mono font-bold uppercase">
                {profile.class.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                P{profile.seasonRecord.championshipPos} in Championship
              </span>
              {profile.rating && (
                <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-amber-300 rounded text-[10px] font-mono font-bold">
                  Glicko {profile.rating}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              @{profile.name}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 max-w-md">
              {profile.bio || "Late Night Racing ACC Series Driver."}
            </p>
          </div>
        </div>

        {/* Season Summary Stats Chips */}
        <div className="grid grid-cols-4 gap-2 text-center font-mono w-full sm:w-auto">
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 min-w-[70px]">
            <span className="text-zinc-500 text-[10px] block">RACES</span>
            <span className="text-sm font-bold text-white">{profile.seasonRecord.races}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 min-w-[70px]">
            <span className="text-zinc-500 text-[10px] block">WINS</span>
            <span className="text-sm font-bold text-amber-400">{profile.seasonRecord.wins}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 min-w-[70px]">
            <span className="text-zinc-500 text-[10px] block">PODIUMS</span>
            <span className="text-sm font-bold text-zinc-200">{profile.seasonRecord.podiums}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 min-w-[70px]">
            <span className="text-zinc-500 text-[10px] block">POINTS</span>
            <span className="text-sm font-bold text-red-500">{profile.seasonRecord.points}</span>
          </div>
        </div>
      </div>

      {/* Recent Form Trend Strip */}
      {profile.recentForm && profile.recentForm.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Championship Form & Recent Trend
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Last {profile.recentForm.length} rounds</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profile.recentForm.map((rf) => (
              <div
                key={rf.roundId}
                className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between font-mono"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">
                    R{rf.roundNumber} · {rf.trackName}
                  </span>
                  <span className="text-xs text-zinc-300 font-bold">+{rf.points} pts</span>
                </div>
                <span
                  className={`text-sm font-black px-2 py-0.5 rounded ${
                    rf.finishPos === 1
                      ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                      : rf.finishPos <= 3
                      ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/40"
                      : "bg-zinc-900 text-zinc-400"
                  }`}
                >
                  P{rf.finishPos}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pace & Consistency Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pace vs Reference Tiers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Pace vs ACC Reference Tiers (acc_laptimes)
            </h3>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${getTierBadge(profile.overallPace.tier)}`}>
              {profile.overallPace.tier} Tier
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60">
              <span className="text-zinc-400">Championship Pace Rating:</span>
              <span className="text-white font-bold">{profile.overallPace.percentage}%</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60">
              <span className="text-zinc-400">Consistency Index:</span>
              <span className="text-emerald-400 font-bold">{profile.overallPace.consistency}%</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60">
              <span className="text-zinc-400">Average Delta to Personal Best:</span>
              <span className="text-zinc-200 font-bold">{profile.overallPace.avgDeltaToPB}</span>
            </div>
          </div>

          {/* Track by track breakdown */}
          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block mb-2">
              Track Pace Breakdown:
            </span>
            <div className="space-y-1.5">
              {profile.trackPace.map((tp) => (
                <div
                  key={tp.trackKey}
                  className="flex items-center justify-between p-2 bg-zinc-950/60 border border-zinc-850 rounded-lg text-xs font-mono"
                >
                  <span className="text-zinc-300 font-medium">{tp.track}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">{tp.bestLap}</span>
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${getTierBadge(tp.tier)}`}>
                      {tp.pacePercentage}% ({tp.tier})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Head-to-Head Comparison Tool */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              Head-to-Head Comparison
            </h3>

            {/* Select Rival */}
            <select
              value={rivalId}
              onChange={(e) => setRivalId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-white rounded px-2 py-1 outline-none cursor-pointer"
            >
              {allMockDrivers
                .filter((d) => d.id !== profile.id)
                .map((d) => (
                  <option key={d.id} value={d.id} className="bg-zinc-950">
                    vs @{d.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs p-3 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-500 block truncate">@{profile.name}</span>
              <span className="text-sm font-bold text-red-500">{profile.seasonRecord.points} pts</span>
            </div>
            <div className="flex items-center justify-center font-black text-zinc-600 text-xs">
              POINTS
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block truncate">@{rivalDriver.name}</span>
              <span className="text-sm font-bold text-amber-400">{rivalDriver.seasonRecord.points} pts</span>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/60">
              <span className="font-bold text-white">{profile.seasonRecord.wins}</span>
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Race Wins</span>
              <span className="font-bold text-white">{rivalDriver.seasonRecord.wins}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/60">
              <span className="font-bold text-white">{profile.seasonRecord.podiums}</span>
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Podiums</span>
              <span className="font-bold text-white">{rivalDriver.seasonRecord.podiums}</span>
            </div>

            <div className="flex justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/60">
              <span className="font-bold text-white">{profile.overallPace.percentage}%</span>
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Pace Index</span>
              <span className="font-bold text-white">{rivalDriver.overallPace.percentage}%</span>
            </div>

            <div className="flex justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/60">
              <span className="font-bold text-white">{profile.overallPace.consistency}%</span>
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Consistency</span>
              <span className="font-bold text-white">{rivalDriver.overallPace.consistency}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track & Car Stats Table (Driver_TrackCarStats) */}
      {profile.trackCarStats && profile.trackCarStats.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Per-Track & Vehicle Statistics (Driver_TrackCarStats)
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Pace benchmarks per circuit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500 font-bold">
                  <th className="py-2.5 px-3">Circuit</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3 text-center">Starts</th>
                  <th className="py-2.5 px-3 text-center">Wins</th>
                  <th className="py-2.5 px-3 text-center">Podiums</th>
                  <th className="py-2.5 px-3">Best Lap</th>
                  <th className="py-2.5 px-3 text-right">Pace Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {profile.trackCarStats.map((tcs, idx) => (
                  <tr key={idx} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{tcs.track}</td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px]">{tcs.car}</td>
                    <td className="py-2.5 px-3 text-center text-zinc-300">{tcs.races}</td>
                    <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{tcs.wins}</td>
                    <td className="py-2.5 px-3 text-center text-zinc-300">{tcs.podiums}</td>
                    <td className="py-2.5 px-3 text-zinc-200">{tcs.bestLap}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getTierBadge(tcs.tier)}`}>
                        {tcs.pacePercentage}% ({tcs.tier})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Authored Community Tunes */}
      {driverTunes.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-red-500" />
              Community Tunes by @{profile.name} ({driverTunes.length})
            </h3>
            <Link to="/setups/community" className="text-[10px] font-mono text-red-500 hover:text-red-400">
              Browse Community →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {driverTunes.map((st) => (
              <Link
                key={st.id}
                to={`/setups/community/${st.id}`}
                className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl space-y-1 block transition-colors"
              >
                <span className="text-xs font-bold text-white font-mono block truncate">{st.name}</span>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{st.track}</span>
                  <span className="text-zinc-400">{st.car}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Season Race Results History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
          <Trophy className="w-4 h-4 text-amber-400" />
          Season 18 Race History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-500 font-bold">
                <th className="py-2.5 px-3">Round</th>
                <th className="py-2.5 px-3">Circuit</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3 text-center">Grid</th>
                <th className="py-2.5 px-3 text-center">Finish</th>
                <th className="py-2.5 px-3 text-center">Incidents</th>
                <th className="py-2.5 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {profile.history.map((h) => (
                <tr key={h.roundId} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">
                    Round {h.roundNumber}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">
                    {h.trackName}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 text-[11px]">
                    {h.car}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-400">
                    P{h.qualifyingPos}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        h.finishPos === 1
                          ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                          : h.finishPos <= 3
                          ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/40"
                          : "text-zinc-400"
                      }`}
                    >
                      P{h.finishPos}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-500">
                    {h.penalties} pts
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-red-400">
                    +{h.points}
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
