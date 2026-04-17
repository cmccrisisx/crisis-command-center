import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, AlertCircle, Loader2, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  command: string;
  last_start: string | null;
  last_end: string | null;
  last_status: string | null;
  last_duration_ms: number | null;
}

function parseFunctionName(command: string): string | null {
  const m = command.match(/\/functions\/v1\/([a-zA-Z0-9_-]+)/);
  return m?.[1] ?? null;
}

function parseBody(command: string): Record<string, unknown> | undefined {
  const m = command.match(/jsonb_build_object\(([^)]*)\)/i);
  if (!m) return undefined;
  try {
    const parts = m[1].split(",").map((p) => p.trim().replace(/^'/, "").replace(/'$/, ""));
    const obj: Record<string, unknown> = {};
    for (let i = 0; i + 1 < parts.length; i += 2) {
      obj[parts[i]] = parts[i + 1];
    }
    return obj;
  } catch {
    return undefined;
  }
}

export function CronJobsPanel() {
  const queryClient = useQueryClient();
  const [runningId, setRunningId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["cron-jobs-status"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cron_jobs_status" as any);
      if (error) throw error;
      return (data ?? []) as CronJob[];
    },
  });

  const runNow = async (job: CronJob) => {
    const fnName = parseFunctionName(job.command);
    if (!fnName) {
      toast.error("Could not detect the edge function in this cron command.");
      return;
    }
    setRunningId(job.jobid);
    const body = parseBody(job.command);
    try {
      const { error } = await supabase.functions.invoke(fnName, { body: body ?? {} });
      if (error) throw error;
      toast.success(`Triggered ${fnName}`);
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["cron-jobs-status"] }), 1500);
    } catch (e) {
      toast.error(`Failed to run ${fnName}: ${(e as Error).message}`);
    } finally {
      setRunningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs font-mono text-muted-foreground">
        Failed to load cron jobs: {(error as Error).message}
      </p>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-xs font-mono text-muted-foreground">No scheduled jobs.</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((job) => {
        const status = (job.last_status ?? "").toLowerCase();
        const Icon =
          status === "succeeded"
            ? CheckCircle2
            : status === "failed"
              ? AlertCircle
              : status === "running" || status === "starting"
                ? Loader2
                : Clock;
        const iconClass =
          status === "succeeded"
            ? "text-crisis-green"
            : status === "failed"
              ? "text-crisis-red"
              : status === "running" || status === "starting"
                ? "text-crisis-blue animate-spin"
                : "text-muted-foreground";

        return (
          <div
            key={job.jobid}
            className="flex items-start justify-between gap-3 rounded-md border border-border/50 bg-card/50 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
                <span className="font-mono text-sm font-medium truncate">{job.jobname}</span>
                {!job.active && (
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    paused
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground">
                <span>schedule: {job.schedule}</span>
                {job.last_start && (
                  <span>
                    last run:{" "}
                    {formatDistanceToNow(new Date(job.last_start), { addSuffix: true })}
                  </span>
                )}
                {job.last_duration_ms != null && (
                  <span>took: {Math.round(job.last_duration_ms)}ms</span>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`font-mono text-[10px] uppercase shrink-0 ${
                status === "succeeded"
                  ? "border-crisis-green/30 text-crisis-green bg-crisis-green/5"
                  : status === "failed"
                    ? "border-crisis-red/30 text-crisis-red bg-crisis-red/5"
                    : "border-border text-muted-foreground"
              }`}
            >
              {job.last_status ?? "never run"}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
