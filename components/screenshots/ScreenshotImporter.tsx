"use client";
import { useDialog } from "@/lib/use-confirm";

import { useState, useRef } from "react";
import {
  X, Upload, Camera, Zap, Check, AlertTriangle,
  Eye, Edit, Save, RefreshCw, Sparkles, Trophy,
  FileText, ArrowRight
} from "lucide-react";
import { Tournament, Match, Team } from "@/types/tournament";

interface ScreenshotImporterProps {
  tournament: Tournament;
  match: Match;
  teams: Team[];
  onClose: () => void;
  onSave: () => void;
}

interface ExtractedResult {
  teamName: string;
  placement: number;
  kills: number;
  confidence: number;
  matched: boolean;
  matchedTeamId?: string;
  edited: boolean;
}

type Step = "upload" | "extracting" | "review" | "confirm";

export default function ScreenshotImporter({
  tournament, match, teams, onClose, onSave
}: ScreenshotImporterProps) {
  const dialog = useDialog();
  const [step, setStep] = useState<Step>("upload");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [results, setResults] = useState<ExtractedResult[]>([]);
  const [mapDetected, setMapDetected] = useState<string>("");
  const [method, setMethod] = useState<"ai" | "manual">("manual");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiError, setAiError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  //  UPLOAD 
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5000000) {
      setError("File too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (!blob) continue;
        const reader = new FileReader();
        reader.onload = (ev) => {
          setScreenshot(ev.target?.result as string);
          setError("");
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  //  EXTRACT 
  const extractResults = async () => {
    if (!screenshot) return;
    setStep("extracting");
    setAiError("");

    try {
      const res = await fetch(`/api/matches/${match.id}/extract-screenshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotBase64: screenshot }),
      });

      if (!res.ok) {
        setAiError("Failed to process screenshot");
        setStep("review");
        initManualResults();
        return;
      }

      const data = await res.json();

      if (data.extraction?.teams?.length > 0) {
        setMethod(data.extraction.method);
        if (data.extraction.mapDetected) setMapDetected(data.extraction.mapDetected);

        // Match extracted names to existing teams
        const matched = data.extraction.teams.map((ext: any) => {
          const matchedTeam = teams.find(t =>
            t.name.toLowerCase().includes(ext.teamName.toLowerCase()) ||
            ext.teamName.toLowerCase().includes(t.name.toLowerCase()) ||
            t.name.toLowerCase() === ext.teamName.toLowerCase()
          );
          return {
            ...ext,
            matched: !!matchedTeam,
            matchedTeamId: matchedTeam?.id,
            edited: false,
          };
        });

        setResults(matched);
        setStep("review");
      } else {
        setAiError(data.aiError || data.extraction?.error || "AI could not extract results");
        setStep("review");
        initManualResults();
      }
    } catch (e: any) {
      setAiError(e.message || "Extraction failed");
      setStep("review");
      initManualResults();
    }
  };

  const initManualResults = () => {
    setMethod("manual");
    setResults(teams.slice(0, 16).map((t, i) => ({
      teamName: t.name,
      placement: i + 1,
      kills: 0,
      confidence: 100,
      matched: true,
      matchedTeamId: t.id,
      edited: false,
    })));
  };

  //  EDIT 
  const updateResult = (idx: number, field: keyof ExtractedResult, value: any) => {
    setResults(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value, edited: true } : r));
  };

  const matchTeam = (idx: number, teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    setResults(prev => prev.map((r, i) =>
      i === idx ? { ...r, matchedTeamId: teamId, teamName: team.name, matched: true, edited: true } : r
    ));
  };

  //  SAVE 
  const handleSave = async () => {
    setSaving(true);
    try {
      const scoring = tournament.scoringRule;
      const matchResults = results.map(r => {
        const placePts = scoring.placementPoints[r.placement - 1] || 0;
        const killPts = r.kills * scoring.killPoints;
        const wwcdBonus = r.placement === 1 && scoring.wwcdBonus ? scoring.wwcdBonus : 0;
        return {
          teamId: r.matchedTeamId || r.teamName,
          teamName: r.teamName,
          placement: r.placement,
          kills: r.kills,
          damage: 0,
          placementPoints: placePts,
          killPoints: killPts,
          totalPoints: placePts + killPts + wwcdBonus,
          wwcd: r.placement === 1,
          playerResults: [],
        };
      });

      const res = await fetch(`/api/matches/${match.id}/qualifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: matchResults,
          notes: `Results imported from screenshot (${method} extraction)`,
          screenshotUrl: screenshot,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        void dialog.alert({ title: "Save Failed", description: "Failed to save match results from screenshot.", variant: "danger" });
      }
    } finally {
      setSaving(false);
    }
  };

  const lowConfidence = results.filter(r => r.confidence < 70);
  const highConfidence = results.filter(r => r.confidence >= 70);
  const unmatchedTeams = results.filter(r => !r.matched);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto py-4" onPaste={handlePaste}>
      <div className="glass-card w-full max-w-6xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Screenshot Result Importer
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {match.name}  {match.map}  {method === "ai" ? "AI-powered extraction" : "Manual entry"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="p-4 border-b border-white/10 bg-white/2">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            {(["upload", "extracting", "review", "confirm"] as Step[]).map((s, i) => {
              const labels = ["Upload", "Extract", "Review", "Save"];
              const isCurrent = step === s;
              const isDone = ["upload", "extracting", "review", "confirm"].indexOf(step) > i;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isDone ? "bg-green-500 border-green-500 text-white" :
                    isCurrent ? "border-blue-500 text-blue-400 bg-blue-500/10" :
                    "border-white/15 text-gray-600"
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs ${isCurrent ? "text-white font-semibold" : isDone ? "text-gray-400" : "text-gray-600"}`}>
                    {labels[i]}
                  </span>
                  {i < 3 && <div className={`flex-1 h-px ${isDone ? "bg-green-500/40" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/*  UPLOAD STEP  */}
        {step === "upload" && (
          <div className="p-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                screenshot ? "border-green-500/40 bg-green-500/5" : "border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {screenshot ? (
                <div>
                  <div className="relative inline-block">
                    <img src={screenshot} alt="Screenshot" className="max-h-64 rounded-xl shadow-2xl mx-auto" />
                    <button
                      onClick={e => { e.stopPropagation(); setScreenshot(null); }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-green-400 font-semibold mt-4">Screenshot ready!</p>
                  <p className="text-gray-500 text-sm">Click to replace or press Extract below</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">Drop screenshot here or click to upload</p>
                  <p className="text-gray-500 text-sm mb-4">Also supports Ctrl+V paste from clipboard</p>
                  <p className="text-gray-600 text-xs">PNG, JPG, WEBP  Max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
              <div className="flex gap-2">
                <button
                  onClick={() => { initManualResults(); setStep("review"); }}
                  className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Edit className="w-4 h-4" />Skip AI  Enter Manually
                </button>
                <button
                  onClick={extractResults}
                  disabled={!screenshot}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5"
                >
                  <Sparkles className="w-4 h-4" />Extract with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/*  EXTRACTING STEP  */}
        {step === "extracting" && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">AI Analyzing Screenshot...</h3>
            <p className="text-gray-500">Detecting team names, placements, and kills</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-purple-400 text-sm font-medium">Powered by GPT-4 Vision</span>
            </div>
          </div>
        )}

        {/*  REVIEW STEP  */}
        {step === "review" && (
          <div className="p-5">
            {/* AI Error Warning */}
            {aiError && (
              <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">AI extraction unavailable</p>
                  <p className="text-yellow-300/70 text-xs">{aiError}. Results shown for manual entry.</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-black text-blue-400">{results.length}</div>
                <div className="text-xs text-gray-500">Detected</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-black text-green-400">{highConfidence.length}</div>
                <div className="text-xs text-gray-500">High Confidence</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-2xl font-black text-yellow-400">{lowConfidence.length}</div>
                <div className="text-xs text-gray-500">Low Confidence</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="text-2xl font-black text-orange-400">{unmatchedTeams.length}</div>
                <div className="text-xs text-gray-500">Unmatched</div>
              </div>
            </div>

            {/* Side by side: Screenshot + Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Screenshot */}
              {screenshot && (
                <div className="glass-card rounded-xl p-3 border border-white/10">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Camera className="w-3 h-3" />Original Screenshot
                  </div>
                  <img src={screenshot} alt="Result screenshot" className="w-full rounded-lg" />
                  {mapDetected && (
                    <div className="mt-2 text-xs text-gray-500">
                      Map detected: <span className="text-white font-medium">{mapDetected}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Results Table */}
              <div className="glass-card rounded-xl p-3 border border-white/10">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-400" />
                  {method === "ai" ? "AI Extracted Results" : "Manual Entry"}
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold ${method === "ai" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {method === "ai" ? "AI" : "MANUAL"}
                  </span>
                </div>

                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {/* Column headers */}
                  <div className="grid grid-cols-12 gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Team</div>
                    <div className="col-span-2 text-center">Place</div>
                    <div className="col-span-2 text-center">Kills</div>
                    <div className="col-span-1 text-center">%</div>
                    <div className="col-span-2 text-center">Match</div>
                  </div>

                  {results.sort((a, b) => a.placement - b.placement).map((r, idx) => (
                    <div key={idx} className={`grid grid-cols-12 gap-1 items-center p-2 rounded-lg border ${
                      r.confidence < 70 ? "border-yellow-500/30 bg-yellow-500/5" :
                      !r.matched ? "border-orange-500/30 bg-orange-500/5" :
                      r.placement <= 3 ? "border-green-500/20 bg-green-500/3" :
                      "border-white/8 bg-white/2"
                    }`}>
                      <div className="col-span-1 text-gray-500 text-xs font-mono">{idx + 1}</div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={r.teamName}
                          onChange={e => updateResult(idx, "teamName", e.target.value)}
                          className="bg-transparent text-white text-xs font-medium w-full border-b border-transparent hover:border-white/20 focus:border-blue-500 outline-none"
                        />
                        {!r.matched && (
                          <select
                            onChange={e => matchTeam(idx, e.target.value)}
                            className="mt-0.5 text-[9px] bg-transparent text-orange-400 border-none outline-none cursor-pointer w-full"
                          >
                            <option value="">Match to team...</option>
                            {teams.map(t => <option key={t.id} value={t.id} className="bg-[#1a1a2e]">{t.name}</option>)}
                          </select>
                        )}
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          max={teams.length}
                          value={r.placement}
                          onChange={e => updateResult(idx, "placement", parseInt(e.target.value) || 1)}
                          className="input-field text-xs py-0.5 px-1 text-center w-full"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={r.kills}
                          onChange={e => updateResult(idx, "kills", parseInt(e.target.value) || 0)}
                          className="input-field text-xs py-0.5 px-1 text-center w-full"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <span className={`text-[10px] font-bold font-mono ${
                          r.confidence >= 90 ? "text-green-400" :
                          r.confidence >= 70 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {r.confidence}%
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        {r.matched ? (
                          <Check className="w-3.5 h-3.5 text-green-400 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mx-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-500">
                {results.filter(r => r.edited).length > 0 && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Edit className="w-3 h-3" />{results.filter(r => r.edited).length} modified
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("upload")} className="btn-secondary px-4 py-2 text-sm">
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || results.length === 0}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5"
                >
                  {saving ? "Saving..." : <><Save className="w-4 h-4" />Submit Results</>}
                </button>
              </div>
            </div>

            {/* Safety notice */}
            <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-center">
              <p className="text-blue-300/70 text-xs">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Results are NEVER auto-published. You must review and confirm before they become official.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}