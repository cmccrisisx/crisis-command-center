import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain, Loader2, FlaskConical, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, Shield,
} from "lucide-react";
import { useCrisisAI } from "@/hooks/useCrisisAI";
import { mockData } from "@/lib/mock-data";
import ReactMarkdown from "react-markdown";

const presetResponses = [
  {
    id: "conservative",
    label: "Conservative — Holding Statement",
    content: "We are aware of the issue and our teams are investigating. We will provide updates as more information becomes available.",
    icon: Shield,
    color: "text-crisis-blue border-crisis-blue/30",
  },
  {
    id: "moderate",
    label: "Moderate — Apology + Actions",
    content: "We sincerely apologize for the disruption. Our engineering teams have been mobilized and are working to restore service. We are cooperating fully with the FCC investigation and will share a full incident report within 48 hours.",
    icon: Minus,
    color: "text-crisis-amber border-crisis-amber/30",
  },
  {
    id: "aggressive",
    label: "Proactive — Full Transparency",
    content: "We take full responsibility for this outage. Here is exactly what happened: [root cause]. We are implementing these immediate fixes: [list]. Every affected customer will receive [compensation]. Our CEO will address the public at [time].",
    icon: TrendingUp,
    color: "text-crisis-green border-crisis-green/30",
  },
];

export default function Scenarios() {
  const [selectedPreset, setSelectedPreset] = useState(presetResponses[0]);
  const [customResponse, setCustomResponse] = useState("");
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const simulator = useCrisisAI();

  const runSimulation = () => {
    const responseText = mode === "custom" ? customResponse : selectedPreset.content;
    const crisisContext = `${mockData.crisis.title}: ${mockData.crisis.description}\n\nCurrent sentiment score: ${mockData.crisis.sentimentScore}\nSignals detected: ${mockData.crisis.signalCount}\nRisk level: ${mockData.globalRisk}`;

    simulator.analyzeAdvanced({
      type: "scenario_simulation",
      crisisContext,
      templateContent: responseText,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Scenario Simulation</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered outcome projections for response strategies
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono h-5 px-2 border-crisis-purple/30 text-crisis-purple">
            <FlaskConical className="h-3 w-3 mr-1" />
            STRATEGIZE MODULE
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Left: Response Selection */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Response Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={mode} onValueChange={(v) => setMode(v as "preset" | "custom")}>
                  <SelectTrigger className="text-xs font-mono bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset" className="text-xs font-mono">Preset Strategies</SelectItem>
                    <SelectItem value="custom" className="text-xs font-mono">Custom Response</SelectItem>
                  </SelectContent>
                </Select>

                {mode === "preset" ? (
                  <div className="space-y-2">
                    {presetResponses.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = selectedPreset.id === preset.id;
                      return (
                        <div
                          key={preset.id}
                          className={`p-3 rounded-sm border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-primary/50 bg-primary/5"
                              : "border-border bg-surface-elevated hover:border-border/80"
                          }`}
                          onClick={() => setSelectedPreset(preset)}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-xs font-mono font-semibold">{preset.label}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{preset.content}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Textarea
                    value={customResponse}
                    onChange={(e) => setCustomResponse(e.target.value)}
                    placeholder="Enter your proposed crisis response..."
                    className="min-h-[180px] text-sm font-mono bg-card"
                  />
                )}

                <Button
                  onClick={runSimulation}
                  className="w-full text-xs font-mono uppercase tracking-wider"
                  disabled={simulator.loading || (mode === "custom" && !customResponse.trim())}
                >
                  {simulator.loading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Run Simulation
                </Button>
              </CardContent>
            </Card>

            {/* Crisis Context Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Crisis Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-2.5 rounded-sm bg-surface-elevated border border-border">
                  <p className="text-xs font-mono font-semibold text-foreground">{mockData.crisis.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{mockData.crisis.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-sm bg-surface-elevated border border-border text-center">
                    <p className="text-xs font-mono text-muted-foreground uppercase">Signals</p>
                    <p className="text-sm font-mono font-bold tabular-nums">{mockData.stats.totalSignals.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-sm bg-surface-elevated border border-border text-center">
                    <p className="text-xs font-mono text-muted-foreground uppercase">Sentiment</p>
                    <p className="text-sm font-mono font-bold tabular-nums text-crisis-red">{mockData.crisis.sentimentScore}</p>
                  </div>
                  <div className="p-2 rounded-sm bg-surface-elevated border border-border text-center">
                    <p className="text-xs font-mono text-muted-foreground uppercase">Risk</p>
                    <p className="text-sm font-mono font-bold tabular-nums text-crisis-red uppercase">{mockData.globalRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Simulation Results */}
          <div className="xl:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">Simulation Results</CardTitle>
                  {simulator.result && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-crisis-green" />
                        <span className="text-[9px] font-mono text-crisis-green">BEST</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Minus className="h-3 w-3 text-crisis-amber" />
                        <span className="text-[9px] font-mono text-crisis-amber">LIKELY</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="h-3 w-3 text-crisis-red" />
                        <span className="text-[9px] font-mono text-crisis-red">WORST</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!simulator.result && !simulator.loading && !simulator.error && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FlaskConical className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground font-mono">Select a response strategy and run the simulation</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">AI will project best, likely, and worst-case outcomes</p>
                  </div>
                )}

                {simulator.loading && !simulator.result && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="relative">
                      <Brain className="h-8 w-8 text-primary animate-pulse" />
                      <Loader2 className="h-4 w-4 animate-spin text-primary absolute -bottom-1 -right-1" />
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">Running scenario projections...</p>
                  </div>
                )}

                {simulator.error && (
                  <div className="flex items-center gap-2 p-3 rounded-sm bg-crisis-red/10 border border-crisis-red/30">
                    <AlertTriangle className="h-4 w-4 text-crisis-red shrink-0" />
                    <p className="text-xs text-crisis-red font-mono">{simulator.error}</p>
                  </div>
                )}

                {simulator.result && (
                  <div className="overflow-auto max-h-[calc(100vh-280px)]">
                    <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed font-mono
                      [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-2 [&_h1]:mt-4
                      [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-2 [&_h2]:mt-4
                      [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground/90 [&_h3]:mb-1 [&_h3]:mt-3
                      [&_strong]:text-foreground
                      [&_li]:text-muted-foreground [&_p]:text-muted-foreground
                      [&_ul]:space-y-0.5 [&_ol]:space-y-0.5
                      [&_hr]:border-border [&_hr]:my-4">
                      <ReactMarkdown>{simulator.result}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
