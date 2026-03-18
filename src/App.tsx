import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="dark">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
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
