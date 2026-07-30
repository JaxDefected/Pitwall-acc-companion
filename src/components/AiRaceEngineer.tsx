import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Wrench,
  Cpu,
  Sparkles,
  AlertTriangle,
  Info,
  User,
  RefreshCw,
} from "lucide-react";
import { ACC_CARS, ACC_TRACKS, NormalizedAccSetup } from "../utils/accParser";
import { ChatMessage } from "../types/chat";
import {
  ISSUE_TYPES, CORNER_PHASES, SPEED_TYPES,
  TYRE_ISSUES, BRAKE_ISSUES, OTHER_ISSUES,
  resolveScenario, getLocalResponse
} from "../services/localFallback";

interface AiRaceEngineerProps {
  activeSetup: {
    name: string;
    car: string;
    track: string;
    rawData: any;
  } | null;
  parsedSetupData: NormalizedAccSetup | null;
}

// Shared ReactMarkdown component config
const markdownComponents = {
  h3: ({ node, ...props }: any) => <h3 className="text-xs font-extrabold uppercase font-mono tracking-wide text-white border-l-2 border-red-500 pl-2 mt-4 mb-2" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-2 text-zinc-300 font-medium" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
  li: ({ node, ...props }: any) => <li className="pl-0.5" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="text-white font-extrabold" {...props} />,
  code: ({ node, ...props }: any) => <code className="bg-zinc-950 px-1 py-0.5 rounded text-xs text-red-400 font-mono" {...props} />,
};

