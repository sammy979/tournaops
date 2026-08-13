"use client";

import { useState } from "react";

interface Prize {
  id: string;
  position: number;
  amount: number | null;
  currency: string | null;
  description: string | null;
  type: string;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  prizePool: number | null;
  prizes: Prize[];
}

interface Props {
  tournaments: Tournament[];
}

interface PrizeForm {
  position: number;
  type: "CASH" | "ITEM";
  amount: string;
  currency: string;
  description: string;
}

const POSITION_LABELS: Record<number, string> = {
  1: "1ST PLACE",
  2: "2ND PLACE",
  3: "3RD PLACE",
  4: "4TH PLACE",
  5: "5TH PLACE",
};

function posLabel(pos: number) {
  return POSITION_LABELS[pos] || `${pos}TH PLACE`;
}

export default function PrizesClient({ tournaments }: Props) {
  const [selectedTournament, setSelectedTournament] = useState<string>(
    tournaments[0]?.id || ""
  );
  const [prizes, setPrizes] = useState<Record<string, Prize[]>>(
    Object.fromEntries(tournaments.map((t) => [t.id, t.prizes]))
  );
  const [prizePool, setPrizePool] = useState<Record<string, string>>(
    Object.fromEntries(
      tournaments.map((t) => [t.id, t.prizePool?.toString() || ""])
    )
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PrizeForm>({
    position: 1,
    type: "CASH",
    amount: "",
    currency: "NPR",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingPool, setSavingPool] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activePrizes = prizes[selectedTournament] || [];
  const activeTournament = tournaments.find((t) => t.id === selectedTournament);

  const totalCash = activePrizes
    .filter((p) => p.type === "CASH" && p.amount)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  function resetForm() {
    setForm({ position: 1, type: "CASH", amount: "", currency: "NPR", description: "" });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  function startEdit(prize: Prize) {
    setForm({
      position: prize.position,
      type: prize.type as "CASH" | "ITEM",
      amount: prize.amount?.toString() || "",
      currency: prize.currency || "NPR",
      description: prize.description || "",
    });
    setEditingId(prize.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  }

  async function savePrize() {
    if (!selectedTournament) return;
    if (form.position < 1) {
      setError("Position must be 1 or higher");
      return;
    }
    if (form.type === "CASH" && (!form.amount || isNaN(Number(form.amount)))) {
      setError("Amount is required for cash prizes");
      return;
    }
    if (form.type === "ITEM" && !form.description.trim()) {
      setError("Description is required for item prizes");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        tournamentId: selectedTournament,
        position: form.position,
        type: form.type,
        amount: form.type === "CASH" ? Number(form.amount) : null,
        currency: form.type === "CASH" ? form.currency : null,
        description: form.description.trim() || null,
      };

      const url = editingId
        ? `/api/prizes/${editingId}`
        : "/api/prizes";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save prize");
        return;
      }

      setSuccess(editingId ? "Prize updated" : "Prize added");

      if (editingId) {
        setPrizes((prev) => ({
          ...prev,
          [selectedTournament]: prev[selectedTournament].map((p) =>
            p.id === editingId ? data.prize : p
          ),
        }));
      } else {
        setPrizes((prev) => ({
          ...prev,
          [selectedTournament]: [...(prev[selectedTournament] || []), data.prize].sort(
            (a, b) => a.position - b.position
          ),
        }));
      }

      resetForm();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePrize(prizeId: string) {
    setDeletingId(prizeId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/prizes/${prizeId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete prize");
        return;
      }
      setSuccess("Prize removed");
      setPrizes((prev) => ({
        ...prev,
        [selectedTournament]: prev[selectedTournament].filter((p) => p.id !== prizeId),
      }));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function savePrizePool() {
    if (!selectedTournament) return;
    const val = prizePool[selectedTournament];
    if (val && isNaN(Number(val))) {
      setError("Prize pool must be a number");
      return;
    }
    setSavingPool(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/tournaments/${selectedTournament}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizePool: val ? Number(val) : null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save prize pool");
        return;
      }
      setSuccess("Prize pool saved");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSavingPool(false);
    }
  }

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1000px",
      margin: "0 auto",
      fontFamily: "Barlow Condensed, sans-serif",
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--gold)",
          letterSpacing: "0.2em",
          marginBottom: "0.25rem",
        }}>
          DASHBOARD / PRIZES
        </div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
        }}>
          Prize Pool Manager
        </h1>
      </div>

      {error && (
        <div style={{
          background: "#1a0000",
          border: "1px solid #ef4444",
          color: "#ef4444",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          marginBottom: "1rem",
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "#001a00",
          border: "1px solid var(--gold)",
          color: "var(--gold)",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          marginBottom: "1rem",
        }}>
          {success}
        </div>
      )}

      {tournaments.length === 0 ? (
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          color: "var(--charcoal)",
        }}>
          No tournaments found. Create a tournament first.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--charcoal)",
              letterSpacing: "0.15em",
              marginBottom: "0.4rem",
            }}>
              TOURNAMENT
            </label>
            <select
              value={selectedTournament}
              onChange={(e) => {
                setSelectedTournament(e.target.value);
                resetForm();
                setError(null);
                setSuccess(null);
              }}
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
              }}
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.game})
                </option>
              ))}
            </select>
          </div>

          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--gold)",
              letterSpacing: "0.15em",
              marginBottom: "0.75rem",
            }}>
              TOTAL PRIZE POOL (NPR)
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input
                type="number"
                value={prizePool[selectedTournament] || ""}
                onChange={(e) =>
                  setPrizePool((prev) => ({
                    ...prev,
                    [selectedTournament]: e.target.value,
                  }))
                }
                placeholder="e.g. 50000"
                min="0"
                style={{
                  flex: 1,
                  background: "var(--black)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "1rem",
                  padding: "0.5rem 0.75rem",
                }}
              />
              <button
                onClick={savePrizePool}
                disabled={savingPool}
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "var(--gold)",
                  color: "var(--black)",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: savingPool ? "not-allowed" : "pointer",
                  opacity: savingPool ? 0.6 : 1,
                }}
              >
                {savingPool ? "SAVING..." : "SAVE POOL"}
              </button>
            </div>
            {totalCash > 0 && (
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--charcoal)",
                marginTop: "0.5rem",
              }}>
                Allocated cash prizes: Rs {totalCash.toLocaleString()}
              </div>
            )}
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--charcoal)",
              letterSpacing: "0.15em",
            }}>
              PRIZE BREAKDOWN — {activePrizes.length} ENTRIES
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setError(null);
                }}
                style={{
                  padding: "0.5rem 1.25rem",
                  background: "transparent",
                  color: "var(--gold)",
                  border: "1px solid var(--gold)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                + ADD PRIZE
              </button>
            )}
          </div>

          {showForm && (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--gold)",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--gold)",
                letterSpacing: "0.15em",
                marginBottom: "1rem",
              }}>
                {editingId ? "EDIT PRIZE" : "NEW PRIZE"}
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--charcoal)",
                    marginBottom: "0.3rem",
                  }}>
                    POSITION
                  </label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, position: Number(e.target.value) }))
                    }
                    min="1"
                    max="99"
                    style={{
                      width: "100%",
                      background: "var(--black)",
                      border: "1px solid var(--border)",
                      color: "#fff",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.6rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--charcoal)",
                    marginBottom: "0.3rem",
                  }}>
                    TYPE
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        type: e.target.value as "CASH" | "ITEM",
                      }))
                    }
                    style={{
                      width: "100%",
                      background: "var(--black)",
                      border: "1px solid var(--border)",
                      color: "#fff",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.6rem",
                    }}
                  >
                    <option value="CASH">CASH</option>
                    <option value="ITEM">ITEM</option>
                  </select>
                </div>

                {form.type === "CASH" && (
                  <>
                    <div>
                      <label style={{
                        display: "block",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--charcoal)",
                        marginBottom: "0.3rem",
                      }}>
                        AMOUNT
                      </label>
                      <input
                        type="number"
                        value={form.amount}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        placeholder="0"
                        min="0"
                        style={{
                          width: "100%",
                          background: "var(--black)",
                          border: "1px solid var(--border)",
                          color: "#fff",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8rem",
                          padding: "0.4rem 0.6rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "block",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--charcoal)",
                        marginBottom: "0.3rem",
                      }}>
                        CURRENCY
                      </label>
                      <select
                        value={form.currency}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, currency: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          background: "var(--black)",
                          border: "1px solid var(--border)",
                          color: "#fff",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8rem",
                          padding: "0.4rem 0.6rem",
                        }}
                      >
                        <option value="NPR">NPR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--charcoal)",
                  marginBottom: "0.3rem",
                }}>
                  DESCRIPTION {form.type === "ITEM" ? "(REQUIRED)" : "(OPTIONAL)"}
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={
                    form.type === "ITEM"
                      ? "e.g. Gaming Mouse, Headset, Trophy..."
                      : "e.g. Cash prize + trophy"
                  }
                  style={{
                    width: "100%",
                    background: "var(--black)",
                    border: "1px solid var(--border)",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    padding: "0.4rem 0.6rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={savePrize}
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1.5rem",
                    background: "var(--gold)",
                    color: "var(--black)",
                    border: "none",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "SAVING..." : editingId ? "UPDATE PRIZE" : "ADD PRIZE"}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    padding: "0.5rem 1.5rem",
                    background: "transparent",
                    color: "var(--charcoal)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {activePrizes.length === 0 ? (
            <div style={{
              padding: "3rem 2rem",
              textAlign: "center",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--charcoal)",
            }}>
              No prizes configured yet. Click ADD PRIZE to start.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {activePrizes.map((prize) => (
                <div
                  key={prize.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "1rem 1.25rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "1.5rem",
                      fontWeight: "900",
                      color: prize.position <= 3 ? "var(--gold)" : "var(--charcoal)",
                      minWidth: "2rem",
                      textAlign: "center",
                    }}>
                      {prize.position <= 3
                        ? ["🥇", "🥈", "🥉"][prize.position - 1]
                        : `#${prize.position}`}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "var(--charcoal)",
                        letterSpacing: "0.1em",
                        marginBottom: "0.2rem",
                      }}>
                        {posLabel(prize.position)}
                      </div>
                      {prize.type === "CASH" && prize.amount && (
                        <div style={{
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "var(--gold)",
                        }}>
                          {prize.currency} {prize.amount.toLocaleString()}
                        </div>
                      )}
                      {prize.description && (
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "#fff",
                          marginTop: "0.15rem",
                        }}>
                          {prize.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: prize.type === "CASH" ? "var(--gold)" : "#f97316",
                      border: `1px solid ${prize.type === "CASH" ? "var(--gold)" : "#f97316"}`,
                      padding: "0.15rem 0.5rem",
                    }}>
                      {prize.type}
                    </span>
                    <button
                      onClick={() => startEdit(prize)}
                      style={{
                        padding: "0.3rem 0.75rem",
                        background: "transparent",
                        color: "var(--charcoal)",
                        border: "1px solid var(--border)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        cursor: "pointer",
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deletePrize(prize.id)}
                      disabled={deletingId === prize.id}
                      style={{
                        padding: "0.3rem 0.75rem",
                        background: "transparent",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        cursor: deletingId === prize.id ? "not-allowed" : "pointer",
                        opacity: deletingId === prize.id ? 0.6 : 1,
                      }}
                    >
                      {deletingId === prize.id ? "..." : "REMOVE"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}