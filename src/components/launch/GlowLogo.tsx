import { motion } from "framer-motion";
import crisisXLogo from "@/assets/crisis-x-logo.png";

export default function GlowLogo() {
  return (
    <motion.div
      className="relative inline-block mb-10 p-6"
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Pulsing background glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            "0 0 30px 8px hsla(0, 85%, 55%, 0.15), 0 0 60px 20px hsla(0, 85%, 55%, 0.08)",
            "0 0 50px 14px hsla(0, 85%, 55%, 0.25), 0 0 90px 30px hsla(0, 85%, 55%, 0.12)",
            "0 0 30px 8px hsla(0, 85%, 55%, 0.15), 0 0 60px 20px hsla(0, 85%, 55%, 0.08)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating logo */}
      <motion.img
        src={crisisXLogo}
        alt="Crisis-X by CMC Connect LLP"
        className="relative max-w-[280px] sm:max-w-[380px] md:max-w-[440px] h-auto w-auto object-contain"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.03 }}
      />
    </motion.div>
  );
}
