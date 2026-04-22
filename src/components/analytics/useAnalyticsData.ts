import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AnalyticsKpis, AnalyticsSignal, AnalyticsSnapshot } from "@/components/analytics/types";
import type { SentimentFilter, SignalSourceFilter } from "@/hooks/useAnalyticsFilters";

type CronJob = {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  command?: string | null;
  last_start: string | null;
};

function parseFunctionName(command?: string | null) {
  if (!command) return null;
  return command.match(/\/functions\/v1\/([a-zA-Z0-9_-]+)/)?.[1] ?? null;
}

function parseScheduleIntervalMinutes(schedule?: string | null) {
  if (!schedule) return null;
  if (schedule === "* * * * *") return 1;
  const minuteStep = schedule.match(/^\*\/(\d+) \* \* \* \*$/);
  if (minuteStep) return Number(minuteStep[1]);
  return null;
}

function buildSignalsQuery(activeCaseId: string | null, windowStart: string, source: SignalSourceFilter, sentiment: SentimentFilter) {
  let query = supabase
    .from("signals")
    .select("id, crisis_id, source, author, author_followers, content, created_at, sentiment, reach, is_influencer, keywords, matched_keyword, tracking_rule_id, detected_at, ingested_at, source_url")
    .gte("detected_at", windowStart)
    .order("detected_at", { ascending: false });

  if (activeCaseId) query = query.eq("crisis_id", activeCaseId);
  if (source !== "all") query = query.eq("source", source);
  if (sentiment !== "all") query = query.eq("sentiment", sentiment);

  return query;
}

