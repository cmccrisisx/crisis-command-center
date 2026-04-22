import { AppLayout } from "@/components/AppLayout";
import { AnalyticsDetailPanels } from "@/components/analytics/AnalyticsDetailPanels";
import { AnalyticsExportCard } from "@/components/analytics/AnalyticsExportCard";
import { AnalyticsFiltersBar } from "@/components/analytics/AnalyticsFiltersBar";
import { AnalyticsKpiGrid } from "@/components/analytics/AnalyticsKpiGrid";
import { AnalyticsOverviewCharts } from "@/components/analytics/AnalyticsOverviewCharts";
import { AnalyticsStatusStrip } from "@/components/analytics/AnalyticsStatusStrip";
import { KeywordComparisonPanel } from "@/components/analytics/KeywordComparisonPanel";
import { useAnalyticsData } from "@/components/analytics/useAnalyticsData";
import { useAnalyticsFilters } from "@/hooks/useAnalyticsFilters";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useActiveCase } from "@/hooks/useActiveCase";

export default function Analytics() {
  usePageTitle("Analytics");
  const { activeCaseId, activeCase } = useActiveCase();
  const { range, source, sentiment, windowStart, setRange, setSource, setSentiment } = useAnalyticsFilters();
  const analytics = useAnalyticsData({ activeCaseId, windowStart, source, sentiment });
  const isLoading = analytics.signalsQuery.isLoading || analytics.snapshotsQuery.isLoading || analytics.trackingRulesQuery.isLoading;

  const caseTitle = activeCase?.title ?? "All cases";
  const rangeLabel = range === "24h" ? "Last 24h" : range === "7d" ? "Last 7 days" : "Last 30 days";
  const sourceLabel = source === "all" ? "All sources" : source;
  const sentimentLabel = sentiment === "all" ? "All sentiment" : sentiment;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCase ? `Case: ${activeCase.title}` : "Production analytics across live monitoring data"}
          </p>
        </div>

        <AnalyticsFiltersBar
          range={range}
          source={source}
          sentiment={sentiment}
          onRangeChange={setRange}
          onSourceChange={setSource}
          onSentimentChange={setSentiment}
        />

        <AnalyticsStatusStrip
          cadenceMinutes={analytics.cadenceMinutes}
          lastRun={analytics.lastRun}
          freshnessStatus={analytics.freshnessStatus}
          attributionCoverage={analytics.kpis.attributionCoverage}
        />

        <AnalyticsKpiGrid kpis={analytics.kpis} isLoading={isLoading} />

        <KeywordComparisonPanel
          activeCaseId={activeCaseId}
          activeCaseTitle={activeCase?.title ?? null}
          signals={analytics.signalsQuery.data ?? []}
          isLoading={analytics.signalsQuery.isLoading}
        />

        <AnalyticsOverviewCharts
          isLoading={isLoading}
          sentimentTimeline={analytics.sentimentTimeline}
          mentionTimeline={analytics.mentionTimeline}
          sourceMix={analytics.sourceMix}
        />

        <AnalyticsDetailPanels
          isLoading={isLoading}
          topKeywords={analytics.topKeywords}
          influencers={analytics.influencers}
          recentSignals={analytics.recentSignals}
        />

        <AnalyticsExportCard
          caseTitle={caseTitle}
          rangeLabel={rangeLabel}
          sourceLabel={sourceLabel}
          sentimentLabel={sentimentLabel}
          kpis={analytics.kpis}
          topKeywords={analytics.topKeywords}
        />
      </div>
    </AppLayout>
  );
}
