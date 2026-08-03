"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Camera, FileText, Zap, Trophy, MessageSquare, TrendingUp, Sparkles, Star, Radio } from "lucide-react";

const AI_FEATURES = [
  {
    icon: Camera, color: "from-blue-500 to-cyan-500",
    title: "AI TableScan",
    desc: "Upload a screenshot and AI extracts match results automatically",
    action: "Open any tournament > Matches > Screenshot Import",
    status: "Available",
  },
  {
    icon: FileText, color: "from-purple-500 to-pink-500",
    title: "Paste Results with AI",
    desc: "Paste messy text from Discord/WhatsApp and AI structures it",
    action: "Open any tournament > Discord Import",
    status: "Available",
  },
  {
    icon: Zap, color: "from-orange-500 to-red-500",
    title: "AI Result Validator",
    desc: "Automatically checks for errors before publishing results",
    action: "Built into every result submission",
    status: "Active",
  },
  {
    icon: Trophy, color: "from-yellow-500 to-orange-500",
    title: "AI Points Table",
    desc: "Smart leaderboard with team insights, trends, and predictions",
    action: "Open any tournament > Standings tab",
    status: "Available",
  },
  {
    icon: Bot, color: "from-green-500 to-emerald-500",
    title: "Tournament Analyst (OpsAI)",
    desc: "Ask questions about standings, kills, predictions",
    action: "Blue bot button on tournament page",
    status: "Available",
  },
  {
    icon: TrendingUp, color: "from-cyan-500 to-blue-500",
    title: "What-If Simulator",
    desc: "Simulate hypothetical match results and see rank changes",
    action: "Coming in next update",
    status: "Coming Soon",
  },
  {
    icon: MessageSquare, color: "from-indigo-500 to-purple-500",
    title: "AI Social Generator",
    desc: "Generate Discord/Twitter posts from match results",
    action: "Broadcast Studio or Share panel",
    status: "Available",
  },
  {
    icon: Star, color: "from-pink-500 to-rose-500",
    title: "AI Commentary",
    desc: "Generate esports-style match commentary",
    action: "Broadcast Studio",
    status: "Available",
  },
  {
    icon: Radio, color: "from-red-500 to-pink-500",
    title: "AI Tournament Report",
    desc: "Auto-generated report with champion, awards, and AI summary",
    action: "/tournaments/[slug]/report",
    status: "Available",
  },
  {
    icon: Sparkles, color: "from-violet-500 to-purple-500",
    title: "AI Scoring Assistant",
    desc: "Upload a scoring rules image and AI creates the template",
    action: "Dashboard > Scoring Systems",
    status: "Available",
  },
];

export default function AIDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">TournaOps AI</h1>
          <p className="text-gray-500 text-sm">AI-powered tournament operations</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
        <p className="text-purple-300 text-sm">
          <Bot className="w-4 h-4 inline mr-1.5" />
          AI features enhance your workflow but <strong>never publish results automatically</strong>. Every AI extraction is reviewed by you before it becomes official.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_FEATURES.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="glass-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-sm">{f.title}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      f.status === "Available" ? "bg-green-500/20 text-green-400" :
                      f.status === "Active" ? "bg-blue-500/20 text-blue-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">{f.desc}</p>
                  <p className="text-gray-600 text-[10px]">{f.action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-xl p-5 border border-white/10">
        <h3 className="text-white font-bold text-sm mb-3">AI Cost Optimization</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>TournaOps uses AI strategically to minimize costs:</p>
          <ul className="space-y-1 list-disc list-inside text-gray-500">
            <li><strong className="text-white">Points calculation</strong> - Pure code (no AI)</li>
            <li><strong className="text-white">Ranking/sorting</strong> - Pure code (no AI)</li>
            <li><strong className="text-white">Tiebreakers</strong> - Pure code (no AI)</li>
            <li><strong className="text-white">Statistics</strong> - Pure code (no AI)</li>
            <li><strong className="text-white">Screenshot reading</strong> - GPT-4o Vision (AI)</li>
            <li><strong className="text-white">Text parsing</strong> - Regex first, AI fallback</li>
            <li><strong className="text-white">Summaries</strong> - GPT-4o-mini (AI)</li>
            <li><strong className="text-white">Content generation</strong> - GPT-4o-mini (AI)</li>
          </ul>
          <p className="mt-2 text-gray-600">Estimated cost: ~$0.01-0.05 per tournament operation</p>
        </div>
      </div>
    </div>
  );
}