import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Radio, Brain, LayoutDashboard, MessageSquare, ShieldCheck,
} from "lucide-react";
import Reveal from "./Reveal";

const modules = [
  { icon: Radio, name: "SIGNAL", sub: "Detect", color: "text-crisis-red", bg: "bg-crisis-red/10", border: "border-crisis-red/20", dot: "bg-crisis-red", desc: "Multi-source signal ingestion across social media, news, blogs, and industry channels with AI-powered filtering." },
  { icon: Brain, name: "SENSE", sub: "Analyze", color: "text-crisis-purple", bg: "bg-crisis-purple/10", border: "border-crisis-purple/20", dot: "bg-crisis-purple", desc: "Narrative clustering, sentiment analysis, and reputation scoring to understand the evolving crisis landscape." },
  { icon: LayoutDashboard, name: "STRATEGIZE", sub: "Plan", color: "text-crisis-amber", bg: "bg-crisis-amber/10", border: "border-crisis-amber/20", dot: "bg-crisis-amber", desc: "Collaborative War Room with AI-generated holding statements and scenario modeling capabilities." },
  { icon: MessageSquare, name: "SPEAK", sub: "Respond", color: "text-crisis-blue", bg: "bg-crisis-blue/10", border: "border-crisis-blue/20", dot: "bg-crisis-blue", desc: "Multi-channel response publishing with role-based approval workflows and complete audit trails." },
  { icon: ShieldCheck, name: "STABILIZE", sub: "Recover", color: "text-crisis-green", bg: "bg-crisis-green/10", border: "border-crisis-green/20", dot: "bg-crisis-green", desc: "Post-crisis reputation monitoring, media reach tracking, and stakeholder briefing reports." },
];

function ModuleCard({ m, i }: { m: typeof modules[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="flex gap-4 sm:gap-6">
      {/* Timeline dot */}
      <div className="hidden sm:flex flex-col items-center pt-6">
        <motion.div
          className={`w-3 h-3 rounded-full ${m.dot} ring-4 ring-background`}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {i < modules.length - 1 && (
          <motion.div
            className="w-px flex-1 bg-border/40"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top" }}
          />
        )}
      </div>

      {/* Card */}
      <Reveal delay={i * 0.08} className="flex-1 pb-4">
        <motion.div
          className={`group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-5 sm:p-6 bg-card border border-border/40 rounded-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5`}
        >
          <div className={`shrink-0 w-12 h-12 ${m.bg} ${m.color} border ${m.border} rounded-sm flex items-center justify-center`}>
            <m.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-1">
              <span className={`text-xs font-mono ${m.color} uppercase tracking-wider`}>{m.name}</span>
              <span className="text-xs text-muted-foreground/50">—</span>
              <span className="text-sm font-semibold text-foreground">{m.sub}</span>
            </div>
            <p className="text-sm text-muted-foreground">{m.desc}</p>
          </div>
          <span className={`hidden sm:block text-xs font-mono ${m.color} opacity-0 group-hover:opacity-100 transition-opacity`}>0{i + 1}</span>
        </motion.div>
      </Reveal>
    </div>
  );
}

export default function ModuleTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.6", "end 0.8"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll-linked progress line (desktop) */}
      <div className="hidden sm:block absolute left-[5px] top-0 bottom-0 w-px bg-border/20">
        <motion.div className="w-full bg-crisis-red/50 origin-top" style={{ height: lineHeight }} />
      </div>

      <div className="sm:ml-0">
        {modules.map((m, i) => (
          <ModuleCard key={m.name} m={m} i={i} />
        ))}
      </div>
    </div>
  );
}
