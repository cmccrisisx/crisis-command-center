import { motion } from "framer-motion";
import crisisXLogo from "@/assets/crisis-x-logo.png";

export default function GlowLogo() {
  return (
    <div className="relative inline-block mb-10">
      {/* Rotating gradient border */}
      <motion.div
        className="absolute -inset-2 rounded-2xl opacity-60"
        style={{
          background: "conic-gradient(from 0deg, hsl(var(--crisis-red)), hsl(var(--crisis-purple)), hsl(var(--crisis-blue)), hsl(var(--crisis-amber)), hsl(var(--crisis-red)))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Pulsing glow */}
      <motion.div
        className="absolute -inset-3 rounded-2xl"
        animate={{
          boxShadow: [
            "0 0 20px 4px hsla(0, 85%, 55%, 0.3)",
            "0 0 40px 8px hsla(0, 85%, 55%, 0.5)",
            "0 0 20px 4px hsla(0, 85%, 55%, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Logo */}
      <img
        src={crisisXLogo}
        alt="Crisis-X by CMC Connect LLP"
        className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-2xl object-cover ring-1 ring-white/10"
      />
    </div>
  );
}
