import type { RiskLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface GlobalRiskBarProps {
  level: RiskLevel;
}

export function GlobalRiskBar({ level }: GlobalRiskBarProps) {
  const barClass = {
    critical: "risk-bar-critical",
    high: "risk-bar-high",
    medium: "risk-bar-medium",
    low: "risk-bar-low",
  }[level];

  return (
    <div
      data-tour="risk-bar"
      className={cn(
        "h-1 w-full fixed top-0 left-0 z-50 transition-colors duration-500",
        barClass,
        level === "critical" && "animate-pulse-glow"
      )}
    />
  );
}
