import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, AlertCircle, Radio, Brain, Target, Megaphone, Shield } from "lucide-react";
import { motion } from "framer-motion";
import crisisLogo from "@/assets/crisis-x-logo.png";
import PublicNav from "@/components/PublicNav";

const modules = [
  { icon: Radio, label: "Signal", color: "bg-crisis-blue" },
  { icon: Brain, label: "Sense", color: "bg-crisis-purple" },
  { icon: Target, label: "Strategize", color: "bg-crisis-amber" },
  { icon: Megaphone, label: "Speak", color: "bg-crisis-red" },
  { icon: Shield, label: "Stabilize", color: "bg-crisis-green" },
];

export default function Auth() {
  usePageTitle("Sign In");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

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
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <PublicNav hideSignIn />
        {/* Risk bar */}
        <div className="h-1 w-full fixed top-0 left-0 z-50 flex">
          <div className="flex-1 bg-risk-critical" />
          <div className="flex-1 bg-risk-high" />
          <div className="flex-1 bg-risk-medium" />
          <div className="flex-1 bg-risk-low" />
        </div>

        {/* Left branding panel */}
        <div className="relative md:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-hidden bg-card border-b md:border-b-0 md:border-r border-border">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-sm"
          >
            <img
              src={crisisLogo}
              alt="Crisis-X"
              className="h-24 md:h-32 w-auto mx-auto mb-8"
            />

            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Crisis Intelligence.
              <br />
              <span className="text-primary">Instant Clarity.</span>
            </h2>

            <p className="text-sm text-muted-foreground font-mono mb-8">
              Detect. Coordinate. Respond. Recover.
            </p>

            {/* Module pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-background/50 backdrop-blur-sm"
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${mod.color}`} />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {mod.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Decorative risk bars */}
            <div className="mt-10 flex gap-1 justify-center">
              {["bg-risk-critical", "bg-risk-high", "bg-risk-medium", "bg-risk-low"].map((c) => (
                <div key={c} className={`h-1 w-10 rounded-full ${c} opacity-60`} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right form panel */}
        <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h1 className="text-xl font-bold mb-1">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                {isSignUp ? "Join the crisis intelligence platform" : "Sign in to your command center"}
              </p>
            </div>

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
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded-sm">
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
