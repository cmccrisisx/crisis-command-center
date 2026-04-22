export type AnalyticsSignal = {
  id: string;
  crisis_id: string | null;
  source: "twitter" | "news" | "blog" | "linkedin";
  author: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  reach: number | null;
  is_influencer: boolean | null;
  matched_keyword: string | null;
  tracking_rule_id: string | null;
  detected_at: string;
  ingested_at: string;
  source_url: string | null;
};

export type AnalyticsSnapshot = {
  id: string;
  crisis_id: string | null;
  snapshot_at: string;
  positive_pct: number | null;
  neutral_pct: number | null;
  negative_pct: number | null;
  signal_volume: number | null;
};

export type AnalyticsKpis = {
  totalMentions: number;
  negativeShare: number;
  positiveShare: number;
  estimatedReach: number;
  activeKeywords: number;
  trackedRules: number;
  medianLatencyMs: number | null;
  latestIngestAt: string | null;
  attributionCoverage: number;
};