export default function AiRaceEngineer({ activeSetup, parsedSetupData }: AiRaceEngineerProps) {
  // ─── Mode Toggle ───
  const [mode, setMode] = useState<"local" | "chat">("local");

  // ─── Local Diagnostic State ───
  const [issueType, setIssueType] = useState<string>("");
  const [cornerPhase, setCornerPhase] = useState<string>("");
  const [speedType, setSpeedType] = useState<string>("high");
  const [localResult, setLocalResult] = useState<ReturnType<typeof getLocalResponse> | null>(null);
  const [hasQueried, setHasQueried] = useState<boolean>(false);

  // ─── AI Chat State ───
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Derived Dropdown Logic ───
  const showPhaseAndSpeed = issueType === "oversteer" || issueType === "understeer";
  const showTyreOptions = issueType === "tyre";
  const showBrakeOptions = issueType === "brakes";
  const showOtherOptions = issueType === "other";

  const canQuery = issueType && (
    (showPhaseAndSpeed && cornerPhase) ||
    (showTyreOptions && cornerPhase) ||
    (showBrakeOptions && cornerPhase) ||
    (showOtherOptions && cornerPhase)
  );

  // ─── Local Handlers ───
  const handleIssueTypeChange = (val: string) => {
    setIssueType(val);
    setCornerPhase("");
    setSpeedType("high");
    setLocalResult(null);
    setHasQueried(false);
  };

  const handleLocalQuery = () => {
    if (!canQuery) return;
    const scenario = resolveScenario(issueType, cornerPhase, showPhaseAndSpeed ? speedType : undefined);
    const result = getLocalResponse(scenario, parsedSetupData);
    setLocalResult(result);
    setHasQueried(true);
  };

  const handleReset = () => {
    setIssueType("");
    setCornerPhase("");
    setSpeedType("high");
    setLocalResult(null);
    setHasQueried(false);
  };

  // ─── Reset chat messages on mode change so greeting regenerates ───
  useEffect(() => {
    setMessages([]);
  }, [mode]);

  // ─── Prepopulate AI chat with greeting ───
  useEffect(() => {
    if (mode === "chat" && messages.length === 0) {
      const greeting = activeSetup
        ? `Hello! I am your AI Race Engineer. I've loaded your setup **${activeSetup.name}** for the **${ACC_CARS[activeSetup.car] || activeSetup.car}** at **${ACC_TRACKS[activeSetup.track] || activeSetup.track}**. How is the car handling out on track?`
        : `Hello! I am your AI Race Engineer. No active setup is currently loaded. Please load a setup from the garage tab, or tell me what vehicle and track you are driving so we can diagnose your handling issues.`;
      setMessages([{ role: "model", content: greeting }]);
    }
  }, [activeSetup, messages.length, mode]);

  // ─── Scroll to bottom on new messages/stream ───
  useEffect(() => {
    if (mode === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent, mode]);

  // ─── AI Chat Handler ───
  const handleSend = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          activeSetup: parsedSetupData,
        }),
      });

      if (!response.ok) {
        let errorText = "Failed to fetch stream from race engineer.";
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorText;
        } catch {
          errorText = `Server error (${response.status}): ${response.statusText || "HTML/Text Response"}`;
        }
        throw new Error(errorText);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported by this browser.");
      }

      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.substring(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullContent += parsed.text;
              setStreamingContent(fullContent);
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }

      if (buffer.trim().startsWith("data: ")) {
        const data = buffer.trim().substring(6);
        if (data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullContent += parsed.text;
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: "model", content: fullContent || "No response received from the engineer." }]);
    } catch (err: any) {
      console.error("AI Race Engineer Stream Error:", err);
      setMessages(prev => [
        ...prev,
        { role: "model", content: `⚠️ **The engineer is currently unavailable.** ${err.message || "Check your connection and try again."}\n\n*Switch to Diagnosis Tool mode for offline engineering advice.*` }
      ]);
    } finally {
      setStreamingContent("");
      setIsStreaming(false);
    }
  };

  const getContextualChips = (setup: NormalizedAccSetup | null): string[] => {
    if (!setup) return [
      "How do I diagnose understeer?",
      "What causes exit oversteer?",
      "How should I adjust tyre pressures?",
    ];
    return [
      "Slow corner exit oversteer under throttle",
      "Mid-corner push in high-speed corners",
      "Brake bias feels too front biased",
      "Tyre degradation on the rear left",
    ];
  };

  // ─── Segmented button style helper ───
  const segBtn = (isActive: boolean) =>
    `flex-1 min-w-[80px] py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center min-h-[44px] md:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
      isActive
        ? "bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm font-extrabold"
        : "text-zinc-500 hover:text-zinc-300"
    }`;

  // ─── Full-width list button style helper ───
  const listBtn = (isActive: boolean) =>
    `w-full py-2.5 px-3 rounded text-xs font-mono font-bold text-left transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
      isActive
        ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
        : "text-zinc-500 hover:text-zinc-300"
    }`;

  return (
    <div className="bg-zinc-950 border border-zinc-800 shadow-xl rounded-xl overflow-hidden font-sans flex flex-col h-[650px] max-h-[80vh]">

      {/* ── Sticky Header ── */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold uppercase font-mono tracking-wider text-white">
              🔧 Virtual AI Race Engineer
            </h3>
            <p className="text-zinc-400 text-[10px] sm:text-xs font-mono uppercase tracking-widest mt-0.5">
              Setup Diagnostics & Handling Advice
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        {activeSetup ? (
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-2 sm:px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest max-w-[100px] sm:max-w-[150px] truncate">
              {ACC_CARS[activeSetup.car]?.split(" ")[0] || activeSetup.car} — {ACC_TRACKS[activeSetup.track] || activeSetup.track}
            </span>
            <span className="hidden sm:inline text-[9px] font-mono text-zinc-500 px-1 border border-zinc-800 rounded">SETUP LOADED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 px-2 sm:px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 uppercase font-black tracking-widest">No setup loaded</span>
          </div>
        )}
      </div>

      {/* ── No setup warning banner ── */}
      {!activeSetup && (
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300 flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>No setup loaded — load a setup from the Garage tab for contextual engineering advice.</span>
        </div>
      )}

      {/* ── Mode Toggle Bar ── */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/60 px-4 sm:px-5 py-3 shrink-0">
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1 max-w-sm">
          <button
            onClick={() => setMode("local")}
            className={`flex-1 py-2 rounded text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[36px] ${
              mode === "local"
                ? "bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm font-extrabold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Wrench className="w-3 h-3" />
            Diagnosis Tool
          </button>
          <button
            onClick={() => setMode("chat")}
            className={`flex-1 py-2 rounded text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[36px] ${
              mode === "chat"
                ? "bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm font-extrabold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI Chat
          </button>
        </div>
      </div>

      {/* ═══════ LOCAL DIAGNOSIS MODE ═══════ */}
      {mode === "local" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">

          {/* Step 1 — Issue Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              1. What is the issue?
            </label>
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1 flex-wrap">
              {ISSUE_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleIssueTypeChange(value)}
                  className={segBtn(issueType === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Corner Phase (Oversteer / Understeer only) */}
          {showPhaseAndSpeed && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                2. When does it happen?
              </label>
              <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1 flex-wrap">
                {CORNER_PHASES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setCornerPhase(value)}
                    className={`${segBtn(cornerPhase === value)} min-w-[100px]`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Speed (Oversteer / Understeer only, after phase selected) */}
          {showPhaseAndSpeed && cornerPhase && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                3. Corner speed?
              </label>
              <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1">
                {SPEED_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSpeedType(value)}
                    className={segBtn(speedType === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Tyre specific */}
          {showTyreOptions && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                2. Select tyre issue
              </label>
              <div className="flex flex-col bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1">
                {TYRE_ISSUES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setCornerPhase(value)}
                    className={listBtn(cornerPhase === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Brake specific */}
          {showBrakeOptions && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                2. Select brake issue
              </label>
              <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1">
                {BRAKE_ISSUES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setCornerPhase(value)}
                    className={segBtn(cornerPhase === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Other specific */}
          {showOtherOptions && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                2. Select issue
              </label>
              <div className="flex flex-col bg-zinc-900 border border-zinc-800 p-1 rounded-lg gap-1">
                {OTHER_ISSUES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setCornerPhase(value)}
                    className={listBtn(cornerPhase === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query CTA Button */}
          {canQuery && !hasQueried && (
            <button
              onClick={handleLocalQuery}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-extrabold uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98] shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              Get Engineering Advice
            </button>
          )}

          {/* ── Result Card ── */}
          {localResult && (
            <div className="space-y-4 animate-fade-in">
              {/* Title */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Wrench className="w-3 h-3" />
                  {localResult.title}
                </h4>
                <button
                  onClick={handleReset}
                  className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-1 cursor-pointer focus-visible:outline-none transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  New Query
                </button>
              </div>

              {/* Active Setup Reference */}
              {localResult.setupSummary && (
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-3 text-[10px] text-zinc-400 leading-relaxed font-mono flex gap-2">
                  <Info className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                  <span className="break-all">{localResult.setupSummary}</span>
                </div>
              )}

              {/* Technique Card */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs font-sans leading-relaxed shadow-md">
                <p className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-2.5 h-2.5" /> Technique First
                </p>
                <p className="text-zinc-200 font-medium leading-relaxed">{localResult.technique}</p>
              </div>

              {/* Mechanical Adjustments Card */}
              {localResult.mechanical.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs font-sans leading-relaxed shadow-md">
                  <p className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> If Technique Is Already Clean — Mechanical Adjustments
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    {localResult.mechanical.map((step, i) => (
                      <li key={i} className="text-zinc-300 font-medium pl-0.5">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Note */}
              {localResult.note && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-2.5 text-[10px] text-amber-300 font-medium flex gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <span>{localResult.note}</span>
                </div>
              )}

              {/* Footer disclaimer */}
              <p className="text-[9px] font-mono text-zinc-600 text-center">
                Always adjust in small increments (1–2 clicks) and run 3 consistent laps before evaluating.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!issueType && (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <Cpu className="w-8 h-8 text-zinc-700" />
              <p className="text-xs text-zinc-500 font-mono">Select a handling issue above to get engineering advice.</p>
              <p className="text-[10px] text-zinc-600 font-mono">No API required — all responses are local.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════ AI CHAT MODE ═══════ */}
      {mode === "chat" && (
        <>
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar bg-zinc-950/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Meta label */}
                <div className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest font-bold mb-1.5 ${msg.role === "user" ? "text-zinc-500" : "text-emerald-400"}`}>
                  {msg.role === "user" ? (
                    <>
                      <span>Driver</span>
                      <User className="w-2.5 h-2.5" />
                    </>
                  ) : (
                    <>
                      <Wrench className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Engineer</span>
                    </>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`text-xs font-sans leading-relaxed px-4 py-3 rounded-2xl max-w-[85%] shadow-md border ${
                    msg.role === "user"
                      ? "bg-zinc-900 border-zinc-800 text-white rounded-tr-none"
                      : "bg-zinc-900/50 border-zinc-800/80 text-zinc-200 rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown components={markdownComponents}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Suggestion Chips on initial greeting */}
                {idx === 0 && messages.length <= 1 && (
                  <div className="mt-4 flex flex-col gap-2 w-full animate-fade-in">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold ml-1">
                      💡 Select a handling feedback prompt:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {getContextualChips(parsedSetupData).map((chipText, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSend(chipText)}
                          className="bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px] md:min-h-0"
                        >
                          {chipText}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Bubble */}
            {isStreaming && streamingContent && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-400 mb-1.5">
                  <Wrench className="w-2.5 h-2.5" />
                  <span>Engineer (Streaming)</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/80 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-xs font-sans leading-relaxed shadow-md">
                  <ReactMarkdown components={markdownComponents}>
                    {streamingContent}
                  </ReactMarkdown>
                  <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-1 animate-pulse" />
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-400 mb-1.5">
                  <Wrench className="w-2.5 h-2.5" />
                  <span>Engineer</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-500 text-xs font-mono flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                  <span>Analyzing telemetry logs...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer Bar */}
          <div className="bg-zinc-900/40 border-t border-zinc-800/80 p-3 sm:p-4 shrink-0 flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all"
            >
              <textarea
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setInput(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Describe setup issues, pressures, understeer, or oversteer..."
                aria-label="Describe setup issues, pressures, understeer, or oversteer..."
                className="flex-1 bg-transparent text-base md:text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none max-h-16 min-h-[36px] py-2 leading-relaxed font-medium"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center self-end mb-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98]"
                aria-label="Send message to AI Race Engineer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 px-1">
              <span>Always adjust in small increments (1-2 clicks) and test for 3 laps.</span>
              <span>{input.length} / 1000</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
