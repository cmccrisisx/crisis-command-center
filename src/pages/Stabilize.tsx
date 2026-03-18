import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Shield, BarChart3, FileText, Loader2, Download } from "lucide-react";
import { mockData, formatNumber } from "@/lib/mock-data";
import { useCrisisAI } from "@/hooks/useCrisisAI";
import ReactMarkdown from "react-markdown";
import { exportToPDF } from "@/lib/pdf-export";
import { toast } from "sonner";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// Generate recovery timeline data
function generateRecoveryData() {
  const data = [];
  for (let day = 0; day <= 14; day++) {
    let rep, sov, sentiment;
    if (day <= 1) {
      rep = 82 - day * 25;
      sov = 15 + day * 30;
      sentiment = -0.2 - day * 0.35;
    } else if (day <= 5) {
      rep = 57 - (day - 1) * 5;
      sov = 45 - (day - 1) * 5;
      sentiment = -0.55 - (day - 2) * 0.08;
    } else if (day <= 10) {
      rep = 37 + (day - 5) * 6;
      sov = 25 + (day - 5) * 2;
      sentiment = -0.72 + (day - 5) * 0.12;
    } else {
      rep = 67 + (day - 10) * 3;
      sov = 35 - (day - 10) * 2;
      sentiment = -0.12 + (day - 10) * 0.06;
    }
    data.push({
      day: `Day ${day}`,
      reputation: Math.round(Math.max(0, Math.min(100, rep + (Math.random() - 0.5) * 4))),
      shareOfVoice: Math.round(Math.max(0, Math.min(100, sov + (Math.random() - 0.5) * 3))),
      sentiment: Math.round(Math.max(-100, Math.min(100, sentiment * 100 + (Math.random() - 0.5) * 5))),
    });
  }
  return data;
}

const recoveryData = generateRecoveryData();
const chartStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "4px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
};

