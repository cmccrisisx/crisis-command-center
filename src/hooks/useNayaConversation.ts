import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Replace with your ElevenLabs Agent ID after creating it at:
// https://elevenlabs.io/app/conversational-ai
const NAYA_AGENT_ID = "PLACEHOLDER_AGENT_ID";

export type VoiceStatus = "idle" | "connecting" | "connected";

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
}

export function useNayaConversation() {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const pendingUserTranscript = useRef<string>("");

  const conversation = useConversation({
    onConnect: () => {
      setVoiceStatus("connected");
    },
    onDisconnect: () => {
      // Flush any pending user transcript
      if (pendingUserTranscript.current.trim()) {
        setTranscripts((prev) => [
          ...prev,
          { role: "user", content: pendingUserTranscript.current.trim() },
        ]);
        pendingUserTranscript.current = "";
      }
      setVoiceStatus("idle");
    },
    onMessage: (message: any) => {
      if (message.type === "user_transcript") {
        const text = message.user_transcription_event?.user_transcript;
        if (text) {
          pendingUserTranscript.current = text;
          // Add committed user transcript
          setTranscripts((prev) => {
            // Replace last user entry if it was partial, or add new
            const last = prev[prev.length - 1];
            if (last?.role === "user") {
              return [...prev.slice(0, -1), { role: "user", content: text }];
            }
            return [...prev, { role: "user", content: text }];
          });
          pendingUserTranscript.current = "";
        }
      }
      if (message.type === "agent_response") {
        const text = message.agent_response_event?.agent_response;
        if (text) {
          setTranscripts((prev) => [...prev, { role: "assistant", content: text }]);
        }
      }
      if (message.type === "agent_response_correction") {
        const corrected = message.agent_response_correction_event?.corrected_agent_response;
        if (corrected) {
          setTranscripts((prev) => {
            const idx = prev.length - 1;
            if (idx >= 0 && prev[idx].role === "assistant") {
              return [...prev.slice(0, idx), { role: "assistant", content: corrected }];
            }
            return prev;
          });
        }
      }
    },
    onError: (error: any) => {
      console.error("Voice conversation error:", error);
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: "Connection lost. Please try again.",
      });
      setVoiceStatus("idle");
    },
  });

  const startConversation = useCallback(async () => {
    if (NAYA_AGENT_ID === "PLACEHOLDER_AGENT_ID") {
      toast({
        variant: "destructive",
        title: "Agent not configured",
        description: "Please set your ElevenLabs Agent ID in useNayaConversation.ts",
      });
      return;
    }

    setVoiceStatus("connecting");
    setTranscripts([]);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast({
        variant: "destructive",
        title: "Microphone Required",
        description: "Please allow microphone access to use voice chat.",
      });
      setVoiceStatus("idle");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("naya-voice-token", {
        body: { agentId: NAYA_AGENT_ID },
      });

      if (error || !data?.token) {
        throw new Error("Failed to get voice token");
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (err: any) {
      console.error("Failed to start voice conversation:", err);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not start voice session. Please try again.",
      });
      setVoiceStatus("idle");
    }
  }, [conversation]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return {
    voiceStatus,
    isSpeaking: conversation.isSpeaking,
    transcripts,
    startConversation,
    endConversation,
  };
}
