import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface StaggerTextProps {
  text: string;
  className?: string;
  highlightLast?: boolean;
  highlightClass?: string;
  delayStart?: number;
}

export default function StaggerText({ text, className = "", highlightLast = false, highlightClass = "text-crisis-red", delayStart = 0 }: StaggerTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(" ");

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => {
        const isLast = highlightLast && i === words.length - 1;
        return (
          <motion.span
            key={i}
            className={`inline-block mr-[0.3em] ${isLast ? highlightClass : ""}`}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{
              duration: 0.5,
              delay: delayStart + i * 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
