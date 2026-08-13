import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", href = "/", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, textSize: "1rem" },
    md: { icon: 32, textSize: "1.25rem" },
    lg: { icon: 44, textSize: "1.75rem" },
  };
  const s = sizes[size];

  const content = (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        textDecoration: "none",
      }}
    >
      {/* Shield icon SVG inline for reliability */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 60 60"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M 30 6 L 52 12 L 52 30 Q 52 46 30 54 Q 8 46 8 30 L 8 12 Z"
          fill="#0a0a0a"
          stroke="#D4AF37"
          strokeWidth="2"
        />
        <path
          d="M 30 12 L 46 16 L 46 30 Q 46 42 30 48 Q 14 42 14 30 L 14 16 Z"
          fill="#D4AF37"
        />
        <text
          x="30"
          y="37"
          fontFamily="Barlow Condensed, sans-serif"
          fontSize="22"
          fontWeight="900"
          fill="#0a0a0a"
          textAnchor="middle"
        >
          T
        </text>
        <circle cx="30" cy="30" r="10" fill="none" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.4" />
        <line x1="30" y1="18" x2="30" y2="22" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.4" />
        <line x1="30" y1="38" x2="30" y2="42" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.4" />
        <line x1="18" y1="30" x2="22" y2="30" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.4" />
        <line x1="38" y1="30" x2="42" y2="30" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.4" />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: s.textSize,
            fontWeight: 900,
            letterSpacing: "0.05em",
            color: "#ffffff",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          TOURNA<span style={{ color: "#D4AF37" }}>OPS</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}