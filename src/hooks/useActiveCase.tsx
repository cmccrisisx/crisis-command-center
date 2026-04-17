import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Crisis = Tables<"crises">;

const STORAGE_KEY = "crisis-x.activeCaseId";
const ALL = "__all__";

interface ActiveCaseContextValue {
  cases: Crisis[];
  activeCaseId: string | null; // null = "All cases"
  setActiveCaseId: (id: string | null) => void;
  activeCase: Crisis | null;
  isLoading: boolean;
}

const ActiveCaseContext = createContext<ActiveCaseContextValue | undefined>(undefined);

export function ActiveCaseProvider({ children }: { children: ReactNode }) {
  const [activeCaseId, setActiveCaseIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === ALL) return null;
    return raw;
  });

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["active-case-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crises")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data as Crisis[];
    },
  });

  const setActiveCaseId = useCallback((id: string | null) => {
    setActiveCaseIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id ?? ALL);
    }
  }, []);

  // If the persisted id no longer exists in the loaded set, fall back to All.
  useEffect(() => {
    if (!activeCaseId || cases.length === 0) return;
    if (!cases.some((c) => c.id === activeCaseId)) {
      setActiveCaseId(null);
    }
  }, [activeCaseId, cases, setActiveCaseId]);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === activeCaseId) ?? null,
    [cases, activeCaseId]
  );

  const value = useMemo<ActiveCaseContextValue>(
    () => ({ cases, activeCaseId, setActiveCaseId, activeCase, isLoading }),
    [cases, activeCaseId, setActiveCaseId, activeCase, isLoading]
  );

  return <ActiveCaseContext.Provider value={value}>{children}</ActiveCaseContext.Provider>;
}

export function useActiveCase() {
  const ctx = useContext(ActiveCaseContext);
  if (!ctx) throw new Error("useActiveCase must be used within ActiveCaseProvider");
  return ctx;
}
