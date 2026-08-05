"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
}

export default function OpsAI({ tournamentId }: { tournamentId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory() {
    try {
      const res = await fetch("/api/chat/history");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function saveMessage(role: string, content: string) {
    await fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content, tournamentId }),
    });
  }

  async function clearHistory() {
    await fetch("/api/chat/history", { method: "DELETE" });
    setMessages([]);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage("user", userMessage.content);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          context: "PUBG Mobile tournament organizer assistant",
        }),
      });

      const data = await res.json();
      const aiContent = data.result || data.text || "Sorry, I could not generate a response.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
      await saveMessage("assistant", aiContent);
    } catch (e) {
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error connecting to AI. Please try again.",
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-white">OpsAI</span>
          <span className="text-xs text-gray-400">Powered by Groq</span>
        </div>
        <button
          onClick={clearHistory}
          className="text-gray-400 hover:text-red-400 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
            <Bot className="w-12 h-12 opacity-30" />
            <p className="text-sm">Ask me anything about your tournament!</p>
            <p className="text-xs opacity-60">Scoring rules, team strategy, scheduling...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-yellow-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about scoring, teams, scheduling..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black rounded-lg px-4 py-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}