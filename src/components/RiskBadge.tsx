import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/mock-data";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const levelConfig = {
  critical: { label: "CRITICAL", bg: "bg-risk-critical", text: "text-primary-foreground" },
  high: { label: "HIGH", bg: "bg-risk-high", text: "text-primary-foreground" },
  medium: { label: "MEDIUM", bg: "bg-risk-medium", text: "text-foreground" },
  low: { label: "LOW", bg: "bg-risk-low", text: "text-primary-foreground" },
};

const sizeConfig = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
};

export function RiskBadge({ level, size = "md", pulse = false, className }: RiskBadgeProps) {
  const config = levelConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold uppercase tracking-wider rounded-sm",
        config.bg,
        config.text,
        sizeConfig[size],
        pulse && level === "critical" && "animate-pulse-glow",
        className
      )}
    >
      {config.label}
    </span>
  );
}
