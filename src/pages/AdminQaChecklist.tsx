import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCcw } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useActiveCase } from "@/hooks/useActiveCase";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { formatMonitoringWindow } from "@/lib/monitoring-window";
import { useQuery } from "@tanstack/react-query";

type TimestampSourceCounts = {
  published?: number;
  modified?: number;
  inline?: number;
  fallback?: number;
};

interface QaRow {
  id: string;
  rule_id: string;
  crisis_id: string;
  last_run_at: string;
  last_crawl_window: "24h" | "7d" | "30d" | "90d";
  stale_results_skipped: number;
  total_results_considered: number;
  inserted_results: number;
  timestamp_source_counts: TimestampSourceCounts;
  tracking_rules: {
    rule_text: string;
    label: string | null;
    platform: string;
    is_active: boolean;
  } | null;
  crises: {
    title: string;
  } | null;
}

function ChecklistItem({ label, ok, helper }: { label: string; ok: boolean; helper: string }) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-border bg-surface-elevated p-3">
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-mono font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminQaChecklist() {
  usePageTitle("Admin QA Checklist");
  const { hasRole } = useAuth();
  const { activeCaseId, activeCase } = useActiveCase();

  const isAdmin = hasRole("admin");

  const qaQuery = useQuery({
    queryKey: ["admin-qa-checklist", activeCaseId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("ingestion_rule_qa")
        .select("id, rule_id, crisis_id, last_run_at, last_crawl_window, stale_results_skipped, total_results_considered, inserted_results, timestamp_source_counts, tracking_rules(rule_text, label, platform, is_active), crises(title)")
        .order("last_run_at", { ascending: false });

      if (activeCaseId) {
        query = query.eq("crisis_id", activeCaseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as QaRow[];
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const summary = useMemo(() => {
    const rows = qaQuery.data ?? [];
    const totals = rows.reduce(
      (acc, row) => {
        acc.stale += row.stale_results_skipped ?? 0;
        acc.considered += row.total_results_considered ?? 0;
        acc.inserted += row.inserted_results ?? 0;
        acc.published += Number(row.timestamp_source_counts?.published ?? 0);
        acc.modified += Number(row.timestamp_source_counts?.modified ?? 0);
        acc.inline += Number(row.timestamp_source_counts?.inline ?? 0);
        acc.fallback += Number(row.timestamp_source_counts?.fallback ?? 0);
        return acc;
      },
      { stale: 0, considered: 0, inserted: 0, published: 0, modified: 0, inline: 0, fallback: 0 }
    );

    return {
      rows,
      totals,
      latestWindow: rows[0]?.last_crawl_window ?? null,
      missingTimestampCoverage: rows.filter((row) => Number(row.timestamp_source_counts?.fallback ?? 0) > 0).length,
      staleRules: rows.filter((row) => row.stale_results_skipped > 0).length,
    };
  }, [qaQuery.data]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList className="h-4 w-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Admin QA</span>
            </div>
            <h1 className="mt-2 text-2xl font-mono font-bold tracking-tight">Crawl QA Checklist</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeCase ? `Review crawl quality for ${activeCase.title}.` : "Review recent crawl windows, extracted timestamps, and stale-result skips across rules."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => qaQuery.refetch()} disabled={qaQuery.isFetching}>
              <RefreshCcw className={qaQuery.isFetching ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button asChild variant="ghost" size="sm" className="font-mono text-xs">
              <Link to="/tracking-manager">Open Tracking Manager</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Last crawl window"
            value={summary.latestWindow ? formatMonitoringWindow(summary.latestWindow) : "No runs"}
            helper="Most recent crawl scope captured from saved rule settings."
          />
          <StatCard
            label="Rules audited"
            value={String(summary.rows.length)}
            helper="Tracking rules with stored QA telemetry from the latest crawl runs."
          />
          <StatCard
            label="Stale skipped"
            value={String(summary.totals.stale)}
            helper="Results rejected because their timestamps fell outside the crawl window."
          />
          <StatCard
            label="Fallback timestamps"
            value={String(summary.totals.fallback)}
            helper="Results that had no extracted published or modified date and fell back to ingest time."
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-mono">Checklist status</CardTitle>
            <CardDescription>Quick pass/fail checks for crawl freshness and timestamp extraction.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <ChecklistItem
              label="Crawl window recorded"
              ok={summary.rows.length > 0 && summary.rows.every((row) => Boolean(row.last_crawl_window))}
              helper="Every tracked rule should expose the last monitoring window used during crawl." 
            />
            <ChecklistItem
              label="Timestamp sources extracted"
              ok={summary.rows.length > 0 && summary.rows.some((row) => Number(row.timestamp_source_counts?.published ?? 0) + Number(row.timestamp_source_counts?.modified ?? 0) > 0)}
              helper="Published and modified timestamps should be captured whenever source metadata exposes them."
            />
            <ChecklistItem
              label="Stale skips visible by rule"
              ok={summary.rows.length > 0}
              helper="Admins can inspect stale-result skips per rule to confirm freshness enforcement is active."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-mono">Rule-level crawl telemetry</CardTitle>
            <CardDescription>Each row captures the most recent crawl run recorded for that tracking rule.</CardDescription>
          </CardHeader>
          <CardContent>
            {qaQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : summary.rows.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-foreground">No crawl QA data yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Run the ingestion job once to populate this checklist.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Case</TableHead>
                    <TableHead>Window</TableHead>
                    <TableHead>Timestamp sources</TableHead>
                    <TableHead className="text-right">Stale skipped</TableHead>
                    <TableHead className="text-right">Inserted</TableHead>
                    <TableHead>Last run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.rows.map((row) => {
                    const sources = row.timestamp_source_counts ?? {};
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{row.tracking_rules?.label || row.tracking_rules?.rule_text || "Unnamed rule"}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-[10px] font-mono uppercase">{row.tracking_rules?.platform ?? "all"}</Badge>
                              {!row.tracking_rules?.is_active && <Badge variant="secondary" className="text-[10px] font-mono uppercase">inactive</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.crises?.title ?? "Unknown case"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">{formatMonitoringWindow(row.last_crawl_window)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[10px] font-mono">Pub {Number(sources.published ?? 0)}</Badge>
                            <Badge variant="outline" className="text-[10px] font-mono">Mod {Number(sources.modified ?? 0)}</Badge>
                            <Badge variant="outline" className="text-[10px] font-mono">Inline {Number(sources.inline ?? 0)}</Badge>
                            <Badge variant={Number(sources.fallback ?? 0) > 0 ? "secondary" : "outline"} className="text-[10px] font-mono">Fallback {Number(sources.fallback ?? 0)}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{row.stale_results_skipped}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{row.inserted_results}/{row.total_results_considered}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.last_run_at), { addSuffix: true })}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}