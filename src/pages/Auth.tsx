import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users to dashboard
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Risk bar */}
        <div className="h-1 w-full fixed top-0 left-0 bg-crisis-green z-50" />

        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-mono font-bold text-2xl tracking-tight text-foreground">
                CRISIS<span className="text-primary">X</span>
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Crisis Intelligence Platform
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label className="text-xs font-mono">Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 font-mono text-sm bg-background"
                  />
                </div>
              )}
              <div>
                <Label className="text-xs font-mono">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  required
                  className="mt-1 font-mono text-sm bg-background"
                />
              </div>
              <div>
                <Label className="text-xs font-mono">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="mt-1 font-mono text-sm bg-background"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-crisis-red bg-crisis-red/10 border border-crisis-red/20 p-2 rounded-sm">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full font-mono text-xs uppercase tracking-wider" disabled={loading}>
                {loading ? "..." : isSignUp ? (
                  <><UserPlus className="h-3.5 w-3.5 mr-1.5" /> Create Account</>
                ) : (
                  <><LogIn className="h-3.5 w-3.5 mr-1.5" /> Sign In</>
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
