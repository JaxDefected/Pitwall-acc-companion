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
  ChevronDown,
  Zap,
  MessageSquare,
  Search
} from "lucide-react";
import { ACC_CARS, ACC_TRACKS, NormalizedAccSetup } from "../utils/accParser";
import { ChatMessage } from "../types/chat";
import { DIAGNOSTIC_CATEGORIES, getLocalFallbackResponse, classifyFreeText } from "../services/localFallback";

interface AiRaceEngineerProps {
  activeSetup: {
    name: string;
    car: string;
    track: string;
    rawData: any;
  } | null;
  parsedSetupData: NormalizedAccSetup | null;
}

// Shared ReactMarkdown component config for consistent rendering
const markdownComponents = {
  h3: ({ node, ...props }: any) => <h3 className="text-xs font-extrabold uppercase font-mono tracking-wide text-white border-l-2 border-red-500 pl-2 mt-4 mb-2" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-2 text-zinc-300 font-medium" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
  li: ({ node, ...props }: any) => <li className="pl-0.5" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="text-white font-extrabold" {...props} />,
  code: ({ node, ...props }: any) => <code className="bg-zinc-950 px-1 py-0.5 rounded text-xs text-red-400 font-mono" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-2 border-amber-500/50 pl-3 my-2 text-amber-300/80 italic" {...props} />,
};

