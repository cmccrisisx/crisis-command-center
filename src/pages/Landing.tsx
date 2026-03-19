import { useRef } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  Radio,
  Brain,
  Target,
  Megaphone,
  Shield,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
} from "lucide-react";
import crisisLogo from "@/assets/crisis-x-logo.jpeg";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const modules = [
  {
    icon: Radio,
    name: "Signal",
    desc: "Real-time threat detection across social, news, and media channels.",
    color: "text-crisis-blue",
    glow: "card-glow-blue",
    accent: "bg-crisis-blue",
  },
  {
    icon: Brain,
    name: "Sense",
    desc: "AI-powered narrative clustering and sentiment analysis.",
    color: "text-crisis-purple",
    glow: "card-glow-purple",
    accent: "bg-crisis-purple",
  },
  {
    icon: Target,
    name: "Strategize",
    desc: "War room coordination with role-based response workflows.",
    color: "text-crisis-amber",
    glow: "card-glow-amber",
    accent: "bg-crisis-amber",
  },
  {
    icon: Megaphone,
    name: "Speak",
    desc: "Multi-channel response drafting with legal and exec approval gates.",
    color: "text-crisis-red",
    glow: "card-glow-red",
    accent: "bg-crisis-red",
  },
  {
    icon: Shield,
    name: "Stabilize",
    desc: "Reputation recovery tracking and post-crisis analytics.",
    color: "text-crisis-green",
    glow: "card-glow-green",
    accent: "bg-crisis-green",
  },
];

const stats = [
  { icon: Zap, value: "< 30s", label: "Signal Detection" },
  { icon: Globe, value: "4+", label: "Channel Coverage" },
  { icon: BarChart3, value: "AI", label: "Powered Response" },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" as const },
  }),
};

const cardVariant = {
  hidden: { opacity: 0, y: 24, rotate: 1.5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

/* ------------------------------------------------------------------ */
/*  AnimatedStat — counts up on viewport entry                         */
/* ------------------------------------------------------------------ */

function AnimatedStat({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="text-center group"
    >
      <stat.icon className="h-6 w-6 mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />
      <p className="text-3xl font-bold font-mono tabular-nums mb-1">
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={isInView ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, delay: index * 0.15 }}
        >
          {stat.value}
        </motion.span>
      </p>
      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
        {stat.label}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */

export default function Landing() {
  usePageTitle("Crisis Intelligence Platform");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0.03, 0]);

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Risk accent bar */}
        <div className="h-1 w-full fixed top-0 left-0 bg-primary z-50" />

        {/* Nav */}
        <nav className="fixed top-1 left-0 right-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src={crisisLogo}
                alt="Crisis-X"
                className="h-8 w-auto rounded"
              />
              <span className="font-mono text-sm font-semibold tracking-wider uppercase">
                Crisis-X
              </span>
            </div>
            <div className="flex items-center gap-3">
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
        <section ref={heroRef} className="relative pt-40 pb-28 px-6 overflow-hidden">
          {/* Floating orbs (parallax layer) */}
          <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none">
            <div className="hero-orb hero-orb-red w-[420px] h-[420px] -top-20 -left-32 animate-float" />
            <div className="hero-orb hero-orb-blue w-[340px] h-[340px] top-10 right-[-80px] animate-float-delayed" />
            <div className="hero-orb hero-orb-purple w-[280px] h-[280px] bottom-0 left-1/3 animate-float-slow" />
            <div className="hero-orb hero-orb-amber w-[200px] h-[200px] top-1/4 right-1/4 animate-float-slow-delayed" />
          </motion.div>

          {/* Scan line overlay */}
          <div className="scan-line-overlay" />

          {/* Decorative grid (fades on scroll) */}
          <motion.div
            style={{ opacity: gridOpacity }}
            className="absolute inset-0"
            aria-hidden
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </motion.div>

          {/* Hero content (parallax — moves slower) */}
          <motion.div
            style={{ y: heroContentY }}
            className="max-w-5xl mx-auto text-center relative z-10"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-8"
            >
              <img
                src={crisisLogo}
                alt="Crisis-X"
                className="h-28 w-auto mx-auto rounded-lg shadow-2xl shadow-primary/20"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
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
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-mono"
            >
              Detect threats in real-time. Coordinate responses across teams.
              Protect your reputation with AI-powered crisis management.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5, type: "spring", stiffness: 80 }}
              className="flex items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="group">
                <Link to="/auth?signup=true" className="font-mono text-xs uppercase tracking-wider gap-2">
                  Get Started{" "}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover:border-primary/50 transition-colors duration-300">
                <Link to="/auth" className="font-mono text-xs uppercase tracking-wider">
                  Sign In
                </Link>
              </Button>
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

        {/* ============================================================ */}
        {/*  STATS                                                       */}
        {/* ============================================================ */}
        <section className="border-y border-border bg-card/50 py-14 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <AnimatedStat key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FEATURES / MODULES                                          */}
        {/* ============================================================ */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-16"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                Five Integrated Modules
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Full-Spectrum Crisis Response
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.name}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={cardVariant}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className={`group relative border border-border rounded-sm p-6 bg-card transition-all duration-300 cursor-default overflow-hidden ${mod.glow}`}
                >
                  {/* Accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${mod.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

                  <mod.icon
                    className={`h-8 w-8 mb-4 ${mod.color} transition-transform duration-300 group-hover:scale-110`}
                  />
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wider mb-2">
                    {mod.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mod.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FINAL CTA                                                   */}
        {/* ============================================================ */}
        <section className="relative py-24 px-6 border-t border-border overflow-hidden">
          {/* Background orb */}
          <div className="hero-orb hero-orb-red w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float opacity-60" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto text-center relative z-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Take Control of Your Next Crisis
            </h2>
            <p className="text-muted-foreground font-mono mb-8">
              Don't wait for the headlines. Be ready.
            </p>
            <Button size="lg" asChild className="group">
              <Link
                to="/auth?signup=true"
                className="font-mono text-xs uppercase tracking-wider gap-2"
              >
                Start Now{" "}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              © {new Date().getFullYear()} Crisis-X. All rights reserved.
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
