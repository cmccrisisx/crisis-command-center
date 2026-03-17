import { useState, useCallback } from "react";

type AnalysisType = "sentiment" | "narrative" | "response";

interface Signal {
  author: string;
  content: string;
  source: string;
  sentiment?: string;
}

interface UseCrisisAIReturn {
  result: string;
  loading: boolean;
  error: string | null;
  analyze: (type: AnalysisType, signals: Signal[], crisisContext?: string) => Promise<void>;
  reset: () => void;
}

const CRISIS_AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crisis-ai`;

export function useCrisisAI(): UseCrisisAIReturn {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult("");
    setError(null);
  }, []);

  const analyze = useCallback(
    async (type: AnalysisType, signals: Signal[], crisisContext?: string) => {
      setResult("");
      setError(null);
      setLoading(true);

      try {
        const resp = await fetch(CRISIS_AI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ type, signals, crisisContext }),
        });

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({ error: "Request failed" }));
          throw new Error(data.error || `Request failed (${resp.status})`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                accumulated += content;
                setResult(accumulated);
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // Flush remaining buffer
        if (buffer.trim()) {
          for (let raw of buffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                accumulated += content;
                setResult(accumulated);
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { result, loading, error, analyze, reset };
}
