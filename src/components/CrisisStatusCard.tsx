import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskBadge } from "@/components/RiskBadge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/lib/crisis-helpers";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import type { Tables } from "@/integrations/supabase/types";
import type { QueryClient } from "@tanstack/react-query";

type Crisis = Tables<"crises">;

const STATUS_LABELS: Record<string, string> = {
  detected: "Detected",
  active: "Active",
  responding: "Responding",
  recovering: "Recovering",
  resolved: "Resolved",
};

const STATUS_COLORS: Record<string, string> = {
  detected: "text-crisis-amber",
  active: "text-crisis-red",
  responding: "text-crisis-blue",
  recovering: "text-crisis-green",
  resolved: "text-muted-foreground",
};

interface CrisisStatusCardProps {
  crisis: Crisis;
  queryClient: QueryClient;
}

export function CrisisStatusCard({ crisis, queryClient }: CrisisStatusCardProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === crisis.status) return;
    setUpdating(true);
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("crises")
        .update(updateData)
        .eq("id", crisis.id);
      if (error) throw error;
      toast.success(`Crisis status updated to ${STATUS_LABELS[newStatus]}`);
      queryClient.invalidateQueries({ queryKey: ["dashboard-crisis"] });
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="border-crisis-red/30 bg-crisis-red/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-crisis-red" />
            <CardTitle className="text-base font-mono">{crisis.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              {updating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground absolute -left-5 top-1/2 -translate-y-1/2" />}
              <Select value={crisis.status} onValueChange={handleStatusChange} disabled={updating}>
                <SelectTrigger className="h-7 w-[140px] text-[10px] font-mono uppercase tracking-wider bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.crisis_status.map((s) => (
                    <SelectItem key={s} value={s} className="text-[10px] font-mono uppercase">
                      <span className={STATUS_COLORS[s]}>{STATUS_LABELS[s]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <RiskBadge level={crisis.risk_level} pulse />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80">{crisis.description}</p>
        <div className="flex items-center gap-4 mt-3 font-mono text-xs tabular-nums">
          <span className="text-foreground/70">Detected: <span className="text-foreground">{new Date(crisis.detected_at).toLocaleTimeString()}</span></span>
          <span className="text-foreground/70">Signals: <span className="text-foreground">{formatNumber(crisis.signal_count ?? 0)}</span></span>
          <span className="text-foreground/70">Type: <span className="text-foreground uppercase">{crisis.type}</span></span>
        </div>
      </CardContent>
    </Card>
  );
}
