import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentBadge } from "@/components/SentimentBadge";
import { mockData, formatNumber, getSourceIcon } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

export default function Signals() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Signal Detection</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time monitoring across all channels</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Filter signals..." className="pl-8 h-8 w-48 text-xs font-mono bg-card" />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs font-mono">
              <Filter className="h-3 w-3 mr-1.5" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {["twitter", "news", "blog", "linkedin"].map((source) => {
            const count = mockData.signals.filter(s => s.source === source).length;
            return (
              <Card key={source} className="bg-card">
                <CardContent className="p-3 text-center">
                  <p className="text-lg mb-0.5">{getSourceIcon(source as any)}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{source}</p>
                  <p className="text-lg font-mono font-bold tabular-nums">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">All Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockData.signals.map((signal) => (
              <div key={signal.id} className="flex items-start gap-3 p-3 rounded-sm bg-surface-elevated border border-border">
                <div className="shrink-0 w-10 h-10 rounded-sm bg-secondary flex items-center justify-center text-sm font-mono font-bold">
                  {getSourceIcon(signal.source)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{signal.author}</span>
                    {signal.isInfluencer && (
                      <span className="text-[9px] font-mono px-1 py-0 rounded-sm bg-crisis-purple/15 text-crisis-purple border border-crisis-purple/30">
                        INFLUENCER
                      </span>
                    )}
                    <SentimentBadge sentiment={signal.sentiment} />
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto tabular-nums">
                      {formatNumber(signal.authorFollowers)} followers
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{signal.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-muted-foreground tabular-nums">
                    <span>Reach: {formatNumber(signal.reach)}</span>
                    <span>Keywords: {signal.keywords.join(", ")}</span>
                    <span className="ml-auto">{signal.timestamp.toLocaleString()}</span>
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
