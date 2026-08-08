"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy, Zap, Shield, Users, BarChart3, Radio,
  ChevronRight, Star, Check, ArrowRight, Globe,
  Cpu, MessageSquare, Target, Crown, Flame,
  Play, Menu, X
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Discord", href: "https://discord.gg/tournaops", external: true },
];

const STATS = [
  { value: "10,000+", label: "Tournaments Run" },
  { value: "500K+", label: "Players Tracked" },
  { value: "50+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
];

const FEATURES = [
  {
    icon: Trophy,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    title: "Multi-Stage Tournaments",
    desc: "Run Qualifiers, Semi-Finals, and Grand Finals with automatic team progression and seeding.",
  },
  {
    icon: BarChart3,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    title: "Live Points Table",
    desc: "Real-time standings with PMGC, PMPL, and custom scoring systems. Auto-calculated after every match.",
  },
  {
    icon: Radio,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    title: "OBS Overlays",
    desc: "Professional broadcast overlays for OBS. Standings, match info, chicken dinner screens.",
  },
  {
    icon: MessageSquare,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    title: "Discord Integration",
    desc: "Bot reads slot lists directly from Discord. Import 16 teams in 2 seconds.",
  },
  {
    icon: Cpu,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    title: "AI Assistant",
    desc: "OpsAI analyzes your tournament, generates reports, MVP predictions, and social media captions.",
  },
  {
    icon: Shield,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    title: "Screenshot Import",
    desc: "Upload PUBG Mobile result screenshots. AI extracts placements and kills automatically.",
  },
  {
    icon: Users,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    title: "Team Registration",
    desc: "Public registration pages. Teams apply, you approve. Player profiles and IGN tracking.",
  },
  {
    icon: Globe,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    title: "Public Tournament Pages",
    desc: "Share a public link. Fans follow standings, results, and schedules in real-time.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create Tournament",
    desc: "Set name, format, scoring system, and max teams. Takes 60 seconds.",
    color: "#f59e0b",
  },
  {
    num: "02",
    title: "Add Teams",
    desc: "Import from Discord, CSV, or registration form. Bulk import 400 teams instantly.",
    color: "#3b82f6",
  },
  {
    num: "03",
    title: "Run Matches",
    desc: "Enter results manually or upload screenshots. AI parses everything automatically.",
    color: "#a855f7",
  },
  {
    num: "04",
    title: "Broadcast Live",
    desc: "Connect OBS overlays. Share public standings link. Generate AI reports.",
    color: "#10b981",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for small tournaments",
    features: [
      "3 tournaments",
      "32 teams max",
      "Basic scoring (PMGC, PMPL)",
      "OBS overlays",
      "Public tournament pages",
      "Discord integration",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    desc: "For serious organizers",
    badge: "Most Popular",
    features: [
      "Unlimited tournaments",
      "400 teams per tournament",
      "All scoring systems",
      "AI Tournament Assistant",
      "Screenshot import (AI)",
      "Multi-stage system",
      "Analytics dashboard",
      "Priority support",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
];

const TESTIMONIALS = [
  {
    name: "ProESports Nepal",
    handle: "@proesportsnepal",
    text: "We ran a 128-team PUBG Mobile tournament with TournaOps. The Discord bot saved us 3 hours of manual work. The OBS overlays looked insane.",
    rating: 5,
  },
  {
    name: "GG Organizers",
    handle: "@ggorganizers",
    text: "Switched from Google Sheets to TournaOps. Never going back. The AI screenshot import alone is worth it.",
    rating: 5,
  },
  {
    name: "FragMasters",
    handle: "@fragmasters",
    text: "The public tournament page kept our community updated in real-time. Our Discord was buzzing during every match.",
    rating: 5,
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(10,10,15,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              <div style={{
                width: "2rem", height: "2rem",
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                borderRadius: "0.5rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Trophy style={{ width: "1rem", height: "1rem", color: "#000" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "#fff" }}>TournaOps</span>
            </Link>

            {/* Desktop Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="hidden md:flex">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  style={{
                    color: "#9ca3af",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link
                href="/login"
                style={{
                  color: "#9ca3af",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  display: "none",
                }}
                className="hidden md:block"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                style={{
                  background: "#f59e0b",
                  color: "#000",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
              >
                Get Started Free
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
                className="md:hidden"
              >
                {mobileOpen ? <X style={{ width: "1.25rem", height: "1.25rem" }} /> : <Menu style={{ width: "1.25rem", height: "1.25rem" }} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div style={{
              background: "rgba(13,13,20,0.98)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "1rem",
            }}>
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.75rem 0",
                    color: "#9ca3af",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href="/login" style={{ flex: 1, textAlign: "center", padding: "0.625rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
                  Sign In
                </Link>
                <Link href="/register" style={{ flex: 1, textAlign: "center", padding: "0.625rem", borderRadius: "0.75rem", background: "#f59e0b", color: "#000", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "5rem",
      }}>
        {/* Background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.12), transparent)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 1.5rem", width: "100%", position: "relative" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "9999px",
              padding: "0.375rem 1rem",
              marginBottom: "1.5rem",
            }}>
              <Flame style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b" }}>
                The #1 Free PUBG Mobile Tournament Platform
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}>
              Run{" "}
              <span style={{
                background: "linear-gradient(to right, #f59e0b, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Pro-Level
              </span>
              {" "}PUBG Mobile Tournaments
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "#9ca3af",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
            }}>
              From qualifiers to grand finals. Real-time standings, OBS overlays,
              Discord bot, AI assistant, and screenshot import. Free forever.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
              <Link
                href="/register"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "#f59e0b",
                  color: "#000",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.875rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 8px 30px rgba(245,158,11,0.3)",
                  transition: "all 0.2s",
                }}
              >
                Start Free — No Credit Card
                <ArrowRight style={{ width: "1.125rem", height: "1.125rem" }} />
              </Link>
              <a
                href="#features"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.875rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s",
                }}
              >
                <Play style={{ width: "1rem", height: "1rem" }} />
                See How It Works
              </a>
            </div>

            {/* Trust */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", color: "#6b7280", fontSize: "0.8rem" }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b", fill: "#f59e0b" }} />
              ))}
              <span style={{ marginLeft: "0.375rem" }}>Trusted by 1,000+ organizers worldwide</span>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{
            marginTop: "4rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.5rem",
            overflow: "hidden",
            maxWidth: "900px",
            margin: "4rem auto 0",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "0.875rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>TournaOps — Live Dashboard</span>
            </div>
            <div style={{ padding: "2rem" }}>
              {/* Mock standings table */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>PMGC Nepal Qualifier — Match 4/6</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>16 Teams • Erangel, Rondo • Live</div>
                </div>
                <div style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "9999px", padding: "0.25rem 0.875rem", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#4ade80" }} />
                  LIVE
                </div>
              </div>
              {[
                { rank: 1, team: "Team Alpha", tag: "ALPH", pts: 87, kills: 34, wwcd: 2 },
                { rank: 2, team: "Dragon Force", tag: "DRAG", pts: 74, kills: 28, wwcd: 1 },
                { rank: 3, team: "Nova Esports", tag: "NOVA", pts: 68, kills: 31, wwcd: 1 },
                { rank: 4, team: "Steel Wolves", tag: "SWLF", pts: 61, kills: 22, wwcd: 0 },
                { rank: 5, team: "Phoenix Rising", tag: "PHNX", pts: 55, kills: 19, wwcd: 0 },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  marginBottom: "0.375rem",
                  background: i === 0 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                  border: i === 0 ? "1px solid rgba(245,158,11,0.15)" : "1px solid transparent",
                }}>
                  <div style={{ width: "2rem", textAlign: "center", fontWeight: 700, color: i === 0 ? "#f59e0b" : i === 1 ? "#d1d5db" : i === 2 ? "#b45309" : "#6b7280" }}>
                    #{row.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#fff" }}>{row.team}</div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>[{row.tag}]</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "3rem" }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>{row.pts}</div>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>PTS</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "3rem" }}>
                    <div style={{ fontWeight: 600, color: "#f87171", fontSize: "0.875rem" }}>{row.kills}</div>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>KILLS</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "3rem" }}>
                    <div style={{ fontWeight: 600, color: "#facc15", fontSize: "0.875rem" }}>{row.wwcd}</div>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>WWCD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section style={{ padding: "4rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "2rem", textAlign: "center" }}>
            {STATS.map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, background: "linear-gradient(to right, #f59e0b, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {stat.value}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              Everything You Need
            </div>
            <h2 style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Built for PUBG Mobile Organizers
            </h2>
            <p style={{ color: "#6b7280", marginTop: "1rem", fontSize: "1.125rem", maxWidth: "500px", margin: "1rem auto 0" }}>
              Every feature you need to run professional tournaments — for free.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.25rem",
                    padding: "1.5rem",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <div style={{
                    width: "2.5rem", height: "2.5rem",
                    borderRadius: "0.75rem",
                    background: f.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1rem",
                  }}>
                    <Icon style={{ width: "1.25rem", height: "1.25rem", color: f.color }} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#fff", marginBottom: "0.5rem", fontSize: "1rem" }}>{f.title}</h3>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "6rem 1.5rem", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              Simple Process
            </div>
            <h2 style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Tournament Running in Minutes
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ position: "relative" }}>
                <div style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: step.color,
                  opacity: 0.2,
                  lineHeight: 1,
                  marginBottom: "0.75rem",
                  fontFamily: "monospace",
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontWeight: 700, color: "#fff", fontSize: "1.125rem", marginBottom: "0.5rem" }}>{step.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6 }}>{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "-1rem",
                    color: "rgba(255,255,255,0.1)",
                    fontSize: "1.5rem",
                    display: "none",
                  }} className="hidden lg:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)", fontWeight: 800, color: "#fff" }}>
              Loved by Organizers
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1.25rem",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} style={{ width: "1rem", height: "1rem", color: "#f59e0b", fill: "#f59e0b" }} />
                  ))}
                </div>
                <p style={{ color: "#d1d5db", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                  "{t.text}"
                </p>
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.875rem" }}>{t.name}</div>
                  <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>{t.handle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "6rem 1.5rem", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              Simple Pricing
            </div>
            <h2 style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)", fontWeight: 800, color: "#fff" }}>
              Free Forever. Upgrade When Ready.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: "800px", margin: "0 auto" }}>
            {PRICING.map(plan => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlighted ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.03)",
                  border: plan.highlighted ? "2px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1.5rem",
                  padding: "2rem",
                  position: "relative",
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: "absolute",
                    top: "-0.875rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#f59e0b",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    padding: "0.25rem 0.875rem",
                    borderRadius: "9999px",
                    whiteSpace: "nowrap",
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "1.125rem", marginBottom: "0.25rem" }}>{plan.name}</div>
                  <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>{plan.desc}</div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <span style={{ fontSize: "3rem", fontWeight: 800, color: "#fff" }}>{plan.price}</span>
                  <span style={{ color: "#6b7280", fontSize: "0.875rem", marginLeft: "0.375rem" }}>/{plan.period}</span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", color: "#d1d5db" }}>
                      <Check style={{ width: "1rem", height: "1rem", color: plan.highlighted ? "#f59e0b" : "#6b7280", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "0.875rem",
                    borderRadius: "0.875rem",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    background: plan.highlighted ? "#f59e0b" : "rgba(255,255,255,0.08)",
                    color: plan.highlighted ? "#000" : "#fff",
                    transition: "all 0.2s",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "2rem",
            padding: "4rem 2rem",
          }}>
            <Crown style={{ width: "3rem", height: "3rem", color: "#f59e0b", margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>
              Ready to Run Your Tournament?
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "1.125rem", marginBottom: "2rem" }}>
              Join 1,000+ organizers. Free forever. No credit card required.
            </p>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#f59e0b",
                color: "#000",
                padding: "1rem 2.5rem",
                borderRadius: "1rem",
                fontWeight: 700,
                fontSize: "1.125rem",
                textDecoration: "none",
                boxShadow: "0 8px 30px rgba(245,158,11,0.4)",
              }}
            >
              Create Free Account
              <ArrowRight style={{ width: "1.25rem", height: "1.25rem" }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "3rem 1.5rem",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between", marginBottom: "3rem" }}>
            <div style={{ maxWidth: "280px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{
                  width: "1.75rem", height: "1.75rem",
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  borderRadius: "0.375rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Trophy style={{ width: "0.875rem", height: "0.875rem", color: "#000" }} />
                </div>
                <span style={{ fontWeight: 800, color: "#fff" }}>TournaOps</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6 }}>
                The free PUBG Mobile tournament platform built for organizers who care about quality.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Resources", links: ["Documentation", "Discord", "Twitter", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 600, color: "#fff", marginBottom: "1rem", fontSize: "0.875rem" }}>{col.title}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              2024 TournaOps. Built with love for the PUBG Mobile community.
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              Made in Nepal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}