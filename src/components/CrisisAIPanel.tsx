import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, BarChart3, FileText, MessageSquareText, Heart, Shield, Loader2, RotateCcw, Radio, Clock3, TriangleAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCrisisAI, type AnalysisType } from "@/hooks/useCrisisAI";
import { useActiveCase } from "@/hooks/useActiveCase";
import type { Tables } from "@/integrations/supabase/types";

type AnalysisTab = "sentiment" | "narrative" | "response" | "emotional" | "reputation";
type Signal = Tables<"signals">;

type AnalysisSignal = {
  author: string;
  content: string;
  source: string;
  sentiment?: string;
};

const tabConfig: Record<AnalysisTab, { label: string; icon: React.ElementType; description: string }> = {
  sentiment: { label: "Sentiment", icon: BarChart3, description: "Classify sentiment shifts from the current case signal stream." },
  narrative: { label: "Narratives", icon: FileText, description: "Cluster the live case signal stream into the most important storylines." },
  response: { label: "Responses", icon: MessageSquareText, description: "Generate response options only from the active case context." },
  emotional: { label: "Emotional", icon: Heart, description: "Read the emotional temperature from the most recent case signals first." },
  reputation: { label: "Reputation", icon: Shield, description: "Estimate trust and brand impact from the active case only." },
};

const RECENT_WINDOW_MS = 1000 * 60 * 60 * 72;

