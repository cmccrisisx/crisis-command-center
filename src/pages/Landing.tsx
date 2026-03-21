import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import crisisLogo from "@/assets/crisis-x-logo.png";
import PWAInstallButton from "@/components/PWAInstallButton";

import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";
import hero4 from "@/assets/hero/hero-4.jpg";

const heroSlides = [
  { src: hero1, alt: "Executive monitoring crisis dashboards" },
  { src: hero2, alt: "Team collaborating during crisis briefing" },
  { src: hero3, alt: "Professional analyzing real-time data wall" },
  { src: hero4, alt: "War room communications strategy session" },
];

const SLIDE_DURATION = 6000;

export default function Landing() {
  usePageTitle("Crisis Intelligence Platform");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0.03, 0]);

  // Slider state
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setProgress(0);
  }, []);

  // Auto-rotation + progress bar
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update progress every 50ms
    const steps = SLIDE_DURATION / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
        step = 0;
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, current]);

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Risk accent bar */}
        <div className="h-1 w-full fixed top-0 left-0 bg-primary z-50" />

        {/* Slide progress bar */}
        <div className="h-0.5 fixed top-1 left-0 z-50 transition-none" style={{ width: `${progress}%`, background: "hsl(var(--crisis-blue))" }} />

        {/* Nav */}
        <nav className="fixed top-1 left-0 right-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img src={crisisLogo} alt="Crisis-X" className="h-8 w-auto rounded" />
              <span className="font-mono text-sm font-semibold tracking-wider uppercase">
                Crisis-X
              </span>
            </div>
            <div className="flex items-center gap-3">
              <PWAInstallButton />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" className="font-mono text-xs uppercase tracking-wider">
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?signup=true" className="font-mono text-xs uppercase tracking-wider">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <section
          ref={heroRef}
          className="relative h-screen flex items-center justify-center overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background image slider */}
          <motion.div style={{ y: bgY }} className="absolute inset-0">
            <AnimatePresence mode="sync">
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={heroSlides[current].src}
                  alt={heroSlides[current].alt}
                  className="w-full h-full object-cover ken-burns"
                />
              </motion.div>
            </AnimatePresence>

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/40" />

            {/* Vignette */}
            <div className="absolute inset-0 hero-vignette" />
          </motion.div>

          {/* Scan line overlay */}
          <div className="scan-line-overlay" />

          {/* Decorative grid (fades on scroll) */}
          <motion.div style={{ opacity: gridOpacity }} className="absolute inset-0" aria-hidden>
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </motion.div>

          {/* Hero content */}
          <motion.div
            style={{ y: heroContentY }}
            className="max-w-5xl mx-auto text-center relative z-10 px-6 pt-16"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-4"
            >
              <img
                src={crisisLogo}
                alt="Crisis-X"
                className="h-16 w-auto mx-auto rounded-lg shadow-2xl shadow-primary/20"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3"
            >
              Crisis Intelligence.
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring", stiffness: 100 }}
                className="text-primary inline-block"
              >
                Instant Clarity.
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-5 font-mono"
            >
              Detect threats in real-time. Coordinate responses across teams.
              Protect your reputation with AI-powered crisis management.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5, type: "spring", stiffness: 80 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <Button size="lg" asChild className="group">
                <Link to="/auth?signup=true" className="font-mono text-xs uppercase tracking-wider gap-2">
                  Get Started{" "}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover:border-primary/50 transition-colors duration-300">
                <Link to="/about" className="font-mono text-xs uppercase tracking-wider">
                  Learn More
                </Link>
              </Button>
            </motion.div>

            {/* Slide indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center justify-center gap-2"
            >
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-primary"
                      : "w-3 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Decorative risk bars */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-risk-critical" />
            <div className="flex-1 bg-risk-high" />
            <div className="flex-1 bg-risk-medium" />
            <div className="flex-1 bg-risk-low" />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              © 2026 Crisis-X | an AI Powered Crisis Intelligence Engine of CMC Connect LLP. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-crisis-green animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">
                Systems Operational
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