export default function Stabilize() {
  const postCrisis = useCrisisAI();
  const currentRep = recoveryData[recoveryData.length - 1];

  const generateReport = () => {
    const crisisContext = `${mockData.crisis.title}: ${mockData.crisis.description}`;
    const signals = mockData.signals.map(s => ({ author: s.author, content: s.content, source: s.source, sentiment: s.sentiment }));
    postCrisis.analyzeAdvanced({
      type: "post_crisis_summary",
      signals,
      crisisContext,
      responseHistory: "Holding statement issued at T+47min. Full apology issued at T+3h. FCC response submitted at T+24h.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">STABILIZE — Recovery</h1>
            <p className="text-sm text-muted-foreground mt-1">Track reputation recovery & post-crisis analysis</p>
          </div>
          <Button onClick={generateReport} variant="outline" className="text-xs font-mono uppercase tracking-wider" disabled={postCrisis.loading}>
            {postCrisis.loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Brain className="h-3.5 w-3.5 mr-1.5" />}
            Generate Post-Crisis Report
          </Button>
        </div>

        {/* Recovery Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Reputation Score</p>
              <p className={`text-2xl font-mono font-bold tabular-nums mt-1 ${currentRep.reputation >= 70 ? "text-crisis-green" : currentRep.reputation >= 50 ? "text-crisis-amber" : "text-crisis-red"}`}>
                {currentRep.reputation}/100
              </p>
              <p className="text-xs font-mono text-crisis-green mt-0.5">↑ Recovering</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Share of Voice</p>
              <p className="text-2xl font-mono font-bold tabular-nums mt-1">{currentRep.shareOfVoice}%</p>
              <p className="text-[10px] font-mono text-crisis-amber mt-0.5">Declining (positive)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Sentiment Score</p>
              <p className={`text-2xl font-mono font-bold tabular-nums mt-1 ${currentRep.sentiment >= 0 ? "text-crisis-green" : "text-crisis-red"}`}>
                {currentRep.sentiment}%
              </p>
              <p className="text-[10px] font-mono text-crisis-green mt-0.5">↑ Improving</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recovery Phase</p>
              <p className="text-lg font-mono font-bold mt-1">Day 14</p>
              <Badge variant="outline" className="text-xs font-mono h-5 px-1.5 border-crisis-green/30 text-crisis-green mt-0.5">STABILIZING</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Reputation Recovery Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Reputation Recovery Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recoveryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip contentStyle={chartStyle} />
                    <Line type="monotone" dataKey="reputation" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Reputation" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Share of Voice */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-crisis-purple" />
                Share of Voice (Crisis Mentions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recoveryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip contentStyle={chartStyle} />
                    <Area type="monotone" dataKey="shareOfVoice" stroke="hsl(var(--crisis-purple))" fill="hsl(var(--crisis-purple) / 0.15)" strokeWidth={2} name="Share of Voice %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Recovery */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-crisis-green" />
                Sentiment Recovery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recoveryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="hsl(var(--muted-foreground))" domain={[-100, 100]} />
                    <Tooltip contentStyle={chartStyle} />
                    <Area
                      type="monotone"
                      dataKey="sentiment"
                      stroke="hsl(var(--crisis-green))"
                      fill="hsl(var(--crisis-green) / 0.15)"
                      strokeWidth={2}
                      name="Sentiment %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Post-Crisis Report */}
        {(postCrisis.result || postCrisis.loading) && (
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                AI Post-Crisis Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postCrisis.loading && !postCrisis.result && (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">Generating post-crisis analysis...</span>
                </div>
              )}
              {postCrisis.result && (
                <div className="p-4 rounded-sm bg-surface-elevated border border-border overflow-auto max-h-[600px]" id="post-crisis-report">
                  <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed font-mono [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:uppercase [&_h2]:tracking-wider [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_ul]:space-y-1">
                    <ReactMarkdown>{postCrisis.result}</ReactMarkdown>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                {postCrisis.loading && postCrisis.result && (
                  <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-primary/30 text-primary animate-pulse">
                    <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                    STREAMING
                  </Badge>
                )}
                {postCrisis.result && !postCrisis.loading && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-mono h-7 whitespace-nowrap"
                    onClick={() => {
                      exportToPDF({
                        title: "Post-Crisis Analysis Report",
                        subtitle: `${mockData.crisis.title} — Crisis-X`,
                        sections: [
                          { title: "AI Analysis", content: postCrisis.result },
                          { title: "Recovery Metrics (Day 14)", content: `Reputation Score: ${currentRep.reputation}/100\nShare of Voice: ${currentRep.shareOfVoice}%\nSentiment Score: ${currentRep.sentiment}%\nPhase: STABILIZING` },
                        ],
                      });
                      toast.success("Post-crisis report PDF downloaded");
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lessons Learned */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Lessons Learned Archive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { lesson: "Initial response delayed by 47 minutes — establish 15-minute response protocol", category: "Process", severity: "high" },
              { lesson: "911 impact was not flagged early enough — add emergency services keyword monitoring", category: "Detection", severity: "critical" },
              { lesson: "Social media team had no pre-approved holding statement — create template library", category: "Preparation", severity: "high" },
              { lesson: "Competitor monitoring gap — competitors capitalized within 2 hours", category: "Intelligence", severity: "medium" },
              { lesson: "Internal communication worked well — Slack war room was effective", category: "Coordination", severity: "low" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-sm bg-surface-elevated border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-xs font-mono h-5 px-1.5 ${
                    item.severity === "critical" ? "text-crisis-red border-crisis-red/30" :
                    item.severity === "high" ? "text-crisis-amber border-crisis-amber/30" :
                    item.severity === "medium" ? "text-crisis-blue border-crisis-blue/30" :
                    "text-crisis-green border-crisis-green/30"
                  }`}>
                    {item.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-mono h-5 px-1.5">{item.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.lesson}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
