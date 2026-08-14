import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  href?: string | null;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

const SIZES = {
  sm:  { icon: 32,  textSize: "0.95rem",  gap: "0.5rem" },
  md:  { icon: 44,  textSize: "1.2rem",   gap: "0.625rem" },
  lg:  { icon: 60,  textSize: "1.6rem",   gap: "0.75rem" },
  xl:  { icon: 80,  textSize: "2rem",     gap: "0.875rem" },
  "2xl": { icon: 120, textSize: "3rem",   gap: "1rem" },
};

export function Logo({
  size = "md",
  href = "/",
  showText = true,
  textColor = "#ffffff",
  className,
}: LogoProps) {
  const s = SIZES[size];

  const content = (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
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
          display: "block",
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
            color: textColor,
            lineHeight: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
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

export default Logo;