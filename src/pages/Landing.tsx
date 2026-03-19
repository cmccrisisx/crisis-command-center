import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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

const modules = [
  {
    icon: Radio,
    name: "Signal",
    desc: "Real-time threat detection across social, news, and media channels.",
    color: "text-crisis-blue",
  },
  {
    icon: Brain,
    name: "Sense",
    desc: "AI-powered narrative clustering and sentiment analysis.",
    color: "text-crisis-purple",
  },
  {
    icon: Target,
    name: "Strategize",
    desc: "War room coordination with role-based response workflows.",
    color: "text-crisis-amber",
  },
  {
    icon: Megaphone,
    name: "Speak",
    desc: "Multi-channel response drafting with legal and exec approval gates.",
    color: "text-crisis-red",
  },
  {
    icon: Shield,
    name: "Stabilize",
    desc: "Reputation recovery tracking and post-crisis analytics.",
    color: "text-crisis-green",
  },
];

const stats = [
  { icon: Zap, value: "< 30s", label: "Signal Detection" },
  { icon: Globe, value: "4+", label: "Channel Coverage" },
  { icon: BarChart3, value: "AI", label: "Powered Response" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Landing() {
  usePageTitle("Crisis Intelligence Platform");

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Risk accent bar */}
        <div className="h-1 w-full fixed top-0 left-0 bg-primary z-50" />

        {/* Nav */}
        <nav className="fixed top-1 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
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

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <img
                src={crisisLogo}
                alt="Crisis-X"
                className="h-28 w-auto mx-auto rounded-lg shadow-2xl shadow-primary/20"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Crisis Intelligence.
              <br />
              <span className="text-primary">Instant Clarity.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-mono"
            >
              Detect threats in real-time. Coordinate responses across teams.
              Protect your reputation with AI-powered crisis management.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-center gap-4"
            >
              <Button size="lg" asChild>
                <Link to="/auth?signup=true" className="font-mono text-xs uppercase tracking-wider gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth" className="font-mono text-xs uppercase tracking-wider">
                  Sign In
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Decorative risk bars */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-risk-critical" />
            <div className="flex-1 bg-risk-high" />
            <div className="flex-1 bg-risk-medium" />
            <div className="flex-1 bg-risk-low" />
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border bg-card/50 py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <stat.icon className="h-6 w-6 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold font-mono tabular-nums mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features / Modules */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-14"
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
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group border border-border rounded-lg p-6 bg-card hover:border-primary/40 transition-colors duration-300"
                >
                  <mod.icon className={`h-8 w-8 mb-4 ${mod.color}`} />
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

        {/* Final CTA */}
        <section className="py-20 px-6 border-t border-border">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Take Control of Your Next Crisis
            </h2>
            <p className="text-muted-foreground font-mono mb-8">
              Don't wait for the headlines. Be ready.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth?signup=true" className="font-mono text-xs uppercase tracking-wider gap-2">
                Start Now <ArrowRight className="h-4 w-4" />
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
              <span className="text-xs font-mono text-muted-foreground">Systems Operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
