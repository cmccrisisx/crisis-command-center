import { Bell, User } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { mockData } from "@/lib/mock-data";

export function TopBar() {
  return (
    <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Global Risk:</span>
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
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Reach</span>
            <span className="text-foreground font-semibold">32M</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
