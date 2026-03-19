import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CrisisAIPanel } from "@/components/CrisisAIPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/crisis-helpers";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingDown, Radio, MessageSquare, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCrisisDialog } from "@/components/CreateCrisisDialog";
import { CrisisStatusCard } from "@/components/CrisisStatusCard";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type Signal = Tables<"signals">;
type Crisis = Tables<"crises">;
type Narrative = Tables<"narratives">;
type ReputationSnapshot = Tables<"reputation_snapshots">;

function StatCard({ label, value, icon: Icon, accent, loading }: { label: string; value: string; icon: React.ElementType; accent?: string; loading?: boolean }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className={`text-2xl font-mono font-bold tabular-nums mt-1 ${accent || "text-foreground"}`}>{value}</p>
            )}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch latest signals from DB
  const { data: dbSignals = [] } = useQuery({
    queryKey: ["dashboard-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Signal[];
    },
  });

  // Fetch signal stats from DB
  const { data: signalStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-signal-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("id, sentiment");
      if (error) throw error;
      const total = data.length;
      const negative = data.filter((s) => s.sentiment === "negative").length;
      const positive = data.filter((s) => s.sentiment === "positive").length;
      const sentimentScore = total > 0 ? (positive - negative) / total : 0;
      return { total, sentimentScore };
    },
  });

  // Fetch active crisis from DB
  const { data: activeCrisis, isLoading: crisisLoading } = useQuery({
    queryKey: ["dashboard-crisis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crises")
        .select("*")
        .in("status", ["active", "detected", "responding"])
        .order("detected_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data?.[0] ?? null) as Crisis | null;
    },
  });

  // Fetch trending narratives from DB
  const { data: narratives = [] } = useQuery({
    queryKey: ["dashboard-narratives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("narratives")
        .select("*")
        .eq("trending", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Narrative[];
    },
  });

  // Fetch reputation snapshots for sentiment timeline
  const { data: snapshots = [] } = useQuery({
    queryKey: ["dashboard-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reputation_snapshots")
        .select("*")
        .order("snapshot_at", { ascending: true })
        .limit(24);
      if (error) throw error;
      return data as ReputationSnapshot[];
    },
  });

  // Fetch response count
  const { data: responseCount = 0, isLoading: responsesLoading } = useQuery({
    queryKey: ["dashboard-response-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("response_log")
        .select("id");
      if (error) throw error;
      return data.length;
    },
  });

  // Build sentiment timeline from snapshots
  const sentimentTimeline = snapshots.map((s) => ({
    time: new Date(s.snapshot_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    negative: Number(s.negative_pct ?? 0),
    neutral: Number(s.neutral_pct ?? 0),
    positive: Number(s.positive_pct ?? 0),
    volume: s.signal_volume ?? 0,
  }));

  // Real-time subscriptions for all dashboard data
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "signals" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            queryClient.setQueryData<Signal[]>(["dashboard-signals"], (old) => {
              const newSignal = payload.new as Signal;
              const updated = old ? [newSignal, ...old] : [newSignal];
              return updated.slice(0, 5);
            });
          }
          queryClient.invalidateQueries({ queryKey: ["dashboard-signal-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crises" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-crisis"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "narratives" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-narratives"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reputation_snapshots" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-snapshots"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "response_log" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-response-count"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time crisis monitoring & response</p>
          </div>
          <div className="flex items-center gap-2">
            <CreateCrisisDialog />
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-wider"
              onClick={() => navigate("/war-room")}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Escalate to War Room
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatCard label="Total Signals" value={formatNumber(signalStats?.total ?? 0)} icon={Radio} loading={statsLoading} />
          <StatCard label="Active Crises" value={activeCrisis ? "1" : "0"} icon={AlertTriangle} accent="text-crisis-red" loading={crisisLoading} />
          <StatCard label="Sentiment" value={((signalStats?.sentimentScore ?? 0) * 100).toFixed(0) + "%"} icon={TrendingDown} accent="text-crisis-red" loading={statsLoading} />
          <StatCard label="Media Reach" value={formatNumber(snapshots.reduce((sum, s) => sum + (s.media_reach ?? 0), 0))} icon={MessageSquare} />
          <StatCard label="Responses Sent" value={responseCount.toString()} icon={MessageSquare} loading={responsesLoading} />
          <StatCard label="Avg Response" value="—" icon={Clock} />
        </div>

        {/* Active Crisis Alert */}
        {activeCrisis ? (
          <CrisisStatusCard crisis={activeCrisis} queryClient={queryClient} />
        ) : (
          <Card className="border-crisis-green/30 bg-crisis-green/10 dark:bg-green-950/40">
            <CardContent className="py-6 text-center">
              <p className="text-sm font-mono text-crisis-green">No active crises detected</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Sentiment Chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Sentiment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {sentimentTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "4px",
                          fontFamily: "JetBrains Mono",
                          fontSize: "11px",
                        }}
                      />
                      <Area type="monotone" dataKey="negative" stackId="1" stroke="hsl(var(--crisis-red))" fill="hsl(var(--crisis-red) / 0.3)" />
                      <Area type="monotone" dataKey="neutral" stackId="1" stroke="hsl(var(--crisis-blue))" fill="hsl(var(--crisis-blue) / 0.2)" />
                      <Area type="monotone" dataKey="positive" stackId="1" stroke="hsl(var(--crisis-green))" fill="hsl(var(--crisis-green) / 0.3)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground">
                    No reputation snapshots yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trending Narratives */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Trending Narratives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {narratives.length === 0 && (
                <p className="text-xs text-muted-foreground font-mono text-center py-4">No trending narratives</p>
              )}
              {narratives.map((narrative) => (
                <div key={narrative.id} className="p-3 rounded-sm bg-surface-elevated border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{narrative.title}</span>
                    <RiskBadge level={narrative.risk_level} size="sm" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{narrative.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <SentimentBadge sentiment={narrative.sentiment} />
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {formatNumber(narrative.signal_count ?? 0)} signals
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Panel */}
        <CrisisAIPanel />

        {/* Recent Signals */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Latest Signals</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-mono" onClick={() => navigate("/signals")}>
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {dbSignals.length === 0 && (
              <p className="text-xs text-muted-foreground font-mono text-center py-4">No signals detected yet</p>
            )}
            {dbSignals.map((signal) => (
              <div key={signal.id} className="flex items-start gap-3 p-3 rounded-sm bg-surface-elevated border border-border">
                <div className="shrink-0 w-8 h-8 rounded-sm bg-secondary flex items-center justify-center text-xs font-mono font-bold">
                  {signal.source === "twitter" ? "𝕏" : signal.source === "news" ? "📰" : signal.source === "blog" ? "📝" : "in"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{signal.author}</span>
                    {signal.is_influencer && (
                      <span className="text-[9px] font-mono px-1 py-0 rounded-sm bg-crisis-purple/15 text-crisis-purple border border-crisis-purple/30">
                        INFLUENCER
                      </span>
                    )}
                    <SentimentBadge sentiment={signal.sentiment} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed truncate">{signal.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground tabular-nums">
                    <span>Reach: {formatNumber(signal.reach ?? 0)}</span>
                    <span>{new Date(signal.detected_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
