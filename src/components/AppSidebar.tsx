import {
  BookOpen,
  LayoutDashboard,
  Radio,
  Swords,
  ShieldCheck,
  BarChart3,
  FileText,
  Settings,
  Megaphone,
  Shield,
  FlaskConical,
  Target,
  ClipboardList,
} from "lucide-react";
import crisisLogo from "@/assets/crisis-x-logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type AppRole = "admin" | "pr_manager" | "legal_reviewer" | "social_manager";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  allowedRoles: AppRole[] | "all"; // "all" = every authenticated user
}

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, allowedRoles: "all" },
  { title: "User Guide", url: "/user-guide", icon: BookOpen, allowedRoles: "all" },
  { title: "Signals", url: "/signals", icon: Radio, allowedRoles: ["admin", "pr_manager", "social_manager"] },
  { title: "War Room", url: "/war-room", icon: Swords, allowedRoles: ["admin", "pr_manager", "legal_reviewer"] },
  { title: "Speak", url: "/speak", icon: Megaphone, allowedRoles: ["admin", "pr_manager", "legal_reviewer", "social_manager"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, allowedRoles: ["admin", "pr_manager", "social_manager"] },
  { title: "Stabilize", url: "/stabilize", icon: Shield, allowedRoles: ["admin", "pr_manager", "social_manager"] },
  { title: "Reports", url: "/reports", icon: FileText, allowedRoles: ["admin", "pr_manager", "legal_reviewer"] },
  { title: "Scenarios", url: "/scenarios", icon: FlaskConical, allowedRoles: ["admin", "pr_manager"] },
  { title: "Trust Ledger", url: "/trust-ledger", icon: ShieldCheck, allowedRoles: ["admin", "pr_manager"] },
  { title: "Tracking Manager", url: "/tracking-manager", icon: Target, allowedRoles: ["admin"] },
  { title: "QA Checklist", url: "/admin-qa", icon: ClipboardList, allowedRoles: ["admin"] },
];

const settingsNav: NavItem[] = [
  { title: "Settings", url: "/settings", icon: Settings, allowedRoles: ["admin"] },
];

function isAllowed(item: NavItem, roles: string[]): boolean {
  if (item.allowedRoles === "all") return true;
  if (roles.includes("admin")) return true;
  return item.allowedRoles.some((r) => roles.includes(r));
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const isActive = (path: string) => location.pathname === path;

  const { data: demoCount = 0 } = useQuery({
    queryKey: ["demo-requests-count"],
    enabled: isAdmin,
    refetchInterval: 30000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("demo_requests")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const visibleMain = mainNav.filter((item) => isAllowed(item, roles));
  const visibleSettings = settingsNav.filter((item) => isAllowed(item, roles));

  return (
    <Sidebar collapsible="icon" className="border-r border-border" data-tour="sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img
            src={crisisLogo}
            alt="Crisis-X"
            className={collapsed ? "h-8 w-auto shrink-0" : "h-14 w-auto shrink-0"}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {!collapsed && "Command"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleSettings.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {!collapsed && "System"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSettings.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-accent/50"
                        activeClassName="bg-accent text-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                        {item.url === "/settings" && demoCount > 0 && (
                          <span className="ml-auto inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-sm bg-crisis-red text-[9px] font-mono font-bold text-white tabular-nums">
                            {demoCount}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="text-[10px] font-mono text-muted-foreground">
            v2.0 · CRISIS-X
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
