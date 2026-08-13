"use client";

import { useState } from "react";
import { X, Upload, Check, AlertCircle, FileText, Users, Clipboard, Download } from "lucide-react";
import { Tournament, Team, Player } from "@/types/tournament";
import { saveTournament } from "@/lib/storage/tournaments";

interface CSVImportProps {
  tournament: Tournament;
  onClose: () => void;
  onSave: (updated: Tournament) => void;
}

export default function CSVImport({ tournament, onClose, onSave }: CSVImportProps) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<{ name: string; players: string[] }[]>([]);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"paste" | "preview">("paste");
  const [importing, setImporting] = useState(false);

  const sampleCSV = `Team Alpha,Player1,Player2,Player3,Player4
Nova Esports,Nova_Killer,Nova_IGL,Nova_Sniper,Nova_Support
Storm Riders,Storm1,Storm2,Storm3,Storm4`;

  const parseCSV = async () => {
    setError("");
    if (!raw.trim()) { setError("Paste your team list first"); return; }
    const lines = raw.trim().split("\n").filter(l => l.trim());
    const teams: { name: string; players: string[] }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/[,\t]/).map(p => p.trim()).filter(p => p);
      if (parts.length < 2) {
        setError(`Line ${i + 1}: Need at least team name + 1 player`);
        return;
      }
      teams.push({ name: parts[0], players: parts.slice(1) });
    }

    if (teams.length === 0) { setError("No teams found"); return; }
    if (teams.length > tournament.maxTeams) {
      setError(`Too many teams (${teams.length}). Max: ${tournament.maxTeams}`);
      return;
    }

    setParsed(teams);
    setMode("preview");
  };

  const handleImport = async () => {
    setImporting(true);
    setTimeout(async () => {
      const newTeams: any[] = parsed.map((t, i) => {
        const existing = (tournament.teams ?? [])[i];
        const players: any[] = t.players.map((name, j) => ({
          id: (existing?.players as any)?.[j]?.id || Math.random().toString(36).substring(2, 10),
          name: name,
          ign: name,
          role: (["IGL", "Fragger", "Support", "Entry"] as const)[j % 4],
        }));
        while (players.length < 4) {
          players.push({
            id: Math.random().toString(36).substring(2, 10),
            name: `Player ${players.length + 1}`,
            ign: "",
            role: "Support",
          });
        }
        return {
          id: existing?.id || Math.random().toString(36).substring(2, 10),
          name: t.name,
          tag: t.name.substring(0, 4).toUpperCase(),
          players,
          seed: i + 1,
        };
      });

      for (let i = parsed.length; i < (tournament.teams ?? []).length; i++) {
        newTeams.push((tournament.teams ?? [])[i]);
      }

      const updated = { ...tournament, teams: newTeams };
      await saveTournament(updated);
      onSave(updated);
      setImporting(false);
    }, 800);
  };

  const fillSample = () => setRaw(sampleCSV);
  const totalPlayers = parsed.reduce((a, t) => a + t.players.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-3xl mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Import Teams from CSV
            </h2>
            <p className="text-gray-500 text-sm mt-1">Paste comma or tab separated team data</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === "paste" && (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Format: TeamName, Player1, Player2, Player3, Player4</label>
              <textarea
                value={raw}
                onChange={e => setRaw(e.target.value)}
                placeholder={sampleCSV}
                className="input-field font-mono text-sm resize-none"
                rows={12}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={fillSample} className="btn-ghost text-xs px-3 py-2">
                <FileText className="w-3.5 h-3.5 mr-1" />Fill Sample
              </button>
              <button onClick={() => navigator.clipboard.readText().then(t => setRaw(t))} className="btn-ghost text-xs px-3 py-2">
                <Clipboard className="w-3.5 h-3.5 mr-1" />Paste from Clipboard
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/8">
              <span className="text-gray-600 text-sm">{raw.trim().split("\n").filter(l => l.trim()).length} lines detected</span>
              <button onClick={parseCSV} disabled={!raw.trim()} className="btn-primary px-6 py-2.5">
                Parse & Preview
              </button>
            </div>
          </div>
        )}

        {mode === "preview" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                  <Check className="w-4 h-4" />{parsed.length} teams parsed
                </span>
                <span className="text-gray-600 text-sm">{totalPlayers} players</span>
              </div>
              <button onClick={() => setMode("paste")} className="btn-ghost text-xs px-3 py-2">Edit</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {parsed.map((team, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
                  <span className="text-gray-600 text-xs font-mono w-6 text-right">{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-yellow-500/20 flex items-center justify-center border border-white/10">
                    <span className="text-sm font-bold text-white">{team.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{team.name}</p>
                    <p className="text-gray-500 text-xs truncate">{team.players.join(", ")}</p>
                  </div>
                  <span className="text-gray-600 text-xs">{team.players.length}P</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/8">
              <p className="text-gray-500 text-sm">This will replace the first {parsed.length} teams</p>
              <div className="flex gap-2">
                <button onClick={() => setMode("paste")} className="btn-secondary px-5 py-2.5">Back</button>
                <button onClick={handleImport} disabled={importing} className="btn-primary px-6 py-2.5">
                  {importing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing...</>
                  ) : (
                    <><Upload className="w-4 h-4" />Import {parsed.length} Teams</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}