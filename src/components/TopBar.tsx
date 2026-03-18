import { Bell, LogOut } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mockData } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

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

const mockAlerts = [
  { id: 1, title: "Emergency Services Disruption", risk: "critical" as const, time: "12 min ago" },
  { id: 2, title: "FCC Investigation Announced", risk: "high" as const, time: "45 min ago" },
  { id: 3, title: "Stock Price Drop 4.2%", risk: "high" as const, time: "1h ago" },
  { id: 4, title: "Influencer @TechReporter_Jane engaging", risk: "medium" as const, time: "2h ago" },
  { id: 5, title: "Customer churn signals rising", risk: "medium" as const, time: "3h ago" },
];

const riskColors: Record<string, string> = {
  critical: "text-crisis-red",
  high: "text-crisis-amber",
  medium: "text-crisis-blue",
  low: "text-crisis-green",
};

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
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider">Recent Alerts</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="px-3 py-2.5 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-mono font-semibold uppercase ${riskColors[alert.risk]}`}>
                      {alert.risk}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">{alert.time}</span>
                  </div>
                  <p className="text-xs text-foreground">{alert.title}</p>
                </div>
              ))}
            </div>
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
