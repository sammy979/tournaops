"use client";
import { useDialog } from "@/lib/use-confirm";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, FileSpreadsheet, Check, X, Loader2,
  Download, AlertCircle, Users, Info, Sparkles, Trophy
} from "lucide-react";
import * as XLSX from "xlsx";
import TournamentNav from "@/components/tournament/TournamentNav";

type ParsedTeam = {
  name: string;
  tag?: string;
  contact?: string;
  players?: any[];
  valid: boolean;
  error?: string;
};

export default function BulkImportPage({ params }: { params: Promise<{ id: string }> }) {
  const dialog = useDialog();
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

        const parsed = json.slice(1).map((row: any) => {
          const name = String(row[0] || "").trim();
          const tag = row[1] ? String(row[1]).trim() : undefined;
          const contact = row[2] ? String(row[2]).trim() : undefined;
          const players: any[] = [];
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
        void dialog.alert({ title: "Parse Error", description: "Failed to parse file: " + (e?.message || "Unknown error"), variant: "danger" });
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
    if (valid.length === 0) { void dialog.alert({ title: "No Valid Teams", description: "No valid teams found to import. Check the format and try again.", variant: "warning" }); return; }

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
      void dialog.alert({ title: "Import Failed", description: "Import failed: " + e.message, variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const validCount = teams.filter(t => t.valid).length;
  const invalidCount = teams.length - validCount;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* Back Link */}
      <button
        onClick={() => router.push("/dashboard/tournaments/" + id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
          background: "transparent", border: "none",
          cursor: "pointer", marginBottom: "1rem",
        }}
      >
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </button>

      {/* Nav */}
      <div style={{ marginBottom: "1.5rem" }}>
        <TournamentNav tournamentId={id} />
      </div>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
          fontWeight: 800, color: "#fff",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            borderRadius: "0.625rem",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Upload style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
          </div>
          Bulk Team Import
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.375rem" }}>
          Import up to 400 teams at once from CSV or Excel spreadsheet
        </p>
      </div>

      {imported !== null ? (
        /* Success State */
        <div style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.1), transparent)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "1.25rem",
          padding: "3rem 2rem",
          textAlign: "center",
        }}>
          <div style={{
            width: "5rem", height: "5rem",
            borderRadius: "1.25rem",
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}>
            <Check style={{ width: "2.5rem", height: "2.5rem", color: "#4ade80" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            Import Complete!
          </h2>
          <p style={{ color: "#d1d5db", fontSize: "1rem", marginBottom: "1rem" }}>
            Successfully imported <strong style={{ color: "#4ade80" }}>{imported} teams</strong>
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Redirecting to tournament in 2 seconds...
          </p>
        </div>
      ) : (
        <>
          {/* Template Download Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.08), transparent)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "1rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "2.75rem", height: "2.75rem",
                borderRadius: "0.75rem",
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <FileSpreadsheet style={{ width: "1.25rem", height: "1.25rem", color: "#60a5fa" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: "0.125rem" }}>
                  First time? Download our template
                </div>
                <div style={{ fontSize: "0.75rem", color: "#93c5fd" }}>
                  Excel file with example data and correct column format
                </div>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.625rem",
                fontSize: "0.8rem", fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
              }}
            >
              <Download style={{ width: "0.875rem", height: "0.875rem" }} />
              Download Template
            </button>
          </div>

          {/* Upload Zone */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "2px dashed rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            padding: "3rem 2rem",
            marginBottom: "1.5rem",
            textAlign: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
            e.currentTarget.style.background = "rgba(245,158,11,0.02)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          }}>
            <div style={{
              width: "3.5rem", height: "3.5rem",
              borderRadius: "1rem",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
            }}>
              <Upload style={{ width: "1.5rem", height: "1.5rem", color: "#f59e0b" }} />
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.375rem" }}>
              Upload CSV or Excel File
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
              Columns: Team Name • Tag • Contact • Player 1-4
            </div>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "#f59e0b",
              color: "#000",
              padding: "0.75rem 1.75rem",
              borderRadius: "0.75rem",
              fontSize: "0.9rem", fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 25px rgba(245,158,11,0.3)",
            }}>
              <Upload style={{ width: "1rem", height: "1rem" }} />
              Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.75rem" }}>
              Supported formats: .xlsx, .xls, .csv (up to 400 teams)
            </p>
          </div>

          {/* Preview */}
          {teams.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              overflow: "hidden",
              marginBottom: "1.5rem",
            }}>
              <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "1rem", flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                    Preview: {teams.length} teams found
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", fontSize: "0.75rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#4ade80" }}>
                      <Check style={{ width: "0.75rem", height: "0.75rem" }} />
                      {validCount} valid
                    </span>
                    {invalidCount > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#f87171" }}>
                        <X style={{ width: "0.75rem", height: "0.75rem" }} />
                        {invalidCount} invalid
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={uploadTeams}
                  disabled={uploading || validCount === 0}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: uploading || validCount === 0 ? "rgba(245,158,11,0.4)" : "#f59e0b",
                    color: "#000",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem", fontWeight: 800,
                    cursor: uploading || validCount === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 8px 25px rgba(245,158,11,0.3)",
                  }}
                >
                  {uploading
                    ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Importing...</>
                    : <><Check style={{ width: "1rem", height: "1rem" }} />Import {validCount} Teams</>
                  }
                </button>
              </div>

              <div style={{ maxHeight: "24rem", overflowY: "auto" }} className="scrollbar-hide">
                {teams.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.75rem 1.25rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: t.valid ? "transparent" : "rgba(239,68,68,0.03)",
                    }}
                  >
                    <div style={{
                      width: "1.75rem", textAlign: "center",
                      color: "#6b7280", fontSize: "0.75rem", fontWeight: 600,
                    }}>
                      {i + 1}
                    </div>
                    {t.valid ? (
                      <Check style={{ width: "1rem", height: "1rem", color: "#4ade80", flexShrink: 0 }} />
                    ) : (
                      <X style={{ width: "1rem", height: "1rem", color: "#f87171", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {t.tag && (
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 800,
                            background: "rgba(245,158,11,0.15)",
                            color: "#fbbf24",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "0.25rem",
                          }}>
                            [{t.tag}]
                          </span>
                        )}
                        <span style={{
                          fontWeight: 700, color: "#fff", fontSize: "0.85rem",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {t.name || "(no name)"}
                        </span>
                      </div>
                      {t.players && t.players.length > 0 && (
                        <div style={{
                          fontSize: "0.7rem", color: "#6b7280",
                          marginTop: "0.25rem",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          Players: {t.players.map((p: any) => p.ign).join(", ")}
                        </div>
                      )}
                      {t.error && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: "0.25rem",
                          fontSize: "0.7rem", color: "#f87171", marginTop: "0.25rem",
                        }}>
                          <AlertCircle style={{ width: "0.7rem", height: "0.7rem" }} />
                          {t.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div style={{
            background: "rgba(59,130,246,0.05)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: "0.75rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}>
            <Info style={{ width: "1rem", height: "1rem", color: "#60a5fa", flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#93c5fd", marginBottom: "0.25rem" }}>
                Import Tips
              </div>
              <div style={{ fontSize: "0.75rem", color: "#d1d5db", lineHeight: 1.6 }}>
                Column order matters: Team Name (required) → Tag → Contact → Player 1-4.
                Empty rows are automatically skipped. Duplicate team names are prevented on server.
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}