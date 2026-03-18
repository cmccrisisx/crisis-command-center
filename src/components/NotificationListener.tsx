import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const SOURCE_ICONS: Record<string, string> = {
  twitter: "🐦",
  news: "📰",
  blog: "📝",
  linkedin: "💼",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_legal: "Pending Legal Review",
  pending_exec: "Pending Exec Approval",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

export function NotificationListener() {
  const { user } = useAuth();
  const { push } = useNotifications();

  useEffect(() => {
    if (!user) return;

    const signalChannel = supabase
      .channel("signal-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals" },
        (payload) => {
          const signal = payload.new as any;
          const icon = SOURCE_ICONS[signal.source] || "📡";
          const sentiment = signal.sentiment === "negative" ? "🔴" : signal.sentiment === "positive" ? "🟢" : "🟡";
          const title = `${icon} New Signal Detected`;
          const description = `${sentiment} ${signal.author}: "${signal.content?.slice(0, 80)}${signal.content?.length > 80 ? "…" : ""}"`;

          toast(title, { description, duration: 6000 });
          push({ title, description, type: "signal", severity: "default" });
        }
      )
      .subscribe();

    const approvalChannel = supabase
      .channel("approval-notifications")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "response_log" },
        (payload) => {
          const response = payload.new as any;
          const oldStatus = (payload.old as any)?.approval_status;
          const newStatus = response.approval_status;
          if (oldStatus === newStatus) return;

          const label = STATUS_LABELS[newStatus] || newStatus;
          const isGood = newStatus === "approved" || newStatus === "published";
          const isBad = newStatus === "rejected";

          const title = isGood
            ? `Response ${label}`
            : isBad
            ? `Response ${label}`
            : `Approval: ${label}`;
          const description = isBad
            ? `${response.channel} response was rejected`
            : `${response.channel} response status updated`;
          const severity = isGood ? "success" as const : isBad ? "error" as const : "info" as const;

          if (isGood) toast.success(title, { description, duration: 5000 });
          else if (isBad) toast.error(title, { description, duration: 5000 });
          else toast.info(title, { description, duration: 5000 });

          push({ title, description, type: "approval", severity });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(signalChannel);
      supabase.removeChannel(approvalChannel);
    };
  }, [user, push]);

  return null;
}
