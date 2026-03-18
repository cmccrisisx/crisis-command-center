import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, FileText, MessageSquareText, Heart, Shield, Loader2, RotateCcw } from "lucide-react";
import { useCrisisAI, type AnalysisType } from "@/hooks/useCrisisAI";
import { mockData } from "@/lib/mock-data";
import ReactMarkdown from "react-markdown";

type AnalysisTab = "sentiment" | "narrative" | "response" | "emotional" | "reputation";

const tabConfig: Record<AnalysisTab, { label: string; icon: React.ElementType; description: string }> = {
  sentiment: { label: "Sentiment", icon: BarChart3, description: "Classify & analyze sentiment across signals" },
  narrative: { label: "Narratives", icon: FileText, description: "Identify dominant narrative clusters" },
  response: { label: "Responses", icon: MessageSquareText, description: "AI-recommended crisis responses" },
  emotional: { label: "Emotional", icon: Heart, description: "Fear, anger, frustration, hope — emotional classification" },
  reputation: { label: "Reputation", icon: Shield, description: "Brand perception, trust index, recovery forecast" },
};

export function CrisisAIPanel() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("sentiment");
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

  const current = hooks[activeTab];

  const signals = mockData.signals.map((s) => ({
    author: s.author,
    content: s.content,
    source: s.source,
    sentiment: s.sentiment,
  }));

  const crisisContext = `${mockData.crisis.title}: ${mockData.crisis.description}`;

  const runAnalysis = () => {
    current.analyze(activeTab as AnalysisType, signals, crisisContext);
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground">CrisisX AI Analysis</CardTitle>
            <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-primary/30 text-primary">
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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

            return (
              <TabsContent key={key} value={key} className="mt-3">
                <p className="text-[11px] text-muted-foreground font-mono mb-3">{config.description}</p>

                {!hook.result && !hook.loading && !hook.error && (
                  <Button
                    onClick={runAnalysis}
                    className="w-full font-mono text-xs uppercase tracking-wider"
                    variant="outline"
                  >
                    <Brain className="h-3.5 w-3.5 mr-1.5" />
                    Run {config.label} Analysis
                  </Button>
                )}

                {hook.loading && !hook.result && (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">Analyzing {mockData.signals.length} signals...</span>
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
                        <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-primary/30 text-primary animate-pulse">
                          <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                          STREAMING
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-[10px] font-mono h-7"
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
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
