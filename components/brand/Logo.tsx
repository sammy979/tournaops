import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string | null;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", href = "/", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 32, textSize: "1rem" },
    md: { icon: 44, textSize: "1.3rem" },
    lg: { icon: 60, textSize: "1.75rem" },
    xl: { icon: 80, textSize: "2.25rem" },
  };
  const s = sizes[size];

  const content = (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.7rem",
        textDecoration: "none",
      }}
    >
      <Image
        src="/logo.png"
        alt="TournaOps"
        width={s.icon}
        height={s.icon}
        style={{
          objectFit: "contain",
          flexShrink: 0,
        }}
        priority
      />
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
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return content;
}