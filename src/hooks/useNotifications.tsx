import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: "signal" | "approval" | "info";
  severity: "success" | "error" | "info" | "default";
  timestamp: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  push: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load from DB on mount / user change
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setNotifications(
          data.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type as AppNotification["type"],
            severity: r.severity as AppNotification["severity"],
            timestamp: new Date(r.created_at),
            read: r.read,
          }))
        );
      }
    };

    load();
  }, [user]);

  const push = useCallback(
    async (n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: n.title,
          description: n.description,
          type: n.type,
          severity: n.severity,
        })
        .select()
        .single();

      if (!error && data) {
        const entry: AppNotification = {
          id: data.id,
          title: data.title,
          description: data.description,
          type: data.type as AppNotification["type"],
          severity: data.severity as AppNotification["severity"],
          timestamp: new Date(data.created_at),
          read: data.read,
        };
        setNotifications((prev) => [entry, ...prev].slice(0, 100));
      }
    },
    [user]
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  const clear = useCallback(async () => {
    if (!user) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, push, markAllRead, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
