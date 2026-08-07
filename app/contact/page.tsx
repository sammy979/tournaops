"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy, Mail, MessageSquare, Send, Check, Twitter,
  Globe, ArrowLeft, Loader2, Sparkles
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSent(true);
      setSending(false);
    }, 1200);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      desc: "For account and billing issues",
      value: "support@tournaops.com",
      href: "mailto:support@tournaops.com",
      color: "#60a5fa",
      bg: "rgba(59,130,246,0.1)",
      border: "rgba(59,130,246,0.25)",
    },
    {
      icon: MessageSquare,
      title: "Discord Community",
      desc: "Join tournament organizers",
      value: "discord.gg/tournaops",
      href: "https://discord.gg/tournaops",
      color: "#a78bfa",
      bg: "rgba(139,92,246,0.1)",
      border: "rgba(139,92,246,0.25)",
    },
    {
      icon: Twitter,
      title: "Twitter / X",
      desc: "Updates and announcements",
      value: "@tournaops",
      href: "https://twitter.com/tournaops",
      color: "#22d3ee",
      bg: "rgba(6,182,212,0.1)",
      border: "rgba(6,182,212,0.25)",
    },
    {
      icon: Globe,
      title: "Live Platform",
      desc: "Try it free right now",
      value: "tournaops.com",
      href: "/register",
      color: "#4ade80",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.25)",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "1rem 1.5rem",
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: "2rem", height: "2rem",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              borderRadius: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Trophy style={{ width: "1rem", height: "1rem", color: "#000" }} />
            </div>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>TournaOps</span>
          </Link>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            color: "#9ca3af", fontSize: "0.8rem", fontWeight: 500,
            textDecoration: "none",
          }}>
            <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
            Home
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            background: "rgba(245,158,11,0.1)",
            color: "#f59e0b",
            padding: "0.3rem 0.875rem",
            borderRadius: "9999px",
            fontSize: "0.7rem", fontWeight: 700,
            marginBottom: "1rem",
            border: "1px solid rgba(245,158,11,0.25)",
          }}>
            <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
            WE'D LOVE TO HEAR FROM YOU
          </span>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800, color: "#fff",
            marginBottom: "1rem",
            letterSpacing: "-0.02em",
          }}>
            Get in Touch
          </h1>
          <p style={{
            color: "#9ca3af",
            fontSize: "1.125rem",
            maxWidth: "600px",
            margin: "0 auto",
          }}>
            Have a question, feature request, or need help with your tournament? We respond within 24 hours.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 340px) 1fr",
          gap: "1.5rem",
        }} className="contact-grid">

          {/* Contact Methods */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {contactMethods.map(c => {
              const Icon = c.icon;
              return (
                <a
                  key={c.title}
                  href={c.href}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "0.875rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.875rem",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = c.border;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  <div style={{
                    width: "2.25rem", height: "2.25rem",
                    borderRadius: "0.625rem",
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: "1rem", height: "1rem", color: c.color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.125rem" }}>
                      {c.title}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.7rem", marginBottom: "0.25rem" }}>
                      {c.desc}
                    </div>
                    <div style={{ color: c.color, fontSize: "0.75rem", fontWeight: 600 }}>
                      {c.value}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Contact Form */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.25rem",
            padding: "2rem",
          }}>
            {sent ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
                <div style={{
                  width: "4rem", height: "4rem",
                  borderRadius: "1rem",
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1rem",
                }}>
                  <Check style={{ width: "2rem", height: "2rem", color: "#4ade80" }} />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
                  Message Sent!
                </h3>
                <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>
                  We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.625rem 1.5rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.85rem", fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="contact-form-row">
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#d1d5db", marginBottom: "0.375rem" }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Doe"
                      required
                      style={{
                        width: "100%",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "0.625rem",
                        padding: "0.625rem 0.875rem",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#d1d5db", marginBottom: "0.375rem" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      required
                      style={{
                        width: "100%",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "0.625rem",
                        padding: "0.625rem 0.875rem",
                        color: "#fff",
                        fontSize: "0.85rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#d1d5db", marginBottom: "0.375rem" }}>
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.625rem",
                      padding: "0.625rem 0.875rem",
                      color: "#fff",
                      fontSize: "0.85rem",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="" style={{ background: "#111116" }}>Select a topic...</option>
                    <option value="support" style={{ background: "#111116" }}>Technical Support</option>
                    <option value="billing" style={{ background: "#111116" }}>Billing and Subscription</option>
                    <option value="feature" style={{ background: "#111116" }}>Feature Request</option>
                    <option value="bug" style={{ background: "#111116" }}>Report a Bug</option>
                    <option value="partnership" style={{ background: "#111116" }}>Partnership</option>
                    <option value="other" style={{ background: "#111116" }}>Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#d1d5db", marginBottom: "0.375rem" }}>
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what you need help with..."
                    rows={6}
                    required
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.625rem",
                      padding: "0.625rem 0.875rem",
                      color: "#fff",
                      fontSize: "0.85rem",
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    background: sending ? "rgba(245,158,11,0.5)" : "#f59e0b",
                    color: "#000",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontSize: "0.9rem", fontWeight: 700,
                    cursor: sending ? "not-allowed" : "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    boxShadow: "0 8px 25px rgba(245,158,11,0.3)",
                  }}
                >
                  {sending
                    ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Sending...</>
                    : <><Send style={{ width: "1rem", height: "1rem" }} />Send Message</>
                  }
                </button>

                <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.7rem" }}>
                  We typically respond within 24 hours on business days.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "2rem 1.5rem",
        marginTop: "3rem",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
        }}>
          <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>© 2025 TournaOps. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem" }}>
            <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "#6b7280", textDecoration: "none" }}>Terms</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .contact-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}