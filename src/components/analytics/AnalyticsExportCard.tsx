import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { exportToPDF } from "@/lib/pdf-export";
import { toast } from "sonner";
import { formatNumber } from "@/lib/crisis-helpers";
import type { AnalyticsKpis } from "@/components/analytics/types";

export function AnalyticsExportCard({
  caseTitle,
  rangeLabel,
  sourceLabel,
  sentimentLabel,
  monitoringWindowLabel,
  kpis,
  topKeywords,
}: {
  caseTitle: string;
  rangeLabel: string;
  sourceLabel: string;
  sentimentLabel: string;
  monitoringWindowLabel: string;
  kpis: AnalyticsKpis | null;
  topKeywords: Array<{ keyword: string; mentions: number; reach: number }>;
}) {
  const handleExport = () => {
    exportToPDF({
      title: `${caseTitle} Analytics Snapshot`,
      subtitle: `Analytics Export — Crisis-X`,
      sections: [
        {
          title: "Filter scope",
          content: `Case: ${caseTitle}\nRange: ${rangeLabel}\nMonitoring window: ${monitoringWindowLabel}\nSource: ${sourceLabel}\nSentiment: ${sentimentLabel}`,
        },
        {
          title: "KPI summary",
          content: kpis
            ? `Total mentions: ${formatNumber(kpis.totalMentions)}\nNegative share: ${kpis.negativeShare.toFixed(1)}%\nPositive share: ${kpis.positiveShare.toFixed(1)}%\nEstimated reach: ${formatNumber(kpis.estimatedReach)}\nTracked keywords: ${kpis.activeKeywords}\nMedian latency: ${kpis.medianLatencyMs == null ? "—" : `${Math.round(kpis.medianLatencyMs / 1000)}s`}\nAttribution coverage: ${kpis.attributionCoverage.toFixed(1)}%`
            : "No KPI data available.",
        },
        {
          title: "Top matched keywords",
          content: topKeywords.length > 0
            ? topKeywords.map((item) => `- ${item.keyword}: ${item.mentions} mentions · reach ${formatNumber(item.reach)}`).join("\n")
            : "No matched keyword performance in the current range.",
        },
      ],
    });

    toast.success("Analytics snapshot PDF downloaded");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono uppercase tracking-wider">Export snapshot</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-foreground">Generate a portable readout of the active analytics scope.</p>
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Includes filters, KPI summary, and matched keyword performance.
          </p>
        </div>

        <Button type="button" variant="outline" size="sm" className="h-8 text-[11px] font-mono uppercase tracking-wider" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </CardContent>
    </Card>
  );
}