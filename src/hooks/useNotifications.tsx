import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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

let _counter = 0;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const push = useCallback((n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const entry: AppNotification = {
      ...n,
      id: `notif-${++_counter}-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [entry, ...prev].slice(0, 100)); // keep last 100
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

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
