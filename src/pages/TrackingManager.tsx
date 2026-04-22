import { Navigate, Link } from "react-router-dom";
import { Radar, Target } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { TrackingRuleManager } from "@/components/TrackingRuleManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function TrackingManagerPage() {
  usePageTitle("Tracking Manager");
  const { hasRole } = useAuth();

  if (!hasRole("admin")) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Admin monitoring</span>
            </div>
            <h1 className="mt-2 text-2xl font-mono font-bold tracking-tight">Keyword & Queries Manager</h1>
            <p className="mt-1 text-sm text-muted-foreground">Add, filter, and update monitoring rules from one dedicated admin page.</p>
          </div>

          <Button asChild variant="outline" className="font-mono text-xs uppercase tracking-wider lg:self-start">
            <Link to="/settings">
              <Radar className="h-3.5 w-3.5" />
              System Settings
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">This is now the fastest place to add tracked names.</p>
              <p className="text-xs text-muted-foreground">Rules saved here directly power monitoring ingestion and case-specific analysis.</p>
            </div>
          </CardContent>
        </Card>

        <TrackingRuleManager />
      </div>
    </AppLayout>
  );
}