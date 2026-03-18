// Crisis X — Types & Utility Functions
// All data now comes from Lovable Cloud (Supabase). This file only exports types and helpers.

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type SentimentType = "positive" | "neutral" | "negative";
export type CrisisType = "pr" | "regulatory" | "operational";
export type SignalSource = "twitter" | "news" | "blog" | "linkedin";

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "critical": return "risk-critical";
    case "high": return "risk-high";
    case "medium": return "risk-medium";
    case "low": return "risk-low";
  }
}

export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case "positive": return "crisis-green";
    case "neutral": return "crisis-blue";
    case "negative": return "crisis-red";
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function getSourceIcon(source: SignalSource): string {
  switch (source) {
    case "twitter": return "𝕏";
    case "news": return "📰";
    case "blog": return "📝";
    case "linkedin": return "in";
  }
}