export function useAnalyticsData({
  activeCaseId,
  windowStart,
  source,
  sentiment,
}: {
  activeCaseId: string | null;
  windowStart: string;
  source: SignalSourceFilter;
  sentiment: SentimentFilter;
}) {
  const signalsQuery = useQuery({
    queryKey: ["analytics-signals-v2", activeCaseId ?? "all", windowStart, source, sentiment],
    queryFn: async () => {
      const { data, error } = await buildSignalsQuery(activeCaseId, windowStart, source, sentiment);
      if (error) throw error;
      return (data ?? []) as AnalyticsSignal[];
    },
  });

  const snapshotsQuery = useQuery({
    queryKey: ["analytics-snapshots-v2", activeCaseId ?? "all", windowStart],
    queryFn: async () => {
      let query = supabase
        .from("reputation_snapshots")
        .select("id, crisis_id, snapshot_at, positive_pct, neutral_pct, negative_pct, signal_volume")
        .gte("snapshot_at", windowStart)
        .order("snapshot_at", { ascending: true });

      if (activeCaseId) query = query.eq("crisis_id", activeCaseId);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AnalyticsSnapshot[];
    },
  });

  const trackingRulesQuery = useQuery({
    queryKey: ["analytics-rules", activeCaseId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("tracking_rules").select("id, rule_text, is_active, rule_type, crisis_id").eq("rule_type", "keyword");
      if (activeCaseId) query = query.eq("crisis_id", activeCaseId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; rule_text: string; is_active: boolean; rule_type: string; crisis_id: string }>;
    },
  });

  const cronQuery = useQuery({
    queryKey: ["analytics-cron-status"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cron_jobs_status" as never);
      if (error) throw error;
      return ((data ?? []) as CronJob[]).filter((job) => parseFunctionName(job.command) === "ingest-signals");
    },
  });

  const liveSignals = signalsQuery.data ?? [];
  const snapshots = snapshotsQuery.data ?? [];
  const rules = trackingRulesQuery.data ?? [];
  const ingestJob = (cronQuery.data ?? [])[0] ?? null;

  const derived = useMemo(() => {
    const totalMentions = liveSignals.length;
    const negativeCount = liveSignals.filter((signal) => signal.sentiment === "negative").length;
    const positiveCount = liveSignals.filter((signal) => signal.sentiment === "positive").length;
    const estimatedReach = liveSignals.reduce((sum, signal) => sum + (signal.reach ?? 0), 0);
    const activeKeywordRules = rules.filter((rule) => rule.is_active);
    const attributionCount = liveSignals.filter((signal) => Boolean(signal.matched_keyword) && Boolean(signal.tracking_rule_id)).length;
    const attributionCoverage = totalMentions > 0 ? (attributionCount / totalMentions) * 100 : 0;

    const latencies = liveSignals
      .map((signal) => new Date(signal.ingested_at).getTime() - new Date(signal.detected_at).getTime())
      .filter((value) => Number.isFinite(value) && value >= 0)
      .sort((a, b) => a - b);

    const medianLatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : null;
    const latestIngestAt = liveSignals[0]?.ingested_at ?? ingestJob?.last_start ?? null;
    const cadenceMinutes = parseScheduleIntervalMinutes(ingestJob?.schedule ?? null);
    const freshnessMinutes = latestIngestAt ? (Date.now() - new Date(latestIngestAt).getTime()) / 60_000 : null;
    const freshnessStatus: "healthy" | "delayed" | "stale" | "unknown" =
      cadenceMinutes == null || freshnessMinutes == null
        ? "unknown"
        : freshnessMinutes <= cadenceMinutes * 2
          ? "healthy"
          : freshnessMinutes <= cadenceMinutes * 4
            ? "delayed"
            : "stale";

    const timelineMap = new Map<string, { positive: number; neutral: number; negative: number; volume: number }>();

    liveSignals.forEach((signal) => {
      const key = new Date(signal.detected_at).toISOString().slice(0, 13);
      const row = timelineMap.get(key) ?? { positive: 0, neutral: 0, negative: 0, volume: 0 };
      row[signal.sentiment] += 1;
      row.volume += 1;
      timelineMap.set(key, row);
    });

    const sentimentTimeline = (snapshots.length > 0
      ? snapshots.map((snapshot) => ({
          time: new Date(snapshot.snapshot_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" }),
          positive: Number(snapshot.positive_pct ?? 0),
          neutral: Number(snapshot.neutral_pct ?? 0),
          negative: Number(snapshot.negative_pct ?? 0),
        }))
      : [...timelineMap.entries()].map(([key, row]) => ({
          time: new Date(`${key}:00:00.000Z`).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" }),
          positive: row.positive,
          neutral: row.neutral,
          negative: row.negative,
        }))).slice(-12);

    const mentionTimeline = [...timelineMap.entries()]
      .map(([key, row]) => ({ time: new Date(`${key}:00:00.000Z`).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" }), volume: row.volume }))
      .slice(-12);

    const sourceMap = liveSignals.reduce<Record<string, number>>((acc, signal) => {
      const label = signal.source === "twitter" ? "Twitter / X" : signal.source === "news" ? "News" : signal.source === "blog" ? "Blogs" : "LinkedIn";
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
    const sourceMix = Object.entries(sourceMap).map(([sourceLabel, volume]) => ({ source: sourceLabel, volume }));

    const keywordMap = liveSignals.reduce<Record<string, { mentions: number; reach: number; negative: number }>>((acc, signal) => {
      const key = signal.matched_keyword ?? "Unattributed";
      if (!acc[key]) acc[key] = { mentions: 0, reach: 0, negative: 0 };
      acc[key].mentions += 1;
      acc[key].reach += signal.reach ?? 0;
      if (signal.sentiment === "negative") acc[key].negative += 1;
      return acc;
    }, {});

    const topKeywords = Object.entries(keywordMap)
      .map(([keyword, values]) => ({
        keyword,
        mentions: values.mentions,
        reach: values.reach,
        negativeShare: values.mentions > 0 ? (values.negative / values.mentions) * 100 : 0,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 8);

    const influencerMap = liveSignals
      .filter((signal) => signal.is_influencer)
      .reduce<Record<string, { name: string; mentions: number; reach: number; sentimentSum: number }>>((acc, signal) => {
        if (!acc[signal.author]) acc[signal.author] = { name: signal.author, mentions: 0, reach: 0, sentimentSum: 0 };
        acc[signal.author].mentions += 1;
        acc[signal.author].reach = Math.max(acc[signal.author].reach, signal.reach ?? 0);
        acc[signal.author].sentimentSum += signal.sentiment === "negative" ? -1 : signal.sentiment === "positive" ? 1 : 0;
        return acc;
      }, {});

    const influencers = Object.values(influencerMap)
      .map((entry) => ({ ...entry, sentiment: entry.mentions > 0 ? entry.sentimentSum / entry.mentions : 0 }))
      .sort((a, b) => b.reach - a.reach)
      .slice(0, 8);

    const recentSignals = liveSignals.slice(0, 12).map((signal) => ({
      id: signal.id,
      matchedKeyword: signal.matched_keyword,
      source: signal.source,
      sentiment: signal.sentiment,
      author: signal.author,
      detectedAt: signal.detected_at,
      latencyMs: new Date(signal.ingested_at).getTime() - new Date(signal.detected_at).getTime(),
      sourceUrl: signal.source_url,
    }));

    const kpis: AnalyticsKpis = {
      totalMentions,
      negativeShare: totalMentions > 0 ? (negativeCount / totalMentions) * 100 : 0,
      positiveShare: totalMentions > 0 ? (positiveCount / totalMentions) * 100 : 0,
      estimatedReach,
      activeKeywords: activeKeywordRules.length,
      trackedRules: rules.length,
      medianLatencyMs,
      latestIngestAt,
      attributionCoverage,
    };

    return {
      kpis,
      cadenceMinutes,
      lastRun: ingestJob?.last_start ?? null,
      freshnessStatus,
      sentimentTimeline,
      mentionTimeline,
      sourceMix,
      topKeywords,
      influencers,
      recentSignals,
    };
  }, [ingestJob, liveSignals, rules, snapshots]);

  return {
    signalsQuery,
    snapshotsQuery,
    trackingRulesQuery,
    cronQuery,
    ...derived,
  };
}