import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";
import type { VoiceStatus } from "@/hooks/useNayaConversation";
import nayaAvatar from "@/assets/naya-avatar.png";

interface VoiceModeProps {
  voiceStatus: VoiceStatus;
  isSpeaking: boolean;
  transcripts: { role: "user" | "assistant"; content: string }[];
  onEnd: () => void;
  getInputByteFrequencyData?: () => Float32Array | undefined;
  getOutputByteFrequencyData?: () => Float32Array | undefined;
}

function AudioWaveform({
  getFrequencyData,
  color,
  barCount = 24,
  label,
}: {
  getFrequencyData?: () => Float32Array | undefined;
  color: string;
  barCount?: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const data = getFrequencyData?.();
    const barWidth = w / barCount;
    const gap = 2;
    const maxBarHeight = h * 0.85;
    const minBarHeight = 2;

    for (let i = 0; i < barCount; i++) {
      // Sample from frequency data, spreading evenly
      let value = 0;
      if (data && data.length > 0) {
        const idx = Math.floor((i / barCount) * Math.min(data.length, 64));
        value = data[idx] ?? 0;
        // Normalize: ElevenLabs returns Float32Array with values typically 0-255
        value = Math.min(value / 255, 1);
      }

      const barH = Math.max(minBarHeight, value * maxBarHeight);
      const x = i * barWidth + gap / 2;
      const y = (h - barH) / 2;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3 + value * 0.7;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - gap, barH, 1.5);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafRef.current = requestAnimationFrame(draw);
  }, [getFrequencyData, color, barCount]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-10"
        style={{ imageRendering: "crisp-edges" }}
      />
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function VoiceMode({
  voiceStatus,
  isSpeaking,
  transcripts,
  onEnd,
  getInputByteFrequencyData,
  getOutputByteFrequencyData,
}: VoiceModeProps) {
  const isConnecting = voiceStatus === "connecting";
  const isConnected = voiceStatus === "connected";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
      {/* Avatar with pulse */}
      <div className="relative">
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            isSpeaking ? "bg-primary/30" : "bg-muted-foreground/20"
          )}
          animate={isConnected ? { scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            isSpeaking ? "bg-primary/20" : "bg-muted-foreground/10"
          )}
          animate={isConnected ? { scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <div
          className={cn(
            "relative h-20 w-20 rounded-full overflow-hidden ring-2 transition-colors",
            isConnected
              ? isSpeaking
                ? "ring-primary shadow-lg shadow-primary/30"
                : "ring-crisis-green shadow-lg shadow-crisis-green/20"
              : "ring-border"
          )}
        >
          <img src={nayaAvatar} alt="Naya" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-mono font-semibold text-foreground">
          {isConnecting && "Connecting..."}
          {isConnected && isSpeaking && "Naya is speaking"}
          {isConnected && !isSpeaking && "Listening..."}
        </p>
        <p className="text-xs text-muted-foreground">
          {isConnecting ? "Setting up voice channel" : "Speak naturally — Naya hears you"}
        </p>
      </div>

      {/* Audio Waveforms */}
      {isConnected && (
        <div className="w-full space-y-1 px-1">
          <AudioWaveform
            getFrequencyData={getOutputByteFrequencyData}
            color="hsl(var(--primary))"
            label={isSpeaking ? "naya speaking" : "naya"}
            barCount={28}
          />
          <AudioWaveform
            getFrequencyData={getInputByteFrequencyData}
            color="hsl(var(--crisis-green))"
            label={!isSpeaking ? "you — listening" : "you"}
            barCount={28}
          />
        </div>
      )}

      {/* Live transcript (last 3) */}
      {transcripts.length > 0 && (
        <div className="w-full max-h-[120px] overflow-y-auto space-y-2 px-2">
          {transcripts.slice(-4).map((t, i) => (
            <div
              key={i}
              className={cn(
                "text-xs rounded-sm px-2.5 py-1.5 max-w-[85%]",
                t.role === "user"
                  ? "bg-primary/20 text-primary-foreground ml-auto"
                  : "bg-muted text-foreground"
              )}
            >
              {t.content}
            </div>
          ))}
        </div>
      )}

      {/* End button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onEnd}
        className="gap-2 mt-1"
        disabled={isConnecting}
      >
        <PhoneOff className="h-3.5 w-3.5" />
        End Conversation
      </Button>
    </div>
  );
}
