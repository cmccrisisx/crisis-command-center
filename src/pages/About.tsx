import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Radio,
  Brain,
  Target,
  Megaphone,
  Shield,
  ArrowRight,
  ArrowLeft,
  Users,
  Zap,
  Globe,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle,
  Building2,
  Landmark,
  Fuel,
  HeartPulse,
  Plane,
  Wifi,
} from "lucide-react";
import crisisLogo from "@/assets/crisis-x-logo.png";
import PWAInstallButton from "@/components/PWAInstallButton";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function BookDemoSection() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("demo_requests").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      message: form.message.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Demo request submitted! We'll be in touch shortly.");
      setForm({ name: "", email: "", company: "", message: "" });
    }
  };

  return (
    <section id="book-demo" className="py-16 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={0}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-crisis-red mb-3 block">
            Get Started
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Book a Demo</h2>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Schedule a guided walkthrough of the Crisis-X Intelligence Engine. See how Africa's first AI-powered crisis platform can protect your organisation's reputation in real time.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-crisis-green" /> 30-minute personalised demo</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-crisis-green" /> Live platform walkthrough</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-crisis-green" /> Custom use-case discussion</li>
          </ul>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={1}
          variants={fadeUp}
          className="space-y-4 bg-card border border-border rounded-sm p-6"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Name *</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" maxLength={100} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Work Email *</label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" maxLength={255} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Company *</label>
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Organisation name" maxLength={150} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Message</label>
            <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about your crisis communication needs (optional)" maxLength={1000} rows={3} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full font-mono text-xs uppercase tracking-wider">
            {submitting ? "Submitting…" : "Request a Demo"}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}

const modules = [
  {
    icon: Radio,
    name: "SIGNAL",
    tagline: "Detect",
    color: "text-crisis-red",
    bg: "bg-crisis-red/10",
    border: "border-crisis-red/20",
    description:
      "Real-time threat detection across social media, news outlets, blogs, and LinkedIn. AI-powered signal ingestion surfaces emerging crises before they escalate.",
    features: [
      "Multi-source signal ingestion (Twitter/X, news, blogs, LinkedIn)",
      "Keyword & sentiment-based filtering",
      "Influencer detection with follower reach scoring",
      "Signal volume tracking and trend alerts",
    ],
  },
  {
    icon: Brain,
    name: "SENSE",
    tagline: "Analyze",
    color: "text-crisis-purple",
    bg: "bg-crisis-purple/10",
    border: "border-crisis-purple/20",
    description:
      "AI-driven narrative clustering and sentiment analysis. Understand what's being said, by whom, and how fast it's spreading — all in real-time.",
    features: [
      "Narrative clustering with AI summarization",
      "Sentiment breakdown (positive / neutral / negative)",
      "Keyword extraction and trending topic detection",
      "Reputation score tracking over time",
    ],
  },
  {
    icon: Target,
    name: "STRATEGIZE",
    tagline: "Plan",
    color: "text-crisis-amber",
    bg: "bg-crisis-amber/10",
    border: "border-crisis-amber/20",
    description:
      "War Room for coordinated crisis response. Scenario planning, AI-generated holding statements, and multi-stakeholder collaboration in one command center.",
    features: [
      "Interactive War Room with real-time messaging",
      "Crisis scenario modeling and playbook access",
      "AI-generated response drafts and holding statements",
      "Risk-level classification (Critical / High / Medium / Low)",
    ],
  },
  {
    icon: Megaphone,
    name: "SPEAK",
    tagline: "Respond",
    color: "text-crisis-blue",
    bg: "bg-crisis-blue/10",
    border: "border-crisis-blue/20",
    description:
      "Multi-channel response management with approval workflows. Draft, review, and publish crisis communications across every channel from one place.",
    features: [
      "Response templates (holding, apology, clarification)",
      "Multi-stage approval workflow (Draft → Legal → Exec → Published)",
      "Channel-specific formatting (press, social, internal)",
      "Full audit trail of all published communications",
    ],
  },
  {
    icon: Shield,
    name: "STABILIZE",
    tagline: "Recover",
    color: "text-crisis-green",
    bg: "bg-crisis-green/10",
    border: "border-crisis-green/20",
    description:
      "Post-crisis reputation monitoring and recovery tracking. Measure sentiment recovery, media reach, and share of voice as you rebuild trust.",
    features: [
      "Reputation score and sentiment recovery charts",
      "Media reach and share-of-voice analytics",
      "Post-crisis reporting with PDF export",
      "Stakeholder impact assessment",
    ],
  },
];

