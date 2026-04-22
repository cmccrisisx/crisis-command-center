import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatNumber } from "@/lib/crisis-helpers";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/lib/recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Signal = Tables<"signals">;

interface KeywordComparisonPanelProps {
  activeCaseId: string | null;
  activeCaseTitle?: string | null;
  signals: Signal[];
  isLoading: boolean;
}

const chartStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "4px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
};

const normalizeKeyword = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

const getTopPlatforms = (signals: Signal[]) => {
  const counts = signals.reduce<Record<string, number>>((acc, signal) => {
    const platform = signal.source === "twitter" ? "Twitter/X" : signal.source === "news" ? "News" : signal.source === "blog" ? "Blogs" : "LinkedIn";
    acc[platform] = (acc[platform] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([platform]) => platform);
};

const signalMatchesKeyword = (signal: Signal, keyword: string) => {
  const normalized = normalizeKeyword(keyword);
  const keywordMatch = signal.keywords?.some((entry) => normalizeKeyword(entry) === normalized) ?? false;
  if (keywordMatch) return true;
  return signal.content.toLowerCase().includes(normalized);
};

export function KeywordComparisonPanel({ activeCaseId, activeCaseTitle, signals, isLoading }: KeywordComparisonPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: availableKeywords = [], isLoading: keywordsLoading } = useQuery({
    queryKey: ["analytics-compare-keywords", activeCaseId ?? "all"],
    enabled: Boolean(activeCaseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracking_rules")
        .select("rule_text")
        .eq("rule_type", "keyword")
        .eq("crisis_id", activeCaseId as string)
        .order("priority", { ascending: true })
        .order("rule_text", { ascending: true });

      if (error) throw error;
      return Array.from(new Set((data ?? []).map((row) => row.rule_text))).sort((a, b) => a.localeCompare(b));
    },
  });

  const selectedKeywords = useMemo(() => searchParams.getAll("compare").map((value) => value.trim()).filter(Boolean), [searchParams]);

  useEffect(() => {
    if (!selectedKeywords.length) return;
    if (!activeCaseId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("compare");
        return next;
      }, { replace: true });
      return;
    }

    const availableNormalized = new Set(availableKeywords.map((keyword) => normalizeKeyword(keyword)));
    const filtered = selectedKeywords.filter((keyword) => availableNormalized.has(normalizeKeyword(keyword))).slice(0, 5);

    if (filtered.length === selectedKeywords.length) return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("compare");
      filtered.forEach((keyword) => next.append("compare", keyword));
      return next;
    }, { replace: true });
  }, [activeCaseId, availableKeywords, selectedKeywords, setSearchParams]);

  const setSelectedKeywords = (nextKeywords: string[]) => {
    const limited = nextKeywords.slice(0, 5);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("compare");
      limited.forEach((keyword) => next.append("compare", keyword));
      return next;
    }, { replace: true });
  };

  const toggleKeyword = (keyword: string) => {
    const normalizedKeyword = normalizeKeyword(keyword);
    const exists = selectedKeywords.some((entry) => normalizeKeyword(entry) === normalizedKeyword);
    if (exists) {
      setSelectedKeywords(selectedKeywords.filter((entry) => normalizeKeyword(entry) !== normalizedKeyword));
      return;
    }
    setSelectedKeywords([...selectedKeywords, keyword]);
  };

  const comparisonMetrics = useMemo(() => {
    return selectedKeywords.slice(0, 5).map((keyword) => {
      const matchedSignals = signals.filter((signal) => signalMatchesKeyword(signal, keyword));
      const sentiment = matchedSignals.reduce(
        (acc, signal) => {
          acc[signal.sentiment] += 1;
          return acc;
        },
        { positive: 0, neutral: 0, negative: 0 }
      );

      return {
        keyword,
        mentions: matchedSignals.length,
        positive: sentiment.positive,
        neutral: sentiment.neutral,
        negative: sentiment.negative,
        latestMention: matchedSignals[0]?.detected_at ?? null,
        reach: matchedSignals.reduce((sum, signal) => sum + (signal.reach ?? 0), 0),
        topPlatforms: getTopPlatforms(matchedSignals),
      };
    });
  }, [selectedKeywords, signals]);

  const chartData = comparisonMetrics.map((entry) => ({ keyword: entry.keyword, mentions: entry.mentions }));

  if (!activeCaseId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Keyword comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Choose a case first to compare tracked keywords inside analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Keyword comparison</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeCaseTitle ? `${activeCaseTitle} • choose 2–5 saved keywords for side-by-side analytics` : "Choose 2–5 saved keywords for side-by-side analytics"}
            </p>
          </div>
          {selectedKeywords.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" className="font-mono text-xs uppercase tracking-wider" onClick={() => setSelectedKeywords([])}>
              Clear
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {keywordsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-28" />
            ))}
          </div>
        ) : availableKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableKeywords.map((keyword) => {
              const isSelected = selectedKeywords.some((entry) => normalizeKeyword(entry) === normalizeKeyword(keyword));
              const disableNewPick = !isSelected && selectedKeywords.length >= 5;
              return (
                <Button
                  key={keyword}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className="font-mono text-xs"
                  disabled={disableNewPick}
                  onClick={() => toggleKeyword(keyword)}
                >
                  {keyword}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Save a few keywords in Tracking Manager to unlock comparison here.</p>
        )}

        {isLoading ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : comparisonMetrics.length >= 2 ? (
          <>
            <div className="grid gap-4 xl:grid-cols-3">
              {comparisonMetrics.map((entry) => (
                <div key={entry.keyword} className="rounded-sm border border-border bg-surface-elevated p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.keyword}</p>
                      <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{entry.mentions} mentions</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">Reach {formatNumber(entry.reach)}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-sm border border-border bg-card px-2 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Positive</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{entry.positive}</p>
                    </div>
                    <div className="rounded-sm border border-border bg-card px-2 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Neutral</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{entry.neutral}</p>
                    </div>
                    <div className="rounded-sm border border-border bg-card px-2 py-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Negative</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{entry.negative}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      Latest mention: {entry.latestMention ? new Date(entry.latestMention).toLocaleString() : "No live mentions yet"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.topPlatforms.length > 0 ? entry.topPlatforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="font-mono text-[10px] uppercase tracking-wide">{platform}</Badge>
                      )) : <span className="text-[11px] text-muted-foreground">No platform signal yet</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="keyword" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={chartStyle} />
                  <Bar dataKey="mentions" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Choose at least 2 keywords to compare mention volume, sentiment, freshness, and platform mix.</p>
        )}
      </CardContent>
    </Card>
  );
}
