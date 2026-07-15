import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Wrench, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  TrendingDown,
  Info
} from "lucide-react";
import { ACC_CARS, ACC_TRACKS, NormalizedAccSetup } from "../utils/accParser";

interface AiRaceEngineerProps {
  activeSetup: {
    name: string;
    car: string;
    track: string;
    rawData: any;
  } | null;
  parsedSetupData: NormalizedAccSetup | null;
}

const COMMON_ISSUES = [
  { key: "slow_exit_oversteer", label: "Rear snaps / slides when applying throttle on slow corner exit" },
  { key: "fast_exit_oversteer", label: "Rear snaps / slides when applying throttle on high-speed corner exit" },
  { key: "curb_instability", label: "Car bottoms out, bounces, or spins violently over curbs/bumps" },
  { key: "entry_understeer", label: "Severe understeer on high-speed corner entry (car won't turn in)" },
  { key: "apex_understeer", label: "Mid-corner steady-state understeer (car washes wide at apex)" },
  { key: "trail_braking_oversteer", label: "Rear snaps / slides under trail braking or corner entry deceleration" },
  { key: "unstable_braking", label: "Rear feels extremely light / unstable under heavy braking" },
  { key: "low_tire_pressure", label: "Tyres cannot reach the optimal 26.2 - 26.9 PSI hot range" },
  { key: "custom", label: "Other / Custom handling feedback (Describe below)" },
];

