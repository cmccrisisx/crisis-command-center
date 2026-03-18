import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain, FileText, Send, Copy, Check, Loader2, MessageSquare,
  Megaphone, History, ShieldCheck, Gavel, Globe, ArrowRight, X,
} from "lucide-react";
import { useCrisisAI } from "@/hooks/useCrisisAI";
import { mockData } from "@/lib/mock-data";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type ResponseRow = Tables<"response_log">;

const templates = [
  { id: "t1", type: "holding" as const, title: "Initial Holding Statement", content: "We are aware of the issue affecting [service/product]. Our team is actively investigating and working to resolve this as quickly as possible. We will provide updates as more information becomes available. We apologize for any inconvenience.", channel: "general" },
  { id: "t2", type: "holding" as const, title: "Service Disruption Acknowledgment", content: "We are experiencing a service disruption that is affecting some of our customers. Our technical teams have been mobilized and are working around the clock to restore full service. Customer safety remains our top priority.", channel: "twitter" },
  { id: "t3", type: "apology" as const, title: "Full Apology Statement", content: "We sincerely apologize for the [incident] that has affected our customers. We take full responsibility and are committed to: 1) Resolving the immediate issue, 2) Conducting a thorough investigation, 3) Implementing measures to prevent recurrence. We value your trust and are working to earn it back.", channel: "general" },
  { id: "t4", type: "clarification" as const, title: "Factual Clarification", content: "We want to address recent reports regarding [topic]. The facts are: [fact 1], [fact 2], [fact 3]. We are committed to transparency and will continue to share verified information as it becomes available.", channel: "press" },
  { id: "t5", type: "apology" as const, title: "Customer-Facing Apology (Social)", content: "We hear you, and we're sorry. The [issue] is unacceptable and we own that. Here's what we're doing right now: [action]. We'll keep you updated every [timeframe]. Thank you for your patience. 🙏", channel: "twitter" },
];

const channels = [
  { value: "twitter", label: "Twitter/X", icon: "𝕏" },
  { value: "linkedin", label: "LinkedIn", icon: "in" },
  { value: "press", label: "Press Release", icon: "📰" },
  { value: "general", label: "General", icon: "📋" },
];

const WORKFLOW_STEPS = [
  { status: "draft", label: "DRAFT", role: "pr_manager", icon: FileText },
  { status: "pending_legal", label: "LEGAL REVIEW", role: "legal_reviewer", icon: Gavel },
  { status: "pending_exec", label: "EXEC APPROVAL", role: "admin", icon: ShieldCheck },
  { status: "approved", label: "APPROVED", role: "social_manager", icon: Check },
  { status: "published", label: "PUBLISHED", role: null, icon: Globe },
];

function getNextStatus(current: string): string | null {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.status === current);
  if (idx < 0 || idx >= WORKFLOW_STEPS.length - 1) return null;
  return WORKFLOW_STEPS[idx + 1].status;
}

function getActionLabel(current: string): string {
  switch (current) {
    case "draft": return "Submit to Legal";
    case "pending_legal": return "Approve & Forward to Exec";
    case "pending_exec": return "Approve";
    case "approved": return "Publish";
    default: return "Advance";
  }
}

function canUserAct(current: string, roles: string[]): boolean {
  if (roles.includes("admin")) return true;
  switch (current) {
    case "draft": return roles.includes("pr_manager");
    case "pending_legal": return roles.includes("legal_reviewer");
    case "pending_exec": return roles.includes("admin");
    case "approved": return roles.includes("social_manager");
    default: return false;
  }
}

function canUserReject(current: string, roles: string[]): boolean {
  if (roles.includes("admin")) return ["pending_legal", "pending_exec"].includes(current);
  if (roles.includes("legal_reviewer")) return ["pending_legal", "pending_exec"].includes(current);
  return false;
}

function statusColor(s: string) {
  switch (s) {
    case "draft": return "text-muted-foreground border-border";
    case "pending_legal": return "text-crisis-amber border-crisis-amber/30 bg-crisis-amber/5";
    case "pending_exec": return "text-crisis-purple border-crisis-purple/30 bg-crisis-purple/5";
    case "approved": return "text-crisis-green border-crisis-green/30 bg-crisis-green/5";
    case "published": return "text-primary border-primary/30 bg-primary/5";
    case "rejected": return "text-crisis-red border-crisis-red/30 bg-crisis-red/5";
    default: return "text-muted-foreground border-border";
  }
}

