import { Badge } from "@/components/ui/badge";

function formatCadence(value: number | null) {
  if (value == null) return "Unknown cadence";
  return value === 1 ? "Every minute" : `Every ${value} minutes`;
}

function formatLastRun(timestamp: string | null) {
  if (!timestamp) return "No recent scheduler run";
  const deltaMinutes = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60_000));
  if (deltaMinutes < 1) return "Ran just now";
  if (deltaMinutes < 60) return `Ran ${deltaMinutes}m ago`;
  return `Ran ${Math.round(deltaMinutes / 60)}h ago`;
}

export function AnalyticsStatusStrip({
  cadenceMinutes,
  lastRun,
  freshnessStatus,
  attributionCoverage,
}: {
  cadenceMinutes: number | null;
  lastRun: string | null;
  freshnessStatus: "healthy" | "delayed" | "stale" | "unknown";
  attributionCoverage: number;
}) {
  const freshnessText =
    freshnessStatus === "healthy"
      ? "Freshness healthy"
      : freshnessStatus === "delayed"
        ? "Freshness delayed"
        : freshnessStatus === "stale"
          ? "Freshness stale"
          : "Freshness unknown";

  const attributionText = attributionCoverage >= 95 ? "Attribution complete" : attributionCoverage >= 60 ? "Attribution partial" : "Attribution low";

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">{formatCadence(cadenceMinutes)}</Badge>
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">{formatLastRun(lastRun)}</Badge>
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">{freshnessText}</Badge>
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">{attributionText}</Badge>
      <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Production data only</Badge>
    </div>
  );
}