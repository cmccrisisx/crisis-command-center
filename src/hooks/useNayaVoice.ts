import { useState, useRef, useCallback } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useNayaVoice() {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPlayingIndex(null);
    setLoading(false);
  }, []);

  const speak = useCallback(async (text: string, index: number) => {
    // If already playing this message, stop
    if (playingIndex === index) {
      stop();
      return;
    }

    // Stop any current playback
    stop();
    setLoading(true);
    setPlayingIndex(index);

    try {
      // Strip markdown for cleaner speech
      const cleanText = text
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[-*] /g, "")
        .trim();

      const response = await fetch(`${SUPABASE_URL}/functions/v1/naya-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        stop();
      };

      audio.onerror = () => {
        stop();
      };

      setLoading(false);
      await audio.play();
    } catch (err) {
      console.error("Naya TTS error:", err);
      stop();
    }
  }, [playingIndex, stop]);

  return { speak, stop, playingIndex, loading };
}
