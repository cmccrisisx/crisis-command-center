import { Bell, User, LogOut } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { mockData } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const { profile, roles, signOut } = useAuth();

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
            <span className="text-muted-foreground">Signals</span>
            <span className="text-foreground font-semibold">{mockData.stats.totalSignals.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Alerts</span>
            <span className="text-crisis-red font-semibold">{mockData.stats.activeAlerts}</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <div className="hidden md:flex items-center gap-2 ml-1 pl-2 border-l border-border">
          <div className="text-right">
            <p className="text-[11px] font-medium leading-tight">{profile?.display_name || "Operator"}</p>
            {roles[0] && (
              <Badge variant="outline" className="text-[8px] font-mono h-3.5 px-1 mt-0.5">
                {roles[0].replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
