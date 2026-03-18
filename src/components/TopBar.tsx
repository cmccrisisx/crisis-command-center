import { Bell, LogOut, CheckCheck, Trash2 } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mockData } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-crisis-red/15 text-crisis-red border-crisis-red/30",
  pr_manager: "bg-crisis-blue/15 text-crisis-blue border-crisis-blue/30",
  legal_reviewer: "bg-crisis-amber/15 text-crisis-amber border-crisis-amber/30",
  social_manager: "bg-crisis-green/15 text-crisis-green border-crisis-green/30",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "ADMIN",
  pr_manager: "PR MANAGER",
  legal_reviewer: "LEGAL",
  social_manager: "SOCIAL",
};

const SEVERITY_DOT: Record<string, string> = {
  success: "bg-crisis-green",
  error: "bg-crisis-red",
  info: "bg-crisis-blue",
  default: "bg-crisis-amber",
};

export function TopBar() {
  const { profile, roles, signOut } = useAuth();
  const { notifications, unreadCount, markAllRead, clear } = useNotifications();

  return (
    <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-foreground/70 uppercase tracking-wider">Global Risk:</span>
          <RiskBadge level={mockData.globalRisk} pulse size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-4 mr-4 font-mono text-xs tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground/70">Signals</span>
            <span className="text-foreground font-semibold">{mockData.stats.totalSignals.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-foreground/70">Alerts</span>
            <span className="text-crisis-red font-semibold">{mockData.stats.activeAlerts}</span>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[9px] font-mono font-bold text-primary-foreground leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-primary">({unreadCount})</span>
                )}
              </p>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAllRead} title="Mark all read">
                    <CheckCheck className="h-3.5 w-3.5" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clear} title="Clear all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* List */}
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground font-mono">No notifications yet</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Alerts will appear here in real-time
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-3 py-2.5 border-b border-border last:border-0 transition-colors ${
                      n.read ? "opacity-60" : "bg-accent/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${SEVERITY_DOT[n.severity]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-foreground truncate">{n.title}</span>
                          <span className="text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
                            {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-border">
          <div className="text-right">
            <p className="text-xs font-medium leading-tight">{profile?.display_name || "Operator"}</p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              {roles.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className={`text-[8px] font-mono h-3.5 px-1 ${ROLE_STYLES[role] || ""}`}
                >
                  {ROLE_LABELS[role] || role.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