const useCases = [
  {
    icon: Building2,
    sector: "Corporate & Conglomerates",
    scenario: "Executive misconduct allegations surface on social media, spreading to mainstream news within hours.",
  },
  {
    icon: Landmark,
    sector: "Government & Public Sector",
    scenario: "Policy backlash or public unrest requiring coordinated multi-agency communication.",
  },
  {
    icon: Wifi,
    sector: "Telecoms & Technology",
    scenario: "Nationwide service outage triggers customer fury across Twitter/X and threatens regulatory action.",
  },
  {
    icon: Fuel,
    sector: "Oil, Gas & Energy",
    scenario: "Environmental incident or spill requiring rapid stakeholder and community engagement.",
  },
  {
    icon: HeartPulse,
    sector: "Healthcare & Pharmaceuticals",
    scenario: "Product recall or patient safety concern demanding transparent, legally compliant communication.",
  },
  {
    icon: Plane,
    sector: "Aviation & Transport",
    scenario: "Operational disruption or safety incident requiring real-time passenger and media communication.",
  },
];

const stats = [
  { value: "5", label: "Integrated Modules", icon: Zap },
  { value: "4", label: "Signal Sources", icon: Globe },
  { value: "Real-time", label: "AI Analysis", icon: Brain },
  { value: "< 60s", label: "Detection to Alert", icon: Clock },
];

const userFlowSteps = [
  {
    step: "01",
    title: "Signal Detected",
    description: "A spike in negative mentions is detected across Twitter/X and news sources. The system auto-classifies risk level.",
    color: "border-crisis-red",
  },
  {
    step: "02",
    title: "Narrative Analyzed",
    description: "AI clusters related signals into narratives, extracts keywords, and assigns sentiment scores. Key influencers are flagged.",
    color: "border-crisis-purple",
  },
  {
    step: "03",
    title: "War Room Activated",
    description: "The crisis team assembles in the War Room. AI generates holding statements and scenario models for decision-making.",
    color: "border-crisis-amber",
  },
  {
    step: "04",
    title: "Response Published",
    description: "Approved communications are published across channels — press releases, social posts, and internal memos — with full audit trail.",
    color: "border-crisis-blue",
  },
  {
    step: "05",
    title: "Reputation Stabilized",
    description: "Post-crisis monitoring tracks sentiment recovery, media reach, and reputation score until the situation is fully resolved.",
    color: "border-crisis-green",
  },
];

