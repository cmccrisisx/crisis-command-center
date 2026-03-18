import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { GlobalRiskBar } from "./GlobalRiskBar";
import { CrisisChat } from "./CrisisChat";
import { NotificationListener } from "./NotificationListener";
import { DemoWalkthrough } from "./DemoWalkthrough";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/lib/mock-data";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: crisis } = useQuery({
    queryKey: ["layout-crisis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crises")
        .select("risk_level")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const riskLevel = (crisis?.risk_level ?? "medium") as RiskLevel;

  return (
    <NotificationsProvider>
      <SidebarProvider>
        <GlobalRiskBar level={riskLevel} />
        <div className="min-h-screen flex w-full pt-1">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 overflow-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
        <CrisisChat />
        <NotificationListener />
        <DemoWalkthrough />
      </SidebarProvider>
    </NotificationsProvider>
  );
}