export default function AiRaceEngineer({ activeSetup, parsedSetupData }: AiRaceEngineerProps) {
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<string>("slow_exit_oversteer");
  const [customDescription, setCustomDescription] = useState<string>("");
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize with active setup when it is loaded or changed
  useEffect(() => {
    if (activeSetup) {
      setSelectedCar(activeSetup.car);
      setSelectedTrack(activeSetup.track);
    }
  }, [activeSetup]);

  const activeCarLabel = ACC_CARS[selectedCar] || selectedCar || "Any Car";
  const activeTrackLabel = ACC_TRACKS[selectedTrack] || selectedTrack || "Any Track";
  const currentIssueObj = COMMON_ISSUES.find(issue => issue.key === selectedIssue);

const handleAnalyze = async () => {
  setIsAnalyzing(true);
  setErrorMsg(null);
  setAnalysisResult(null);

  try {
    const response = await fetch("/api/engineer-adjust", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carName: activeCarLabel,
        trackName: activeTrackLabel,
        issueLabel: issueLabel,
        customDescription: customDescription,
        activeSetup: parsedSetupData,
      }),
    });

    // Read raw text first to avoid breaking on malformed/HTML responses
    const rawText = await response.text();

    if (!response.ok) {
      console.error("Server error response payload:", rawText);
      throw new Error(`Server returned status ${response.status}. Check network logs.`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Failed to parse server response as JSON. Raw response:", rawText);
      throw new Error("Received an invalid response format from the server.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    setAnalysisResult(data.reply);
  } catch (err: any) {
    console.error(err);
    setErrorMsg(err.message || "An unexpected error occurred while communicating with the pitwall.");
  } finally {
    setIsAnalyzing(false);
  }
};

  return (
    <div className="bg-zinc-950 border border-zinc-800 shadow-xl rounded-xl overflow-hidden font-sans">
      {/* Visual Tech Header */}
      <div className="bg-zinc-900 border-b border-zinc-850 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-650/10 rounded-lg border border-red-500/20 text-red-500">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-white">
              🔧 Virtual AI Race Engineer
            </h3>
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest mt-0.5">
              Telemetry Diagnostics & Setup Prescription Engine
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          <span className="text-xs font-mono text-zinc-400 uppercase font-black tracking-widest">AI Engineer Currently Offline</span>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-850">
        {/* Left Control Panel (Inputs) */}
        <div className="lg:col-span-5 p-5 md:p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono mb-2">
              1. Session & Context
            </h3>
            
            {activeSetup ? (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Active Setup:</span>
                  <span className="text-red-450 font-bold truncate max-w-[180px]" title={activeSetup.name}>
                    {activeSetup.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Vehicle Class:</span>
                  <span className="text-white font-medium">{activeCarLabel}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Circuit:</span>
                  <span className="text-white font-medium">{activeTrackLabel}</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 text-xs font-medium text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  No setup is loaded in the telemetry analyzer right now. The AI Engineer will diagnose issues using general car class characteristics.
                </span>
              </div>
            )}
          </div>

          {/* Car & Track Override Selectors (Only if no active setup is loaded) */}
          {!activeSetup && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <h4 className="text-zinc-450 text-xs font-bold uppercase tracking-wider font-mono">Override Car</h4>
                <select
                  value={selectedCar}
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2.5 rounded focus:outline-none focus:border-red-500 text-xs min-h-[44px] md:min-h-0 w-full whitespace-normal break-words max-w-full"
                  style={{ whiteSpace: "normal" }}
                >
                  <option value="" style={{ whiteSpace: "normal" }} className="whitespace-normal break-words py-1 text-xs text-white">Select a Car</option>
                  {(() => {
                    // Group cars by class
                    const groups: Record<string, [string, string][]> = {
                      "GT3": [],
                      "GT4": [],
                      "GT2": [],
                      "TCX": [],
                      "Cup / Challenge (GTC)": []
                    };
                    const uncategorized: [string, string][] = [];

                    Object.entries(ACC_CARS).forEach(([key, value]) => {
                      const lower = key.toLowerCase();
                      if (lower.includes("gt4") || lower === "alpine_a110_gt4" || lower === "chevrolet_camaro_gt4r" || lower === "ktm_xbow_gt4" || lower === "maserati_mc_gt4" || lower === "ginetta_g55_gt4" || lower === "aston_martin_vantage_gt4") {
                        groups["GT4"].push([key, value]);
                      } else if (lower.includes("gt2") || lower === "porsche_935") {
                        groups["GT2"].push([key, value]);
                      } else if (lower.includes("gt3") || lower === "jaguar_g3" || lower.includes("audi_r8_lms") || lower.includes("bentley_continental") || lower.includes("lexus_rc_f") || lower.includes("lamborghini_gallardo_rex") || lower.includes("mclaren_650s") || lower === "mercedes_amg_gt3" || lower.includes("nissan_gt_r")) {
                        groups["GT3"].push([key, value]);
                      } else if (lower.includes("m2_cs") || lower.includes("tcx")) {
                        groups["TCX"].push([key, value]);
                      } else if (lower.includes("cup") || lower.includes("challenge") || lower.includes("st_evo")) {
                        groups["Cup / Challenge (GTC)"].push([key, value]);
                      } else {
                        uncategorized.push([key, value]);
                      }
                    });

                    // Sort groups alphabetically by display name
                    const sortByName = (list: [string, string][]) => {
                      return list.sort((a, b) => a[1].localeCompare(b[1]));
                    };

                    const renderGroup = (label: string, carsList: [string, string][]) => {
                      const sortedList = sortByName(carsList);
                      if (sortedList.length === 0) return null;
                      return (
                        <optgroup key={label} label={label} className="bg-zinc-900 text-zinc-400 font-bold py-1">
                          {sortedList.map(([key, value]) => (
                            <option key={key} value={key} style={{ whiteSpace: "normal" }} className="whitespace-normal break-words py-1 text-xs text-white bg-zinc-900 font-normal">
                              {value}
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

              <div className="flex flex-col gap-1">
                <h4 className="text-zinc-450 text-xs font-bold uppercase tracking-wider font-mono">Override Circuit</h4>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2.5 rounded focus:outline-none focus:border-red-500 text-xs min-h-[44px] md:min-h-0 w-full whitespace-normal break-words max-w-full"
                  style={{ whiteSpace: "normal" }}
                >
                  <option value="" style={{ whiteSpace: "normal" }} className="whitespace-normal break-words py-1 text-xs text-white">Select a Track</option>
                  {Object.entries(ACC_TRACKS).map(([key, value]) => (
                    <option key={key} value={key} style={{ whiteSpace: "normal" }} className="whitespace-normal break-words py-1 text-xs text-white">{value}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Dropdown list of common issues */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono">
              2. Vehicle Handling Symptom
            </h3>
            <select
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 px-3.5 py-3 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-md transition-all cursor-pointer min-h-[44px] md:min-h-0 whitespace-normal break-words max-w-full"
              style={{ whiteSpace: "normal" }}
            >
              {COMMON_ISSUES.map((issue) => (
                <option 
                  key={issue.key} 
                  value={issue.key}
                  className="whitespace-normal break-words py-1 text-xs text-white"
                  style={{ whiteSpace: "normal" }}
                >
                  {issue.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom feedback notes */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 font-mono">
              3. Telemetry Log / Driver Notes
            </h3>
            <textarea
              placeholder="e.g. 'I slide a lot on high track temperatures at turn 4 and turn 11' or 'The rear snaps over the chicane curbs during qualifying runs'..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-red-500 focus:outline-none rounded-lg p-3 text-xs text-white placeholder-zinc-600 font-medium resize-none h-28"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest font-mono text-zinc-950 bg-emerald-400 hover:bg-emerald-350 disabled:bg-zinc-800 disabled:text-zinc-500 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/5 mt-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Vehicle Dynamics...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                <span>Analyze & Adjust Setup</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Panel (Results) */}
        <div className="lg:col-span-7 p-5 md:p-6 bg-zinc-900/10 flex flex-col justify-between min-h-[400px]">
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="p-4 bg-emerald-500/5 rounded-full border border-emerald-500/10 mb-4 animate-bounce">
                <Cpu className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-200">
                AI Race Engineer Analyzing
              </h3>
              <p className="text-zinc-500 text-xs mt-2 max-w-xs font-medium">
                Evaluating spring rates, ARB roll ratios, aerodynamic rake configurations, and damper curves...
              </p>
              
              <div className="w-full max-w-xs bg-zinc-900 h-1.5 rounded-full mt-5 overflow-hidden border border-zinc-800">
                <div className="h-full bg-emerald-400 rounded-full animate-loaderWidth" style={{ width: "65%" }}></div>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="p-3 bg-red-500/5 rounded-full border border-red-500/10 mb-4 text-red-500">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-red-400">
                Diagnostics Failure
              </h3>
              <p className="text-zinc-400 text-xs mt-2 max-w-sm">
                {errorMsg}
              </p>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : analysisResult ? (
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-400">
                  Race Engineer Prescription
                </h3>
              </div>
              
              {/* Prescribed adjustments layout with customized markdown styling */}
              <div className="prose prose-invert max-w-none text-zinc-300 text-xs font-medium font-sans leading-relaxed space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                <ReactMarkdown
                  components={{
                    h3: ({ node, ...props }) => <h3 className="text-xs font-extrabold uppercase font-mono tracking-wide text-white border-l-2 border-red-500 pl-2 mt-4 mb-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3 text-zinc-350 font-medium" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-zinc-350" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-zinc-350" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="text-white font-extrabold" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-zinc-900 px-1 py-0.5 rounded text-xs text-red-400 font-mono" {...props} />,
                  }}
                >
                  {analysisResult}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800 mb-4 text-zinc-500">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-400">
                Awaiting Feedback Logs
              </h3>
              <p className="text-zinc-500 text-xs mt-2 max-w-xs font-medium">
                Describe your car's behavior and click the button to generate tailored setups.
              </p>
            </div>
          )}

          {/* Quick Disclaimer / Checklist reminder bar */}
          <div className="mt-5 border-t border-zinc-850 pt-4 flex items-start gap-2.5 bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-850">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs font-sans text-zinc-400 leading-relaxed font-medium">
              <span className="font-extrabold text-white uppercase font-mono tracking-wider mr-1.5">⏱️ Disclaimer:</span>
              Always adjust in small increments (1-2 clicks) and test for 3 laps. Make changes sequentially.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
