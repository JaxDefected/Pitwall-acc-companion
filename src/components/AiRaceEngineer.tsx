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
  RefreshCw
} from "lucide-react";
import { ACC_CARS, ACC_TRACKS, NormalizedAccSetup } from "../utils/accParser";
import { ChatMessage } from "../types/chat";

interface AiRaceEngineerProps {
  activeSetup: {
    name: string;
    car: string;
    track: string;
    rawData: any;
  } | null;
  parsedSetupData: NormalizedAccSetup | null;
}

export default function AiRaceEngineer({ activeSetup, parsedSetupData }: AiRaceEngineerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Prepopulate chat with greeting when setup or messages mount
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = activeSetup
        ? `Hello! I am your AI Race Engineer. I've loaded your setup **${activeSetup.name}** for the **${ACC_CARS[activeSetup.car] || activeSetup.car}** at **${ACC_TRACKS[activeSetup.track] || activeSetup.track}**. How is the car handling out on track?`
        : `Hello! I am your AI Race Engineer. No active setup is currently loaded. Please load a setup from the garage tab, or tell me what vehicle and track you are driving so we can diagnose your handling issues.`;
      setMessages([{ role: "model", content: greeting }]);
    }
  }, [activeSetup, messages.length]);

  // Smooth scroll to bottom on new message or stream update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const getContextualChips = (setup: NormalizedAccSetup | null): string[] => {
    if (!setup) return [
      "How do I diagnose understeer?",
      "What causes exit oversteer?",
      "How should I adjust tyre pressures?",
    ];
    return [
      `My FL is running cold at ${setup.carName.split(' ')[0]}`,
      "Slow corner exit oversteer under throttle",
      "Mid-corner push in high-speed corners",
      `Brake bias feels too front biased`,
      "Tyre degradation on the rear left",
    ];
  };

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch stream from race engineer.");
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
        
        // Save the last partial line back to buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.substring(6); // remove 'data: '
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

      // Handle any remaining complete buffer line
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
        { role: "model", content: `⚠️ **The engineer is currently unavailable.** ${err.message || "Check your connection and try again."}` }
      ]);
    } finally {
      setStreamingContent("");
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 shadow-xl rounded-xl overflow-hidden font-sans flex flex-col h-[650px] max-h-[80vh]">
      {/* Sticky Active Setup Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-850/80 backdrop-blur px-5 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-650/10 rounded-lg border border-red-500/20 text-red-500">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-white">
              🔧 Virtual AI Race Engineer
            </h3>
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest mt-0.5">
              Stateful Telemetry Chat Diagnostics
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        {activeSetup ? (
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

      {/* Amber Warning Banner if no setup is loaded (Non-blocking) */}
      {!activeSetup && (
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300 flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Telemetry diagnostics are inactive. Go to the garage tab to load a setup for automated engineering context.</span>
        </div>
      )}

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
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-xs font-extrabold uppercase font-mono tracking-wide text-white border-l-2 border-red-500 pl-2 mt-4 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 text-zinc-300 font-medium" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
                  strong: ({ node, ...props }) => <strong className="text-white font-extrabold" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-zinc-950 px-1 py-0.5 rounded text-xs text-red-400 font-mono" {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
            
            {/* Show Suggestion Chips if it's the initial Greeting message */}
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
                      className="bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 text-zinc-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
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
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-xs font-extrabold uppercase font-mono tracking-wide text-white border-l-2 border-red-500 pl-2 mt-4 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 text-zinc-300 font-medium" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-zinc-300" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
                  strong: ({ node, ...props }) => <strong className="text-white font-extrabold" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-zinc-950 px-1 py-0.5 rounded text-xs text-red-400 font-mono" {...props} />,
                }}
              >
                {streamingContent}
              </ReactMarkdown>
              <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading Indicator when no content has streamed yet */}
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
            className="p-2 bg-emerald-450 hover:bg-emerald-400 text-zinc-950 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center self-end mb-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        
        {/* Count and Disclaimer info */}
        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600 px-1">
          <span>Always adjust in small increments (1-2 clicks) and test for 3 laps.</span>
          <span>{input.length} / 1000</span>
        </div>
      </div>
    </div>
  );
}
