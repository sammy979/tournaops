"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  if (loading) {
    return (
      <div style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "48px",
        textAlign: "center",
        fontFamily: "Barlow Condensed, sans-serif",
        fontSize: "0.85rem",
        color: "var(--white-40)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>Loading notifications...</div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.78rem",
          color: "var(--white-40)",
        }}>
          {notifications.length} TOTAL · {unreadCount} UNREAD
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary"
            style={{ padding: "6px 14px" }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "48px",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--white-40)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "8px",
          }}>No Notifications</div>
          <p style={{ color: "var(--white-40)", fontSize: "0.82rem" }}>
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <div style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          {notifications.map((n: any, i: number) => (
            <div key={n.id || i} style={{
              padding: "14px 20px",
              borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
              borderLeft: n.read ? "3px solid transparent" : "3px solid var(--gold)",
              background: n.read ? "transparent" : "var(--gold-dim)",
            }}>
              <div style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.88rem",
                color: "var(--white)",
                marginBottom: "4px",
              }}>{n.title || n.message || "Notification"}</div>
              {n.description && (
                <div style={{ fontSize: "0.78rem", color: "var(--white-40)" }}>
                  {n.description}
                </div>
              )}
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.7rem",
                color: "var(--white-40)",
                marginTop: "4px",
              }}>
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}