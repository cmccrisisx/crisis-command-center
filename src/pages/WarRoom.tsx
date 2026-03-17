import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { mockData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Send } from "lucide-react";
import { useState } from "react";

const approvalSteps = [
  { label: "PR Draft", status: "complete" as const, assignee: "Sarah Chen" },
  { label: "Legal Review", status: "current" as const, assignee: "James Morton" },
  { label: "Executive Approval", status: "pending" as const, assignee: "CEO Office" },
  { label: "Execute", status: "pending" as const, assignee: "Comms Team" },
];

const warRoomMessages = [
  { id: 1, author: "Sarah Chen", role: "PR Manager", time: "14:23", message: "Initial holding statement drafted. Sending to legal for review." },
  { id: 2, author: "James Morton", role: "Legal", time: "14:31", message: "Reviewing now. Need to check regulatory implications of the 911 impact." },
  { id: 3, author: "Alex Rivera", role: "Social Media", time: "14:35", message: "Negative mentions spiking at 450/min. Competitor accounts amplifying." },
  { id: 4, author: "Sarah Chen", role: "PR Manager", time: "14:42", message: "Updated draft with legal feedback. Adding FCC compliance language." },
  { id: 5, author: "System", role: "AI", time: "14:45", message: "⚡ AI Analysis: Recommend immediate public acknowledgment. Delay beyond 15min increases sentiment damage by 23%." },
];

export default function WarRoom() {
  const [inputValue, setInputValue] = useState("");

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
        <Card className="border-crisis-red/20 bg-crisis-red/5">
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
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Decision Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {warRoomMessages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-sm border ${msg.role === "AI" ? "bg-intel/5 border-intel/20" : "bg-surface-elevated border-border"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{msg.author}</span>
                      <Badge variant="outline" className="text-[9px] font-mono h-4 px-1">{msg.role}</Badge>
                      <span className="text-[10px] font-mono text-muted-foreground ml-auto tabular-nums">{msg.time}</span>
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
                />
                <Button size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Responsibilities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Sarah Chen", role: "PR Manager", task: "Draft public response", status: "In Progress" },
                { name: "James Morton", role: "Legal", task: "Review compliance language", status: "Reviewing" },
                { name: "Alex Rivera", role: "Social Media", task: "Monitor & report sentiment", status: "Active" },
                { name: "Dana Kim", role: "Executive", task: "Final approval", status: "Waiting" },
              ].map((person) => (
                <div key={person.name} className="p-3 rounded-sm bg-surface-elevated border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{person.name}</span>
                    <Badge variant="outline" className="text-[9px] font-mono h-4 px-1">{person.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{person.task}</p>
                  <p className="text-[10px] font-mono text-crisis-amber mt-1">{person.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
