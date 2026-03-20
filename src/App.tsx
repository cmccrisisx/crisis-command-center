import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import Signals from "./pages/Signals.tsx";
import WarRoom from "./pages/WarRoom.tsx";
import Speak from "./pages/Speak.tsx";
import Analytics from "./pages/Analytics.tsx";
import Stabilize from "./pages/Stabilize.tsx";
import Reports from "./pages/Reports.tsx";
import SettingsPage from "./pages/Settings.tsx";
import Auth from "./pages/Auth.tsx";
import Scenarios from "./pages/Scenarios.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import Launch from "./pages/Launch.tsx";

const queryClient = new QueryClient();

function LandingOrDashboard() {
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

  return user ? <Index /> : <Landing />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="dark bg-background text-foreground min-h-screen">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/launch" element={<Launch />} />
              <Route path="/" element={<LandingOrDashboard />} />
              <Route path="/signals" element={<ProtectedRoute><Signals /></ProtectedRoute>} />
              <Route path="/war-room" element={<ProtectedRoute><WarRoom /></ProtectedRoute>} />
              <Route path="/speak" element={<ProtectedRoute><Speak /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/stabilize" element={<ProtectedRoute><Stabilize /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/scenarios" element={<ProtectedRoute><Scenarios /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
