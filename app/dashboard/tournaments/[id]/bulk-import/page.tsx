"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileSpreadsheet, Check, X, Loader2, Download, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

type ParsedTeam = { name: string; tag?: string; contact?: string; players?: any[]; valid: boolean; error?: string };

export default function BulkImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [teams, setTeams] = useState<ParsedTeam[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imported, setImported] = useState<number | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const wb = XLSX.read(data, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Skip header row
        const parsed = json.slice(1).map((row: any) => {
          const name = String(row[0] || "").trim();
          const tag = row[1] ? String(row[1]).trim() : undefined;
          const contact = row[2] ? String(row[2]).trim() : undefined;
          const players: any[] = [];
          
          // Cols 3-6 = player IGNs
          for (let i = 3; i <= 6; i++) {
            if (row[i]) players.push({ ign: String(row[i]).trim() });
          }
          
          return {
            name, tag, contact, players,
            valid: name.length > 0,
            error: name.length === 0 ? "Missing team name" : undefined,
          };
        }).filter(t => t.name || t.tag);
        
        setTeams(parsed);
      } catch (e: any) {
        alert("Failed to parse file: " + e?.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      ["Team Name", "Tag", "Contact", "Player 1", "Player 2", "Player 3", "Player 4"],
      ["Team Alpha", "ALP", "captain@team.com", "Player_IGN_1", "Player_IGN_2", "Player_IGN_3", "Player_IGN_4"],
      ["Team Beta", "BET", "beta@team.com", "IGN1", "IGN2", "IGN3", "IGN4"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    ws["!cols"] = [{ wch: 20 }, { wch: 8 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teams");
    XLSX.writeFile(wb, "tournaops-team-import-template.xlsx");
  };

  const uploadTeams = async () => {
    const valid = teams.filter(t => t.valid);
    if (valid.length === 0) return alert("No valid teams to import");
    
    setUploading(true);
    try {
      const res = await fetch("/api/tournaments/" + id + "/teams/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setImported(data.imported);
      setTimeout(() => router.push("/dashboard/tournaments/" + id), 2000);
    } catch (e: any) {
      alert("Import failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const validCount = teams.filter(t => t.valid).length;
  const invalidCount = teams.length - validCount;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push("/dashboard/tournaments/" + id)} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Tournament
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 flex items-center gap-3">
          <Upload className="w-8 h-8 text-yellow-400" />
          Bulk Import Teams
        </h1>
        <p className="text-neutral-400 mb-8">Upload CSV or Excel file with team data. Perfect for 16-400 team tournaments.</p>

        {imported !== null ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Import Complete!</h2>
            <p className="text-neutral-300">Imported {imported} teams. Redirecting...</p>
          </div>
        ) : (
          <>
            {/* Template Download */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-10 h-10 text-blue-400" />
                  <div>
                    <div className="font-bold text-white">Need a template?</div>
                    <div className="text-sm text-blue-200/80">Download our Excel template with example data</div>
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-xl p-8 mb-6 text-center hover:border-yellow-500/50 transition-all">
              <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
              <div className="text-white font-bold mb-1">Upload CSV or Excel File</div>
              <div className="text-sm text-neutral-400 mb-4">Columns: Team Name, Tag, Contact, Player 1-4</div>
              <label className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose File
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
              </label>
            </div>

            {/* Preview */}
            {teams.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-6">
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-white font-bold">Preview: {teams.length} teams found</div>
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span className="text-green-400">{validCount} valid</span>
                      {invalidCount > 0 && <span className="text-red-400">{invalidCount} invalid</span>}
                    </div>
                  </div>
                  <button
                    onClick={uploadTeams}
                    disabled={uploading || validCount === 0}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-2.5 rounded-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {uploading ? "Importing..." : "Import " + validCount + " Teams"}
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {teams.map((t, i) => (
                    <div key={i} className={"flex items-center gap-3 p-3 border-b border-neutral-800 " + (t.valid ? "" : "bg-red-500/5")}>
                      <div className="w-8 text-center text-neutral-500 text-sm">{i + 1}</div>
                      {t.valid ? <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> : <X className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {t.tag && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">[{t.tag}]</span>}
                          <span className="font-bold text-white truncate">{t.name || "(no name)"}</span>
                        </div>
                        {t.players && t.players.length > 0 && (
                          <div className="text-xs text-neutral-500 mt-0.5 truncate">
                            Players: {t.players.map((p: any) => p.ign).join(", ")}
                          </div>
                        )}
                        {t.error && (
                          <div className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {t.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}