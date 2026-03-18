import { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TourStep {
  title: string;
  description: string;
  icon: string;
  target?: string; // data-tour attribute value
  cardPosition?: "auto"; // always auto-position relative to target
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Crisis X",
    description:
      "Your AI-powered crisis intelligence command center. Let's walk through the key modules so you can respond to threats with speed and precision.",
    icon: "🛡️",
  },
  {
    title: "Global Risk Bar",
    description:
      "The thin bar at the very top reflects the overall risk level in real-time — green, amber, or red. One glance tells you where things stand.",
    icon: "🔴",
    target: "risk-bar",
  },
  {
    title: "Navigation Sidebar",
    description:
      "Access every module from here: Signals, War Room, Speak, Analytics, Stabilize, Reports, and Scenarios. Items are filtered by your role.",
    icon: "📋",
    target: "sidebar",
  },
  {
    title: "SIGNAL — Live Threat Detection",
    description:
      "The Signals page aggregates mentions from Twitter, news, blogs, and LinkedIn. Each signal is scored for sentiment and reach.",
    icon: "📡",
    target: "sidebar",
  },
  {
    title: "Top Bar & Notifications",
    description:
      "Monitor global risk at a glance and check the bell icon for real-time alerts on new signals and approval status changes.",
    icon: "🔔",
    target: "notifications",
  },
  {
    title: "SPEAK — Response & Approvals",
    description:
      "Draft responses using AI-generated templates, then route them through legal and executive approval. Track every status change in real-time.",
    icon: "📢",
    target: "topbar",
  },
  {
    title: "AI Advisor — CX",
    description:
      "The floating chat bubble gives you instant access to the Crisis AI advisor — ask about risk assessments, draft responses, or get strategic recommendations.",
    icon: "🤖",
    target: "chat-bubble",
  },
  {
    title: "You're Ready",
    description:
      "You can always re-launch this tour from Settings. Now go protect your brand — the command center is yours.",
    icon: "🚀",
  },
];

const PADDING = 8;
const CARD_WIDTH = 400;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetRect(target?: string): Rect | null {
  if (!target) return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function computeCardStyle(rect: Rect | null): React.CSSProperties {
  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  let top: number;
  let left: number;

  // Vertical: prefer below, else above
  if (cy < vh / 2) {
    top = rect.top + rect.height + PADDING + 12;
  } else {
    top = rect.top - PADDING - 12 - 200; // approximate card height
  }

  // Horizontal: center on target but clamp
  left = cx - CARD_WIDTH / 2;
  left = Math.max(16, Math.min(left, vw - CARD_WIDTH - 16));
  top = Math.max(16, Math.min(top, vh - 260));

  return { top, left };
}

export function DemoWalkthrough() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<Rect | null>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        const prefs = (data?.preferences as Record<string, unknown>) || {};
        if (!prefs.tour_completed) setVisible(true);
      });
  }, [user]);

  // Measure target element whenever step changes
  useLayoutEffect(() => {
    if (!visible) return;

    const measure = () => {
      const current = TOUR_STEPS[step];
      const rect = getTargetRect(current?.target);
      setSpotlightRect(rect);
      setCardStyle(computeCardStyle(rect));
    };

    // Measure immediately + after a short delay (for layout shifts)
    measure();
    const t = setTimeout(measure, 100);

    // Re-measure on resize
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [step, visible]);

  const dismiss = useCallback(async () => {
    setVisible(false);
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single();
    const prefs = (data?.preferences as Record<string, unknown>) || {};
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

  // Keyboard nav
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, step]);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const hasSpotlight = !!spotlightRect;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="walkthrough-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
        >
          {/* SVG overlay with cutout */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <defs>
              <mask id="tour-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {hasSpotlight && (
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{
                      x: spotlightRect!.left - PADDING,
                      y: spotlightRect!.top - PADDING,
                      width: spotlightRect!.width + PADDING * 2,
                      height: spotlightRect!.height + PADDING * 2,
                      opacity: 1,
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    rx="4"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="hsl(222 47% 4% / 0.82)"
              mask="url(#tour-mask)"
              style={{ pointerEvents: "all" }}
            />
          </svg>

          {/* Spotlight ring glow */}
          {hasSpotlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                top: spotlightRect!.top - PADDING,
                left: spotlightRect!.left - PADDING,
                width: spotlightRect!.width + PADDING * 2,
                height: spotlightRect!.height + PADDING * 2,
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute rounded-sm border border-primary/60 shadow-[0_0_20px_4px_hsl(var(--primary)/0.25)] pointer-events-none"
              style={{ zIndex: 101 }}
            />
          )}

          {/* Click-blocker on overlay area (outside spotlight) */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 100 }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Step card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -12 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute"
            style={{ ...cardStyle, width: CARD_WIDTH, maxWidth: "90vw", zIndex: 102 }}
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
    const prefs = (data?.preferences as Record<string, unknown>) || {};
    await supabase
      .from("profiles")
      .update({ preferences: { ...prefs, tour_completed: false } })
      .eq("user_id", user.id);
    window.location.reload();
  }, [user]);
}