export default function About() {
  usePageTitle("About Crisis-X — Africa's First AI Crisis Intelligence Engine");

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Risk accent bar */}
        <div className="h-1 w-full fixed top-0 left-0 bg-primary z-50" />

        {/* Nav */}
        <nav className="fixed top-1 left-0 right-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={crisisLogo} alt="Crisis-X" className="h-8 w-auto rounded" />
              <span className="font-mono text-sm font-semibold tracking-wider uppercase">
                Crisis-X
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <PWAInstallButton />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="font-mono text-xs uppercase tracking-wider gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Home
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
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-xs uppercase tracking-wider text-primary">
                First of its Kind in Africa
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              The Crisis-X
              <br />
              <span className="text-primary">Intelligence Engine</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto font-mono leading-relaxed"
            >
              Crisis-X is Africa's first AI-powered crisis intelligence platform — purpose-built
              for enterprises, governments, and institutions that cannot afford to be caught
              off-guard. From signal detection to reputation recovery, Crisis-X delivers
              end-to-end crisis management in a single command center.
            </motion.p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-border bg-muted/30 py-8 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold font-mono tabular-nums">{stat.value}</p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5 Modules */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Five Integrated Modules</h2>
              <p className="text-sm font-mono text-muted-foreground max-w-2xl mx-auto">
                Each module maps to a critical phase of crisis management — from early detection
                to full reputation recovery.
              </p>
            </motion.div>

            <div className="space-y-8">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.name}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`border ${mod.border} rounded-sm ${mod.bg} p-6 md:p-8`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-start gap-3">
                      <div className={`p-2.5 rounded-sm border ${mod.border} bg-background/50`}>
                        <mod.icon className={`h-5 w-5 ${mod.color}`} />
                      </div>
                      <div>
                        <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                          {mod.name}
                        </h3>
                        <p className={`text-xs font-mono ${mod.color}`}>{mod.tagline}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">{mod.description}</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mod.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-xs font-mono text-foreground/80">
                            <CheckCircle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${mod.color}`} />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* User Flow */}
        <section className="py-20 px-6 border-t border-border bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
              <p className="text-sm font-mono text-muted-foreground max-w-xl mx-auto">
                A crisis unfolds in minutes. Crisis-X responds in seconds.
              </p>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />

              <div className="space-y-8">
                {userFlowSteps.map((step, i) => (
                  <motion.div
                    key={step.step}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex gap-6 items-start"
                  >
                    <div
                      className={`flex-shrink-0 h-12 w-12 rounded-sm border-2 ${step.color} bg-background flex items-center justify-center font-mono text-sm font-bold`}
                    >
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Built for Africa's Most Critical Sectors</h2>
              <p className="text-sm font-mono text-muted-foreground max-w-2xl mx-auto">
                From Lagos to Nairobi, Johannesburg to Accra — Crisis-X is designed for
                organizations operating in high-stakes, fast-moving environments.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map((uc, i) => (
                <motion.div
                  key={uc.sector}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="border border-border rounded-sm p-5 bg-background hover:border-primary/30 transition-colors"
                >
                  <uc.icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider mb-2">
                    {uc.sector}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {uc.scenario}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Crisis-X */}
        <section className="py-20 px-6 border-t border-border bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Why Crisis-X?</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: Globe,
                  title: "Africa-First Design",
                  desc: "Built for the unique media landscape, regulatory environment, and communication dynamics of African markets.",
                },
                {
                  icon: Brain,
                  title: "AI-Native Architecture",
                  desc: "Every module is powered by AI — from signal detection to response generation to reputation scoring.",
                },
                {
                  icon: Users,
                  title: "Enterprise-Grade RBAC",
                  desc: "Role-based access control for PR managers, legal reviewers, social managers, and executives.",
                },
                {
                  icon: BarChart3,
                  title: "Real-Time Analytics",
                  desc: "Live dashboards with sentiment trends, signal volume, media reach, and share of voice metrics.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="border border-border rounded-sm p-5 bg-background"
                >
                  <item.icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-4"
            >
              Take Control of Your Next Crisis
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm font-mono text-muted-foreground mb-8"
            >
              Join Africa's most forward-thinking organizations on Crisis-X.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="group">
                <Link to="/auth?signup=true" className="font-mono text-xs uppercase tracking-wider gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth" className="font-mono text-xs uppercase tracking-wider">
                  Sign In
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Book a Demo */}
        <BookDemoSection />

        {/* Decorative risk bars */}
        <div className="flex h-1">
          <div className="flex-1 bg-risk-critical" />
          <div className="flex-1 bg-risk-high" />
          <div className="flex-1 bg-risk-medium" />
          <div className="flex-1 bg-risk-low" />
        </div>

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
