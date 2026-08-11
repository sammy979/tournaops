"use client";

interface TeamLogoProps {
  name: string;
  logo?: string;
  size?: number;
  tag?: string;
}

// Consistent color from name hash
function nameToColors(name: string): [string, string] {
  const colors = [
    ["#f59e0b", "#f97316"], ["#3b82f6", "#6366f1"],
    ["#8b5cf6", "#a855f7"], ["#22c55e", "#10b981"],
    ["#ef4444", "#f43f5e"], ["#06b6d4", "#0ea5e9"],
    ["#eab308", "#facc15"], ["#ec4899", "#f472b6"],
    ["#14b8a6", "#0d9488"], ["#f97316", "#ea580c"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length] as [string, string];
}

export default function TeamLogo({ name, logo, size = 40, tag }: TeamLogoProps) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        style={{
          width: size, height: size,
          objectFit: "cover",
          borderRadius: size * 0.2,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    );
  }

  const [c1, c2] = nameToColors(name || tag || "?");
  const initial = (tag || name || "?").trim()[0]?.toUpperCase() || "?";

  return (
    <div
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        borderRadius: size * 0.2,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: size * 0.45,
        boxShadow: `0 4px 12px ${c1}40`,
        border: "1px solid rgba(255,255,255,0.15)",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {initial}
    </div>
  );
}
