import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/crisis-helpers";
import type { AnalyticsKpis } from "@/components/analytics/types";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatLatency(ms: number | null) {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function freshnessLabel(timestamp: string | null) {
  if (!timestamp) return "No recent ingest";
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60_000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  return `${Math.round(diffMinutes / 60)}h ago`;
}

function KpiCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface-elevated px-3 py-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-mono font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}

export function AnalyticsKpiGrid({ kpis, isLoading }: { kpis: AnalyticsKpis | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Total mentions" value={formatNumber(kpis.totalMentions)} helper="Signals within current filters" />
      <KpiCard label="Negative share" value={formatPercent(kpis.negativeShare)} helper="Portion of negative signals" />
      <KpiCard label="Positive share" value={formatPercent(kpis.positiveShare)} helper="Portion of positive signals" />
      <KpiCard label="Estimated reach" value={formatNumber(kpis.estimatedReach)} helper="Summed signal reach" />
      <KpiCard label="Tracked keywords" value={String(kpis.activeKeywords)} helper={`Rules active ${kpis.trackedRules}`} />
      <KpiCard label="Attributed mentions" value={formatNumber(kpis.attributedMentions)} helper={`${formatPercent(kpis.attributionCoverage)} linked to tracked rules`} />
      <KpiCard label="Pending attribution" value={formatNumber(kpis.unattributedMentions)} helper={`${formatPercent(kpis.unattributedShare)} still awaiting rule linkage`} />
      <KpiCard label="Last ingest" value={freshnessLabel(kpis.latestIngestAt)} helper={kpis.liveMode ? "Streaming with realtime inserts" : "Most recent pipeline insert"} />
      <KpiCard label="Median latency" value={formatLatency(kpis.medianLatencyMs)} helper="Detect-to-ingest pipeline time" />
      <KpiCard label="Attribution" value={formatPercent(kpis.attributionCoverage)} helper="Signals fully linked to keyword and rule" />
    </div>
  );
}