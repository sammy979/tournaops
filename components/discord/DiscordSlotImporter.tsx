"use client";
import { useDialog } from "@/lib/use-confirm";

import { useState, useEffect, useCallback } from "react";
import {
  X, MessageSquare, Zap, Check, AlertTriangle, Upload,
  Sparkles, RefreshCw, Trash2, Eye, ArrowRight, Info
} from "lucide-react";
import { Tournament, Team, Player } from "@/types/tournament";
import { saveTournament } from "@/lib/storage/tournaments";
import {
  parseSlotList, validateImport,
  type ParseResult, type ParsedSlot, type ExistingTeamTypeType, type ExistingTeam, type ExistingMatch
} from "@/lib/discord/slotParser";

interface DiscordSlotImporterProps {
  tournament: Tournament;
  onClose: () => void;
  onSave: (updated: Tournament) => void;
}

type Mode = "paste" | "preview" | "confirm";
type ConflictAction = "skip" | "update" | "create_new";

const SAMPLE_MESSAGES = [
  {
    label: "SLOT format",
    text: ` SLOT LIST  Friday Scrim

SLOT 1 - Team Alpha
SLOT 2 - Nova Esports
SLOT 3 - Storm Riders
SLOT 4 - Dark Knights
SLOT 5 - Phoenix Squad
SLOT 6 - Team Nepal
SLOT 7 - BGMI Kings
SLOT 8 - Warriors`,
  },
  {
    label: "Numbered list",
    text: `Registered Teams:

1. Team Alpha
2. Nova Esports
3. Storm Riders
4. Dark Knights
5. Phoenix Squad`,
  },
  {
    label: "S1 format",
    text: `S1 Team Alpha
S2 Nova Esports
S3 Storm Riders
S4 Dark Knights`,
  },
];

