"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDialog } from "@/lib/use-confirm";
import {
  ArrowLeft, Users, Crown, Shield, Loader2, Search,
  Trash2, Check, X, User as UserIcon
} from "lucide-react";

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
  _count: { tournaments: number };
}

export default function AdminUsersPage() {
  const dialog = useDialog();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
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
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    } finally {
      setUpdating(null);
    }
  }

  async function deleteUser(id: string, email: string) {
    const ok = await dialog.confirm({
      title: "Delete User?",
      description: `Permanently delete ${email}? This cannot be undone. All their tournaments will be deleted.`,
      confirmLabel: "Delete User",
      variant: "danger",
    });
    if (!ok) return;

    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
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

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) ||
           u.username.toLowerCase().includes(q) ||
           (u.displayName || "").toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Admin
      </Link>

      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <Users style={{ width: "1.5rem", height: "1.5rem", color: "#f59e0b" }} />
            User Management
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {users.length} total users
          </p>
        </div>
        <div style={{ position: "relative", flex: 1, maxWidth: "320px", minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "0.875rem", height: "0.875rem", color: "#6b7280" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.5rem",
              padding: "0.5rem 0.75rem 0.5rem 2rem",
              color: "#fff",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflowX: "auto" }}>
        <div style={{ minWidth: "800px" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 100px 80px 120px", gap: "0.75rem", padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <div>User</div>
            <div>Role</div>
            <div style={{ textAlign: "center" }}>Pro</div>
            <div style={{ textAlign: "center" }}>Admin</div>
            <div style={{ textAlign: "center" }}>Tourn.</div>
            <div style={{ textAlign: "center" }}>Actions</div>
          </div>

          {/* Rows */}
          {filtered.map(u => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 100px 80px 120px", gap: "0.75rem", padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", opacity: updating === u.id ? 0.5 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "0.75rem", flexShrink: 0 }}>
                  {(u.displayName || u.username || "U").charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.displayName || u.username}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email}
                  </div>
                </div>
              </div>

              <select
                value={u.role}
                onChange={e => updateUser(u.id, { role: e.target.value as any })}
                disabled={updating === u.id}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.375rem 0.5rem", color: "#fff", fontSize: "0.75rem", cursor: "pointer" }}
              >
                <option value="USER">User</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>

              <button
                onClick={() => updateUser(u.id, { isPro: !u.isPro })}
                disabled={updating === u.id}
                title={u.isPro ? "Revoke Pro" : "Grant Pro"}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", background: u.isPro ? "rgba(245,158,11,0.15)" : "rgba(107,114,128,0.08)", border: "1px solid " + (u.isPro ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"), borderRadius: "0.375rem", padding: "0.375rem", color: u.isPro ? "#f59e0b" : "#6b7280", cursor: "pointer" }}
              >
                <Crown style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>

              <button
                onClick={() => updateUser(u.id, { isAdmin: !u.isAdmin })}
                disabled={updating === u.id}
                title={u.isAdmin ? "Revoke Admin" : "Grant Admin"}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", background: u.isAdmin ? "rgba(239,68,68,0.15)" : "rgba(107,114,128,0.08)", border: "1px solid " + (u.isAdmin ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"), borderRadius: "0.375rem", padding: "0.375rem", color: u.isAdmin ? "#f87171" : "#6b7280", cursor: "pointer" }}
              >
                <Shield style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>

              <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 }}>
                {u._count?.tournaments || 0}
              </div>

              <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center" }}>
                <button
                  onClick={() => deleteUser(u.id, u.email)}
                  disabled={updating === u.id}
                  title="Delete user"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", padding: "0.375rem 0.5rem", color: "#f87171", cursor: "pointer" }}
                >
                  <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#6b7280" }}>
              <UserIcon style={{ width: "2rem", height: "2rem", margin: "0 auto 0.5rem", opacity: 0.3 }} />
              <div>No users found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}