export default function Speak() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
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
      toast.success("Response saved as draft");
      queryClient.invalidateQueries({ queryKey: ["responses"] });
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
            <p className="text-sm text-muted-foreground mt-1">Draft, review, approve, and publish crisis responses</p>
          </div>
          <WorkflowLegend roles={roles} />
        </div>

        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="queue" className="text-xs font-mono gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Approval Queue
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs font-mono gap-1.5">
              <FileText className="h-3 w-3" /> Templates
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs font-mono gap-1.5">
              <Brain className="h-3 w-3" /> AI Draft
            </TabsTrigger>
            <TabsTrigger value="publish" className="text-xs font-mono gap-1.5">
              <Megaphone className="h-3 w-3" /> Compose
            </TabsTrigger>
          </TabsList>

          {/* Approval Queue Tab */}
          <TabsContent value="queue">
            <ApprovalQueue />
          </TabsContent>

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
                      <Badge variant="outline" className={`text-xs font-mono h-5 px-1.5 ${typeColor(tmpl.type)}`}>
                        {tmpl.type.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs font-mono">{tmpl.channel}</Badge>
                      <Button variant="ghost" size="sm" className="ml-auto text-xs font-mono h-6" onClick={(e) => { e.stopPropagation(); copyToClipboard(tmpl.content); }}>
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
                      <SelectTrigger className="text-xs font-mono bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {templates.map(t => <SelectItem key={t.id} value={t.id} className="text-xs font-mono">{t.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground mb-1.5 block">Target Channel</label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="text-xs font-mono bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {channels.map(ch => <SelectItem key={ch.value} value={ch.value} className="text-xs font-mono">{ch.icon} {ch.label}</SelectItem>)}
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
                        <Button variant="outline" size="sm" className="text-xs font-mono h-7" onClick={() => copyToClipboard(drafter.result)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs font-mono h-7" onClick={() => logResponse(drafter.result, selectedChannel)}>
                          <MessageSquare className="h-3 w-3 mr-1" /> Save as Draft
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs font-mono h-7 ml-auto" onClick={() => { drafter.reset(); generateDraft(); }}>
                          <Brain className="h-3 w-3 mr-1" /> Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="publish">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono uppercase tracking-wider">Compose Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="text-xs font-mono bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {channels.map(ch => <SelectItem key={ch.value} value={ch.value} className="text-xs font-mono">{ch.icon} {ch.label}</SelectItem>)}
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
                      Save as Draft
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
                        {selectedChannel === ch.value && <Badge variant="outline" className="text-xs font-mono h-4 px-1.5 text-primary border-primary/30">SELECTED</Badge>}
                      </div>
                      <p className="text-xs text-foreground/70 font-mono">
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
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* ── Workflow Legend ── */
function WorkflowLegend({ roles }: { roles: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {WORKFLOW_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.role ? roles.includes(step.role) || roles.includes("admin") : false;
        return (
          <div key={step.status} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[9px] font-mono border ${isActive ? statusColor(step.status) : "border-border/50 text-muted-foreground/50"}`}>
              <Icon className="h-2.5 w-2.5" />
              {step.label}
            </div>
            {i < WORKFLOW_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Approval Queue ── */
function ApprovalQueue() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [transitioning, setTransitioning] = useState<string | null>(null);

  const { data: responses = [], isLoading } = useQuery({
    queryKey: ["responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("response_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ResponseRow[];
    },
  });

  const transition = async (responseId: string, newStatus: string) => {
    if (!user) return;
    setTransitioning(responseId);
    try {
      const { error } = await supabase.rpc("transition_approval_status", {
        _response_id: responseId,
        _new_status: newStatus as "draft" | "pending_legal" | "pending_exec" | "approved" | "rejected" | "published",
        _user_id: user.id,
      });
      if (error) {
        toast.error(error.message || "Transition failed");
      } else {
        toast.success(`Status changed to ${newStatus.replace("_", " ")}`);
        queryClient.invalidateQueries({ queryKey: ["responses"] });
      }
    } finally {
      setTransitioning(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
        <span className="text-xs font-mono text-muted-foreground">Loading queue...</span>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">No responses in the queue</p>
          <p className="text-xs text-muted-foreground mt-1">Create a draft from the AI Draft or Compose tabs</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {responses.map((r) => {
        const nextStatus = getNextStatus(r.approval_status);
        const userCanAct = canUserAct(r.approval_status, roles);
        const userCanReject = canUserReject(r.approval_status, roles);
        const isTransitioning = transitioning === r.id;
        const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.status === r.approval_status);

        return (
          <Card key={r.id} className="overflow-hidden">
            {/* Progress bar */}
            <div className="h-0.5 bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((stepIndex + 1) / WORKFLOW_STEPS.length) * 100}%` }}
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[9px] font-mono h-5 px-1.5 ${statusColor(r.approval_status)}`}>
                      {r.approval_status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px] font-mono h-5 px-1.5">{r.channel}</Badge>
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums ml-auto">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.content}</p>
                  {r.approved_at && (
                    <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                      Last action: {new Date(r.approved_at).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.approval_status === "rejected" && (
                    <span className="text-[9px] font-mono text-crisis-red">REJECTED</span>
                  )}
                  {r.approval_status === "published" && (
                    <span className="text-[9px] font-mono text-primary">LIVE</span>
                  )}
                  {userCanReject && r.approval_status !== "rejected" && r.approval_status !== "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] font-mono h-7 text-crisis-red border-crisis-red/30 hover:bg-crisis-red/10"
                      disabled={isTransitioning}
                      onClick={() => transition(r.id, "rejected")}
                    >
                      {isTransitioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3 mr-1" />}
                      Reject
                    </Button>
                  )}
                  {nextStatus && userCanAct && (
                    <Button
                      size="sm"
                      className="text-[10px] font-mono h-7 uppercase tracking-wider"
                      disabled={isTransitioning}
                      onClick={() => transition(r.id, nextStatus)}
                    >
                      {isTransitioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3 mr-1" />}
                      {getActionLabel(r.approval_status)}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
