import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { VoiceStatus } from "@/hooks/useNayaConversation";
import nayaAvatar from "@/assets/naya-avatar.png";

interface VoiceModeProps {
  voiceStatus: VoiceStatus;
  isSpeaking: boolean;
  transcripts: { role: "user" | "assistant"; content: string }[];
  onEnd: () => void;
}

export function VoiceMode({ voiceStatus, isSpeaking, transcripts, onEnd }: VoiceModeProps) {
  const isConnecting = voiceStatus === "connecting";
  const isConnected = voiceStatus === "connected";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
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
        <div className={cn(
          "relative h-20 w-20 rounded-full overflow-hidden ring-2 transition-colors",
          isConnected
            ? isSpeaking ? "ring-primary shadow-lg shadow-primary/30" : "ring-crisis-green shadow-lg shadow-crisis-green/20"
            : "ring-border"
        )}>
          <img src={nayaAvatar} alt="Naya" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-1">
        <p className="text-sm font-mono font-semibold text-foreground">
          {isConnecting && "Connecting..."}
          {isConnected && isSpeaking && "Naya is speaking"}
          {isConnected && !isSpeaking && "Listening..."}
        </p>
        <p className="text-xs text-muted-foreground">
          {isConnecting ? "Setting up voice channel" : "Speak naturally — Naya hears you"}
        </p>
      </div>

      {/* Live transcript (last 3) */}
      {transcripts.length > 0 && (
        <div className="w-full max-h-[160px] overflow-y-auto space-y-2 px-2">
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
        className="gap-2 mt-2"
        disabled={isConnecting}
      >
        <PhoneOff className="h-3.5 w-3.5" />
        End Conversation
      </Button>
    </div>
  );
}
