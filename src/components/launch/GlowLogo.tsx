import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import crisisXLogo from "@/assets/crisis-x-logo.png";

export default function GlowLogo() {
  const [phase, setPhase] = useState<"teaser" | "curtain" | "reveal" | "idle">("teaser");
  const [bursts, setBursts] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("curtain"), 1000);
    const t2 = setTimeout(() => setPhase("reveal"), 2000);
    const t3 = setTimeout(() => setPhase("idle"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleClick = useCallback(() => {
    setBursts((prev) => [...prev, Date.now()]);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setGlowOffset({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlowOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center justify-center mb-10 p-8 cursor-pointer select-none"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mouse-follow glow layer */}
      {phase === "idle" && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            background: `radial-gradient(ellipse at ${50 + glowOffset.x * 30}% ${50 + glowOffset.y * 30}%, hsla(0, 85%, 55%, 0.15) 0%, transparent 70%)`,
          }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Pulsing breathing glow (post-reveal) */}
      <AnimatePresence>
        {(phase === "reveal" || phase === "idle") && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              boxShadow: phase === "reveal"
                ? "0 0 80px 30px hsla(0, 85%, 55%, 0.4), 0 0 120px 50px hsla(0, 85%, 55%, 0.2)"
                : [
                    "0 0 30px 8px hsla(0, 85%, 55%, 0.15), 0 0 60px 20px hsla(0, 85%, 55%, 0.08)",
                    "0 0 50px 14px hsla(0, 85%, 55%, 0.25), 0 0 90px 30px hsla(0, 85%, 55%, 0.12)",
                    "0 0 30px 8px hsla(0, 85%, 55%, 0.15), 0 0 60px 20px hsla(0, 85%, 55%, 0.08)",
                  ],
            }}
            transition={phase === "idle" ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Stage 0: Teaser glowing line */}
      <AnimatePresence>
        {(phase === "teaser" || phase === "curtain") && (
          <>
            <motion.div
              className="absolute left-1/2 top-1/2 h-[2px] bg-primary rounded-full pointer-events-none"
              style={{ translateX: "-50%", translateY: "-50%" }}
              initial={{ width: 0, opacity: 0 }}
              animate={
                phase === "teaser"
                  ? {
                      width: "60%",
                      opacity: [0, 1, 0.6, 1],
                      boxShadow: [
                        "0 0 10px 4px hsla(0, 85%, 55%, 0.4)",
                        "0 0 20px 8px hsla(0, 85%, 55%, 0.6)",
                        "0 0 10px 4px hsla(0, 85%, 55%, 0.4)",
                      ],
                    }
                  : { width: 0, opacity: 0 }
              }
              exit={{ width: 0, opacity: 0 }}
              transition={
                phase === "teaser"
                  ? { width: { duration: 0.8 }, opacity: { duration: 1, repeat: Infinity }, boxShadow: { duration: 1.5, repeat: Infinity } }
                  : { duration: 0.4 }
              }
            />
          </>
        )}
      </AnimatePresence>

      {/* Stage 1: Curtain halves */}
      <AnimatePresence>
        {phase === "curtain" && (
          <>
            <motion.div
              className="absolute inset-0 bg-background pointer-events-none"
              style={{ clipPath: "inset(0 50% 0 0)" }}
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-background pointer-events-none"
              style={{ clipPath: "inset(0 0 0 50%)" }}
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            {/* Flash */}
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Logo image */}
      <motion.img
        src={crisisXLogo}
        alt="Crisis-X by CMC Connect LLP"
        className="relative max-w-[280px] sm:max-w-[380px] md:max-w-[440px] h-auto w-auto object-contain"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
        animate={
          phase === "teaser"
            ? { opacity: 0, scale: 0.95, filter: "blur(12px)" }
            : phase === "curtain"
            ? { opacity: 0.3, scale: 0.95, filter: "blur(8px)" }
            : phase === "reveal"
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)", y: [0, -6, 0] }
        }
        transition={
          phase === "idle"
            ? { y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, default: { duration: 0.6 } }
            : { duration: 0.8, ease: "easeOut" }
        }
        whileHover={phase === "idle" ? { scale: 1.02, y: -4 } : undefined}
      />

      {/* Click burst rings */}
      <AnimatePresence>
        {bursts.map((id) => (
          <motion.div
            key={id}
            className="absolute inset-0 m-auto rounded-full border-2 border-primary pointer-events-none"
            style={{ width: 60, height: 60 }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() =>
              setBursts((prev) => prev.filter((b) => b !== id))
            }
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
