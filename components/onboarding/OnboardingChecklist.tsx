"use client";

import { useState } from "react";
import {
  Check, ChevronRight, Play, Users, Award, Trophy,
  Zap, Crown, Radio, Lock, ArrowRight, X, Sparkles,
  Target, Shield, Grid3X3, Globe, Info, Flame
} from "lucide-react";
import { Tournament } from "@/types/tournament";

interface OnboardingChecklistProps {
  tournament: Tournament;
  stageCount: number;
  onAction: (action: string) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  desc: string;
  icon: any;
  color: string;
  isComplete: (t: Tournament, stages: number) => boolean;
  action: string;
  actionLabel: string;
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: "create",
    label: "Create Tournament",
    desc: "Tournament created successfully",
    icon: Trophy,
    color: "text-yellow-400",
    isComplete: () => true,
    action: "",
    actionLabel: "",
  },
  {
    id: "teams",
    label: "Add Teams",
    desc: "Import or create team roster",
    icon: Users,
    color: "text-blue-400",
    isComplete: (t) => (t.teams?.length || 0) > 1,
    action: "add-teams",
    actionLabel: "Add Teams",
  },
  {
    id: "stages",
    label: "Set Up Stages",
    desc: "Create qualifier, semi-final, or final stages",
    icon: Award,
    color: "text-purple-400",
    isComplete: (_, stages) => stages > 0,
    action: "add-stage",
    actionLabel: "Add Stage",
  },
  {
    id: "groups",
    label: "Assign Groups",
    desc: "Distribute teams into groups",
    icon: Grid3X3,
    color: "text-indigo-400",
    isComplete: (t) => {
      // Check if any round has lobbies with teamIds
      return (t.rounds || []).some((r: any) => {
        const lobbies = r.lobbies as any[];
        return lobbies?.some(l => l.teamIds?.length > 0);
      });
    },
    action: "assign-groups",
    actionLabel: "Assign Groups",
  },
  {
    id: "start",
    label: "Start Tournament",
    desc: "Change status to LIVE",
    icon: Radio,
    color: "text-green-400",
    isComplete: (t) => t.status === "live" || t.status === "completed",
    action: "go-live",
    actionLabel: "Go Live",
  },
  {
    id: "results",
    label: "Enter Match Results",
    desc: "Submit placement and kill data",
    icon: Target,
    color: "text-orange-400",
    isComplete: (t) => (t.matches || []).some((m: any) => m.status === "completed"),
    action: "enter-results",
    actionLabel: "Enter Results",
  },
  {
    id: "advance",
    label: "Advance Teams",
    desc: "Move qualified teams to next stage",
    icon: Zap,
    color: "text-cyan-400",
    isComplete: () => false,
    action: "advance-teams",
    actionLabel: "Advance",
  },
  {
    id: "champion",
    label: "Crown Champion",
    desc: "Complete tournament and publish results",
    icon: Crown,
    color: "text-yellow-400",
    isComplete: (t) => t.status === "completed",
    action: "complete",
    actionLabel: "Finish",
  },
];

