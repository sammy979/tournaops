import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name ? getInitials(name) : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={cn(
          "object-cover flex-shrink-0",
          sizeMap[size],
          className
        )}
        style={{
          borderRadius: 0,
          border: "1px solid #D4AF37",
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center font-bold flex-shrink-0",
        sizeMap[size],
        className
      )}
      style={{
        background: "#141414",
        color: "#D4AF37",
        border: "1px solid #D4AF37",
        borderRadius: 0,
        letterSpacing: "0.05em",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      {initials}
    </div>
  );
}

export { Avatar };