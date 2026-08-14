"use client";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifs(d.notifications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAll = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  };

  const typeColor = (t: string) => {
    if (t === "success") return "#22c55e";
    if (t === "error" || t === "warning") return "#ef4444";
    if (t === "info") return "#60a5fa";
    return "#D4AF37";
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>NOTIFICATIONS</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#9ca3af", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", minHeight: "44px" }}>
            Mark All Read
          </button>
        )}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>Loading...</div>
        ) : notifs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔔</div>
            <div style={{ color: "#6b7280" }}>No notifications yet</div>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{ padding: "1rem 1.25rem", borderBottom: i < notifs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", gap: "1rem", alignItems: "flex-start", background: n.read ? "transparent" : "rgba(212,175,55,0.03)", cursor: n.read ? "default" : "pointer", transition: "background 0.15s" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.read ? "transparent" : typeColor(n.type), marginTop: "0.4rem", flexShrink: 0, border: n.read ? "1px solid rgba(255,255,255,0.1)" : "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: n.read ? 500 : 700, color: n.read ? "#9ca3af" : "#fff", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{n.title}</div>
                <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>{n.message}</div>
                <div style={{ color: "#4b5563", fontSize: "0.7rem", marginTop: "0.25rem" }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}