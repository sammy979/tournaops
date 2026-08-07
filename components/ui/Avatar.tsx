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
          "rounded-full object-cover flex-shrink-0",
          sizeMap[size],
          className
        )}
      />
    );
  }

  const colors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-yellow-500 to-orange-600",
    "from-pink-500 to-red-600",
    "from-indigo-500 to-blue-600",
    "from-purple-500 to-pink-600",
  ];

  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0;

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white flex-shrink-0",
        sizeMap[size],
        `bg-gradient-to-br ${colors[colorIndex]}`,
        className
      )}
    >
      {initials}
    </div>
  );
}

export { Avatar };