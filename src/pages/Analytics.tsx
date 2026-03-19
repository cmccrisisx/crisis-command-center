import { usePageTitle } from "@/hooks/usePageTitle";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/crisis-helpers";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type Signal = Tables<"signals">;
type ReputationSnapshot = Tables<"reputation_snapshots">;

const chartStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "4px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
};

export default function Analytics() {
  usePageTitle("Analytics");
  // Fetch reputation snapshots for sentiment timeline
  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ["analytics-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reputation_snapshots")
        .select("*")
        .order("snapshot_at", { ascending: true });
      if (error) throw error;
      return data as ReputationSnapshot[];
    },
  });

  // Fetch signals for volume-by-platform and influencer data
  const { data: signals = [], isLoading: signalsLoading } = useQuery({
    queryKey: ["analytics-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data as Signal[];
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

  // Compute volume by platform from signals
  const platformCounts = signals.reduce<Record<string, number>>((acc, s) => {
    const platform = s.source === "twitter" ? "Twitter/X" : s.source === "news" ? "News" : s.source === "blog" ? "Blogs" : "LinkedIn";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});
  const volumeByPlatform = Object.entries(platformCounts).map(([platform, volume]) => ({ platform, volume }));

  // Compute influencer data from signals
  const influencers = signals
    .filter((s) => s.is_influencer)
    .reduce<Record<string, { name: string; reach: number; mentions: number; sentimentSum: number }>>((acc, s) => {
      if (!acc[s.author]) {
        acc[s.author] = { name: s.author, reach: s.reach ?? 0, mentions: 0, sentimentSum: 0 };
      }
      acc[s.author].mentions += 1;
      acc[s.author].reach = Math.max(acc[s.author].reach, s.reach ?? 0);
      acc[s.author].sentimentSum += s.sentiment === "negative" ? -1 : s.sentiment === "positive" ? 1 : 0;
      return acc;
    }, {});
  const influencerData = Object.values(influencers)
    .map((inf) => ({ ...inf, sentiment: inf.mentions > 0 ? inf.sentimentSum / inf.mentions : 0 }))
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5);

  const isLoading = snapshotsLoading || signalsLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep-dive into crisis data & trends</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Sentiment Over Time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Sentiment Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : sentimentTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentimentTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Line type="monotone" dataKey="negative" stroke="hsl(var(--crisis-red))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="positive" stroke="hsl(var(--crisis-green))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="neutral" stroke="hsl(var(--crisis-blue))" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground">No snapshot data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Volume by Platform */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Volume by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : volumeByPlatform.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeByPlatform}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="platform" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground">No signal data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mention Volume */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Mention Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : sentimentTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={chartStyle} />
                      <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground">No snapshot data yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Influencer Impact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Influencer Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : influencerData.length > 0 ? (
                influencerData.map((inf) => (
                  <div key={inf.name} className="flex items-center gap-3 p-2.5 rounded-sm bg-surface-elevated border border-border">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold block truncate">{inf.name}</span>
                      <div className="flex items-center gap-3 mt-0.5 text-xs font-mono text-foreground/70 tabular-nums">
                        <span>Reach: {formatNumber(inf.reach)}</span>
                        <span>Mentions: {inf.mentions}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold tabular-nums ${inf.sentiment < -0.6 ? "text-crisis-red" : inf.sentiment < 0 ? "text-crisis-amber" : "text-crisis-green"}`}>
                        {(inf.sentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-muted-foreground text-center py-4">No influencer signals detected</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
