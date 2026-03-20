import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AnimatedConnector() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <svg ref={ref} className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-1 overflow-visible" preserveAspectRatio="none">
      <motion.line
        x1="0%"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        strokeDasharray="1000"
        strokeDashoffset={inView ? 0 : 1000}
        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </svg>
  );
}
