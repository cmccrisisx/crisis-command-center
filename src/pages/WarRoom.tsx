import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { mockData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Send, Brain, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCrisisAI } from "@/hooks/useCrisisAI";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface WarRoomMsg {
  id: string;
  user_id: string;
  message: string;
  role: string;
  message_type: string;
  created_at: string;
  display_name?: string;
}

const approvalSteps = [
  { label: "PR Draft", status: "complete" as const, assignee: "PR Manager" },
  { label: "Legal Review", status: "current" as const, assignee: "Legal Reviewer" },
  { label: "Executive Approval", status: "pending" as const, assignee: "Admin" },
  { label: "Execute", status: "pending" as const, assignee: "Social Manager" },
];

export default function WarRoom() {
  const { user, profile, roles } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<WarRoomMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiAdvisor = useCrisisAI();

  // Load existing messages and subscribe to realtime
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from("war_room_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      
      if (data) {
        // Fetch display names for users
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        
        const nameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
        setMessages(data.map(m => ({ ...m, display_name: nameMap.get(m.user_id) || "Unknown" })));
      }
      setLoading(false);
    };

    loadMessages();

    const channel = supabase
      .channel("war-room-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "war_room_messages" }, async (payload) => {
        const newMsg = payload.new as WarRoomMsg;
        // Fetch display name
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", newMsg.user_id)
          .single();
        
        setMessages(prev => [...prev, { ...newMsg, display_name: prof?.display_name || "Unknown" }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const { error } = await supabase.from("war_room_messages").insert({
      user_id: user.id,
      message: inputValue.trim(),
      role: roles[0] || "user",
      message_type: "message",
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setInputValue("");
    }
  };

  const requestAIAdvice = () => {
    const signals = mockData.signals.map(s => ({ author: s.author, content: s.content, source: s.source, sentiment: s.sentiment }));
    const crisisContext = `${mockData.crisis.title}: ${mockData.crisis.description}`;
    aiAdvisor.analyze("response", signals, crisisContext);
  };

  const roleLabel = (r: string) => r.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold tracking-tight">War Room</h1>
            <RiskBadge level="critical" pulse />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted-foreground">Active since</span>
            <span className="text-foreground tabular-nums">{mockData.crisis.detectedAt.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Crisis Summary */}
        <Card className="border-crisis-red/20 bg-crisis-red/10 dark:bg-red-950/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-crisis-red" />
              <span className="font-mono font-bold text-sm">{mockData.crisis.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{mockData.crisis.description}</p>
          </CardContent>
        </Card>

        {/* Approval Chain */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Chain of Command</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {approvalSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 flex-1">
                  <div className={`flex-1 p-3 rounded-sm border text-center ${
                    step.status === "complete" ? "bg-crisis-green/10 border-crisis-green/30" :
                    step.status === "current" ? "bg-crisis-amber/10 border-crisis-amber/30 glow-amber" :
                    "bg-secondary border-border"
                  }`}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      {step.status === "complete" ? (
                        <CheckCircle className="h-3.5 w-3.5 text-crisis-green" />
                      ) : step.status === "current" ? (
                        <Clock className="h-3.5 w-3.5 text-crisis-amber" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground" />
                      )}
                      <span className="text-xs font-mono font-semibold">{step.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{step.assignee}</p>
                  </div>
                  {i < approvalSteps.length - 1 && (
                    <div className="text-muted-foreground text-xs">→</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Chat / Decision Log */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Decision Log</CardTitle>
                <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5">
                  {messages.length} entries
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={scrollRef} className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                    <span className="text-xs font-mono text-muted-foreground">Loading messages...</span>
                  </div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="text-center py-8 text-xs font-mono text-muted-foreground">
                    No messages yet. Start the conversation.
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-sm border ${msg.message_type === "ai" ? "bg-primary/5 border-primary/20" : "bg-surface-elevated border-border"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{msg.display_name || "Unknown"}</span>
                      <Badge variant="outline" className="text-xs font-mono h-5 px-1.5">{roleLabel(msg.role)}</Badge>
                      <span className="text-[10px] font-mono text-muted-foreground ml-auto tabular-nums">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add to decision log..."
                  className="text-sm bg-card"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button size="icon" className="shrink-0" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Advisor + Assignments */}
          <div className="space-y-4">
            {/* AI Quick Advisor */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  AI Advisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!aiAdvisor.result && !aiAdvisor.loading && (
                  <Button onClick={requestAIAdvice} variant="outline" className="w-full text-xs font-mono">
                    <Brain className="h-3 w-3 mr-1.5" />
                    Get AI Recommendation
                  </Button>
                )}
                {aiAdvisor.loading && !aiAdvisor.result && (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs font-mono text-muted-foreground">Analyzing...</span>
                  </div>
                )}
                {aiAdvisor.result && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-sm bg-surface-elevated border border-border overflow-auto max-h-[250px]">
                      <div className="prose prose-sm prose-invert max-w-none text-[11px] leading-relaxed font-mono [&_h2]:text-xs [&_h2]:font-bold [&_h3]:text-[11px] [&_strong]:text-foreground [&_li]:text-muted-foreground [&_p]:text-muted-foreground">
                        <ReactMarkdown>{aiAdvisor.result}</ReactMarkdown>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] font-mono h-6" onClick={() => { aiAdvisor.reset(); requestAIAdvice(); }}>
                      <Brain className="h-2.5 w-2.5 mr-1" />
                      Refresh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "PR Manager", task: "Draft public response", status: "In Progress" },
                  { name: "Legal Reviewer", task: "Review compliance language", status: "Reviewing" },
                  { name: "Social Manager", task: "Monitor & report sentiment", status: "Active" },
                  { name: "Admin", task: "Final approval", status: "Waiting" },
                ].map((person) => (
                  <div key={person.name} className="p-3 rounded-sm bg-surface-elevated border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{person.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{person.task}</p>
                    <p className="text-[10px] font-mono text-crisis-amber mt-1">{person.status}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
