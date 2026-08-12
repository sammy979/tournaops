"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/ui/AdminShell";
import { useDialog } from "@/lib/use-confirm";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  isAdmin: boolean;
  isPro: boolean;
  role: "USER" | "ORGANIZER" | "SUPER_ADMIN";
  createdAt: string;
  _count?: { tournaments: number };
}

export default function AdminUsersPage() {
  const dialog = useDialog();
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateUser(id: string, updates: Partial<AdminUser>) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        await dialog.alert({
          title: "Update Failed",
          description: data.error || "Could not update user.",
          variant: "danger",
        });
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    } finally {
      setUpdating(null);
    }
  }

  async function deleteUser(id: string, email: string) {
    const ok = await dialog.confirm({
      title: "Delete User?",
      description: `Permanently delete ${email}? This cannot be undone. All their tournaments will also be deleted.`,
      confirmLabel: "Delete User",
      variant: "danger",
    });
    if (!ok) return;

    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        await dialog.alert({
          title: "Delete Failed",
          description: data.error || "Could not delete user.",
          variant: "danger",
        });
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.displayName || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total:      users.length,
    pro:        users.filter((u) => u.isPro).length,
    admin:      users.filter((u) => u.isAdmin || u.role === "SUPER_ADMIN").length,
    organizer:  users.filter((u) => u.role === "ORGANIZER").length,
  };

  return (
    <AdminShell>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="section-label">Admin</div>
            <h1 className="text-display" style={{ marginBottom: "6px" }}>User Management</h1>
            <p style={{ color: "var(--white-40)", fontSize: "0.85rem" }}>
              Grant Pro, promote to organizer or admin, or delete accounts.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                style={{
                  width: "240px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "8px 12px",
                  color: "var(--white)",
                  fontSize: "0.85rem",
                  outline: "none",
                  fontFamily: "Barlow, sans-serif",
                }}
              />
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="btn-gold"
              style={{ fontSize: "0.72rem", padding: "8px 16px", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}>
          <Counter label="Total Users" value={stats.total}     color="var(--white)" />
          <Counter label="Pro"         value={stats.pro}       color="var(--gold)"  />
          <Counter label="Organizers"  value={stats.organizer} color="var(--blue)"  />
          <Counter label="Admins"      value={stats.admin}     color="var(--red)"   />
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            padding: "12px 16px",
            background: "var(--red-dim)",
            border: "1px solid var(--red)",
            color: "var(--red)",
            marginBottom: "16px",
          }}>{error}</div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--white-40)", fontSize: "0.85rem" }}>
            Loading users...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--white-40)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>No Users Found</div>
            <p style={{ fontSize: "0.82rem" }}>
              {search ? `No users match "${search}"` : "No users in the database yet."}
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflowX: "auto" }}>
            <div style={{ minWidth: "900px" }}>

              {/* HEADER ROW */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 90px 90px 90px 100px",
                gap: "12px",
                padding: "10px 16px",
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.7rem",
                color: "var(--white-40)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                <div>User</div>
                <div>Role</div>
                <div style={{ textAlign: "center" }}>Pro</div>
                <div style={{ textAlign: "center" }}>Admin</div>
                <div style={{ textAlign: "center" }}>Tourn.</div>
                <div style={{ textAlign: "center" }}>Actions</div>
              </div>

              {/* DATA ROWS */}
              {filtered.map((u, i) => (
                <div key={u.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 90px 90px 90px 100px",
                  gap: "12px",
                  padding: "12px 16px",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                  opacity: updating === u.id ? 0.5 : 1,
                }}>
                  {/* USER */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      background: "var(--gold-dim)",
                      border: "1px solid var(--gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "var(--gold)",
                      fontSize: "0.85rem",
                      fontFamily: "Barlow Condensed, sans-serif",
                      flexShrink: 0,
                    }}>
                      {(u.displayName || u.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--white)",
                        fontFamily: "Barlow Condensed, sans-serif",
                        letterSpacing: "0.02em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {u.displayName || u.username}
                      </div>
                      <div style={{
                        fontSize: "0.72rem",
                        color: "var(--white-40)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "JetBrains Mono, monospace",
                      }}>{u.email}</div>
                    </div>
                  </div>

                  {/* ROLE */}
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value as any })}
                    disabled={updating === u.id}
                    style={{
                      background: "var(--black)",
                      border: "1px solid var(--border)",
                      padding: "6px 8px",
                      color: "var(--white)",
                      fontSize: "0.75rem",
                      fontFamily: "Barlow, sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    <option value="USER">User</option>
                    <option value="ORGANIZER">Organizer</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>

                  {/* PRO TOGGLE */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => updateUser(u.id, { isPro: !u.isPro })}
                      disabled={updating === u.id}
                      title={u.isPro ? "Revoke Pro" : "Grant Pro"}
                      style={{
                        padding: "4px 12px",
                        background: u.isPro ? "var(--gold)" : "transparent",
                        color: u.isPro ? "var(--black)" : "var(--white-40)",
                        border: `1px solid ${u.isPro ? "var(--gold)" : "var(--border-2)"}`,
                        cursor: "pointer",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >{u.isPro ? "Pro" : "Free"}</button>
                  </div>

                  {/* ADMIN TOGGLE */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => updateUser(u.id, { isAdmin: !u.isAdmin })}
                      disabled={updating === u.id}
                      title={u.isAdmin ? "Revoke Admin" : "Grant Admin"}
                      style={{
                        padding: "4px 12px",
                        background: u.isAdmin ? "var(--red)" : "transparent",
                        color: u.isAdmin ? "var(--white)" : "var(--white-40)",
                        border: `1px solid ${u.isAdmin ? "var(--red)" : "var(--border-2)"}`,
                        cursor: "pointer",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >{u.isAdmin ? "Admin" : "No"}</button>
                  </div>

                  {/* TOURNAMENT COUNT */}
                  <div style={{
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "var(--white-70)",
                    fontWeight: 700,
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    {u._count?.tournaments ?? 0}
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                    <button
                      onClick={() => deleteUser(u.id, u.email)}
                      disabled={updating === u.id}
                      title="Delete user"
                      className="btn-danger"
                      style={{ fontSize: "0.7rem", padding: "5px 12px" }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderTop: `3px solid ${color}`,
      padding: "14px 16px",
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>{label}</div>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 900,
        fontSize: "1.8rem",
        color,
        lineHeight: 1,
      }}>{value.toLocaleString()}</div>
    </div>
  );
}