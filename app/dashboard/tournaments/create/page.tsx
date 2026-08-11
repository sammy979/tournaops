"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [game, setGame] = useState("pubg_mobile");
  const [format, setFormat] = useState("SQUAD");
  const [maxTeams, setMaxTeams] = useState(16);
  const [prizePool, setPrizePool] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, game, format, maxTeams: Number(maxTeams), prizePool }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/tournaments/${data.tournament?.id || data.id}`);
      } else {
        const err = await res.json();
        setError(err.error || "Creation failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            <Link href="/dashboard" style={{ color: "var(--white-40)", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ color: "var(--white-20)" }}>→</span>
            <span style={{ color: "var(--gold)" }}>Create Tournament</span>
          </div>
          <div className="section-label">New Tournament</div>
          <h1 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: "var(--white)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}>Create Tournament</h1>
        </div>
      </div>

      <div className="container-ops" style={{ padding: "32px 24px", maxWidth: "720px" }}>
        <form onSubmit={submit} style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "3px solid var(--gold)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}>
          <div>
            <label style={{
              display: "block",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              color: "var(--white-70)",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>Tournament Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="e.g. Nepal Pro Scrims #42"
              style={{
                width: "100%",
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.95rem",
                padding: "11px 14px",
                background: "var(--surface-2)",
                color: "var(--white)",
                border: "1px solid var(--border)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              color: "var(--white-70)",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional tournament description..."
              style={{
                width: "100%",
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.88rem",
                padding: "11px 14px",
                background: "var(--surface-2)",
                color: "var(--white)",
                border: "1px solid var(--border)",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "var(--white-70)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.9rem",
                  padding: "11px 14px",
                  background: "var(--surface-2)",
                  color: "var(--white)",
                  border: "1px solid var(--border)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="SOLO">Solo</option>
                <option value="DUO">Duo</option>
                <option value="SQUAD">Squad</option>
              </select>
            </div>

            <div>
              <label style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "var(--white-70)",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>Max Teams</label>
              <input
                type="number"
                value={maxTeams}
                onChange={(e) => setMaxTeams(Number(e.target.value))}
                min={2}
                max={128}
                required
                style={{
                  width: "100%",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.95rem",
                  padding: "11px 14px",
                  background: "var(--surface-2)",
                  color: "var(--white)",
                  border: "1px solid var(--border)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              color: "var(--white-70)",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>Prize Pool (Optional)</label>
            <input
              type="text"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. Rs 10,000 or $500"
              style={{
                width: "100%",
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.9rem",
                padding: "11px 14px",
                background: "var(--surface-2)",
                color: "var(--white)",
                border: "1px solid var(--border)",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "var(--red-dim)",
              border: "1px solid var(--red)",
              borderLeft: "3px solid var(--red)",
              padding: "10px 14px",
              fontSize: "0.85rem",
              color: "var(--red)",
              fontFamily: "Barlow Condensed, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
            <Link href="/dashboard" className="btn-secondary">Cancel</Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-gold"
              style={{
                opacity: (loading || !name.trim()) ? 0.5 : 1,
                cursor: (loading || !name.trim()) ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}