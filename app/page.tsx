import { getServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default async function HomePage() {
  const user = await getServerUser();

  const recentTournaments = await prisma.tournament.findMany({
    where: { status: "published", isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, name: true, game: true, status: true, slug: true,
      maxTeams: true, createdAt: true, startDate: true, prizePool: true,
      teams: { select: { id: true } },
    },
  });

  const totalTournaments = await prisma.tournament.count();
  const totalUsers = await prisma.user.count();
  const totalTeams = await prisma.team.count();

  return (
    <main style={{ background: "#0a0a0a", color: "#fff", overflow: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.6); } 50% { box-shadow: 0 0 40px 8px rgba(212,175,55,0.2); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes tick { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bg-move { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
        @keyframes crosshair-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes helicopter { 0% { transform: translateX(-200px) translateY(0); } 50% { transform: translateX(45vw) translateY(-15px); } 100% { transform: translateX(calc(100vw + 200px)) translateY(0); } }
        @keyframes rotor { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes parachute { 0% { transform: translateY(-100px) rotate(-5deg); } 100% { transform: translateY(calc(100vh + 100px)) rotate(5deg); } }
        @keyframes cloud-drift { 0% { transform: translateX(-200px); } 100% { transform: translateX(calc(100vw + 200px)); } }
        @keyframes sun-glow { 0%,100% { opacity: 0.7; filter: blur(20px); } 50% { opacity: 1; filter: blur(30px); } }
        @keyframes flag-wave { 0%,100% { transform: skewX(0deg); } 50% { transform: skewX(-3deg); } }
        @keyframes smoke { 0% { transform: translateY(0) scale(1); opacity: 0.4; } 100% { transform: translateY(-40px) scale(1.5); opacity: 0; } }

        .grid-bg { background-image: linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px); background-size: 60px 60px; animation: bg-move 20s linear infinite; }
        .scanline { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent); animation: scanline 8s linear infinite; pointer-events: none; z-index: 5; }
        .shine-text { background: linear-gradient(90deg, #D4AF37 0%, #fff 50%, #D4AF37 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shine 3s linear infinite; }
        .fade-up { animation: fadeUp 0.8s ease-out forwards; opacity: 0; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.3s; }
        .fade-up-3 { animation-delay: 0.5s; }
        .fade-up-4 { animation-delay: 0.7s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(212,175,55,0.4); }
        .btn-primary { transition: all 0.2s; }
        .tournament-card:hover { border-color: #D4AF37 !important; transform: translateY(-4px); }
        .tournament-card { transition: all 0.3s; }
        .feature-card:hover { background: #141414 !important; border-color: #D4AF37 !important; }
        .feature-card { transition: all 0.3s; }
        .crosshair { animation: crosshair-rotate 20s linear infinite; }
        .heli { animation: helicopter 22s linear infinite; }
        .rotor { animation: rotor 0.1s linear infinite; transform-origin: center; }
        .chute { animation: parachute 18s linear infinite; }
        .cloud-1 { animation: cloud-drift 60s linear infinite; }
        .cloud-2 { animation: cloud-drift 90s linear infinite; animation-delay: -30s; }
        .cloud-3 { animation: cloud-drift 75s linear infinite; animation-delay: -50s; }
        .sun-glow-el { animation: sun-glow 4s ease-in-out infinite; }
        .flag { animation: flag-wave 3s ease-in-out infinite; transform-origin: left center; }
        .smoke-el { animation: smoke 4s ease-out infinite; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,175,55,0.15)",
        padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Logo size="md" href="/" />
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user ? (
            <Link href="/dashboard" style={{
              padding: "0.6rem 1.5rem", background: "#D4AF37", color: "#0a0a0a",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "700",
              textDecoration: "none", letterSpacing: "0.1em",
            }}>DASHBOARD →</Link>
          ) : (
            <>
              <Link href="/login" style={{
                padding: "0.6rem 1.25rem", background: "transparent", color: "#fff",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem",
                textDecoration: "none", letterSpacing: "0.1em",
              }}>LOGIN</Link>
              <Link href="/register" className="btn-primary" style={{
                padding: "0.6rem 1.5rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.1em",
              }}>GET STARTED</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO — NEPAL BATTLEGROUND SCENE */}
      <section style={{
        position: "relative",
        padding: "6rem 2rem 12rem",
        overflow: "hidden",
        minHeight: "95vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(180deg, #1a0e1a 0%, #2d1a0e 30%, #4a2818 60%, #1a0e08 100%)",
      }}>

        {/* SKY GRADIENT */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "60%",
          background: "linear-gradient(180deg, #4a1e0e 0%, #7a3d20 40%, #b8621f 70%, #d4a03a 90%, transparent 100%)",
          zIndex: 0,
        }} />

        {/* SUN */}
        <div className="sun-glow-el" style={{
          position: "absolute", top: "25%", right: "20%",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "radial-gradient(circle, #ffdd66 0%, #ff9c33 40%, transparent 70%)",
          zIndex: 1,
        }} />
        <div style={{
          position: "absolute", top: "27%", right: "22%",
          width: "80px", height: "80px", borderRadius: "50%",
          background: "#ffcc55",
          zIndex: 2,
          boxShadow: "0 0 100px 30px rgba(255,180,80,0.6)",
        }} />

        {/* CLOUDS */}
        <div className="cloud-1" style={{ position: "absolute", top: "12%", left: 0, zIndex: 2, opacity: 0.4 }}>
          <svg width="180" height="60" viewBox="0 0 180 60">
            <ellipse cx="40" cy="35" rx="35" ry="18" fill="#e8d5c0" />
            <ellipse cx="80" cy="30" rx="45" ry="22" fill="#e8d5c0" />
            <ellipse cx="130" cy="35" rx="38" ry="18" fill="#e8d5c0" />
          </svg>
        </div>
        <div className="cloud-2" style={{ position: "absolute", top: "20%", left: 0, zIndex: 2, opacity: 0.3 }}>
          <svg width="120" height="40" viewBox="0 0 120 40">
            <ellipse cx="30" cy="25" rx="25" ry="12" fill="#f0e0cc" />
            <ellipse cx="60" cy="22" rx="30" ry="14" fill="#f0e0cc" />
            <ellipse cx="90" cy="25" rx="25" ry="12" fill="#f0e0cc" />
          </svg>
        </div>
        <div className="cloud-3" style={{ position: "absolute", top: "8%", left: 0, zIndex: 2, opacity: 0.35 }}>
          <svg width="150" height="50" viewBox="0 0 150 50">
            <ellipse cx="35" cy="30" rx="30" ry="15" fill="#e0c8b0" />
            <ellipse cx="75" cy="28" rx="38" ry="18" fill="#e0c8b0" />
            <ellipse cx="115" cy="30" rx="30" ry="15" fill="#e0c8b0" />
          </svg>
        </div>

        {/* HIMALAYAN MOUNTAIN RANGE - BACK */}
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style={{
          position: "absolute", bottom: "35%", left: 0, right: 0, width: "100%", height: "35%",
          zIndex: 3, opacity: 0.8,
        }}>
          <defs>
            <linearGradient id="mtnBack" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8a5a3a" />
              <stop offset="0.6" stopColor="#5a3820" />
              <stop offset="1" stopColor="#3a2412" />
            </linearGradient>
            <linearGradient id="snow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fff8ee" />
              <stop offset="1" stopColor="#e8ddcc" />
            </linearGradient>
          </defs>
          {/* Back range with snow caps */}
          <polygon points="0,400 100,180 180,240 280,120 380,200 480,80 580,180 680,60 780,160 880,100 980,180 1080,80 1180,160 1280,120 1360,200 1440,140 1440,400" fill="url(#mtnBack)" />
          {/* Snow caps */}
          <polygon points="480,80 500,120 460,120" fill="url(#snow)" />
          <polygon points="680,60 705,105 655,105" fill="url(#snow)" />
          <polygon points="880,100 900,140 860,140" fill="url(#snow)" />
          <polygon points="1080,80 1105,130 1055,130" fill="url(#snow)" />
          <polygon points="280,120 300,160 260,160" fill="url(#snow)" />
        </svg>

        {/* MID MOUNTAIN RANGE */}
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" style={{
          position: "absolute", bottom: "25%", left: 0, right: 0, width: "100%", height: "25%",
          zIndex: 4,
        }}>
          <defs>
            <linearGradient id="mtnMid" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#5a3820" />
              <stop offset="1" stopColor="#2a1408" />
            </linearGradient>
          </defs>
          <polygon points="0,300 120,140 220,200 340,80 460,180 580,60 700,160 820,100 940,180 1060,80 1200,160 1320,120 1440,180 1440,300" fill="url(#mtnMid)" />
        </svg>

        {/* NEPALI FLAG on left mountain */}
        <div style={{ position: "absolute", bottom: "45%", left: "8%", zIndex: 5 }}>
          <svg width="40" height="60" viewBox="0 0 40 60">
            <line x1="4" y1="0" x2="4" y2="60" stroke="#8a6a3a" strokeWidth="2" />
            <g className="flag">
              <polygon points="4,4 30,10 4,18" fill="#DC143C" stroke="#003893" strokeWidth="1.5" />
              <polygon points="4,20 30,28 4,36" fill="#DC143C" stroke="#003893" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="#fff" />
              <text x="10" y="30" fontSize="4" fill="#fff">☀</text>
            </g>
          </svg>
        </div>

        {/* HINDU TEMPLE (Pashupatinath style) - Left */}
        <div style={{ position: "absolute", bottom: "18%", left: "12%", zIndex: 6 }}>
          <svg width="120" height="180" viewBox="0 0 120 180">
            {/* Base */}
            <rect x="10" y="130" width="100" height="50" fill="#3a2010" stroke="#D4AF37" strokeWidth="0.5" />
            <rect x="15" y="135" width="90" height="5" fill="#D4AF37" opacity="0.6" />
            {/* Door */}
            <rect x="50" y="145" width="20" height="35" fill="#1a0808" />
            <rect x="52" y="147" width="16" height="31" fill="none" stroke="#D4AF37" strokeWidth="0.3" />
            {/* Pillars */}
            <rect x="20" y="130" width="6" height="50" fill="#5a3018" />
            <rect x="94" y="130" width="6" height="50" fill="#5a3018" />
            {/* Tiered pagoda roofs */}
            <polygon points="10,130 60,110 110,130" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.8" />
            <rect x="15" y="105" width="90" height="8" fill="#3a2010" />
            <polygon points="18,105 60,85 102,105" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.8" />
            <rect x="22" y="82" width="76" height="6" fill="#3a2010" />
            <polygon points="25,82 60,62 95,82" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.8" />
            <rect x="30" y="60" width="60" height="5" fill="#3a2010" />
            <polygon points="32,60 60,40 88,60" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.8" />
            {/* Golden spire */}
            <rect x="57" y="20" width="6" height="20" fill="#D4AF37" />
            <polygon points="55,20 60,5 65,20" fill="#D4AF37" />
            <circle cx="60" cy="3" r="2" fill="#ffd700" />
            {/* Prayer flags */}
            <line x1="10" y1="130" x2="30" y2="110" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="110" y1="130" x2="90" y2="110" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2,2" />
          </svg>
        </div>

        {/* MOSQUE with dome and minaret - Center-left */}
        <div style={{ position: "absolute", bottom: "17%", left: "30%", zIndex: 6 }}>
          <svg width="140" height="160" viewBox="0 0 140 160">
            {/* Main building */}
            <rect x="20" y="90" width="100" height="70" fill="#2a1a0a" stroke="#D4AF37" strokeWidth="0.5" />
            {/* Arched entrance */}
            <path d="M 60 160 L 60 130 Q 60 115 70 115 Q 80 115 80 130 L 80 160 Z" fill="#0a0505" />
            <path d="M 60 130 Q 60 115 70 115 Q 80 115 80 130" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            {/* Windows */}
            <path d="M 30 145 L 30 130 Q 30 122 35 122 Q 40 122 40 130 L 40 145 Z" fill="#4a2818" stroke="#D4AF37" strokeWidth="0.3" />
            <path d="M 100 145 L 100 130 Q 100 122 105 122 Q 110 122 110 130 L 110 145 Z" fill="#4a2818" stroke="#D4AF37" strokeWidth="0.3" />
            {/* Main dome */}
            <path d="M 30 90 Q 30 55 70 55 Q 110 55 110 90 Z" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.8" />
            <path d="M 40 90 Q 40 62 70 62 Q 100 62 100 90" fill="none" stroke="#D4AF37" strokeWidth="0.3" />
            {/* Dome spire */}
            <line x1="70" y1="55" x2="70" y2="35" stroke="#D4AF37" strokeWidth="2" />
            <path d="M 66 35 Q 70 25 74 35 Z" fill="#D4AF37" />
            <path d="M 68 25 Q 70 18 72 25 M 66 22 L 74 22" stroke="#D4AF37" strokeWidth="0.8" fill="none" />
            {/* Minaret left */}
            <rect x="8" y="55" width="8" height="105" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.4" />
            <rect x="6" y="50" width="12" height="8" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.4" />
            <path d="M 5 50 Q 12 30 19 50 Z" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.5" />
            <line x1="12" y1="30" x2="12" y2="20" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="12" cy="18" r="2" fill="#D4AF37" />
            {/* Minaret right */}
            <rect x="124" y="55" width="8" height="105" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.4" />
            <rect x="122" y="50" width="12" height="8" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.4" />
            <path d="M 121 50 Q 128 30 135 50 Z" fill="#3a1810" stroke="#D4AF37" strokeWidth="0.5" />
            <line x1="128" y1="30" x2="128" y2="20" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="128" cy="18" r="2" fill="#D4AF37" />
          </svg>
        </div>

        {/* CHURCH with cross - Center-right */}
        <div style={{ position: "absolute", bottom: "17%", right: "30%", zIndex: 6 }}>
          <svg width="100" height="170" viewBox="0 0 100 170">
            {/* Main building */}
            <rect x="15" y="80" width="70" height="90" fill="#2a1a10" stroke="#D4AF37" strokeWidth="0.5" />
            {/* Roof */}
            <polygon points="15,80 50,50 85,80" fill="#4a1810" stroke="#D4AF37" strokeWidth="0.5" />
            {/* Door */}
            <path d="M 40 170 L 40 140 Q 40 130 50 130 Q 60 130 60 140 L 60 170 Z" fill="#0a0505" />
            <path d="M 40 140 Q 40 130 50 130 Q 60 130 60 140" fill="none" stroke="#D4AF37" strokeWidth="0.4" />
            {/* Stained glass windows */}
            <rect x="20" y="100" width="12" height="20" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.3" />
            <path d="M 20 100 Q 26 92 32 100" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.3" />
            <rect x="68" y="100" width="12" height="20" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.3" />
            <path d="M 68 100 Q 74 92 80 100" fill="#8B0000" stroke="#D4AF37" strokeWidth="0.3" />
            {/* Bell tower */}
            <rect x="42" y="30" width="16" height="55" fill="#2a1a10" stroke="#D4AF37" strokeWidth="0.4" />
            <polygon points="40,30 50,10 60,30" fill="#4a1810" stroke="#D4AF37" strokeWidth="0.5" />
            {/* Bell window */}
            <path d="M 44 50 L 44 42 Q 44 38 50 38 Q 56 38 56 42 L 56 50 Z" fill="#0a0505" />
            {/* Cross on top */}
            <line x1="50" y1="10" x2="50" y2="0" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="46" y1="3" x2="54" y2="3" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
        </div>

        {/* BUDDHIST STUPA (Boudhanath style) - Right */}
        <div style={{ position: "absolute", bottom: "17%", right: "10%", zIndex: 6 }}>
          <svg width="110" height="150" viewBox="0 0 110 150">
            {/* Base tiers */}
            <rect x="5" y="130" width="100" height="20" fill="#3a2010" stroke="#D4AF37" strokeWidth="0.5" />
            <rect x="15" y="115" width="80" height="15" fill="#4a2818" stroke="#D4AF37" strokeWidth="0.5" />
            <rect x="25" y="102" width="60" height="13" fill="#5a3020" stroke="#D4AF37" strokeWidth="0.5" />
            {/* White dome */}
            <ellipse cx="55" cy="102" rx="40" ry="35" fill="#f0e8d8" stroke="#D4AF37" strokeWidth="0.6" />
            <ellipse cx="55" cy="102" rx="40" ry="35" fill="none" stroke="#8a6a4a" strokeWidth="0.3" strokeDasharray="3,3" />
            {/* Square tower with eyes */}
            <rect x="40" y="55" width="30" height="25" fill="#D4AF37" stroke="#8a6a3a" strokeWidth="0.5" />
            {/* The famous Buddha eyes */}
            <ellipse cx="47" cy="65" rx="3" ry="2" fill="#fff" />
            <ellipse cx="63" cy="65" rx="3" ry="2" fill="#fff" />
            <circle cx="47" cy="65" r="1" fill="#0066cc" />
            <circle cx="63" cy="65" r="1" fill="#0066cc" />
            {/* Question mark nose */}
            <path d="M 53 70 Q 55 74 53 76 Q 55 78 57 76" fill="none" stroke="#8B0000" strokeWidth="0.8" />
            {/* 13 tiers spire */}
            {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
              <rect key={i} x={48 - i*0.4} y={50 - i*3} width={14 + i*0.8} height="2.5" fill="#D4AF37" stroke="#8a6a3a" strokeWidth="0.2" />
            ))}
            {/* Golden umbrella & pinnacle */}
            <ellipse cx="55" cy="13" rx="10" ry="3" fill="#D4AF37" />
            <line x1="55" y1="13" x2="55" y2="0" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="55" cy="0" r="2" fill="#ffd700" />
            {/* Prayer flag strings */}
            <line x1="5" y1="130" x2="55" y2="75" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="2,3" opacity="0.6" />
            <line x1="105" y1="130" x2="55" y2="75" stroke="#D4AF37" strokeWidth="0.4" strokeDasharray="2,3" opacity="0.6" />
          </svg>
        </div>

        {/* FOREGROUND TREES */}
        <div style={{ position: "absolute", bottom: "12%", left: "3%", zIndex: 7 }}>
          <svg width="60" height="90" viewBox="0 0 60 90">
            <rect x="27" y="60" width="6" height="30" fill="#1a0808" />
            <polygon points="30,10 12,45 48,45" fill="#0d1a0d" stroke="#1a3a1a" strokeWidth="0.5" />
            <polygon points="30,25 15,55 45,55" fill="#0d1a0d" stroke="#1a3a1a" strokeWidth="0.5" />
            <polygon points="30,40 18,65 42,65" fill="#0d1a0d" stroke="#1a3a1a" strokeWidth="0.5" />
          </svg>
        </div>
        <div style={{ position: "absolute", bottom: "10%", right: "3%", zIndex: 7 }}>
          <svg width="70" height="100" viewBox="0 0 70 100">
            <rect x="32" y="65" width="6" height="35" fill="#1a0808" />
            <polygon points="35,10 15,50 55,50" fill="#0d1a0d" stroke="#1a3a1a" strokeWidth="0.5" />
            <polygon points="35,28 18,60 52,60" fill="#0d1a0d" stroke="#1a3a1a" strokeWidth="0.5" />
            <polygon points="35,45 20,70 50,70" fill="#0d1a0d" stroke="#1a3a1a" strokeWidth="0.5" />
          </svg>
        </div>

        {/* HELICOPTER with spinning rotor */}
        <div className="heli" style={{ position: "absolute", top: "16%", left: 0, zIndex: 8 }}>
          <svg width="100" height="50" viewBox="0 0 100 50">
            <ellipse cx="45" cy="30" rx="25" ry="8" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1" />
            <rect x="70" y="27" width="22" height="4" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1" />
            <polygon points="88,25 98,29 88,33" fill="#D4AF37" />
            <rect x="42" y="18" width="6" height="4" fill="#D4AF37" />
            <g style={{ transformOrigin: "45px 18px" }} className="rotor">
              <line x1="15" y1="18" x2="75" y2="18" stroke="#D4AF37" strokeWidth="1.5" opacity="0.7" />
              <line x1="45" y1="-12" x2="45" y2="48" stroke="#D4AF37" strokeWidth="1.5" opacity="0.4" />
            </g>
            <line x1="35" y1="38" x2="40" y2="45" stroke="#1a1a1a" strokeWidth="1" />
            <line x1="55" y1="38" x2="50" y2="45" stroke="#1a1a1a" strokeWidth="1" />
            <line x1="38" y1="45" x2="55" y2="45" stroke="#1a1a1a" strokeWidth="1.5" />
          </svg>
        </div>

        {/* PARACHUTE 1 */}
        <div className="chute" style={{ position: "absolute", left: "20%", top: 0, zIndex: 8 }}>
          <svg width="50" height="80" viewBox="0 0 60 90">
            <path d="M 5,25 Q 30,-8 55,25 L 45,35 L 30,32 L 15,35 Z" fill="rgba(212,175,55,0.4)" stroke="#D4AF37" strokeWidth="1" />
            <line x1="12" y1="32" x2="28" y2="55" stroke="#D4AF37" strokeWidth="0.5" />
            <line x1="30" y1="30" x2="30" y2="55" stroke="#D4AF37" strokeWidth="0.5" />
            <line x1="48" y1="32" x2="32" y2="55" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="30" cy="60" r="4" fill="#1a1a1a" stroke="#D4AF37" strokeWidth="1" />
            <rect x="27" y="63" width="6" height="8" fill="#1a1a1a" />
          </svg>
        </div>

        {/* PARACHUTE 2 (delayed) */}
        <div className="chute" style={{ position: "absolute", left: "75%", top: 0, zIndex: 8, animationDelay: "-8s" }}>
          <svg width="45" height="70" viewBox="0 0 60 90">
            <path d="M 5,25 Q 30,-8 55,25 L 45,35 L 30,32 L 15,35 Z" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1" />
            <line x1="12" y1="32" x2="28" y2="55" stroke="#fff" strokeWidth="0.5" />
            <line x1="30" y1="30" x2="30" y2="55" stroke="#fff" strokeWidth="0.5" />
            <line x1="48" y1="32" x2="32" y2="55" stroke="#fff" strokeWidth="0.5" />
            <circle cx="30" cy="60" r="4" fill="#1a1a1a" stroke="#fff" strokeWidth="1" />
          </svg>
        </div>

        {/* CROSSHAIR */}
        <div style={{ position: "absolute", top: "45%", right: "8%", opacity: 0.25, zIndex: 8 }}>
          <svg width="140" height="140" viewBox="0 0 100 100" className="crosshair">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="20" stroke="#D4AF37" strokeWidth="1" />
            <line x1="50" y1="80" x2="50" y2="100" stroke="#D4AF37" strokeWidth="1" />
            <line x1="0" y1="50" x2="20" y2="50" stroke="#D4AF37" strokeWidth="1" />
            <line x1="80" y1="50" x2="100" y2="50" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="50" cy="50" r="2" fill="#D4AF37" />
          </svg>
        </div>

        {/* GRID overlay */}
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.15, zIndex: 9 }} />
        <div className="scanline" style={{ top: 0 }} />

        {/* Dark bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "300px", zIndex: 10,
          background: "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.9) 60%, #0a0a0a 100%)",
          pointerEvents: "none",
        }} />

        {/* HERO CONTENT */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 20, textAlign: "center", width: "100%" }}>

          <div className="fade-up fade-up-1" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid rgba(212,175,55,0.5)",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(10px)",
            marginBottom: "2rem",
          }}>
            <span style={{
              width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%",
              animation: "tick 1.5s ease-in-out infinite",
              boxShadow: "0 0 10px #22c55e",
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
              color: "#D4AF37", letterSpacing: "0.2em", fontWeight: "600",
            }}>
              LIVE OPS · KATHMANDU DROP ZONE · v2.5
            </span>
          </div>

          <h1 className="fade-up fade-up-2" style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(3rem, 9vw, 8rem)",
            fontWeight: "900",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
            textShadow: "0 4px 40px rgba(0,0,0,0.9), 0 0 60px rgba(212,175,55,0.3)",
          }}>
            <span style={{ color: "#fff" }}>WINNER</span><br />
            <span className="shine-text">WINNER</span><br />
            <span style={{ color: "#D4AF37" }}>CHICKEN DINNER</span>
          </h1>

          <p className="fade-up fade-up-3" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(0.9rem, 1.4vw, 1.15rem)",
            color: "#f0e8d8",
            maxWidth: "620px",
            margin: "0 auto 3rem",
            lineHeight: 1.7,
            textShadow: "0 2px 20px rgba(0,0,0,0.95)",
          }}>
            Nepal&apos;s complete tournament operating system for PUBG Mobile, BGMI, and battle royale.
            From temple to stupa, mountain to mosque — organize like a champion.
          </p>

          <div className="fade-up fade-up-4" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{
                padding: "1.15rem 2.75rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.15em",
                animation: "pulse-gold 2s infinite",
              }}>🎮 OPEN COMMAND CENTER →</Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary" style={{
                  padding: "1.15rem 2.75rem", background: "#D4AF37", color: "#0a0a0a",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: "700",
                  textDecoration: "none", letterSpacing: "0.15em",
                  animation: "pulse-gold 2s infinite",
                }}>🎮 DROP IN FREE →</Link>
                <Link href="/tournaments" style={{
                  padding: "1.15rem 2.75rem",
                  background: "rgba(0,0,0,0.7)", color: "#fff",
                  border: "1px solid #D4AF37",
                  backdropFilter: "blur(10px)",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: "700",
                  textDecoration: "none", letterSpacing: "0.15em",
                }}>WATCH LIVE</Link>
              </>
            )}
          </div>

          <div className="fade-up fade-up-4" style={{
            display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#d0c8b8",
            letterSpacing: "0.15em", fontWeight: "600",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          }}>
            <span>✓ NO SPREADSHEETS</span>
            <span>✓ LIVE OVERLAYS</span>
            <span>✓ NEPAL PAYMENTS</span>
            <span>✓ PMGC & PMPL</span>
          </div>
        </div>
      </section>

      {/* LIVE STATS BAR */}
      <section style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", background: "#0f0f0f", position: "relative", zIndex: 30 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
          {[
            { num: totalTournaments, label: "TOURNAMENTS RUN", icon: "🏆" },
            { num: totalUsers, label: "ACTIVE ORGANIZERS", icon: "👑" },
            { num: totalTeams, label: "SQUADS REGISTERED", icon: "⚔️" },
            { num: 299, label: "NPR / MONTH PRO", icon: "💎", prefix: "Rs " },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "2.5rem", fontWeight: "900",
                color: "#D4AF37", lineHeight: 1, marginBottom: "0.75rem",
              }}>
                {s.prefix || ""}{s.num.toLocaleString()}
              </div>
              <div style={{ width: "40px", height: "2px", background: "#D4AF37", margin: "0 auto 0.75rem" }} />
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem",
                color: "#8a8a8a", letterSpacing: "0.2em", fontWeight: "600",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE TOURNAMENTS */}
      <section style={{ padding: "6rem 2rem", position: "relative" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem",
                color: "#ef4444", letterSpacing: "0.2em", marginBottom: "0.75rem", fontWeight: "700",
              }}>
                <span style={{
                  width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%",
                  animation: "tick 1.2s infinite", boxShadow: "0 0 10px #ef4444",
                }} />
                LIVE NOW · BROADCASTING
              </div>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900",
                textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0,
              }}>
                Active <span style={{ color: "#D4AF37" }}>Battlegrounds</span>
              </h2>
            </div>
            {user && (
              <Link href="/dashboard/tournaments/create" className="btn-primary" style={{
                padding: "0.75rem 1.5rem", background: "transparent", color: "#D4AF37",
                border: "1px solid #D4AF37",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.15em",
              }}>+ NEW TOURNAMENT</Link>
            )}
          </div>

          {recentTournaments.length === 0 ? (
            <div style={{ padding: "6rem 2rem", textAlign: "center", border: "1px dashed #2a2a2a", background: "rgba(20,20,20,0.5)" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem", opacity: 0.4 }}>🎯</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>DROP ZONE EMPTY</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem", color: "#b8b8b8", marginBottom: "2rem", fontWeight: "700" }}>Be the first to deploy a tournament</div>
              <Link href={user ? "/dashboard/tournaments/create" : "/register"} className="btn-primary" style={{
                padding: "1rem 2.5rem", background: "#D4AF37", color: "#0a0a0a",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: "700",
                textDecoration: "none", letterSpacing: "0.15em", display: "inline-block",
              }}>DEPLOY NOW →</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
              {recentTournaments.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.slug}`} className="tournament-card" style={{
                  background: "linear-gradient(135deg, #141414 0%, #0f0f0f 100%)",
                  border: "1px solid #2a2a2a", padding: "1.5rem",
                  textDecoration: "none", color: "inherit", display: "block",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: "60px", height: "60px", background: "linear-gradient(135deg, transparent 50%, rgba(212,175,55,0.15) 50%)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", position: "relative" }}>
                    <div style={{ padding: "0.25rem 0.6rem", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#D4AF37", letterSpacing: "0.15em", fontWeight: "700" }}>
                      {t.game.toUpperCase().replace("_", " ")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#22c55e", letterSpacing: "0.15em", fontWeight: "700" }}>
                      <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", animation: "tick 1.5s infinite" }} />
                      {t.status.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.5rem", fontWeight: "900", textTransform: "uppercase", marginBottom: "1rem", lineHeight: 1.1, color: "#fff", letterSpacing: "-0.01em" }}>
                    {t.name}
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#666", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>SQUADS</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", color: "#fff", fontWeight: "700" }}>{t.teams.length}<span style={{ color: "#666" }}>/{t.maxTeams}</span></div>
                    </div>
                    {t.prizePool && (
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#666", letterSpacing: "0.15em", marginBottom: "0.2rem" }}>PRIZE POOL</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", color: "#D4AF37", fontWeight: "700" }}>{t.prizePool}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#8a8a8a" }}>
                    <span>{t.startDate ? "STARTS " + new Date(t.startDate).toLocaleDateString("en-NP", { month: "short", day: "numeric" }).toUpperCase() : "TBD"}</span>
                    <span style={{ color: "#D4AF37", fontWeight: "700" }}>VIEW →</span>
                  </div>
                  <div style={{ marginTop: "0.75rem", height: "3px", background: "#0a0a0a" }}>
                    <div style={{ height: "100%", background: "#D4AF37", width: `${Math.min(100, (t.teams.length / t.maxTeams) * 100)}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: "6rem 2rem", background: "#0f0f0f", position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#D4AF37", letterSpacing: "0.3em", marginBottom: "0.75rem", fontWeight: "700" }}>THE ARSENAL</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0 }}>
              Everything an <span style={{ color: "#D4AF37" }}>organizer</span> needs
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "⚡", title: "LIVE BRACKETS", desc: "Auto-advancing brackets with real-time score sync from screenshots", tag: "REAL-TIME" },
              { icon: "🎯", title: "SCORING ENGINE", desc: "PMGC, PMPL presets. Or build custom kill + placement point rules", tag: "CUSTOMIZABLE" },
              { icon: "📡", title: "OBS OVERLAYS", desc: "Broadcaster-ready standings, top fragger, chicken dinner overlays", tag: "STREAM READY" },
              { icon: "🏆", title: "PRIZE POOLS", desc: "Position-based cash + item prize distribution. NPR/USD support", tag: "FLEXIBLE" },
              { icon: "📋", title: "REGISTRATIONS", desc: "Squad sign-ups, approval workflow, waitlist, seed management", tag: "AUTOMATED" },
              { icon: "🤖", title: "AI TOOLS", desc: "Screenshot result extraction, live commentary, match summaries", tag: "AI POWERED" },
              { icon: "💳", title: "NEPAL PAYMENTS", desc: "Khalti, eSewa, Bank Transfer. Manual verification in 24h", tag: "LOCAL" },
              { icon: "📊", title: "ANALYTICS", desc: "Real-time stats, top fraggers, participation, tournament ROI", tag: "INSIGHTS" },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", padding: "2rem 1.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "1rem", right: "1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#D4AF37", letterSpacing: "0.15em", fontWeight: "700", padding: "0.15rem 0.5rem", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.05)" }}>{f.tag}</div>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.15rem", fontWeight: "800", color: "#fff", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>{f.title}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#8a8a8a", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CTA */}
      <section style={{ padding: "6rem 2rem", position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #0a0a0a 0%, #1a1500 50%, #0a0a0a 100%)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#D4AF37", letterSpacing: "0.3em", marginBottom: "1rem", fontWeight: "700", padding: "0.4rem 1rem", border: "1px solid rgba(212,175,55,0.3)" }}>🇳🇵 NEPAL PRICING</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "1rem", color: "#fff" }}>
            Only <span className="shine-text">Rs 299</span><br />
            <span style={{ fontSize: "0.6em", color: "#b8b8b8" }}>per month · unlimited tournaments</span>
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", color: "#b8b8b8", maxWidth: "500px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Less than one cup of coffee per week. Run unlimited tournaments with full access to overlays, AI, and analytics.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {!user ? (
              <Link href="/register" className="btn-primary" style={{ padding: "1.25rem 3rem", background: "#D4AF37", color: "#0a0a0a", fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: "900", textDecoration: "none", letterSpacing: "0.15em", animation: "pulse-gold 2s infinite" }}>🎮 START FREE →</Link>
            ) : (
              <Link href="/dashboard/upgrade" className="btn-primary" style={{ padding: "1.25rem 3rem", background: "#D4AF37", color: "#0a0a0a", fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", fontWeight: "900", textDecoration: "none", letterSpacing: "0.15em", animation: "pulse-gold 2s infinite" }}>UPGRADE TO PRO →</Link>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#8a8a8a", letterSpacing: "0.1em" }}>
            <span>💳 KHALTI</span>
            <span>💳 ESEWA</span>
            <span>🏦 BANK TRANSFER</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "3rem 2rem 2rem", background: "#0a0a0a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <Logo size="sm" href={null} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#666", lineHeight: 1.7 }}>
                The tournament operating system built for Nepal&apos;s competitive esports scene.
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>PRODUCT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["Features","/#features"],["Pricing","/pricing"],["Tournaments","/tournaments"]].map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#b8b8b8", textDecoration: "none" }}>{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>COMPANY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[["Contact","/contact"],["Privacy","/privacy"],["Terms","/terms"]].map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#b8b8b8", textDecoration: "none" }}>{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "1rem", fontWeight: "700" }}>SUPPORT</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#b8b8b8", lineHeight: 1.7 }}>
                📧 support@tournaops.com<br />
                🇳🇵 Kathmandu, Nepal
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#666" }}>
            <div>© {new Date().getFullYear()} TOURNAOPS · BUILT IN NEPAL 🇳🇵</div>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", animation: "tick 1.5s infinite" }} />
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}