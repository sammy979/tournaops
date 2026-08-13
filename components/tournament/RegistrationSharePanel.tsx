"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Link2, Copy, Check, Share2, Users, ExternalLink,
  QrCode, Sparkles, Clock
} from "lucide-react";

interface Props {
  tournamentId: string;
  tournamentSlug: string;
  tournamentName: string;
  status: string;
}

export default function RegistrationSharePanel({ tournamentId, tournamentSlug, tournamentName, status }: Props) {
  const [copied, setCopied] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalRegs, setTotalRegs] = useState(0);
  const [showQR, setShowQR] = useState(false);

  const registrationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/tournaments/${tournamentSlug}/register`
    : `/tournaments/${tournamentSlug}/register`;

  useEffect(() => {
    const fetchRegs = () => {
      fetch(`/api/tournaments/${tournamentId}/registrations`)
        .then(r => r.json())
        .then(d => {
          const regs = Array.isArray(d.registrations) ? d.registrations : [];
          setTotalRegs(regs.length);
          setPendingCount(regs.filter((r: any) => r.status === "pending").length);
        })
        .catch(() => {});
    };
    fetchRegs();
    const i = setInterval(fetchRegs, 10000);
    return () => clearInterval(i);
  }, [tournamentId]);

  const copy = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const text = `Register your team for ${tournamentName}!`;
    if (navigator.share) {
      navigator.share({ title: tournamentName, text, url: registrationUrl });
    } else {
      copy();
    }
  };

  if (status !== "registration" && status !== "draft") return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.04))",
      border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: "1rem",
      padding: "1.25rem",
      marginBottom: "1.5rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            borderRadius: "0.625rem",
            background: "linear-gradient(135deg, #D4AF37, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users style={{ width: "1.125rem", height: "1.125rem", color: "#fff" }} />
          </div>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginBottom: "0.125rem" }}>
              Team Registration
              {pendingCount > 0 && (
                <span style={{
                  marginLeft: "0.5rem",
                  display: "inline-flex", alignItems: "center", gap: "0.25rem",
                  padding: "0.15rem 0.5rem",
                  background: "#f59e0b", color: "#000",
                  borderRadius: "9999px",
                  fontSize: "0.65rem", fontWeight: 800,
                }}>
                  {pendingCount} PENDING
                </span>
              )}
            </h3>
            <p style={{ color: "#a5b4fc", fontSize: "0.75rem" }}>
              {totalRegs > 0 ? `${totalRegs} total registrations` : "Share this link to accept team registrations"}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/registrations"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            padding: "0.5rem 0.875rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem", fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Manage
          <ExternalLink style={{ width: "0.75rem", height: "0.75rem" }} />
        </Link>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.5rem",
        padding: "0.5rem 0.75rem",
        marginBottom: "0.75rem",
      }}>
        <Link2 style={{ width: "0.875rem", height: "0.875rem", color: "#818cf8", flexShrink: 0 }} />
        <code style={{
          flex: 1,
          color: "#a5b4fc",
          fontSize: "0.75rem",
          fontFamily: "monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {registrationUrl}
        </code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <button
          onClick={copy}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
            background: copied ? "#4ade80" : "#D4AF37",
            border: "none",
            color: copied ? "#000" : "#fff",
            padding: "0.625rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem", fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          {copied
            ? <><Check style={{ width: "0.875rem", height: "0.875rem" }} />Copied!</>
            : <><Copy style={{ width: "0.875rem", height: "0.875rem" }} />Copy Link</>
          }
        </button>
        <button
          onClick={share}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#a5b4fc",
            padding: "0.625rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem", fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Share2 style={{ width: "0.875rem", height: "0.875rem" }} />
          Share
        </button>
        <button
          onClick={() => setShowQR(!showQR)}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
            background: showQR ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showQR ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: showQR ? "#c084fc" : "#fff",
            padding: "0.625rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem", fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <QrCode style={{ width: "0.875rem", height: "0.875rem" }} />
          {showQR ? "Hide QR" : "Show QR"}
        </button>
      </div>

      {showQR && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "#fff",
          borderRadius: "0.75rem",
          display: "flex", justifyContent: "center",
        }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registrationUrl)}`}
            alt="Registration QR Code"
            width={200}
            height={200}
            style={{ borderRadius: "0.5rem" }}
          />
        </div>
      )}
    </div>
  );
}