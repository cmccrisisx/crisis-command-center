import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crisis-chat`;

export function useCrisisChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const userIdRef = useRef<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setHistoryLoaded(true);
        return;
      }
      userIdRef.current = session.user.id;

      const { data, error } = await supabase
        .from("naya_chat_messages")
        .select("role, content")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data && data.length > 0 && !error) {
        setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
      }
      setHistoryLoaded(true);
    };
    loadHistory();
  }, []);

  const persistMessage = useCallback(async (msg: ChatMessage) => {
    const userId = userIdRef.current;
    if (!userId) return;
    await supabase.from("cx_chat_messages").insert({
      user_id: userId,
      role: msg.role,
      content: msg.content,
    });
  }, []);

  const send = useCallback(async (input: string) => {
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    // Persist user message
    persistMessage(userMsg);

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error || `Request failed (${resp.status})`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = (text: string) => {
        accumulated = text;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: text } : m
            );
          }
          return [...prev, { role: "assistant", content: text }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const json = line.slice(6).trim();
          if (json === "[DONE]") break;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(accumulated + content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const json = raw.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(accumulated + content);
          } catch { /* ignore */ }
        }
      }

      // Persist final assistant message
      if (accumulated) {
        persistMessage({ role: "assistant", content: accumulated });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Chat failed");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, persistMessage]);

  const clear = useCallback(async () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);

    // Delete all chat messages for this user
    const userId = userIdRef.current;
    if (userId) {
      await supabase.from("cx_chat_messages").delete().eq("user_id", userId);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { messages, isLoading, error, historyLoaded, send, clear, stop };
}
