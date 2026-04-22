import { useEffect, useState } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { Plus, Radar, Search, Target } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { TrackingRuleManager } from "@/components/TrackingRuleManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function TrackingManagerPage() {
  usePageTitle("Tracking Manager");
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSignal, setOpenSignal] = useState(0);

  const createParam = searchParams.get("create");
  const requestedRuleType = createParam === "keyword" || createParam === "query" ? createParam : null;

  useEffect(() => {
    if (requestedRuleType) {
      setOpenSignal((value) => value + 1);
    }
  }, [requestedRuleType]);

  const triggerCreate = (ruleType: "keyword" | "query") => {
    setSearchParams({ create: ruleType });
    setOpenSignal((value) => value + 1);
  };

  const clearCreateIntent = () => {
    if (!requestedRuleType) return;
    setSearchParams({});
  };

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
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Critical workflow</p>
              <h2 className="text-xl font-mono font-bold tracking-tight text-foreground sm:text-2xl">Add tracked keywords and queries first</h2>
              <p className="max-w-3xl text-sm text-muted-foreground">Paste names, brands, executives, or search phrases here so monitoring and analytics stay focused on the right live conversations.</p>
             <p className="text-xs text-muted-foreground">Tip: add multiple keywords at once with commas or new lines.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button onClick={() => triggerCreate("keyword")} size="lg" className="font-mono text-xs uppercase tracking-wider">
                <Plus className="h-4 w-4" />
                Add Keyword
              </Button>
              <Button onClick={() => triggerCreate("query")} size="lg" variant="outline" className="font-mono text-xs uppercase tracking-wider">
                <Search className="h-4 w-4" />
                Add Search Query
              </Button>
              <Button asChild variant="ghost" className="justify-start font-mono text-xs uppercase tracking-wider sm:ml-auto">
                <Link to="/settings">
                  <Radar className="h-3.5 w-3.5" />
                  System Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <TrackingRuleManager
          initialOpen={Boolean(requestedRuleType)}
          initialRuleType={requestedRuleType ?? "keyword"}
          openSignal={openSignal}
          onInitialOpenHandled={clearCreateIntent}
        />
      </div>
    </AppLayout>
  );
}