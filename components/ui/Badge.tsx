import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "bg-white/8 text-gray-300 border-white/10",
        draft: "bg-gray-500/15 text-gray-400 border-gray-500/20",
        registration: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        live: "bg-green-500/15 text-green-400 border-green-500/20",
        completed: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
        cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
        pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
        gold: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
        pro: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30",
        new: "bg-green-500/15 text-green-400 border-green-500/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "live" && "bg-green-400 animate-pulse",
            variant === "registration" && "bg-blue-400",
            variant === "draft" && "bg-gray-400",
            variant === "completed" && "bg-purple-400",
            variant === "cancelled" && "bg-red-400",
            variant === "pending" && "bg-yellow-400",
          )}
        />
      )}
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, any> = {
    draft: "draft",
    registration: "registration",
    live: "live",
    completed: "completed",
    cancelled: "cancelled",
    pending: "pending",
  };

  const labelMap: Record<string, string> = {
    draft: "Draft",
    registration: "Registration",
    live: "Live",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending",
  };

  return (
    <Badge variant={variantMap[status] ?? "default"} dot>
      {labelMap[status] ?? status}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };