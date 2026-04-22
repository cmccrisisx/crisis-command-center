import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnalyticsRangePreset, SentimentFilter, SignalSourceFilter } from "@/hooks/useAnalyticsFilters";

const SOURCE_OPTIONS: Array<{ value: SignalSourceFilter; label: string }> = [
  { value: "all", label: "All sources" },
  { value: "twitter", label: "Twitter / X" },
  { value: "news", label: "News" },
  { value: "blog", label: "Blogs" },
  { value: "linkedin", label: "LinkedIn" },
];

const SENTIMENT_OPTIONS: Array<{ value: SentimentFilter; label: string }> = [
  { value: "all", label: "All sentiment" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

const RANGE_OPTIONS: Array<{ value: AnalyticsRangePreset; label: string }> = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
];

export function AnalyticsFiltersBar({
  range,
  source,
  sentiment,
  onRangeChange,
  onSourceChange,
  onSentimentChange,
}: {
  range: AnalyticsRangePreset;
  source: SignalSourceFilter;
  sentiment: SentimentFilter;
  onRangeChange: (value: AnalyticsRangePreset) => void;
  onSourceChange: (value: SignalSourceFilter) => void;
  onSentimentChange: (value: SentimentFilter) => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-card px-3 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">Scoped analytics</Badge>
          <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Live data only</Badge>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={range} onValueChange={(value) => onRangeChange(value as AnalyticsRangePreset)}>
            <SelectTrigger className="h-8 w-[140px] text-xs font-mono">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs font-mono">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={source} onValueChange={(value) => onSourceChange(value as SignalSourceFilter)}>
            <SelectTrigger className="h-8 w-[150px] text-xs font-mono">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs font-mono">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sentiment} onValueChange={(value) => onSentimentChange(value as SentimentFilter)}>
            <SelectTrigger className="h-8 w-[150px] text-xs font-mono">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs font-mono capitalize">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" size="sm" className="h-8 text-[11px] font-mono uppercase tracking-wider" onClick={() => {
            onRangeChange("7d");
            onSourceChange("all");
            onSentimentChange("all");
          }}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}