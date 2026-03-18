import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CrisisAIPanel } from "@/components/CrisisAIPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Badge } from "@/components/ui/badge";
import { mockData, formatNumber, getSourceIcon } from "@/lib/mock-data";
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
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Signal = Tables<"signals">;

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className={`text-2xl font-mono font-bold tabular-nums mt-1 ${accent || "text-foreground"}`}>{value}</p>
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
  const { data: signalStats } = useQuery({
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

  // Real-time subscription for signals
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-signals-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals" },
        (payload) => {
          // Update latest signals list
          queryClient.setQueryData<Signal[]>(["dashboard-signals"], (old) => {
            const newSignal = payload.new as Signal;
            const updated = old ? [newSignal, ...old] : [newSignal];
            return updated.slice(0, 5);
          });
          // Invalidate stats to recount
          queryClient.invalidateQueries({ queryKey: ["dashboard-signal-stats"] });
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
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-wider"
            onClick={() => navigate("/war-room")}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Escalate to War Room
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatCard label="Total Signals" value={formatNumber(signalStats?.total ?? mockData.stats.totalSignals)} icon={Radio} />
          <StatCard label="Active Alerts" value={mockData.stats.activeAlerts.toString()} icon={AlertTriangle} accent="text-crisis-red" />
          <StatCard label="Sentiment" value={((signalStats?.sentimentScore ?? mockData.stats.sentimentScore) * 100).toFixed(0) + "%"} icon={TrendingDown} accent="text-crisis-red" />
          <StatCard label="Media Reach" value={formatNumber(mockData.stats.mediaReach)} icon={MessageSquare} />
          <StatCard label="Responses Sent" value={mockData.stats.responsesSent.toString()} icon={MessageSquare} />
          <StatCard label="Avg Response" value={mockData.stats.avgResponseTime} icon={Clock} />
        </div>

        {/* Active Crisis Alert */}
        <Card className="border-crisis-red/30 bg-crisis-red/10 dark:bg-red-950/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-crisis-red" />
                <CardTitle className="text-base font-mono">{mockData.crisis.title}</CardTitle>
              </div>
              <RiskBadge level={mockData.crisis.riskLevel} pulse />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">{mockData.crisis.description}</p>
            <div className="flex items-center gap-4 mt-3 font-mono text-xs tabular-nums">
              <span className="text-foreground/70">Detected: <span className="text-foreground">{mockData.crisis.detectedAt.toLocaleTimeString()}</span></span>
              <span className="text-foreground/70">Signals: <span className="text-foreground">{formatNumber(mockData.crisis.signalCount)}</span></span>
              <span className="text-foreground/70">Type: <span className="text-foreground uppercase">{mockData.crisis.type}</span></span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Sentiment Chart */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Sentiment Timeline — 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData.sentimentTimeline}>
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
              </div>
            </CardContent>
          </Card>

          {/* Trending Narratives */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Trending Narratives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.narratives.filter(n => n.trending).map((narrative) => (
                <div key={narrative.id} className="p-3 rounded-sm bg-surface-elevated border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{narrative.title}</span>
                    <RiskBadge level={narrative.riskLevel} size="sm" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{narrative.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <SentimentBadge sentiment={narrative.sentiment} />
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {formatNumber(narrative.signalCount)} signals
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Stakeholder Impact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Stakeholder Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {mockData.stakeholders.map((s) => (
                <div key={s.group} className="p-3 rounded-sm bg-surface-elevated border border-border text-center">
                  <p className="text-xs font-mono text-muted-foreground mb-1">{s.group}</p>
                  <p className={`text-xl font-mono font-bold tabular-nums ${s.sentiment < -0.5 ? "text-crisis-red" : s.sentiment < -0.2 ? "text-crisis-amber" : "text-crisis-green"}`}>
                    {(s.sentiment * 100).toFixed(0)}%
                  </p>
                  <p className="text-[10px] font-mono text-crisis-red tabular-nums">{s.change}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
            {mockData.signals.slice(0, 5).map((signal) => (
              <div key={signal.id} className="flex items-start gap-3 p-3 rounded-sm bg-surface-elevated border border-border">
                <div className="shrink-0 w-8 h-8 rounded-sm bg-secondary flex items-center justify-center text-xs font-mono font-bold">
                  {signal.source === "twitter" ? "𝕏" : signal.source === "news" ? "📰" : signal.source === "blog" ? "📝" : "in"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{signal.author}</span>
                    {signal.isInfluencer && (
                      <span className="text-[9px] font-mono px-1 py-0 rounded-sm bg-crisis-purple/15 text-crisis-purple border border-crisis-purple/30">
                        INFLUENCER
                      </span>
                    )}
                    <SentimentBadge sentiment={signal.sentiment} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed truncate">{signal.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground tabular-nums">
                    <span>Reach: {formatNumber(signal.reach)}</span>
                    <span>{signal.timestamp.toLocaleTimeString()}</span>
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
