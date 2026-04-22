import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Clock3, ExternalLink, Radio, RefreshCw, Siren, Target } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CrisisOption = {
  id: string;
  title: string;
};

type RuleSummary = {
  id: string;
  crisis_id: string;
  rule_text: string;
  is_active: boolean;
};

type LiveSignal = {
  id: string;
  crisis_id: string | null;
  author: string;
  content: string;
  source: "twitter" | "news" | "blog" | "linkedin";
  sentiment: "positive" | "neutral" | "negative";
  source_url: string | null;
  matched_keyword: string | null;
  tracking_rule_id: string | null;
  detected_at: string;
  ingested_at: string | null;
};

type CronJob = {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  last_start: string | null;
  last_status: string | null;
  last_duration_ms: number | null;
};

const SOURCE_LABELS: Record<LiveSignal["source"], string> = {
  twitter: "Twitter / X",
  news: "News",
  blog: "Blog",
  linkedin: "LinkedIn",
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

function formatLatency(ms: number | null) {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function formatAge(timestamp?: string | null) {
  if (!timestamp) return "No recent ingest";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3_600_000) return `${Math.round(diffMs / 60_000)}m ago`;
  return `${Math.round(diffMs / 3_600_000)}h ago`;
}

function StatCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "positive" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-sm border px-3 py-3",
        tone === "positive" && "border-primary/30 bg-primary/5",
        tone === "warning" && "border-crisis-amber/30 bg-accent",
        tone === "default" && "border-border bg-surface-elevated"
      )}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-mono font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}

