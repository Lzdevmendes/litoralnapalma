import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, color, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        className
      )}
      style={
        color
          ? {
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }
          : undefined
      }
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ backgroundColor: color ?? "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
