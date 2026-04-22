import { useState, useMemo, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentBadge } from "@/components/SentimentBadge";
import { formatNumber, getSourceIcon } from "@/lib/crisis-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Loader2, Radio, RefreshCw, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { SignalReaderDrawer } from "@/components/SignalReaderDrawer";
import { useActiveCase } from "@/hooks/useActiveCase";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

type Signal = Tables<"signals">;

const SOURCE_OPTIONS = ["twitter", "news", "blog", "linkedin"] as const;
const SENTIMENT_OPTIONS = ["positive", "neutral", "negative"] as const;

function freshnessLabel(dateString?: string | null) {
  if (!dateString) return "No signals yet";
  const deltaMinutes = Math.max(0, Math.round((Date.now() - new Date(dateString).getTime()) / 60000));
  if (deltaMinutes < 1) return "Updated just now";
  if (deltaMinutes < 60) return `Updated ${deltaMinutes}m ago`;
  const hours = Math.round(deltaMinutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.round(hours / 24)}d ago`;
}

export default function Signals() {
  usePageTitle("Signals");
  const queryClient = useQueryClient();
  const { activeCaseId, activeCase } = useActiveCase();
  const { hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilters, setSourceFilters] = useState<string[]>([]);
  const [sentimentFilters, setSentimentFilters] = useState<string[]>([]);
  const [realtimeCount, setRealtimeCount] = useState(0);
  const [isIngesting, setIsIngesting] = useState(false);
  const [readerSignal, setReaderSignal] = useState<Signal | null>(null);

  const handleRefreshSignals = async () => {
    setIsIngesting(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-signals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(activeCaseId ? { crisisId: activeCaseId } : {}),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success(`Ingested ${data.inserted} new signals`);
        queryClient.invalidateQueries({ queryKey: ["signals", activeCaseId ?? "all"] });
      } else {
        toast.error(data.error || "Ingestion failed");
      }
    } catch {
      toast.error("Failed to refresh signals");
    } finally {
      setIsIngesting(false);
    }
  };

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["signals", activeCaseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("signals").select("*").order("detected_at", { ascending: false });
      if (activeCaseId) q = q.eq("crisis_id", activeCaseId);
      const { data, error } = await q;
      if (error) throw error;
      setRealtimeCount(0);
      return data as Signal[];
    },
  });

  useEffect(() => {
    const queryKey = ["signals", activeCaseId ?? "all"] as const;
    const matchesCase = (s: Signal) => !activeCaseId || s.crisis_id === activeCaseId;

    const channel = supabase
      .channel(`signals-realtime-${activeCaseId ?? "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "signals" }, (payload) => {
        const next = payload.new as Signal;
        if (!matchesCase(next)) return;
        queryClient.setQueryData<Signal[]>(queryKey, (old) => {
          if (!old) return [next];
          if (old.some((s) => s.id === next.id)) return old;
          return [next, ...old];
        });
        setRealtimeCount((c) => c + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "signals" }, (payload) => {
        const next = payload.new as Signal;
        if (!matchesCase(next)) return;
        queryClient.setQueryData<Signal[]>(queryKey, (old) => old?.map((s) => (s.id === next.id ? next : s)) ?? []);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "signals" }, (payload) => {
        queryClient.setQueryData<Signal[]>(queryKey, (old) => old?.filter((s) => s.id !== (payload.old as { id: string }).id) ?? []);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, activeCaseId]);

  const filteredSignals = useMemo(() => {
    let result = signals;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.content.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          (s.keywords ?? []).some((k) => k.toLowerCase().includes(q))
      );
    }
    if (sourceFilters.length > 0) {
      result = result.filter((s) => sourceFilters.includes(s.source));
    }
    if (sentimentFilters.length > 0) {
      result = result.filter((s) => sentimentFilters.includes(s.sentiment));
    }
    return result;
  }, [signals, searchQuery, sourceFilters, sentimentFilters]);

  const sourceCounts = SOURCE_OPTIONS.map((source) => ({
    source,
    count: filteredSignals.filter((s) => s.source === source).length,
  }));

  const toggleFilter = (
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const activeFilterCount = sourceFilters.length + sentimentFilters.length;
  const latestSignalAt = signals[0]?.detected_at ?? null;
  const isAdmin = hasRole("admin");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Signal Detection</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{activeCase ? `Case: ${activeCase.title}` : "Real-time monitoring across all channels"}</span>
              <Badge variant="outline" className="text-[10px] font-mono h-5 px-1.5">
                <Clock3 className="mr-1 h-3 w-3" />
                {freshnessLabel(latestSignalAt)}
              </Badge>
              {realtimeCount > 0 && (
                <Badge variant="outline" className="text-xs font-mono h-5 px-1.5 border-crisis-green/30 text-crisis-green animate-pulse">
                  <Radio className="h-2.5 w-2.5 mr-1" />
                  {realtimeCount} new
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs font-mono">
                <Link to="/tracking-manager?create=keyword">Add Keyword</Link>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-mono"
              onClick={handleRefreshSignals}
              disabled={isIngesting}
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isIngesting ? "animate-spin" : ""}`} />
              {isIngesting ? "Ingesting…" : "Refresh Signals"}
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter signals..."
                className="pl-8 h-8 w-48 text-xs font-mono bg-secondary text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs font-mono relative">
                  <Filter className="h-3 w-3 mr-1.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-mono font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Source</p>
                    <div className="space-y-1.5">
                      {SOURCE_OPTIONS.map((src) => (
                        <label key={src} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={sourceFilters.includes(src)}
                            onCheckedChange={() => toggleFilter(src, sourceFilters, setSourceFilters)}
                          />
                          <span className="text-xs font-mono capitalize">{src}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-xs font-mono font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Sentiment</p>
                    <div className="space-y-1.5">
                      {SENTIMENT_OPTIONS.map((sent) => (
                        <label key={sent} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={sentimentFilters.includes(sent)}
                            onCheckedChange={() => toggleFilter(sent, sentimentFilters, setSentimentFilters)}
                          />
                          <span className="text-xs font-mono capitalize">{sent}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs font-mono h-7" onClick={() => { setSourceFilters([]); setSentimentFilters([]); }}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {sourceCounts.map(({ source, count }) => (
            <Card key={source} className="bg-card">
              <CardContent className="p-3 text-center">
                <p className="text-lg mb-0.5">{getSourceIcon(source as any)}</p>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{source}</p>
                <p className="text-lg font-mono font-bold tabular-nums">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">All Signals</CardTitle>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {filteredSignals.length} of {signals.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground font-mono">Loading signals…</span>
              </div>
            ) : filteredSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 font-mono">
                {signals.length === 0 ? "No signals detected yet." : "No signals match your filters."}
              </p>
            ) : (
              filteredSignals.map((signal) => {
                const hasUrl = !!signal.source_url;
                return (
                  <button
                    key={signal.id}
                    type="button"
                    disabled={!hasUrl}
                    onClick={() => hasUrl && setReaderSignal(signal)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-sm bg-surface-elevated border border-border transition-colors ${
                      hasUrl ? "hover:bg-secondary/40 hover:border-primary/40 cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div className="shrink-0 w-10 h-10 rounded-sm bg-secondary flex items-center justify-center text-sm font-mono font-bold">
                      {getSourceIcon(signal.source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">{signal.author}</span>
                        {signal.is_influencer && (
                          <span className="text-[9px] font-mono px-1 py-0 rounded-sm bg-crisis-purple/15 text-crisis-purple border border-crisis-purple/30">
                            INFLUENCER
                          </span>
                        )}
                        <SentimentBadge sentiment={signal.sentiment} />
                        <span className="text-xs font-mono text-muted-foreground ml-auto tabular-nums whitespace-nowrap">
                          {formatNumber(signal.author_followers ?? 0)} followers
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{signal.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs font-mono text-muted-foreground tabular-nums">
                        <span>Reach: {formatNumber(signal.reach ?? 0)}</span>
                        <span>Keywords: {(signal.keywords ?? []).join(", ")}</span>
                        <span className="ml-auto">{new Date(signal.detected_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
      <SignalReaderDrawer
        open={!!readerSignal}
        onOpenChange={(o) => !o && setReaderSignal(null)}
        url={readerSignal?.source_url ?? null}
        fallbackTitle={readerSignal?.author}
        fallbackExcerpt={readerSignal?.content}
      />
    </AppLayout>
  );
}
