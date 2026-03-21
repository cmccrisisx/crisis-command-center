import { useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Mic, BarChart3, Clock, Shield, Smartphone, Zap,
  Building2, Plane, Fuel, Heart, Wifi, Users,
  ArrowRight, ChevronDown, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowLogo from "@/components/launch/GlowLogo";
import StaggerText from "@/components/launch/StaggerText";
import WaveformDecor from "@/components/launch/WaveformDecor";
import AnimatedConnector from "@/components/launch/AnimatedConnector";
import ModuleTimeline from "@/components/launch/ModuleTimeline";
import Reveal from "@/components/launch/Reveal";

/* ── Animated counter ── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      if (ref.current) ref.current.textContent = `${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value, suffix]);
  return <span ref={ref} className="tabular-nums font-mono">0{suffix}</span>;
}

/* ── Stat card with flash border on count complete ── */
function StatCard({ value, suffix, label, color, index }: { value: number; suffix: string; label: string; color: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, delay: index * 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className={`bg-card border ${color} rounded-sm p-6 sm:p-8`}
        animate={inView ? { borderColor: ["hsla(0,0%,100%,0)", "hsla(0,85%,55%,0.4)", "hsla(0,0%,100%,0)"] } : {}}
        transition={{ duration: 0.8, delay: index * 0.35 + 1.3 }}
      >
        <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {suffix === ".2B" ? (
            <span className="font-mono tabular-nums">$<Counter value={value} />.2B</span>
          ) : suffix === "min" ? (
            <span className="font-mono tabular-nums">&lt; <Counter value={value} /> min</span>
          ) : (
            <span className="font-mono tabular-nums"><Counter value={value} suffix="%" /></span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </motion.div>
    </motion.div>
  );
}

const useCases = [
  { icon: Building2, title: "Corporate", desc: "Brand crises, product recalls, executive controversies" },
  { icon: Users, title: "Government", desc: "Public policy backlash, misinformation campaigns" },
  { icon: Wifi, title: "Telecoms", desc: "Service outages, regulatory scrutiny, public sentiment" },
  { icon: Fuel, title: "Oil & Gas", desc: "Environmental incidents, community relations, safety events" },
  { icon: Heart, title: "Healthcare", desc: "Patient safety events, regulatory actions, public health" },
  { icon: Plane, title: "Aviation", desc: "Safety incidents, operational disruptions, passenger sentiment" },
];

const steps = [
  { n: "01", title: "Signal Detected", color: "text-crisis-red", ring: "ring-crisis-red/30" },
  { n: "02", title: "Narrative Analyzed", color: "text-crisis-purple", ring: "ring-crisis-purple/30" },
  { n: "03", title: "Strategy Formed", color: "text-crisis-amber", ring: "ring-crisis-amber/30" },
  { n: "04", title: "Response Published", color: "text-crisis-blue", ring: "ring-crisis-blue/30" },
  { n: "05", title: "Reputation Recovered", color: "text-crisis-green", ring: "ring-crisis-green/30" },
];

export default function Launch() {
  usePageTitle("Launch");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="dark bg-background text-foreground min-h-screen overflow-x-hidden">
      {/* ── Hero ── */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-crisis-red" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 text-center max-w-4xl">
          <GlowLogo />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-crisis-red/30 bg-crisis-red/5 text-crisis-red text-xs font-mono uppercase tracking-widest mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-crisis-red animate-pulse-glow" />
            Official Launch — Wednesday 2025
          </motion.div>

          {/* Staggered title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-4">
            {"Crisis-X".split("").map((char, i) => (
              <motion.span
                key={i}
                className={`inline-block ${char === "X" ? "text-crisis-red" : ""}`}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {char === "-" ? <span>-</span> : char}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-2 text-balance"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Africa's First AI-Powered Crisis Intelligence Engine
          </motion.p>
          <motion.p
            className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            A Specialised Crisis Management & Communication Service by CMC Connect LLP
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
            <Button asChild size="lg" className="bg-crisis-red hover:bg-crisis-red/90 text-white rounded-sm relative overflow-hidden group">
              <Link to="/about#book-demo">
                Book a Demo <ArrowRight className="ml-1 w-4 h-4" />
                <motion.span
                  className="absolute inset-0 bg-white/10 rounded-sm"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm">
              <Link to="/auth">Get Started</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 text-muted-foreground/40">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.section>

      {/* ── Problem ── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs font-mono text-crisis-red uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-balance leading-tight">
              Crises move faster than<br className="hidden sm:block" /> teams can respond.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: 60, suffix: "min", label: "for a crisis to go viral on social media", color: "border-crisis-red/30" },
              { value: 78, suffix: "%", label: "of organizations lack a real-time response system", color: "border-crisis-amber/30" },
              { value: 4, suffix: ".2B", label: "annual reputation loss from delayed crisis response ($)", color: "border-crisis-blue/30" },
            ].map((s, i) => (
              <StatCard key={i} value={s.value} suffix={s.suffix} label={s.label} color={s.color} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Positioning — word-by-word ── */}
      <section className="py-20 px-4 border-y border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <StaggerText
            text="Detect. Analyze. Respond. Recover."
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug"
            delayStart={0}
          />
          <StaggerText
            text="In Real Time."
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mt-2"
            highlightLast
            highlightClass="text-crisis-red"
            delayStart={0.8}
          />
        </div>
      </section>

      {/* ── 5 Modules — Timeline ── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs font-mono text-crisis-red uppercase tracking-widest mb-3">The Architecture</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-balance">5 Modules. One Command Center.</h2>
          </Reveal>
          <ModuleTimeline />
        </div>
      </section>

      {/* ── Naya ── */}
      <section className="py-24 sm:py-32 px-4 bg-card/50 border-y border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <WaveformDecor />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-crisis-purple/30 bg-crisis-purple/5 text-crisis-purple text-xs font-mono uppercase tracking-widest mb-6">
              <Mic className="w-3 h-3" /> AI Advisor
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Naya</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-12">
              Your AI-powered crisis advisor — always on, always informed. She analyzes signals,
              recommends strategies, and speaks with you in real-time through voice conversation.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              { title: "Real-Time Voice", desc: "WebRTC-powered conversation with natural voice synthesis", color: "border-crisis-purple/30" },
              { title: "Crisis Chat", desc: "Contextual AI analysis of active crises and signals", color: "border-crisis-blue/30" },
              { title: "Scenario Modeling", desc: "Simulate crisis outcomes and recommended actions", color: "border-crisis-amber/30" },
              { title: "Live Audio Waveforms", desc: "Visual feedback showing when Naya is speaking or listening", color: "border-crisis-green/30" },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`p-5 bg-card border ${f.color} rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 hover:border-opacity-60`}>
                  <p className="font-semibold text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Flow — animated connector ── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs font-mono text-crisis-red uppercase tracking-widest mb-3">User Journey</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-balance">From Signal to Recovery in 5 Steps</h2>
          </Reveal>
          <div className="relative">
            <AnimatedConnector />
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-3">
              {steps.map((step, i) => (
                <Reveal key={i} delay={i * 0.15} className="text-center">
                  <motion.div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full border border-border bg-card ${step.color} font-mono text-sm font-bold mb-3 ring-2 ${step.ring}`}
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: [0.5, 1.15, 1] }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {step.n}
                  </motion.div>
                  <p className="text-sm font-semibold">{step.title}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-24 sm:py-32 px-4 bg-card/50 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs font-mono text-crisis-red uppercase tracking-widest mb-3">Use Cases</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-balance">Built for Industries Where Reputation Is Everything</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="flex items-start gap-4 p-5 bg-card border border-border/40 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
                  <uc.icon className="w-5 h-5 text-crisis-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">{uc.title}</p>
                    <p className="text-xs text-muted-foreground">{uc.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Authority ── */}
      <section className="py-24 sm:py-32 px-4 border-b border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-crisis-amber/30 bg-crisis-amber/5 text-crisis-amber text-xs font-mono uppercase tracking-widest mb-6">
              <ShieldCheck className="w-3 h-3" /> Verified Authority
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Proof Over Trust
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              In an age of synthetic media, "truth" is no longer enough. Crisis-X anchors every official
              communication with a cryptographic signature — so stakeholders know instantly what is authentic.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { title: "SHA-256 Hashing", desc: "Every document receives an immutable fingerprint that changes if even a single byte is altered." },
              { title: "HMAC Signatures", desc: "Server-side cryptographic signing ensures only authorized issuers can mint verified records." },
              { title: "Public Verification", desc: "Anyone — journalists, regulators, public — can verify a document's authenticity instantly." },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-5 bg-card border border-crisis-amber/20 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
                  <p className="font-semibold text-sm mb-1">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" size="lg" className="rounded-sm border-crisis-amber/30 text-crisis-amber hover:bg-crisis-amber/10">
                <Link to="/verify">Public Verification Portal</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Platform Highlights ── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs font-mono text-crisis-red uppercase tracking-widest mb-3">Platform Highlights</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-balance">Enterprise-Grade Crisis Intelligence</h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, stat: "< 60s", label: "Signal Detection" },
              { icon: BarChart3, stat: "122+", label: "Signals Monitored" },
              { icon: Zap, stat: "5", label: "Intelligence Modules" },
              { icon: Mic, stat: "24/7", label: "AI Advisor (Naya)" },
              { icon: Shield, stat: "RBAC", label: "Role-Based Access" },
              { icon: Smartphone, stat: "PWA", label: "Mobile Ready" },
            ].map((h, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  className="p-5 sm:p-6 bg-card border border-border/40 rounded-sm text-center transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
                  whileInView={{ scale: [0.95, 1] }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <h.icon className="w-5 h-5 text-crisis-red mx-auto mb-3" />
                  <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums mb-1">{h.stat}</p>
                  <p className="text-xs text-muted-foreground">{h.label}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 sm:py-32 px-4 border-t border-border/30">
        <Reveal className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Ready to Transform<br />Your Crisis Response?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the organizations using Crisis-X to detect, analyze, and neutralize threats before they become full-blown crises.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-crisis-red hover:bg-crisis-red/90 text-white rounded-sm relative overflow-hidden">
              <Link to="/about#book-demo">
                Book a Demo <ArrowRight className="ml-1 w-4 h-4" />
                <motion.span
                  className="absolute inset-0 bg-white/10 rounded-sm"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
          <div className="mt-12 pt-8 border-t border-border/30 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">CMC Connect LLP</p>
            <p>Lagos, Nigeria • info@cmconnect.com</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
