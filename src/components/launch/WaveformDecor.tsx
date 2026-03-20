import { motion } from "framer-motion";

const bars = [
  { h: 24, delay: 0 },
  { h: 36, delay: 0.15 },
  { h: 20, delay: 0.3 },
  { h: 32, delay: 0.1 },
  { h: 16, delay: 0.25 },
];

export default function WaveformDecor() {
  return (
    <div className="flex items-end gap-1 justify-center mb-4 h-10">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-crisis-purple/40"
          animate={{ height: [bar.h * 0.4, bar.h, bar.h * 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: bar.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
