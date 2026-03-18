import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, FileText, Send, Copy, Check, Loader2, MessageSquare, Megaphone, History } from "lucide-react";
import { useCrisisAI } from "@/hooks/useCrisisAI";
import { mockData } from "@/lib/mock-data";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const templates = [
  {
    id: "t1",
    type: "holding" as const,
    title: "Initial Holding Statement",
    content: "We are aware of the issue affecting [service/product]. Our team is actively investigating and working to resolve this as quickly as possible. We will provide updates as more information becomes available. We apologize for any inconvenience.",
    channel: "general",
  },
  {
    id: "t2",
    type: "holding" as const,
    title: "Service Disruption Acknowledgment",
    content: "We are experiencing a service disruption that is affecting some of our customers. Our technical teams have been mobilized and are working around the clock to restore full service. Customer safety remains our top priority.",
    channel: "twitter",
  },
  {
    id: "t3",
    type: "apology" as const,
    title: "Full Apology Statement",
    content: "We sincerely apologize for the [incident] that has affected our customers. We take full responsibility and are committed to: 1) Resolving the immediate issue, 2) Conducting a thorough investigation, 3) Implementing measures to prevent recurrence. We value your trust and are working to earn it back.",
    channel: "general",
  },
  {
    id: "t4",
    type: "clarification" as const,
    title: "Factual Clarification",
    content: "We want to address recent reports regarding [topic]. The facts are: [fact 1], [fact 2], [fact 3]. We are committed to transparency and will continue to share verified information as it becomes available.",
    channel: "press",
  },
  {
    id: "t5",
    type: "apology" as const,
    title: "Customer-Facing Apology (Social)",
    content: "We hear you, and we're sorry. The [issue] is unacceptable and we own that. Here's what we're doing right now: [action]. We'll keep you updated every [timeframe]. Thank you for your patience. 🙏",
    channel: "twitter",
  },
];

const channels = [
  { value: "twitter", label: "Twitter/X", icon: "𝕏" },
  { value: "linkedin", label: "LinkedIn", icon: "in" },
  { value: "press", label: "Press Release", icon: "📰" },
  { value: "general", label: "General", icon: "📋" },
];

