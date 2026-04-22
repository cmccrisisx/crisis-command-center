import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/crisis-helpers";

function formatLatency(ms: number | null) {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

export function AnalyticsDetailPanels({
  isLoading,
  topKeywords,
  influencers,
  recentSignals,
}: {
  isLoading: boolean;
  topKeywords: Array<{ keyword: string; mentions: number; reach: number; negativeShare: number }>;
  influencers: Array<{ name: string; mentions: number; reach: number; sentiment: number }>;
  recentSignals: Array<{ id: string; matchedKeyword: string | null; source: string; sentiment: string; author: string; detectedAt: string; latencyMs: number | null; sourceUrl: string | null }>;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Top matched keywords</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)
            ) : topKeywords.length > 0 ? (
              topKeywords.map((entry) => (
                <div key={entry.keyword} className="rounded-sm border border-border bg-surface-elevated p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.keyword}</p>
                      <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        {entry.mentions} mentions · reach {formatNumber(entry.reach)}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
                      {entry.negativeShare.toFixed(0)}% negative
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs font-mono text-muted-foreground">No matched keywords in the current range.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Recent matched alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
              </div>
            ) : recentSignals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead className="text-right">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSignals.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell className="font-medium">{signal.matchedKeyword ?? "Unattributed"}</TableCell>
                      <TableCell className="font-mono text-xs uppercase">{signal.source}</TableCell>
                      <TableCell className="capitalize">{signal.sentiment}</TableCell>
                      <TableCell>{signal.author}</TableCell>
                      <TableCell className="font-mono text-xs">{new Date(signal.detectedAt).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{formatLatency(signal.latencyMs)}</TableCell>
                      <TableCell className="text-right">
                        {signal.sourceUrl ? (
                          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px] font-mono uppercase tracking-wider">
                            <a href={signal.sourceUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-4 text-center text-xs font-mono text-muted-foreground">No recent alerts matched the current filters.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Influencer impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)
          ) : influencers.length > 0 ? (
            influencers.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3 rounded-sm border border-border bg-surface-elevated p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span>Reach {formatNumber(entry.reach)}</span>
                    <span>Mentions {entry.mentions}</span>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
                  {(entry.sentiment * 100).toFixed(0)}% sentiment
                </Badge>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs font-mono text-muted-foreground">No influencer activity in the current range.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}