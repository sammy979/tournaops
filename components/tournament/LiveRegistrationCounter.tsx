"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Zap, Clock, ArrowRight, CheckCircle,
  AlertCircle, TrendingUp, Sparkles
} from "lucide-react";

interface Props {
  slug: string;
  tournamentName: string;
  status: string;
  slotsInfo: {
    maxTeams: number;
    approvedTeams: number;
    pendingRegistrations: number;
    totalUsed: number;
    available: number;
    fillPercentage: number;
  };
  primaryColor?: string;
}

export default function LiveRegistrationCounter({
  slug,
  tournamentName,
  status,
  slotsInfo,
  primaryColor = "#f59e0b"
}: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (slotsInfo.pendingRegistrations > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 3000);
      return () => clearTimeout(t);
    }
  }, [slotsInfo.pendingRegistrations]);

  if (status !== "registration") return null;

  const isFilling = slotsInfo.fillPercentage >= 70;
  const isAlmostFull = slotsInfo.fillPercentage >= 90;
  const isFull = slotsInfo.available <= 0;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${primaryColor}10, transparent)`,
      border: `1px solid ${primaryColor}30`,
      borderRadius: "1.25rem",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Live pulse indicator */}
      {pulse && (
        <div style={{
          position: "absolute",
          top: "0.75rem", right: "0.75rem",
          display: "flex", alignItems: "center", gap: "0.375rem",
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.3)",
          padding: "0.25rem 0.625rem",
          borderRadius: "9999px",
          fontSize: "0.65rem", fontWeight: 800,
          color: "#f87171",
          animation: "pulse 2s infinite",
        }}>
          <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#f87171" }} />
          NEW REGISTRATION
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "2.75rem", height: "2.75rem",
            borderRadius: "0.75rem",
            background: `linear-gradient(135deg, ${primaryColor}30, ${primaryColor}10)`,
            border: `1px solid ${primaryColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users style={{ width: "1.25rem", height: "1.25rem", color: primaryColor }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff" }}>
              {isFull ? "Registration Full" : "Registration Open"}
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.125rem" }}>
              {isFull
                ? "All slots filled — waitlist may be available"
                : `${slotsInfo.available} slot${slotsInfo.available === 1 ? "" : "s"} remaining`
              }
            </p>
          </div>
        </div>

        {!isFull && (
          <Link
            href={`/tournaments/${slug}/register`}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: primaryColor, color: "#000",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 800, fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: `0 8px 25px ${primaryColor}40`,
            }}
          >
            <Zap style={{ width: "1rem", height: "1rem" }} />
            Register Team
          </Link>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
          <span style={{ color: "#9ca3af", fontWeight: 600 }}>
            {slotsInfo.totalUsed} / {slotsInfo.maxTeams} teams
          </span>
          <span style={{
            fontWeight: 800,
            color: isFull ? "#f87171" : isAlmostFull ? "#fbbf24" : isFilling ? primaryColor : "#4ade80",
          }}>
            {slotsInfo.fillPercentage}% Full
          </span>
        </div>
        <div style={{
          height: "0.625rem",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "9999px",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            width: `${slotsInfo.fillPercentage}%`,
            height: "100%",
            background: isFull
              ? "linear-gradient(to right, #f87171, #ef4444)"
              : isAlmostFull
              ? "linear-gradient(to right, #fbbf24, #f59e0b)"
              : `linear-gradient(to right, ${primaryColor}, ${primaryColor})`,
            borderRadius: "9999px",
            transition: "width 1s ease-out",
            boxShadow: `0 0 12px ${primaryColor}80`,
          }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <div style={{
          padding: "0.75rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "0.625rem",
          textAlign: "center",
        }}>
          <CheckCircle style={{ width: "1rem", height: "1rem", color: "#4ade80", margin: "0 auto 0.25rem" }} />
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
            {slotsInfo.approvedTeams}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "uppercase", fontWeight: 700 }}>
            Approved
          </div>
        </div>

        <div style={{
          padding: "0.75rem",
          background: pulse ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
          border: pulse ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.06)",
          borderRadius: "0.625rem",
          textAlign: "center",
          transition: "all 0.3s",
        }}>
          <Clock style={{ width: "1rem", height: "1rem", color: "#fbbf24", margin: "0 auto 0.25rem" }} />
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
            {slotsInfo.pendingRegistrations}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "uppercase", fontWeight: 700 }}>
            Pending
          </div>
        </div>

        <div style={{
          padding: "0.75rem",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "0.625rem",
          textAlign: "center",
        }}>
          <Users style={{ width: "1rem", height: "1rem", color: isFull ? "#f87171" : primaryColor, margin: "0 auto 0.25rem" }} />
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: isFull ? "#f87171" : "#fff", lineHeight: 1 }}>
            {slotsInfo.available}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "uppercase", fontWeight: 700 }}>
            Available
          </div>
        </div>
      </div>

      {/* Urgency Message */}
      {isAlmostFull && !isFull && (
        <div style={{
          marginTop: "1rem",
          padding: "0.625rem 0.875rem",
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "0.5rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
          fontSize: "0.75rem", color: "#fbbf24", fontWeight: 600,
        }}>
          <AlertCircle style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
          Almost full! Only {slotsInfo.available} spot{slotsInfo.available === 1 ? "" : "s"} left
        </div>
      )}

      {isFilling && !isAlmostFull && !isFull && (
        <div style={{
          marginTop: "1rem",
          padding: "0.625rem 0.875rem",
          background: `${primaryColor}15`,
          border: `1px solid ${primaryColor}30`,
          borderRadius: "0.5rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
          fontSize: "0.75rem", color: primaryColor, fontWeight: 600,
        }}>
          <TrendingUp style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
          Registration filling fast — {slotsInfo.available} slots remaining
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}