export default function Speak() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [selectedChannel, setSelectedChannel] = useState("twitter");
  const [draftContent, setDraftContent] = useState("");
  const [copied, setCopied] = useState(false);
  const drafter = useCrisisAI();

  const generateDraft = () => {
    const crisisContext = `${mockData.crisis.title}: ${mockData.crisis.description}`;
    drafter.analyzeAdvanced({
      type: "draft_response",
      crisisContext,
      templateContent: selectedTemplate.content,
      channel: selectedChannel,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const logResponse = async (content: string, channel: string) => {
    if (!user) return;
    const { error } = await supabase.from("response_log").insert({
      user_id: user.id,
      content,
      channel,
      approval_status: "draft",
    });
    if (error) {
      toast.error("Failed to log response");
    } else {
      toast.success("Response saved to audit trail");
    }
  };

  const typeColor = (t: string) => {
    switch (t) {
      case "holding": return "border-crisis-amber/30 text-crisis-amber";
      case "apology": return "border-crisis-red/30 text-crisis-red";
      case "clarification": return "border-crisis-blue/30 text-crisis-blue";
      default: return "border-border text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">SPEAK — Response Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Draft, review, and publish crisis responses</p>
          </div>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="templates" className="text-xs font-mono gap-1.5">
              <FileText className="h-3 w-3" /> Templates
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs font-mono gap-1.5">
              <Brain className="h-3 w-3" /> AI Draft
            </TabsTrigger>
            <TabsTrigger value="publish" className="text-xs font-mono gap-1.5">
              <Megaphone className="h-3 w-3" /> Publish
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs font-mono gap-1.5">
              <History className="h-3 w-3" /> Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {templates.map((tmpl) => (
                <Card
                  key={tmpl.id}
                  className={`cursor-pointer transition-colors ${selectedTemplate.id === tmpl.id ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => setSelectedTemplate(tmpl)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono">{tmpl.title}</CardTitle>
                      <Badge variant="outline" className={`text-[9px] font-mono h-4 px-1.5 ${typeColor(tmpl.type)}`}>
                        {tmpl.type.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-[9px] font-mono">{tmpl.channel}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-[10px] font-mono h-6"
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(tmpl.content); }}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Draft Tab */}
          <TabsContent value="draft">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Base Template</label>
                    <Select value={selectedTemplate.id} onValueChange={(v) => setSelectedTemplate(templates.find(t => t.id === v) || templates[0])}>
                      <SelectTrigger className="text-xs font-mono bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id} className="text-xs font-mono">{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Target Channel</label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="text-xs font-mono bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map(ch => (
                          <SelectItem key={ch.value} value={ch.value} className="text-xs font-mono">
                            {ch.icon} {ch.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateDraft} className="w-full text-xs font-mono uppercase tracking-wider" disabled={drafter.loading}>
                    {drafter.loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Brain className="h-3.5 w-3.5 mr-1.5" />}
                    Generate AI Draft
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">AI-Generated Draft</CardTitle>
                </CardHeader>
                <CardContent>
                  {!drafter.result && !drafter.loading && (
                    <p className="text-xs text-muted-foreground font-mono py-8 text-center">Select a template and channel, then generate a draft.</p>
                  )}
                  {drafter.loading && !drafter.result && (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs font-mono text-muted-foreground">Drafting response...</span>
                    </div>
                  )}
                  {drafter.result && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-sm bg-surface-elevated border border-border overflow-auto max-h-[400px]">
                        <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed font-mono [&_h2]:text-xs [&_h2]:font-bold [&_strong]:text-foreground [&_li]:text-muted-foreground [&_p]:text-muted-foreground">
                          <ReactMarkdown>{drafter.result}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-[10px] font-mono h-7" onClick={() => copyToClipboard(drafter.result)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="text-[10px] font-mono h-7" onClick={() => logResponse(drafter.result, selectedChannel)}>
                          <MessageSquare className="h-3 w-3 mr-1" /> Save to Audit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[10px] font-mono h-7 ml-auto" onClick={() => { drafter.reset(); generateDraft(); }}>
                          <Brain className="h-3 w-3 mr-1" /> Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Publish Tab */}
          <TabsContent value="publish">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">Compose Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="text-xs font-mono bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map(ch => (
                        <SelectItem key={ch.value} value={ch.value} className="text-xs font-mono">
                          {ch.icon} {ch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="Type or paste your response here..."
                    className="min-h-[200px] text-sm font-mono bg-card"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {draftContent.length} chars
                      {selectedChannel === "twitter" && draftContent.length > 280 && (
                        <span className="text-crisis-red ml-2">Exceeds 280 char limit</span>
                      )}
                    </span>
                    <Button
                      className="text-xs font-mono uppercase tracking-wider"
                      onClick={() => {
                        if (draftContent.trim()) {
                          logResponse(draftContent, selectedChannel);
                          setDraftContent("");
                        }
                      }}
                      disabled={!draftContent.trim()}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Submit for Approval
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">Channel Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {channels.map(ch => (
                    <div key={ch.value} className={`p-3 rounded-sm border mb-2 ${selectedChannel === ch.value ? "border-primary/30 bg-primary/5" : "border-border bg-surface-elevated"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{ch.icon}</span>
                        <span className="text-xs font-mono font-semibold">{ch.label}</span>
                        {selectedChannel === ch.value && <Badge variant="outline" className="text-[8px] font-mono h-3.5 px-1 text-primary border-primary/30">SELECTED</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {ch.value === "twitter" && "Max 280 characters. Concise, empathetic tone."}
                        {ch.value === "linkedin" && "Professional tone. 1-3 paragraphs recommended."}
                        {ch.value === "press" && "Formal press release format. Include quotes and facts."}
                        {ch.value === "general" && "Flexible format for internal or multi-purpose use."}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function AuditTrail() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    const load = async () => {
      const { data } = await supabase
        .from("response_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setResponses(data || []);
      setLoading(false);
    };
    load();
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "draft": return "text-muted-foreground border-border";
      case "pending_legal": return "text-crisis-amber border-crisis-amber/30";
      case "pending_exec": return "text-crisis-purple border-crisis-purple/30";
      case "approved": return "text-crisis-green border-crisis-green/30";
      case "published": return "text-primary border-primary/30";
      case "rejected": return "text-crisis-red border-crisis-red/30";
      default: return "text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
        <span className="text-xs font-mono text-muted-foreground">Loading audit trail...</span>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <History className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">No responses logged yet</p>
          <p className="text-xs text-muted-foreground mt-1">Draft and save responses to build your audit trail</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {responses.map((r: any) => (
        <Card key={r.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[9px] font-mono h-4 px-1.5 ${statusColor(r.approval_status)}`}>
                  {r.approval_status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1.5">{r.channel}</Badge>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
