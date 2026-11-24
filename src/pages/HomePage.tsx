import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Clock,
  Gauge,
  Wrench,
  Calendar,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useHomeSnapshot } from "../hooks/useHomeSnapshot";

function formatSessionTime(isoString?: string) {
  if (!isoString) return { local: "—", sydney: "—" };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { local: "—", sydney: "—" };

    const local = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);

    const sydney =
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Australia/Sydney",
      }).format(d) + " AEDT";

    return { local, sydney };
  } catch {
    return { local: "—", sydney: "—" };
  }
}

export default function HomePage() {
  const { snapshot, loading } = useHomeSnapshot("lnr-acc-s18");
  const nextRound = snapshot.nextRound;

  // Live countdown to next race
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 3, hours: 14, minutes: 22, seconds: 48 });

  useEffect(() => {
    if (!nextRound?.startAt) return;
    const target = new Date(nextRound.startAt).getTime();

    const updateTimer = () => {
      if (document.hidden) return; // Pause timer when tab is hidden
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextRound?.startAt]);

  const [standingsTab, setStandingsTab] = useState<"pro" | "proam" | "am">("pro");

  const standingsList = snapshot.standingsTop?.[standingsTab] || [];
  const practiceTime = formatSessionTime(nextRound?.sessions?.practiceAt);
  const qualyTime = formatSessionTime(nextRound?.sessions?.qualifyingAt);
  const raceTime = formatSessionTime(nextRound?.sessions?.raceAt);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-12 space-y-6 text-left font-sans">
      {/* 1. Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-mono font-black uppercase tracking-widest shadow-md shadow-red-600/20">
              Late Night Racing
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {snapshot.seasonLabel} · Round {nextRound?.roundNumber || 5} of 10
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-mono">
            ACC Series Championship Companion
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Live league hub, race telemetry setups, pace metrics, and engineering toolkit for console & PC sim racers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://discord.gg/SX2hjFAZj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-[#5865F2]/20 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Join LNR Discord</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <Link
              to="/series"
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border border-zinc-700 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Season Calendar & Standings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Round Timeline Strip */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            Championship Timeline
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Thursday 20:00 AEDT
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {snapshot.roundTimeline.map((r) => {
            const isNext = r.status === "next" || r.roundId === nextRound?.roundId;
            const isCompleted = r.status === "completed";

            return (
              <Link
                key={r.roundNumber}
                to={`/series/round/${r.roundId}`}
                className={`flex-shrink-0 px-3 py-2 rounded-lg border text-left transition-all min-w-[110px] ${
                  isNext
                    ? "bg-red-950/40 border-red-500 shadow-md shadow-red-500/10 text-white"
                    : isCompleted
                    ? "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    : "bg-zinc-950/40 border-zinc-800/60 text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span>R{r.roundNumber}</span>
                  {isNext && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  {isCompleted && <span className="text-emerald-500">✓</span>}
                </div>
                <div className="text-xs font-bold font-mono text-zinc-200 mt-0.5">
                  {r.circuitName}
                </div>
                <div className="text-[9px] font-mono text-zinc-500 truncate">
                  {isCompleted ? "Completed" : isNext ? "NEXT RACE" : "Upcoming"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Next Race Hero Card */}
      {nextRound && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                  Round {nextRound.roundNumber} Hero
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {nextRound.trackName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight uppercase">
                {nextRound.trackName} Endurance
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Vehicles: {nextRound.carName}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300 self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{nextRound.trackName}</span>
            </div>
          </div>

          {/* Live Countdown Display */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block text-center mb-3">
              Countdown to Race Start
            </span>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto text-center font-mono">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-white block">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider">
                  Days
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-white block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider">
                  Hours
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-white block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider">
                  Mins
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-red-500 block">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider">
                  Secs
                </span>
              </div>
            </div>
          </div>

          {/* Session Times: Local vs Australia/Sydney */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase block">Practice:</span>
              <span className="font-bold text-white text-sm block mt-0.5">{practiceTime.local}</span>
              <span className="text-[10px] text-zinc-500">Sydney: {practiceTime.sydney}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase block">Qualifying:</span>
              <span className="font-bold text-white text-sm block mt-0.5">{qualyTime.local}</span>
              <span className="text-[10px] text-zinc-500">Sydney: {qualyTime.sydney}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase block">Main Race:</span>
              <span className="font-bold text-red-500 text-sm block mt-0.5">{raceTime.local}</span>
              <span className="text-[10px] text-zinc-500">Sydney: {raceTime.sydney}</span>
            </div>
          </div>

          {/* Prepare for this Round Links */}
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-2.5">
              Prepare For This Round:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                to={`/setups/jaxtune?track=${nextRound.trackKey}`}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500/50 rounded-lg text-xs font-mono font-bold text-zinc-200 transition-all text-center"
              >
                <Gauge className="w-3.5 h-3.5 text-red-500" />
                <span>Round Setups</span>
              </Link>
              <Link
                to={`/lap-times?track=${nextRound.trackKey}`}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500/50 rounded-lg text-xs font-mono font-bold text-zinc-200 transition-all text-center"
              >
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>Lap Targets</span>
              </Link>
              <Link
                to="/engineer"
                className="flex items-center justify-center gap-1.5 p-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 rounded-lg text-xs font-mono font-bold text-zinc-200 transition-all text-center"
              >
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Engineer</span>
              </Link>
              <Link
                to={`/series/round/${nextRound.roundId}`}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded-lg text-xs font-mono font-bold text-red-400 transition-all text-center"
              >
                <span>Round Intel →</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Standings Snapshot & Recent Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Standings Snapshot (Col 7) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Season 18 Standings Snapshot
              </h3>
            </div>
            <Link
              to="/series"
              className="text-[10px] font-mono text-red-500 hover:text-red-400 font-bold flex items-center gap-1"
            >
              Full Standings <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Class Tabs */}
          <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-lg gap-1 text-[10px] font-mono font-bold uppercase tracking-wider">
            {(["pro", "proam", "am"] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setStandingsTab(cls)}
                className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                  standingsTab === cls
                    ? "bg-zinc-800 text-red-500 font-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {cls === "pro" ? "GT3 Pro" : cls === "proam" ? "GT3 Pro-Am" : "GT3 Am"}
              </button>
            ))}
          </div>

          {/* Standings Table */}
          <div className="space-y-1.5">
            {standingsList.map((row) => (
              <div
                key={row.pos}
                className="flex items-center justify-between p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-xs font-mono hover:bg-zinc-850 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 text-center font-black ${
                      row.pos === 1
                        ? "text-amber-400"
                        : row.pos === 2
                        ? "text-zinc-300"
                        : row.pos === 3
                        ? "text-amber-700"
                        : "text-zinc-500"
                    }`}
                  >
                    {row.pos}
                  </span>
                  <div>
                    <span className="font-bold text-white block">@{row.name}</span>
                    <span className="text-[10px] text-zinc-500">{row.car}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-white text-sm block">
                    {row.points} pts
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    {row.wins}W · {row.podiums}P
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results (Col 5) */}
        {snapshot.recentResults && (
          <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Round {snapshot.recentResults.roundNumber} Results: {snapshot.recentResults.trackName}
                </h3>
              </div>
              <Link
                to={`/series/round/${snapshot.recentResults.roundId}`}
                className="text-[10px] font-mono text-red-500 hover:text-red-400 font-bold flex items-center gap-1"
              >
                All Results <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Podium */}
            <div className="space-y-2">
              {snapshot.recentResults.podium.map((p) => (
                <div
                  key={p.pos}
                  className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-base font-black font-mono ${
                        p.pos === 1
                          ? "text-amber-400"
                          : p.pos === 2
                          ? "text-zinc-300"
                          : "text-amber-700"
                      }`}
                    >
                      P{p.pos}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white font-mono block">
                        @{p.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">{p.car}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {p.gap}
                  </span>
                </div>
              ))}
            </div>

            {/* Fastest Lap Banner */}
            {snapshot.recentResults.fastestLap && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5 text-xs font-mono flex items-center justify-between text-purple-300">
                <span className="text-[10px] uppercase font-bold">Fastest Lap (+1 pt):</span>
                <span className="font-bold">
                  @{snapshot.recentResults.fastestLap.name} — {snapshot.recentResults.fastestLap.lapTime}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Race Prep Toolkit Tiles */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block">
          ACC Race Prep & Engineering Toolkit
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/lap-times"
            className="p-5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500/40 rounded-xl transition-all group"
          >
            <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-1">
              Lap Times Reference
            </h4>
            <p className="text-xs text-zinc-400">
              Alien, Competitive, and Midpack benchmark times across GT2, GT3, and GT4.
            </p>
          </Link>

          <Link
            to="/engineer"
            className="p-5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/40 rounded-xl transition-all group"
          >
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-1">
              AI Race Engineer
            </h4>
            <p className="text-xs text-zinc-400">
              Instant handling diagnostics for oversteer, understeer, and tyre wear on track.
            </p>
          </Link>

          <Link
            to="/setups/jaxtune"
            className="p-5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500/40 rounded-xl transition-all group"
          >
            <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-1">
              Jaxtune Setups
            </h4>
            <p className="text-xs text-zinc-400">
              Curated baseline setups with thermal compensator and sandbox tuning sliders.
            </p>
          </Link>

          <Link
            to="/setups/community"
            className="p-5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-500/40 rounded-xl transition-all group"
          >
            <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-1">
              Community Tunes
            </h4>
            <p className="text-xs text-zinc-400">
              User-submitted setups, team cloud variants, and GitHub repository synchronization.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
