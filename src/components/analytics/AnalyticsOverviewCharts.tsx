import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/lib/recharts";

const chartStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "4px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
};

const SOURCE_COLORS = ["hsl(var(--primary))", "hsl(var(--crisis-blue))", "hsl(var(--crisis-amber))", "hsl(var(--crisis-green))"];

export function AnalyticsOverviewCharts({
  isLoading,
  sentimentTimeline,
  mentionTimeline,
  sourceMix,
}: {
  isLoading: boolean;
  sentimentTimeline: Array<{ time: string; positive: number; neutral: number; negative: number }>;
  mentionTimeline: Array<{ time: string; volume: number }>;
  sourceMix: Array<{ source: string; volume: number }>;
}) {
  const panels = [
    {
      title: "Sentiment trend",
      content: isLoading ? (
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
        <div className="flex h-full items-center justify-center text-xs font-mono text-muted-foreground">No sentiment data in range</div>
      ),
    },
    {
      title: "Mention volume",
      content: isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : mentionTimeline.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mentionTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={chartStyle} />
            <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.16)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-mono text-muted-foreground">No signal volume in range</div>
      ),
    },
    {
      title: "Source mix",
      content: isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : sourceMix.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sourceMix}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="source" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={chartStyle} />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
              {sourceMix.map((entry, index) => (
                <Cell key={`${entry.source}-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-mono text-muted-foreground">No source distribution in range</div>
      ),
    },
    {
      title: "Source share",
      content: isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : sourceMix.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sourceMix} dataKey="volume" nameKey="source" innerRadius={52} outerRadius={84} paddingAngle={2}>
              {sourceMix.map((entry, index) => (
                <Cell key={`${entry.source}-pie-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartStyle} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-mono text-muted-foreground">No source mix to compare</div>
      ),
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {panels.map((panel) => (
        <Card key={panel.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">{panel.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">{panel.content}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}