export default function AiRaceEngineer({ activeSetup, parsedSetupData }: AiRaceEngineerProps) {
  // ─── Mode State ───
  const [engineerMode, setEngineerMode] = useState<"local" | "ai">("local");

  // ─── Local Diagnostic State ───
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedSpeed, setSelectedSpeed] = useState<"high" | "low">("low");
  const [localResponse, setLocalResponse] = useState<string | null>(null);

  // ─── AI Chat State ───
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Prepopulate AI chat with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = activeSetup
        ? `Hello! I am your AI Race Engineer. I've loaded your setup **${activeSetup.name}** for the **${ACC_CARS[activeSetup.car] || activeSetup.car}** at **${ACC_TRACKS[activeSetup.track] || activeSetup.track}**. How is the car handling out on track?`
        : `Hello! I am your AI Race Engineer. No active setup is currently loaded. Please load a setup from the garage tab, or tell me what vehicle and track you are driving so we can diagnose your handling issues.`;
      setMessages([{ role: "model", content: greeting }]);
    }
  }, [activeSetup, messages.length]);

  // Scroll to bottom on new messages/stream
  useEffect(() => {
    if (engineerMode === "ai") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent, engineerMode]);

  // Scroll to response when local diagnosis completes
  useEffect(() => {
    if (localResponse && engineerMode === "local") {
      responseRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [localResponse, engineerMode]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory("");
    setSelectedSpeed("low");
    setLocalResponse(null);
  }, [selectedCategory]);

  // Reset speed when subcategory changes
  useEffect(() => {
    setLocalResponse(null);
  }, [selectedSubcategory, selectedSpeed]);

  // ─── Derived Data ───
  const currentCategory = selectedCategory ? DIAGNOSTIC_CATEGORIES[selectedCategory] : null;
  const currentSubcategory = currentCategory && selectedSubcategory
    ? currentCategory.subcategories[selectedSubcategory]
    : null;
  const showSpeedSelector = currentSubcategory?.hasSpeedVariant ?? false;

  // ─── Local Diagnosis Handler ───
  const handleDiagnose = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    const response = getLocalFallbackResponse(
      selectedCategory,
      selectedSubcategory,
      selectedSpeed,
      parsedSetupData
    );
    setLocalResponse(response);
  };

  // ─── AI Chat Handler ───
  const handleSend = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");
    setErrorMsg(null);

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
            // Ignore syntax errors for incomplete lines
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
      console.warn("Gemini API unavailable, switching to local fallback:", err.message);

      // Attempt to classify the failed message and provide a local fallback
      const classified = classifyFreeText(content);
      if (classified) {
        const fallbackResponse = getLocalFallbackResponse(
          classified.category,
          classified.subcategory,
          classified.speed,
          parsedSetupData
        );
        setMessages(prev => [...prev, { role: "model", content: fallbackResponse }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "model", content: `⚠️ **The engineer is currently unavailable.** ${err.message || "Check your connection and try again."}\n\n*Switch to Setup Diagnostics mode for offline rule-based assistance.*` }
        ]);
      }
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

  return (
    <div className="bg-zinc-950 border border-zinc-800 shadow-xl rounded-xl overflow-hidden font-sans flex flex-col h-[650px] max-h-[80vh]">
      {/* ─── Sticky Header ─── */}
      <div className="bg-zinc-900/90 border-b border-zinc-850/80 backdrop-blur px-5 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-650/10 rounded-lg border border-red-500/20 text-red-500">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-white">
              🔧 Virtual Race Engineer
            </h3>
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest mt-0.5">
              {engineerMode === "local" ? "Setup Diagnostics" : "AI Chat Diagnostics"}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        {engineerMode === "local" ? (
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest">
              Local Mode
            </span>
          </div>
        ) : activeSetup ? (
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest max-w-[150px] truncate sm:max-w-none">
              {ACC_CARS[activeSetup.car]?.split(' ')[0] || activeSetup.car} — {ACC_TRACKS[activeSetup.track] || activeSetup.track}
            </span>
            <span className="hidden sm:inline text-[9px] font-mono text-zinc-500 px-1 border border-zinc-800 rounded">SETUP LOADED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-amber-550 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-widest">
              No setup loaded
            </span>
          </div>
        )}
      </div>

      {/* ─── Mode Toggle ─── */}
      <div className="bg-zinc-900/60 border-b border-zinc-850/80 px-4 py-2.5 shrink-0">
        <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800 p-0.5">
          <button
            onClick={() => setEngineerMode("local")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-mono uppercase font-black tracking-widest transition-all cursor-pointer ${
              engineerMode === "local"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Zap className="w-3 h-3" />
            Setup Diagnostics
          </button>
          <button
            onClick={() => setEngineerMode("ai")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-mono uppercase font-black tracking-widest transition-all cursor-pointer ${
              engineerMode === "ai"
                ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            AI Chat
            <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded font-mono">BETA</span>
          </button>
        </div>
      </div>

      {/* ─── Amber Warning Banner ─── */}
      {!activeSetup && (
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300 flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Load a setup from the garage tab for automated setup value references in diagnostics.</span>
        </div>
      )}

      {/* ═══════════ LOCAL DIAGNOSTICS MODE ═══════════ */}
      {engineerMode === "local" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                What's the issue?
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="">Select a handling category...</option>
                  {Object.entries(DIAGNOSTIC_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Subcategory Selector */}
            {currentCategory && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  When does it happen?
                </label>
                <div className="relative">
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="">Select phase / scenario...</option>
                    {Object.entries(currentCategory.subcategories).map(([key, sub]) => (
                      <option key={key} value={key}>{sub.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Speed Variant Selector */}
            {showSpeedSelector && selectedSubcategory && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  Corner speed?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSpeed("low")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedSpeed === "low"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    🐢 Low Speed
                  </button>
                  <button
                    onClick={() => setSelectedSpeed("high")}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedSpeed === "high"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    🏎️ High Speed
                  </button>
                </div>
              </div>
            )}

            {/* Diagnose Button */}
            {selectedCategory && selectedSubcategory && (
              <button
                onClick={handleDiagnose}
                className="w-full flex items-center justify-center gap-2 bg-emerald-450 hover:bg-emerald-400 text-zinc-950 font-mono font-black text-xs uppercase tracking-widest py-3 rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Search className="w-3.5 h-3.5" />
                Diagnose Issue
              </button>
            )}

            {/* ─── Response Panel ─── */}
            {localResponse && (
              <div ref={responseRef} className="animate-fade-in">
                {/* Engineer Header */}
                <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-400 mb-2">
                  <Wrench className="w-2.5 h-2.5" />
                  <span>Engineer Diagnosis</span>
                </div>

                {/* Response Card */}
                <div className="bg-zinc-900/50 border border-zinc-850/80 rounded-2xl px-5 py-4 text-xs font-sans leading-relaxed shadow-md">
                  <ReactMarkdown components={markdownComponents}>
                    {localResponse}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* ─── Empty State / Welcome ─── */}
            {!localResponse && !selectedCategory && (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-3 opacity-60">
                <Wrench className="w-8 h-8 text-zinc-600" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  Select a handling issue above
                </p>
                <p className="text-[10px] text-zinc-600 max-w-[280px]">
                  Choose your category, phase, and corner speed to receive rule-based engineering guidance with your current setup values.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ AI CHAT MODE ═══════════ */}
      {engineerMode === "ai" && (
        <>
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-zinc-950/40">
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
                      : "bg-zinc-900/50 border-zinc-850/80 text-zinc-200 rounded-tl-none"
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
                          className="bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                <div className="bg-zinc-900/50 border border-zinc-850/80 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-xs font-sans leading-relaxed shadow-md">
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
                <div className="bg-zinc-900/50 border border-zinc-850/80 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-500 text-xs font-mono flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                  <span>Analyzing telemetry logs...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Composer */}
          <div className="bg-zinc-900/40 border-t border-zinc-850/80 p-4 shrink-0 flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2 bg-zinc-950 border border-zinc-850/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all"
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
                className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none max-h-16 min-h-[36px] py-2 leading-relaxed font-medium"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="p-2 bg-emerald-450 hover:bg-emerald-400 text-zinc-950 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center self-end mb-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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

      {/* ─── Local Mode Footer ─── */}
      {engineerMode === "local" && (
        <div className="bg-zinc-900/40 border-t border-zinc-850/80 px-4 py-3 shrink-0">
          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 px-1">
            <span>Always adjust in small increments (1-2 clicks) and test for 3 laps.</span>
            <span className="text-zinc-700">Offline • No API calls</span>
          </div>
        </div>
      )}
    </div>
  );
}