export default function DiscordSlotImporter({ tournament, onClose, onSave }: DiscordSlotImporterProps) {
  const dialog = useDialog();
  const [mode, setMode] = useState<Mode>("paste");
  const [rawText, setRawText] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [editableSlots, setEditableSlots] = useState<ParsedSlot[]>([]);
  const [conflictAction, setConflictAction] = useState<ConflictAction>("update");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importCount, setImportCount] = useState(0);

  // Existing teams for duplicate check
  const existingTeams: ExistingTeam[] = (tournament.teams ?? []).map(t => ({
    id: t.id,
    name: t.name,
    seed: t.seed,
  }));

  const dupCheck = parseResult ? validateImport(editableSlots, existingTeams) : null;

  //  Actions 

  const handleParse = () => {
    if (!rawText.trim()) return;
    const result = parseSlotList(rawText);
    setParseResult(result);
    setEditableSlots([...result.slots]);
    setMode("preview");
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawText(text);
    } catch {
      void dialog.alert({ title: "Clipboard Error", description: "Could not read clipboard. Please paste manually.", variant: "warning" });
    }
  };

  const loadSample = (idx: number) => {
    setRawText(SAMPLE_MESSAGES[idx].text);
  };

  const updateSlot = (idx: number, field: keyof ParsedSlot, value: any) => {
    setEditableSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSlot = (idx: number) => {
    setEditableSlots(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 600));

    let updatedTeams = [...(tournament.teams ?? [])];
    let importedCount = 0;

    for (const slot of editableSlots) {
      const existingMatch = dupCheck?.existingMatches.find(
        m => (m as any)?.parsed?.slotNumber === slot.slotNumber && (m as any)?.parsed?.teamName === slot.teamName
      );

      if (existingMatch) {
        if (conflictAction === "skip") continue;

        if (conflictAction === "update") {
          updatedTeams = updatedTeams.map(t =>
            t.id === (existingMatch as any)?.existing?.id
              ? { ...t, name: slot.teamName, seed: slot.slotNumber }
              : t
          );
          importedCount++;
          continue;
        }
        // create_new falls through to add
      }

      // Create new team
      const newTeam: any = {
        id: Math.random().toString(36).substring(2, 10),
        name: slot.teamName,
        tag: slot.teamName.substring(0, 4).toUpperCase(),
        seed: slot.slotNumber,
        players: Array.from({ length: 4 }, (_, i) => ({
          id: Math.random().toString(36).substring(2, 10),
          name: slot.players?.[i] || `Player ${i + 1}`,
          ign: slot.players?.[i] || "",
          role: (["IGL", "Fragger", "Support", "Entry"] as const)[i],
        })),
      };
      updatedTeams.push(newTeam);
      importedCount++;
    }

    // Sort by seed
    updatedTeams.sort((a, b) => (a.seed || 999) - (b.seed || 999));

    const updated = { ...tournament, teams: updatedTeams };
    await saveTournament(updated);

    // Save import history
    try {
      const historyKey = `discord_imports_${tournament.id}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");
      existing.push({
        id: Math.random().toString(36).substring(2, 10),
        importedAt: new Date().toISOString(),
        source: "manual_paste",
        rawText: rawText.substring(0, 500),
        slotsImported: importedCount,
        format: parseResult?.format,
        confidence: parseResult?.confidence,
      });
      localStorage.setItem(historyKey, JSON.stringify(existing.slice(-20)));
    } catch {}

    setImportCount(importedCount);
    setImported(true);
    setTimeout(async () => {
      onSave(updated);
    }, 1500);
  };

  const confidencePct = parseResult ? Math.round(parseResult.confidence * 100) : 0;
  const confidenceColor =
    confidencePct >= 80 ? "text-green-400" :
    confidencePct >= 50 ? "text-yellow-400" : "text-red-400";

  //  RENDER 

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 sm:py-8">
      <div className="glass-card w-full max-w-3xl mx-3 sm:mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/*  Header  */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Import from Discord</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Paste your slot list message from Discord</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/*  Step Indicator  */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/8 bg-black/20">
          {["Paste", "Preview", "Confirm"].map((step, i) => {
            const stepMode: Mode[] = ["paste", "preview", "confirm"];
            const current = mode === stepMode[i];
            const done = ["paste", "preview", "confirm"].indexOf(mode) > i;
            return (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                  done ? "bg-green-500 border-green-500 text-white" :
                  current ? "border-blue-400 text-blue-400 bg-blue-500/10" :
                  "border-white/15 text-gray-600"
                }`}>
                  {done ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-xs ${current ? "text-white font-semibold" : done ? "text-gray-400" : "text-gray-600"}`}>
                  {step}
                </span>
                {i < 2 && <div className={`flex-1 h-px ${done ? "bg-green-500/40" : "bg-white/10"}`} />}
              </div>
            );
          })}
        </div>

        {/*  */}
        {/* STEP 1: PASTE                                       */}
        {/*  */}
        {mode === "paste" && (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">
                Paste Discord Message
              </label>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste your Discord slot list here...

Example:
SLOT 1 - Team Alpha
SLOT 2 - Team Bravo
SLOT 3 - Team Nepal"
                className="input-field font-mono text-sm resize-none"
                rows={12}
                autoFocus
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button onClick={handlePasteFromClipboard} className="btn-ghost text-xs px-3 py-1.5">
                  <Upload className="w-3 h-3 mr-1" />Paste from Clipboard
                </button>
                {SAMPLE_MESSAGES.map((s, i) => (
                  <button key={i} onClick={() => loadSample(i)} className="btn-ghost text-xs px-3 py-1.5">
                    <Sparkles className="w-3 h-3 mr-1" />{s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-400">
                  <p className="font-semibold text-yellow-500 mb-1">Supported formats:</p>
                  <div className="font-mono text-gray-500 space-y-0.5">
                    <div>SLOT 1 - Team Name</div>
                    <div>1. Team Name    1 - Team Name    1) Team Name</div>
                    <div>S1 Team Name    #1 Team Name    Slot 1: Team Name</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/8">
              <span className="text-gray-600 text-sm">
                {rawText.trim().split("\n").filter(l => l.trim()).length} lines
              </span>
              <button
                onClick={handleParse}
                disabled={!rawText.trim() || rawText.trim().length < 10}
                className="btn-primary px-6 py-2.5"
              >
                <Zap className="w-4 h-4" />Parse & Preview
              </button>
            </div>
          </div>
        )}

        {/*  */}
        {/* STEP 2: PREVIEW                                     */}
        {/*  */}
        {mode === "preview" && parseResult && (
          <div className="p-6 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Detected", value: parseResult.totalDetected, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Confidence", value: `${confidencePct}%`, color: confidenceColor, bg: "bg-white/5" },
                { label: "New Teams", value: dupCheck?.newTeams.length || 0, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Conflicts", value: dupCheck?.existingMatches.length || 0, color: (dupCheck?.existingMatches.length || 0) > 0 ? "text-yellow-400" : "text-gray-500", bg: "bg-yellow-500/5" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-white/8 text-center`}>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 space-y-1.5">
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {parseResult.warnings.length} warning{parseResult.warnings.length !== 1 ? "s" : ""}
                </div>
                <div className="space-y-0.5 max-h-24 overflow-y-auto">
                  {parseResult.warnings.slice(0, 8).map((w, i) => (
                    <p key={i} className="text-xs text-yellow-300/80"> {typeof w === "string" ? w : (w as any).message ?? String(w)}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Slot List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Detected Teams ({editableSlots.length})
                </p>
                <span className="text-gray-700 text-xs font-mono">Format: {parseResult.format}</span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {editableSlots.map((slot, idx) => {
                  const conflict = dupCheck?.existingMatches.find(
                    m => (m as any)?.parsed?.slotNumber === slot.slotNumber && (m as any)?.parsed?.teamName === slot.teamName
                  );
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                        conflict
                          ? "bg-yellow-500/5 border-yellow-500/20"
                          : "bg-white/3 border-white/8"
                      }`}
                    >
                      <input
                        type="number"
                        value={slot.slotNumber}
                        onChange={e => updateSlot(idx, "slotNumber", parseInt(e.target.value) || 0)}
                        className="input-field w-14 text-center text-sm py-1 font-mono"
                      />
                      <input
                        type="text"
                        value={slot.teamName}
                        onChange={e => updateSlot(idx, "teamName", e.target.value)}
                        className="input-field flex-1 text-sm py-1"
                      />
                      {conflict && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          (conflict as any).matchType === "exact_name" ? "bg-orange-500/20 text-orange-400" :
                          (conflict as any).matchType === "similar_name" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {(conflict as any).matchType === "exact_name" ? "EXISTS" :
                           (conflict as any).matchType === "similar_name" ? "SIMILAR" : "SEED USED"}
                        </span>
                      )}
                      <button
                        onClick={() => removeSlot(idx)}
                        className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {editableSlots.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-sm">
                    No slots detected. Try a different format.
                  </div>
                )}
              </div>
            </div>

            {/* Conflict Resolution */}
            {(dupCheck?.existingMatches.length || 0) > 0 && (
              <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                <p className="text-white text-xs font-semibold mb-2">
                  {dupCheck?.existingMatches.length} team{dupCheck && dupCheck.existingMatches.length !== 1 ? "s" : ""} conflict with existing. What should happen?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["update", "skip", "create_new"] as ConflictAction[]).map(action => (
                    <button
                      key={action}
                      onClick={() => setConflictAction(action)}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                        conflictAction === action
                          ? "border-blue-500 bg-blue-500/15 text-blue-300"
                          : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      {action === "update" ? "Update Existing" :
                       action === "skip" ? "Skip Conflicts" : "Add as New"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/8">
              <button onClick={() => setMode("paste")} className="btn-secondary px-5 py-2">
                Back
              </button>
              <button
                onClick={() => setMode("confirm")}
                disabled={editableSlots.length === 0}
                className="btn-primary px-6 py-2.5"
              >
                Continue<ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/*  */}
        {/* STEP 3: CONFIRM                                     */}
        {/*  */}
        {mode === "confirm" && parseResult && (
          <div className="p-6 space-y-4">
            {imported ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Import Complete!</h3>
                <p className="text-gray-400">
                  <strong className="text-green-400">{importCount}</strong> team{importCount !== 1 ? "s" : ""} imported into
                </p>
                <p className="text-white font-semibold mt-1">{tournament.name}</p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-white/4 border border-white/8">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Confirm Import</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tournament:</span>
                      <span className="text-white font-medium">{tournament.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Teams to import:</span>
                      <span className="text-green-400 font-bold">{editableSlots.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">New teams:</span>
                      <span className="text-white">{dupCheck?.newTeams.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Conflict action:</span>
                      <span className="text-blue-400 capitalize">{conflictAction.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Existing squads:</span>
                      <span className="text-gray-400">{(tournament.teams ?? []).length}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/8">
                      <span className="text-gray-500 font-semibold">After import:</span>
                      <span className="text-white font-bold">
                        ~{(tournament.teams ?? []).length + (dupCheck?.newTeams.length || 0) + (conflictAction === "create_new" ? (dupCheck?.existingMatches.length || 0) : 0)} squads
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <div className="flex items-start gap-2 text-xs text-blue-300">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Existing player rosters will be preserved for updated teams. New teams get default players you can edit later.</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/8">
                  <button onClick={() => setMode("preview")} className="btn-secondary px-5 py-2" disabled={importing}>
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="btn-primary px-6 py-2.5"
                  >
                    {importing ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing...</>
                    ) : (
                      <><Check className="w-4 h-4" />Confirm Import</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}