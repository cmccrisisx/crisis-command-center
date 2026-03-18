import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TourStep {
  title: string;
  description: string;
  icon: string;
  selector?: string; // optional CSS selector to highlight
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Crisis X",
    description:
      "Your AI-powered crisis intelligence command center. Let's walk through the key modules so you can respond to threats with speed and precision.",
    icon: "🛡️",
    position: "center",
  },
  {
    title: "Global Risk Bar",
    description:
      "The thin bar at the very top of the screen reflects the overall risk level in real-time — green, amber, or red. One glance tells you where things stand.",
    icon: "🔴",
    position: "top-left",
  },
  {
    title: "SIGNAL — Live Threat Detection",
    description:
      "The Signals page aggregates mentions from Twitter, news, blogs, and LinkedIn. Each signal is scored for sentiment and reach, and flagged if it comes from an influencer.",
    icon: "📡",
    position: "top-right",
  },
  {
    title: "SENSE — War Room",
    description:
      "The War Room is your collaborative command center. Select a crisis, coordinate with your team in real-time, and get AI-powered analysis of the situation.",
    icon: "⚔️",
    position: "bottom-left",
  },
  {
    title: "SPEAK — Response & Approvals",
    description:
      "Draft responses using AI-generated templates, then route them through legal and executive approval. Track every status change in real-time.",
    icon: "📢",
    position: "top-right",
  },
  {
    title: "STABILIZE — Recovery Tracking",
    description:
      "Monitor recovery metrics, sentiment trends, and reputation scores as the crisis winds down. Know exactly when things are returning to normal.",
    icon: "🛡️",
    position: "bottom-right",
  },
  {
    title: "AI Advisor",
    description:
      "The floating chat bubble in the bottom-right corner gives you instant access to the Crisis AI advisor — ask about risk assessments, draft responses, or get strategic recommendations.",
    icon: "🤖",
    position: "bottom-right",
  },
  {
    title: "You're Ready",
    description:
      "You can always re-launch this tour from Settings. Now go protect your brand — the command center is yours.",
    icon: "🚀",
    position: "center",
  },
];

const POSITION_CLASSES: Record<string, string> = {
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "top-left": "top-20 left-8",
  "top-right": "top-20 right-8",
  "bottom-left": "bottom-20 left-8",
  "bottom-right": "bottom-20 right-8",
};

export function DemoWalkthrough() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Check if user has already completed the tour
    supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        const prefs = (data?.preferences as Record<string, unknown>) || {};
        if (!prefs.tour_completed) {
          setVisible(true);
        }
      });
  }, [user]);

  const dismiss = useCallback(async () => {
    setVisible(false);
    if (!user) return;
    // Mark tour complete
    const { data } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single();
    const prefs = ((data?.preferences as Record<string, unknown>) || {});
    await supabase
      .from("profiles")
      .update({ preferences: { ...prefs, tour_completed: true } })
      .eq("user_id", user.id);
  }, [user]);

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="walkthrough-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Step card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`absolute ${POSITION_CLASSES[current.position]} z-[101] w-[90vw] max-w-md`}
          >
            <div className="rounded-sm border border-border bg-card p-6 shadow-2xl shadow-primary/10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{current.icon}</span>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                      Step {step + 1} of {TOUR_STEPS.length}
                    </p>
                    <h3 className="text-base font-semibold text-foreground leading-tight mt-0.5">
                      {current.title}
                    </h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={dismiss}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Body */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {current.description}
              </p>

              {/* Progress bar */}
              <div className="flex gap-1 mb-4">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismiss}
                  className="text-xs text-muted-foreground font-mono"
                >
                  Skip tour
                </Button>
                <div className="flex gap-2">
                  {step > 0 && (
                    <Button variant="outline" size="sm" onClick={prev} className="text-xs font-mono">
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={next} className="text-xs font-mono">
                    {step < TOUR_STEPS.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Get Started
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Imperative trigger to re-launch the tour (used from Settings) */
export function useLaunchTour() {
  const { user } = useAuth();

  return useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single();
    const prefs = ((data?.preferences as Record<string, unknown>) || {});
    await supabase
      .from("profiles")
      .update({ preferences: { ...prefs, tour_completed: false } })
      .eq("user_id", user.id);
    // Reload to trigger the tour
    window.location.reload();
  }, [user]);
}
