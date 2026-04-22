import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type AnalyticsRangePreset = "24h" | "7d" | "30d";
type SignalSourceFilter = "all" | "twitter" | "news" | "blog" | "linkedin";
type SentimentFilter = "all" | "positive" | "neutral" | "negative";

const RANGE_OPTIONS: AnalyticsRangePreset[] = ["24h", "7d", "30d"];
const SOURCE_OPTIONS: SignalSourceFilter[] = ["all", "twitter", "news", "blog", "linkedin"];
const SENTIMENT_OPTIONS: SentimentFilter[] = ["all", "positive", "neutral", "negative"];

function isRangePreset(value: string | null): value is AnalyticsRangePreset {
  return value !== null && RANGE_OPTIONS.includes(value as AnalyticsRangePreset);
}

function isSourceFilter(value: string | null): value is SignalSourceFilter {
  return value !== null && SOURCE_OPTIONS.includes(value as SignalSourceFilter);
}

function isSentimentFilter(value: string | null): value is SentimentFilter {
  return value !== null && SENTIMENT_OPTIONS.includes(value as SentimentFilter);
}

export function getAnalyticsWindowStart(range: AnalyticsRangePreset) {
  const now = Date.now();
  const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  return new Date(now - hours * 60 * 60 * 1000).toISOString();
}

export function useAnalyticsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const range = isRangePreset(searchParams.get("range")) ? (searchParams.get("range") as AnalyticsRangePreset) : "7d";
  const source = isSourceFilter(searchParams.get("source")) ? (searchParams.get("source") as SignalSourceFilter) : "all";
  const sentiment = isSentimentFilter(searchParams.get("sentiment")) ? (searchParams.get("sentiment") as SentimentFilter) : "all";

  const filters = useMemo(
    () => ({
      range,
      source,
      sentiment,
      windowStart: getAnalyticsWindowStart(range),
    }),
    [range, source, sentiment]
  );

  const updateFilter = (key: "range" | "source" | "sentiment", value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, value);
        return next;
      },
      { replace: true }
    );
  };

  return {
    ...filters,
    setRange: (value: AnalyticsRangePreset) => updateFilter("range", value),
    setSource: (value: SignalSourceFilter) => updateFilter("source", value),
    setSentiment: (value: SentimentFilter) => updateFilter("sentiment", value),
  };
}

export type { AnalyticsRangePreset, SignalSourceFilter, SentimentFilter };