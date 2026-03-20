import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  usePageTitle("Not Found");
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded bg-destructive/10 mx-auto">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-5xl font-mono font-bold tabular-nums text-foreground tracking-tight">404</h1>
          <p className="mt-2 text-muted-foreground">
            Route <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> not found
          </p>
        </div>
        <Button asChild variant="default" size="sm">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
