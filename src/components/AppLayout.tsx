import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { GlobalRiskBar } from "./GlobalRiskBar";
import { CrisisChat } from "./CrisisChat";
import { NotificationListener } from "./NotificationListener";
import { mockData } from "@/lib/mock-data";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <GlobalRiskBar level={mockData.globalRisk} />
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
    </SidebarProvider>
  );
}
