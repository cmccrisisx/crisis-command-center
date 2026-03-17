import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="h-1 w-32 bg-primary animate-pulse-glow rounded-full mx-auto mb-4" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Initializing Crisis X</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
