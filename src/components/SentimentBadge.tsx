import { cn } from "@/lib/utils";
import type { SentimentType } from "@/lib/mock-data";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  className?: string;
}

const config = {
  positive: { label: "Positive", className: "bg-crisis-green/15 text-crisis-green border-crisis-green/30" },
  neutral: { label: "Neutral", className: "bg-crisis-blue/15 text-crisis-blue border-crisis-blue/30" },
  negative: { label: "Negative", className: "bg-crisis-red/15 text-crisis-red border-crisis-red/30" },
};

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const c = config[sentiment];
  return (
    <span className={cn("inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm border", c.className, className)}>
      {c.label.toUpperCase()}
    </span>
  );
}