function formatFreshness(dateString?: string | null) {
  if (!dateString) return "No recent signals";
  const timestamp = new Date(dateString).getTime();
  const deltaMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (deltaMinutes < 1) return "Updated just now";
  if (deltaMinutes < 60) return `Updated ${deltaMinutes}m ago`;
  const hours = Math.round(deltaMinutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Updated ${days}d ago`;
}

export function CrisisAIPanel() {
  const queryClient = useQueryClient();
  const { activeCaseId, activeCase } = useActiveCase();
  const [activeTab, setActiveTab] = useState<AnalysisTab>("sentiment");
  const [recentOnly, setRecentOnly] = useState(true);
  const sentiment = useCrisisAI();
  const narrative = useCrisisAI();
  const response = useCrisisAI();
  const emotional = useCrisisAI();
  const reputation = useCrisisAI();

  const hooks: Record<AnalysisTab, ReturnType<typeof useCrisisAI>> = {
    sentiment,
    narrative,
    response,
    emotional,
    reputation,
  };

  const { data: signals = [], isLoading: signalsLoading } = useQuery({
    queryKey: ["ai-panel-signals", activeCaseId ?? "none"],
    enabled: !!activeCaseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .eq("crisis_id", activeCaseId!)
        .order("detected_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as Signal[];
    },
  });

  useEffect(() => {
    if (!activeCaseId) return;
    const channel = supabase
      .channel(`ai-panel-signals-${activeCaseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals", filter: `crisis_id=eq.${activeCaseId}` },
        (payload) => {
          const next = payload.new as Signal;
          queryClient.setQueryData<Signal[]>(["ai-panel-signals", activeCaseId], (old) => {
            if (!old) return [next];
            if (old.some((item) => item.id === next.id)) return old;
            return [next, ...old].slice(0, 120);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "signals", filter: `crisis_id=eq.${activeCaseId}` },
        (payload) => {
          const next = payload.new as Signal;
          queryClient.setQueryData<Signal[]>(["ai-panel-signals", activeCaseId], (old) =>
            old?.map((item) => (item.id === next.id ? next : item)) ?? [next]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCaseId, queryClient]);

  const recentSignals = useMemo(
    () => signals.filter((signal) => new Date(signal.detected_at).getTime() >= Date.now() - RECENT_WINDOW_MS),
    [signals]
  );

  const effectiveSignals = useMemo(() => {
    if (!recentOnly) return signals;
    return recentSignals.length > 0 ? recentSignals : signals;
  }, [recentOnly, recentSignals, signals]);

  const mappedSignals = useMemo<AnalysisSignal[]>(() => effectiveSignals.map((signal) => ({
    author: signal.author,
    content: signal.content,
    source: signal.source,
    sentiment: signal.sentiment,
  })), [effectiveSignals]);

  const current = hooks[activeTab];
  const latestSignalAt = signals[0]?.detected_at ?? null;
  const freshnessLabel = formatFreshness(latestSignalAt);
  const stale = latestSignalAt ? Date.now() - new Date(latestSignalAt).getTime() > RECENT_WINDOW_MS : true;

  const crisisContext = activeCase
    ? `${activeCase.title}: ${activeCase.description || "No description provided"}. Status: ${activeCase.status}. Risk level: ${activeCase.risk_level}. Total signals in scope: ${effectiveSignals.length}. Recent 72h signals: ${recentSignals.length}.`
    : "";

  const runAnalysis = () => {
    current.analyze(activeTab as AnalysisType, mappedSignals, crisisContext);
  };

  if (!activeCaseId || !activeCase) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground">CrisisX AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a case to run case-specific analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground">CrisisX AI Analysis</CardTitle>
            <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-primary/30 text-primary">
              CASE-SCOPED
            </Badge>
            <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-border text-muted-foreground">
              <Clock3 className="mr-1 h-2.5 w-2.5" />
              {freshnessLabel}
            </Badge>
            {signals.length > 0 && (
              <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-primary/20 text-primary">
                <Radio className="mr-1 h-2.5 w-2.5" />
                {recentSignals.length}/{signals.length} recent
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant={recentOnly ? "secondary" : "outline"}
            size="sm"
            className="font-mono text-[10px] uppercase tracking-wider"
            onClick={() => setRecentOnly((value) => !value)}
          >
            {recentOnly ? "Recent 72h" : "All case signals"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stale && (
          <div className="flex items-start gap-2 rounded-sm border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-foreground">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 text-accent-foreground" />
            <div>
              <p className="font-mono uppercase tracking-wider text-[10px] text-muted-foreground">Freshness warning</p>
              <p>This analysis may be stale because the active case has no new signals inside the last 72 hours.</p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalysisTab)}>
          <TabsList className="w-full bg-secondary">
            {(Object.keys(tabConfig) as AnalysisTab[]).map((key) => {
              const { label, icon: Icon } = tabConfig[key];
              return (
                <TabsTrigger key={key} value={key} className="flex-1 text-xs font-mono gap-1.5">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(tabConfig) as AnalysisTab[]).map((key) => {
            const hook = hooks[key];
            const config = tabConfig[key];
            const signalCount = mappedSignals.length;

            return (
              <TabsContent key={key} value={key} className="mt-3">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-foreground/70 font-mono">{config.description}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{signalCount} signals in scope</p>
                </div>

                {!activeCaseId ? null : signalsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">Loading case signals…</span>
                  </div>
                ) : signalCount === 0 ? (
                  <div className="rounded-sm border border-border bg-surface-elevated px-3 py-5 text-center text-xs font-mono text-muted-foreground">
                    No signals are available for this case yet.
                  </div>
                ) : (
                  <>
                    {!hook.result && !hook.loading && !hook.error && (
                      <Button onClick={runAnalysis} className="w-full font-mono text-xs uppercase tracking-wider" variant="outline">
                        <Brain className="h-3.5 w-3.5 mr-1.5" />
                        Run {config.label} Analysis
                      </Button>
                    )}

                    {hook.loading && !hook.result && (
                      <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs font-mono text-muted-foreground">Analyzing {signalCount} scoped signals…</span>
                      </div>
                    )}

                    {hook.error && (
                      <div className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-xs text-destructive font-mono">
                        {hook.error}
                      </div>
                    )}

                    {hook.result && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-sm bg-surface-elevated border border-border overflow-auto max-h-[500px]">
                          <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed font-mono [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:uppercase [&_h2]:tracking-wider [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_ul]:space-y-1">
                            <ReactMarkdown>{hook.result}</ReactMarkdown>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {hook.loading && (
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 border-primary/30 text-primary animate-pulse">
                              <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                              STREAMING
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-xs font-mono h-7"
                            onClick={() => {
                              hook.reset();
                              runAnalysis();
                            }}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Re-analyze
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