export default function OnboardingChecklist({ tournament, stageCount, onAction }: OnboardingChecklistProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const completedCount = CHECKLIST.filter(item => item.isComplete(tournament, stageCount)).length;
  const progress = Math.round((completedCount / CHECKLIST.length) * 100);
  const nextIncomplete = CHECKLIST.find(item => !item.isComplete(tournament, stageCount) && item.action);
  const isAllDone = completedCount === CHECKLIST.length;

  return (
    <>
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/8 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Getting Started</h3>
                <p className="text-gray-500 text-xs">
                  {isAllDone ? "All steps complete! " : `${completedCount}/${CHECKLIST.length} steps complete`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowGuide(true)} className="btn-ghost text-xs px-3 py-1.5">
                <Info className="w-3 h-3" />How It Works
              </button>
              <button onClick={() => setDismissed(true)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">{progress}%</div>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-4 space-y-1">
          {CHECKLIST.map((item, idx) => {
            const Icon = item.icon;
            const complete = item.isComplete(tournament, stageCount);
            const isNext = item === nextIncomplete;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  complete ? "bg-green-500/5" :
                  isNext ? "bg-blue-500/5 border border-blue-500/20" :
                  "hover:bg-white/3"
                }`}
              >
                {/* Status circle */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  complete ? "bg-green-500 border-green-400" :
                  isNext ? "border-blue-500 bg-blue-500/20" :
                  "border-white/15 bg-white/5"
                }`}>
                  {complete ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${complete ? "text-green-400 line-through opacity-70" : "text-white"}`}>
                    {item.label}
                  </div>
                  <div className="text-gray-500 text-xs">{item.desc}</div>
                </div>

                {/* Action button */}
                {!complete && item.action && (
                  <button
                    onClick={() => onAction(item.action)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                      isNext
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/25"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {item.actionLabel}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {complete && (
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-white/8 flex items-center gap-3 flex-wrap">
          {tournament.status === "draft" && (
            <button
              onClick={() => onAction("go-live")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-green-500/30 hover:opacity-90 transition-all"
            >
              <Play className="w-5 h-5" />
              Start Tournament
            </button>
          )}
          {tournament.status === "live" && (
            <button
              onClick={() => onAction("complete")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-sm shadow-lg shadow-yellow-500/30 hover:opacity-90"
            >
              <Crown className="w-5 h-5" />
              Complete Tournament
            </button>
          )}

          {tournament.status === "draft" && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5" />
              Complete at least steps 1-4 before going live
            </div>
          )}
        </div>
      </div>

      {/* HOW IT WORKS GUIDE */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-8">
          <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  How to Run a Tournament
                </h2>
                <p className="text-gray-500 text-sm mt-1">Complete guide for organizers</p>
              </div>
              <button onClick={() => setShowGuide(false)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {[
                {
                  step: "1",
                  icon: Trophy,
                  color: "from-yellow-500 to-orange-500",
                  title: "Create Your Tournament",
                  desc: "Use the 9-step wizard to set up name, teams, scoring, and maps. Choose a structure template (Simple, Standard, or Pro) or build your own.",
                },
                {
                  step: "2",
                  icon: Users,
                  color: "from-blue-500 to-cyan-500",
                  title: "Add Teams",
                  desc: "Import teams from Discord (paste slot list), upload CSV, or add manually. Teams get auto-assigned slot numbers.",
                },
                {
                  step: "3",
                  icon: Award,
                  color: "from-purple-500 to-pink-500",
                  title: "Set Up Stages",
                  desc: "Go to the Pipeline tab. Add stages like Qualifier, Semi-Final, Grand Final. Each stage can have multiple groups.",
                },
                {
                  step: "4",
                  icon: Grid3X3,
                  color: "from-indigo-500 to-purple-500",
                  title: "Assign Groups",
                  desc: "Click Groups on any stage. Use Random Draw, Snake Seeding, or drag-and-drop to distribute teams.",
                },
                {
                  step: "5",
                  icon: Radio,
                  color: "from-green-500 to-emerald-500",
                  title: "Go Live",
                  desc: "Click Start Tournament. Your public page goes live. Spectators can follow standings in real-time.",
                },
                {
                  step: "6",
                  icon: Target,
                  color: "from-orange-500 to-red-500",
                  title: "Enter Results",
                  desc: "After each match: go to Matches tab, click Enter Results. Enter placements and kills. Points calculate automatically.",
                },
                {
                  step: "7",
                  icon: Zap,
                  color: "from-cyan-500 to-blue-500",
                  title: "Advance Teams",
                  desc: "When a stage is complete: click Advance Teams. Preview who qualifies, then confirm. Teams auto-move to next stage.",
                },
                {
                  step: "8",
                  icon: Crown,
                  color: "from-yellow-500 to-orange-500",
                  title: "Crown Champion",
                  desc: "After Grand Final: lock the stage, publish results. Champion announcement goes live. Download report and share!",
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-600 text-xs font-mono">Step {item.step}</span>
                        <h3 className="text-white font-bold text-sm">{item.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <p className="text-blue-300 text-xs">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  <strong>Pro Tip:</strong> Use the Discord bot! Post slot lists in Discord and import directly. Use /standings to show live standings in Discord.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 text-center">
              <button onClick={() => setShowGuide(false)} className="btn-primary px-6 py-2.5">
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}