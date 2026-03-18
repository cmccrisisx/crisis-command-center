import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockData, formatNumber } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

const chartStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "4px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
};

// Mock influencer data
const influencerData = [
  { name: "@TechReporter_Jane", reach: 450000, sentiment: -0.8, mentions: 12 },
  { name: "Reuters", reach: 12000000, sentiment: -0.6, mentions: 5 },
  { name: "@BusinessAnalyst", reach: 210000, sentiment: -0.7, mentions: 8 },
  { name: "TechCrunch", reach: 5000000, sentiment: -0.5, mentions: 3 },
  { name: "@EmergencyMgmt", reach: 2000000, sentiment: -0.9, mentions: 4 },
];

const volumeByPlatform = [
  { platform: "Twitter/X", volume: 8500, color: "hsl(var(--crisis-blue))" },
  { platform: "News", volume: 3200, color: "hsl(var(--crisis-amber))" },
  { platform: "Blogs", volume: 1800, color: "hsl(var(--crisis-purple))" },
  { platform: "LinkedIn", volume: 1000, color: "hsl(var(--crisis-green))" },
];

export default function Analytics() {
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
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Sentiment Trend — 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData.sentimentTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={chartStyle} />
                    <Line type="monotone" dataKey="negative" stroke="hsl(var(--crisis-red))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="positive" stroke="hsl(var(--crisis-green))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="neutral" stroke="hsl(var(--crisis-blue))" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeByPlatform}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="platform" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Mention Volume */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Mention Volume — 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData.sentimentTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={chartStyle} />
                    <Area type="monotone" dataKey="volume" stroke="hsl(var(--intel))" fill="hsl(var(--intel) / 0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Influencer Impact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Influencer Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {influencerData.map((inf) => (
                <div key={inf.name} className="flex items-center gap-3 p-2.5 rounded-sm bg-surface-elevated border border-border">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate">{inf.name}</span>
                    <div className="flex items-center gap-3 mt-0.5 text-xs font-mono text-foreground/70 tabular-nums">
                      <span>Reach: {formatNumber(inf.reach)}</span>
                      <span>Mentions: {inf.mentions}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-mono font-bold tabular-nums ${inf.sentiment < -0.6 ? "text-crisis-red" : "text-crisis-amber"}`}>
                      {(inf.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
