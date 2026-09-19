import { useState, useRef, useEffect } from "react";
import { Send, Loader2, BookOpen, AlertTriangle, Leaf, Bot } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { queryKnowledge } from "@/api/client";
import type { RAGResponse } from "@/types";

interface Message {
  id: string;
  role: "farmer" | "assistant";
  text: string;
  sources?: RAGResponse["sources"];
  isInsufficient?: boolean;
  isDynamic?: boolean;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is Yellow Leaf Disease in arecanut?",
  "How do I use DAP fertilizer for rice?",
  "What causes leaf curl in tomato?",
  "How to manage rust in wheat?",
  "What is the dosage of Carbendazim fungicide?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I'm your agricultural advisor. Ask me about crop diseases, fertilizers, pests, or farming practices. I'll give you evidence-backed answers from our agricultural knowledge base.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(question: string = input.trim()) {
    if (!question || loading) return;
    setInput("");

    const farmerMsg: Message = {
      id: Date.now().toString(),
      role: "farmer",
      text: question,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, farmerMsg]);
    setLoading(true);

    try {
      const result = await queryKnowledge(question);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: result.answer || "No answer found for that question.",
        sources: result.sources,
        isInsufficient: result.insufficient_evidence,
        isDynamic: result.question_type === "dynamic",
        timestamp: new Date(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      toast.error("Could not get an answer. Please try again.");
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-2xl flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#bfc9c3]/40 px-4 pb-4 pt-8 sm:px-6">
        <p className="agro-eyebrow mb-2">AgroCare advisor</p>
        <h1 className="page-header text-3xl">Agricultural Advisory</h1>
        <p className="page-subheader mt-1">Evidence-backed answers for the next decision in your field.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex gap-2.5", msg.role === "farmer" && "flex-row-reverse")}>
            {/* Avatar */}
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              msg.role === "assistant" ? "bg-agro-100" : "bg-gray-200"
            )}>
              {msg.role === "assistant"
                ? <Bot className="w-4 h-4 text-agro-700" />
                : <Leaf className="w-4 h-4 text-gray-600" />}
            </div>

            {/* Bubble */}
            <div className={clsx("max-w-[82%] space-y-2", msg.role === "farmer" && "items-end flex flex-col")}>
              <div className={clsx(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "farmer"
                  ? "bg-agro-600 text-white rounded-tr-sm"
                  : "bg-white text-gray-800 ring-1 ring-gray-100 rounded-tl-sm"
              )}>
                {msg.isDynamic && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mb-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Requires real-time data — not available in knowledge base</span>
                  </div>
                )}
                {msg.isInsufficient && !msg.isDynamic && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1 mb-2">
                    <BookOpen className="w-3 h-3" />
                    <span>Limited evidence found</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Sources
                  </p>
                  {msg.sources.slice(0, 3).map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 ring-1 ring-gray-100">
                      <p className="font-medium text-agro-700 mb-0.5">{s.source}</p>
                      <p className="text-gray-500 line-clamp-2">{s.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-300 px-1">
                {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-agro-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-agro-700" />
            </div>
            <div className="bg-white ring-1 ring-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-agro-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only shown when no user messages yet */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex-shrink-0">
          <p className="text-xs text-gray-400 mb-2">Suggested questions</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} onClick={() => handleSend(q)}
                className="flex-shrink-0 bg-agro-50 text-agro-700 border border-agro-200 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-agro-100 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input className="field-input flex-1" placeholder="Ask about crops, diseases, fertilizers…"
            value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
          <button type="submit" disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-agro-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 hover:bg-agro-700 transition-colors"
            aria-label="Send">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