export function LiveMonitoringPanel({
  crises,
  selectedCaseId,
  rules,
}: {
  crises: CrisisOption[];
  selectedCaseId: string;
  rules: RuleSummary[];
}) {
  const queryClient = useQueryClient();
  const defaultCaseId = useMemo(() => {
    const ihs = crises.find((crisis) => crisis.title.toLowerCase().includes("ihs nigeria"));
    return ihs?.id ?? crises[0]?.id ?? null;
  }, [crises]);

  const [monitorCaseId, setMonitorCaseId] = useState<string | null>(
    selectedCaseId !== "all" ? selectedCaseId : defaultCaseId
  );

  useEffect(() => {
    if (selectedCaseId !== "all") {
      setMonitorCaseId(selectedCaseId);
      return;
    }
    setMonitorCaseId((current) => current ?? defaultCaseId);
  }, [selectedCaseId, defaultCaseId]);

  const monitorCase = crises.find((crisis) => crisis.id === monitorCaseId) ?? null;
  const activeRulesForCase = useMemo(
    () => rules.filter((rule) => rule.crisis_id === monitorCaseId && rule.is_active),
    [rules, monitorCaseId]
  );

  const { data: cronJobs = [], isLoading: cronLoading } = useQuery({
    queryKey: ["cron-jobs-status", "live-monitor"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cron_jobs_status" as never);
      if (error) throw error;
      return ((data ?? []) as CronJob[]).filter((job) => parseFunctionName((job as CronJob & { command?: string }).command) === "ingest-signals");
    },
  });

  const { data: liveSignals = [], isLoading: signalsLoading } = useQuery({
    queryKey: ["live-signals", monitorCaseId],
    enabled: !!monitorCaseId,
    refetchInterval: 20_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("id, crisis_id, author, content, source, sentiment, source_url, matched_keyword, tracking_rule_id, detected_at, ingested_at")
        .eq("crisis_id", monitorCaseId)
        .order("ingested_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return (data ?? []) as LiveSignal[];
    },
  });

  useEffect(() => {
    if (!monitorCaseId) return;

    const channel = supabase
      .channel(`live-monitor-${monitorCaseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals", filter: `crisis_id=eq.${monitorCaseId}` },
        (payload) => {
          const next = payload.new as LiveSignal;
          queryClient.setQueryData<LiveSignal[]>(["live-signals", monitorCaseId], (current) => {
            const existing = current ?? [];
            if (existing.some((signal) => signal.id === next.id)) return existing;
            return [next, ...existing].slice(0, 12);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [monitorCaseId, queryClient]);

  const runNowMutation = useMutation({
    mutationFn: async () => {
      if (!monitorCaseId) throw new Error("Choose a case first");
      const { data, error } = await supabase.functions.invoke("ingest-signals", {
        body: { crisisId: monitorCaseId },
      });
      if (error) throw error;
      return data as { inserted?: number; errors?: string[] };
    },
    onSuccess: (data) => {
      toast.success("Live scan triggered", {
        description: typeof data?.inserted === "number" ? `${data.inserted} new signals ingested.` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["live-signals", monitorCaseId] });
      queryClient.invalidateQueries({ queryKey: ["cron-jobs-status", "live-monitor"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to trigger live scan");
    },
  });

  const ingestJob = cronJobs[0] ?? null;
  const cadenceMinutes = parseScheduleIntervalMinutes(ingestJob?.schedule ?? null);
  const latestSignal = liveSignals[0] ?? null;
  const latestIngestAt = latestSignal?.ingested_at ?? ingestJob?.last_start ?? null;
  const freshnessMinutes = latestIngestAt ? (Date.now() - new Date(latestIngestAt).getTime()) / 60_000 : null;
  const freshnessStatus =
    cadenceMinutes == null || freshnessMinutes == null
      ? "unknown"
      : freshnessMinutes <= cadenceMinutes * 2
        ? "healthy"
        : freshnessMinutes <= cadenceMinutes * 4
          ? "delayed"
          : "stale";

  const latencies = liveSignals
    .map((signal) => {
      if (!signal.ingested_at || !signal.detected_at) return null;
      return new Date(signal.ingested_at).getTime() - new Date(signal.detected_at).getTime();
    })
    .filter((value): value is number => value != null)
    .sort((a, b) => a - b);

  const medianLatency = latencies.length > 0 ? latencies[Math.floor(latencies.length / 2)] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Live monitoring status</CardTitle>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Verify cadence, freshness, and exact matched keywords for the selected case in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedCaseId === "all" ? (
              <div className="flex flex-wrap gap-2">
                {crises.slice(0, 6).map((crisis) => (
                  <Button
                    key={crisis.id}
                    type="button"
                    size="sm"
                    variant={monitorCaseId === crisis.id ? "default" : "outline"}
                    className="font-mono text-[11px] uppercase tracking-wider"
                    onClick={() => setMonitorCaseId(crisis.id)}
                  >
                    {crisis.title}
                  </Button>
                ))}
              </div>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="font-mono text-[11px] uppercase tracking-wider"
              onClick={() => runNowMutation.mutate()}
              disabled={!monitorCaseId || runNowMutation.isPending}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", runNowMutation.isPending && "animate-spin")} />
              Run now
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
            {monitorCase?.title ?? "Select a case"}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[10px] uppercase tracking-wide",
              freshnessStatus === "healthy" && "border-primary/30 text-primary",
              freshnessStatus === "delayed" && "border-crisis-amber/30 text-foreground",
              freshnessStatus === "stale" && "border-destructive/30 text-destructive"
            )}
          >
            {freshnessStatus === "healthy"
              ? "Live monitoring active"
              : freshnessStatus === "delayed"
                ? "Freshness delayed"
                : freshnessStatus === "stale"
                  ? "Freshness stale"
                  : "Waiting for cadence"}
          </Badge>
          {ingestJob?.active ? (
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
              cadence {cadenceMinutes ? `every ${cadenceMinutes}m` : ingestJob.schedule}
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
              Job paused
            </Badge>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Cadence"
            value={cadenceMinutes ? `${cadenceMinutes}m` : cronLoading ? "…" : "—"}
            helper={ingestJob?.last_start ? `Last run ${formatAge(ingestJob.last_start)}` : "Waiting for scheduler details"}
            tone="positive"
          />
          <StatCard
            label="Active keywords"
            value={String(activeRulesForCase.length)}
            helper={activeRulesForCase.length > 0 ? "Rules currently eligible for ingestion" : "Add or activate a keyword to begin monitoring"}
          />
          <StatCard
            label="Last alert"
            value={latestIngestAt ? formatAge(latestIngestAt) : "—"}
            helper={latestSignal?.matched_keyword ? `Matched ${latestSignal.matched_keyword}` : "No recent signals for this case"}
            tone={freshnessStatus === "healthy" ? "positive" : freshnessStatus === "stale" ? "warning" : "default"}
          />
          <StatCard
            label="Median latency"
            value={formatLatency(medianLatency)}
            helper="Pipeline time from detection to ingest"
          />
        </div>

        <div className="rounded-sm border border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-primary" />
              <p className="text-xs font-mono uppercase tracking-wider text-foreground">Recent matched alerts</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Latest 12 signals for this case</p>
          </div>

          <div className="divide-y divide-border">
            {signalsLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : liveSignals.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No live alerts yet for this case.</p>
              </div>
            ) : (
              liveSignals.map((signal) => {
                const latency = signal.ingested_at
                  ? new Date(signal.ingested_at).getTime() - new Date(signal.detected_at).getTime()
                  : null;

                return (
                  <div key={signal.id} className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
                          {signal.matched_keyword ?? "Matched keyword unavailable"}
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wide">
                          {SOURCE_LABELS[signal.source]}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
                          {signal.sentiment}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{signal.author}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{signal.content}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 text-[11px] text-muted-foreground lg:items-end">
                      <div className="flex flex-wrap items-center gap-3 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatAge(signal.ingested_at ?? signal.detected_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5" />
                          latency {formatLatency(latency)}
                        </span>
                        {signal.tracking_rule_id ? (
                          <span className="inline-flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" />
                            linked rule
                          </span>
                        ) : null}
                      </div>

                      {signal.source_url ? (
                        <Button asChild type="button" variant="ghost" size="sm" className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider">
                          <a href={signal.source_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open source
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}