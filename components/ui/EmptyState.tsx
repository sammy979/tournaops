import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-2xl border-2 border-dashed border-white/10 p-12",
        className
      )}
    >
      {icon && (
        <div className="text-gray-700 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} leftIcon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };