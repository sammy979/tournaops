// app/admin/page.tsx
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Shield, Users, Trophy, Activity, Database, Zap, Crown,
  DollarSign, CheckCircle, Clock, AlertCircle, TrendingUp,
  Settings, BarChart3, ArrowRight, Loader2,
} from "lucide-react"

interface Stats {
  totalUsers: number
  totalTournaments: number
  totalTeams: number
  totalMatches: number
  proUsers: number
  liveTournaments: number
  pendingPayments: number
  approvedPayments: number
  totalPayments: number
  totalRevenue: number
}

interface RecentUser {
  id: string
  email: string
  displayName: string
  isPro: boolean
  role: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats || null)
        setRecentUsers(d.recentUsers || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const primaryCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, color: "#60a5fa", link: "/admin/users" },
    { icon: Trophy, label: "Tournaments", value: stats?.totalTournaments ?? 0, color: "#f59e0b" },
    { icon: Activity, label: "Live Now", value: stats?.liveTournaments ?? 0, color: "#4ade80" },
    { icon: Database, label: "Total Teams", value: stats?.totalTeams ?? 0, color: "#c084fc" },
    { icon: Zap, label: "Total Matches", value: stats?.totalMatches ?? 0, color: "#ec4899" },
    { icon: Crown, label: "Pro Users", value: stats?.proUsers ?? 0, color: "#facc15" },
  ]

  const paymentCards = [
    { icon: Clock, label: "Pending Payments", value: stats?.pendingPayments ?? 0, color: "#fb923c", link: "/admin/payments", highlight: (stats?.pendingPayments ?? 0) > 0 },
    { icon: CheckCircle, label: "Approved Payments", value: stats?.approvedPayments ?? 0, color: "#4ade80", link: "/admin/payments" },
    { icon: DollarSign, label: "Total Revenue", value: `Rs ${(stats?.totalRevenue ?? 0).toLocaleString()}`, color: "#10b981", isText: true },
  ]

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.25)", borderRadius: "9999px", padding: "0.3rem 0.875rem",
          fontSize: "0.7rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.875rem" }}>
          <Shield style={{ width: "0.875rem", height: "0.875rem" }} />
          SYSTEM ADMIN
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />
          Platform Administration
        </h1>
        <p style={{ color: "#9ca3af", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          Complete system overview and management
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {primaryCards.map((card) => {
          const Icon = card.icon
          const inner = (
            <div style={{
              background: "rgba(30,30,40,0.6)", borderRadius: "0.875rem", padding: "1.25rem",
              border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden",
              cursor: card.link ? "pointer" : "default", transition: "all 0.15s",
            }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: "6rem", height: "6rem",
                background: `radial-gradient(circle, ${card.color}22, transparent 70%)`,
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem",
                  background: `${card.color}22`, border: `1px solid ${card.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem",
                }}>
                  <Icon style={{ width: "1.125rem", height: "1.125rem", color: card.color }} />
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.5rem" }}>
                  {card.label}
                </div>
              </div>
            </div>
          )
          return card.link ? <Link key={card.label} href={card.link} style={{ textDecoration: "none" }}>{inner}</Link> : <div key={card.label}>{inner}</div>
        })}
      </div>

      {/* Payment Stats */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
          💰 Payments & Revenue
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {paymentCards.map((card) => {
            const Icon = card.icon
            const inner = (
              <div style={{
                background: card.highlight ? "rgba(251,146,60,0.08)" : "rgba(30,30,40,0.6)",
                borderRadius: "0.875rem", padding: "1.25rem",
                border: `1px solid ${card.highlight ? "rgba(251,146,60,0.3)" : "rgba(255,255,255,0.05)"}`,
                display: "flex", alignItems: "center", gap: "1rem",
                cursor: card.link ? "pointer" : "default",
              }}>
                <div style={{
                  width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem",
                  background: `${card.color}22`, border: `1px solid ${card.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon style={{ width: "1.25rem", height: "1.25rem", color: card.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: card.isText ? "1.25rem" : "1.5rem", fontWeight: 700, color: card.color, lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, marginTop: "0.375rem" }}>
                    {card.label}
                  </div>
                </div>
                {card.link && <ArrowRight style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />}
              </div>
            )
            return card.link ? <Link key={card.label} href={card.link} style={{ textDecoration: "none" }}>{inner}</Link> : <div key={card.label}>{inner}</div>
          })}
        </div>
      </div>

      {/* Admin Access & Quick Links */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,146,60,0.03))",
        borderRadius: "1rem", padding: "1.5rem",
        border: "1px solid rgba(245,158,11,0.2)", marginBottom: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <AlertCircle style={{ width: "1.125rem", height: "1.125rem", color: "#f59e0b" }} />
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f59e0b", margin: 0 }}>Admin Access</h3>
        </div>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginTop: 0, marginBottom: "1rem" }}>
          You have elevated system privileges. Use responsibly. All admin actions are logged for audit purposes.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { icon: Trophy, label: "All Tournaments", href: "/dashboard/tournaments" },
            { icon: Users, label: "Manage Users", href: "/admin/users" },
            { icon: DollarSign, label: "Payment Center", href: "/admin/payments" },
            { icon: Settings, label: "Payment Settings", href: "/admin/settings/payments" },
            { icon: Activity, label: "System Health", href: "/admin/system-health" },
            { icon: AlertCircle, label: "Error Logs", href: "/admin/system-health/errors" },
            { icon: BarChart3, label: "System Analytics", href: "/admin" },
          ].map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.label} href={link.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.625rem", padding: "0.75rem 0.875rem",
                  display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <Icon style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e5e7eb", flex: 1 }}>{link.label}</span>
                  <ArrowRight style={{ width: "0.875rem", height: "0.875rem", color: "#6b7280" }} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Users */}
      {recentUsers.length > 0 && (
        <div style={{ background: "rgba(30,30,40,0.6)", borderRadius: "1rem", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp style={{ width: "1rem", height: "1rem", color: "#60a5fa" }} />
              Recent Signups
            </h3>
            <Link href="/admin/users" style={{ fontSize: "0.75rem", color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {recentUsers.map((u) => (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.625rem 0.75rem", background: "rgba(0,0,0,0.2)",
                borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.03)",
              }}>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {(u.displayName || u.email)[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.displayName || u.email}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                  {u.isPro && (
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "0.125rem 0.5rem", borderRadius: "0.25rem" }}>PRO</span>
                  )}
                  {u.role === "SUPER_ADMIN" && (
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#a78bfa", background: "rgba(167,139,250,0.1)", padding: "0.125rem 0.5rem", borderRadius: "0.25rem" }}>ADMIN</span>
                  )}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#6b7280", flexShrink: 0 }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}