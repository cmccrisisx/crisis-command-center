import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import {
  BarChart3,
  Copy,
  Filter,
  Info,
  Loader2,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RuleType = "keyword" | "query";
type RuleStatusFilter = "all" | "active" | "paused";
type RuleTypeFilter = "all" | RuleType;
type TrackingPlatform = "all" | "twitter" | "news" | "blog" | "linkedin";

interface CrisisOption {
  id: string;
  title: string;
}

interface TrackingRuleRow {
  id: string;
  crisis_id: string;
  platform: TrackingPlatform;
  rule_type: RuleType;
  rule_text: string;
  label: string | null;
  notes: string | null;
  is_active: boolean;
  priority: number;
  updated_at: string;
  created_at: string;
  created_by: string | null;
  crisis: CrisisOption | null;
}

interface TrackingRuleFormState {
  crisis_id: string;
  platform: TrackingPlatform;
  rule_type: RuleType;
  rule_text: string;
  label: string;
  notes: string;
  is_active: boolean;
  priority: string;
}

interface TrackingRuleManagerProps {
  initialOpen?: boolean;
  initialRuleType?: RuleType;
  openSignal?: number;
  onInitialOpenHandled?: () => void;
}

const TRACKING_RULES_TABLE = "tracking_rules" as const;

const PLATFORM_OPTIONS: Array<{ value: TrackingPlatform; label: string }> = [
  { value: "all", label: "All platforms" },
  { value: "twitter", label: "Twitter / X" },
  { value: "news", label: "News" },
  { value: "blog", label: "Blogs" },
  { value: "linkedin", label: "LinkedIn" },
];

const DEFAULT_TRACKING_RULE_FORM: TrackingRuleFormState = {
  crisis_id: "",
  platform: "all",
  rule_type: "keyword",
  rule_text: "",
  label: "",
  notes: "",
  is_active: true,
  priority: "100",
};

const normalizeRuleText = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

const parseKeywordBatch = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((entry) => entry.trim().replace(/\s+/g, " "))
    .filter(Boolean);

const dedupeKeywords = (values: string[]) => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const normalized = normalizeRuleText(value);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const trackingRuleSchema = z
  .object({
    crisis_id: z.string().uuid({ message: "Select a case" }),
    platform: z.enum(["all", "twitter", "news", "blog", "linkedin"], { message: "Select a platform" }),
    rule_type: z.enum(["keyword", "query"]),
    rule_text: z.string().trim().min(2, "Rule text is too short").max(500, "Rule text must be 500 characters or less"),
    label: z.string().trim().max(120, "Label must be 120 characters or less").optional(),
    notes: z.string().trim().max(500, "Notes must be 500 characters or less").optional(),
    is_active: z.boolean(),
    priority: z.coerce.number().int().min(0, "Priority must be 0 or greater").max(9999, "Priority must be 9999 or less"),
  })
  .superRefine((data, ctx) => {
    if (!normalizeRuleText(data.rule_text)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rule_text"], message: "Rule text cannot be empty" });
    }
  });

function StatPill({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface-elevated px-3 py-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-mono font-semibold tabular-nums text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function getRuleTypeCopy(ruleType: RuleType) {
  return {
    title: ruleType === "keyword" ? "Add Keyword" : "Add Search Query",
    description:
      ruleType === "keyword"
        ? "Enter the names or phrases this case should track."
        : "Save one broader search expression for this case.",
    placeholder:
      ruleType === "keyword"
        ? "Type a keyword and press Enter"
        : 'Use OR, quotes, hashtags, names, events…',
    submitLabel: ruleType === "keyword" ? "Add Keyword" : "Save Query",
  };
}

export function TrackingRuleManager({
  initialOpen = false,
  initialRuleType = "keyword",
  openSignal = 0,
  onInitialOpenHandled,
}: TrackingRuleManagerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [caseFilter, setCaseFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<TrackingPlatform>("all");
  const [typeFilter, setTypeFilter] = useState<RuleTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<RuleStatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrackingRuleRow | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [formState, setFormState] = useState<TrackingRuleFormState>(DEFAULT_TRACKING_RULE_FORM);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keywordEntries, setKeywordEntries] = useState<string[]>([]);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [compareCaseId, setCompareCaseId] = useState<string | null>(null);
  const autoOpenedEmptyRef = useRef(false);
  const lastHandledOpenSignalRef = useRef<number | null>(null);
  const keywordInputRef = useRef<HTMLInputElement | null>(null);
  const queryTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { data: crises = [], isLoading: crisesLoading } = useQuery({
    queryKey: ["tracking-rule-cases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crises").select("id, title").order("title");
      if (error) throw error;
      return (data ?? []) as CrisisOption[];
    },
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["tracking-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TRACKING_RULES_TABLE)
        .select("id, crisis_id, platform, rule_type, rule_text, label, notes, is_active, priority, updated_at, created_at, created_by, crises(id, title)")
        .order("priority", { ascending: true })
        .order("updated_at", { ascending: false });
      if (error) throw error;

      return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
        const crisisValue = row.crises;
        const crisis = Array.isArray(crisisValue)
          ? (crisisValue[0] as CrisisOption | undefined) ?? null
          : (crisisValue as CrisisOption | null);

        return {
          id: String(row.id),
          crisis_id: String(row.crisis_id),
          platform: ((row.platform as TrackingPlatform | null) ?? "all"),
          rule_type: row.rule_type as RuleType,
          rule_text: String(row.rule_text ?? ""),
          label: (row.label as string | null) ?? null,
          notes: (row.notes as string | null) ?? null,
          is_active: Boolean(row.is_active),
          priority: Number(row.priority ?? 0),
          updated_at: String(row.updated_at ?? ""),
          created_at: String(row.created_at ?? ""),
          created_by: (row.created_by as string | null) ?? null,
          crisis,
        } satisfies TrackingRuleRow;
      });
    },
  });

  const filteredRules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesCase = caseFilter === "all" || rule.crisis_id === caseFilter;
      const matchesPlatform = platformFilter === "all" || rule.platform === platformFilter;
      const matchesType = typeFilter === "all" || rule.rule_type === typeFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? rule.is_active : !rule.is_active);
      const haystack = [rule.rule_text, rule.label ?? "", rule.notes ?? "", rule.crisis?.title ?? ""].join(" ").toLowerCase();
      return matchesCase && matchesPlatform && matchesType && matchesStatus && (!query || haystack.includes(query));
    });
  }, [rules, caseFilter, platformFilter, typeFilter, statusFilter, searchQuery]);

  const countsByCase = useMemo(
    () =>
      rules.reduce<Record<string, number>>((acc, rule) => {
        acc[rule.crisis_id] = (acc[rule.crisis_id] ?? 0) + 1;
        return acc;
      }, {}),
    [rules]
  );

  const activeRuleCount = useMemo(() => rules.filter((rule) => rule.is_active).length, [rules]);
  const casesCoveredCount = useMemo(() => new Set(rules.map((rule) => rule.crisis_id)).size, [rules]);
  const recentUpdatesCount = useMemo(
    () => rules.filter((rule) => Date.now() - new Date(rule.updated_at).getTime() < 1000 * 60 * 60 * 24).length,
    [rules]
  );

  const resetForm = (preferredRuleType: RuleType = initialRuleType) => {
    setEditingRule(null);
    setAdvancedOpen(false);
    setKeywordDraft("");
    setKeywordEntries([]);
    setFormState({
      ...DEFAULT_TRACKING_RULE_FORM,
      crisis_id: caseFilter !== "all" ? caseFilter : crises[0]?.id ?? "",
      platform: platformFilter,
      rule_type: preferredRuleType,
    });
  };

  const invalidateRules = () => {
    queryClient.invalidateQueries({ queryKey: ["tracking-rules"] });
    queryClient.invalidateQueries({ queryKey: ["tracking-rule-cases"] });
  };

  const openCreateSheet = (ruleType: RuleType = "keyword") => {
    resetForm(ruleType);
    setSheetOpen(true);
  };

  const openEditSheet = (rule: TrackingRuleRow) => {
    setEditingRule(rule);
    setAdvancedOpen(true);
    setKeywordDraft("");
    setKeywordEntries(rule.rule_type === "keyword" ? [rule.rule_text] : []);
    setFormState({
      crisis_id: rule.crisis_id,
      platform: rule.platform,
      rule_type: rule.rule_type,
      rule_text: rule.rule_text,
      label: rule.label ?? "",
      notes: rule.notes ?? "",
      is_active: rule.is_active,
      priority: String(rule.priority),
    });
    setSheetOpen(true);
  };

  const openDuplicateSheet = (rule: TrackingRuleRow) => {
    setEditingRule(null);
    setAdvancedOpen(true);
    setKeywordDraft("");
    setKeywordEntries(rule.rule_type === "keyword" ? [rule.rule_text] : []);
    setFormState({
      crisis_id: rule.crisis_id,
      platform: rule.platform,
      rule_type: rule.rule_type,
      rule_text: rule.rule_text,
      label: rule.label ? `${rule.label} copy` : "",
      notes: rule.notes ?? "",
      is_active: false,
      priority: String(rule.priority + 10),
    });
    setSheetOpen(true);
  };

  useEffect(() => {
    if (!initialOpen) return;
    if (lastHandledOpenSignalRef.current === openSignal) return;
    lastHandledOpenSignalRef.current = openSignal;
    openCreateSheet(initialRuleType);
    onInitialOpenHandled?.();
  }, [initialOpen, initialRuleType, onInitialOpenHandled, openSignal, crises, caseFilter, platformFilter]);

  useEffect(() => {
    if (crisesLoading || rulesLoading || autoOpenedEmptyRef.current || rules.length > 0) return;
    autoOpenedEmptyRef.current = true;
    openCreateSheet(initialRuleType);
  }, [crisesLoading, rulesLoading, rules.length, initialRuleType, crises, caseFilter, platformFilter]);

  useEffect(() => {
    if (!sheetOpen) return;
    if (formState.rule_type === "keyword" && !editingRule) {
      keywordInputRef.current?.focus();
      return;
    }
    if (formState.rule_type === "query") {
      queryTextareaRef.current?.focus();
    }
  }, [sheetOpen, formState.rule_type, editingRule]);

  useEffect(() => {
    const validIds = new Set(rules.map((rule) => rule.id));
    setCompareSelection((current) => current.filter((id) => validIds.has(id)));
  }, [rules]);

  const addKeywords = (values: string[]) => {
    const incoming = dedupeKeywords(values);
    if (!incoming.length) return;

    setKeywordEntries((current) => {
      const merged = dedupeKeywords([...current, ...incoming]);
      if (merged.length === current.length) {
        toast.message("These keywords are already in the list");
      }
      return merged;
    });
  };

  const commitKeywordDraft = () => {
    if (!keywordDraft.trim()) return;
    addKeywords(parseKeywordBatch(keywordDraft));
    setKeywordDraft("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywordEntries((current) => current.filter((entry) => normalizeRuleText(entry) !== normalizeRuleText(keyword)));
  };

  const compareRules = useMemo(
    () => rules.filter((rule) => compareSelection.includes(rule.id)).sort((a, b) => compareSelection.indexOf(a.id) - compareSelection.indexOf(b.id)),
    [rules, compareSelection]
  );

  const canCompare = compareRules.length >= 2 && compareRules.length <= 5;
  const activeComparableCaseId = compareRules[0]?.crisis_id ?? compareCaseId;
  const hasInlineCaseError = !formState.crisis_id;
  const isKeywordCreateMode = formState.rule_type === "keyword" && !editingRule;
  const keywordHelperText = hasInlineCaseError ? "Select a case first, then add keywords." : "Press Enter, comma, or paste a newline list.";
  const draftKeywords = keywordDraft.trim() ? parseKeywordBatch(keywordDraft) : [];
  const pendingKeywordEntries = dedupeKeywords([...keywordEntries, ...draftKeywords]);
  const currentRuleText = isKeywordCreateMode ? pendingKeywordEntries[0] ?? "" : formState.rule_text;
  const hasPrimaryValue = isKeywordCreateMode ? pendingKeywordEntries.length > 0 : normalizeRuleText(currentRuleText).length > 0;
  const compareSummaryText =
    compareRules.length === 0
      ? "Select 2–5 saved keywords to enable comparison."
      : compareRules.length === 1
        ? "Select 1 more keyword to enable comparison."
        : `Ready to compare ${compareRules.length} keyword${compareRules.length === 1 ? "" : "s"}.`;
  const compareScopeText =
    compareRules.length > 0
      ? `Comparison stays scoped to ${compareRules[0]?.crisis?.title ?? "the selected case"}.`
      : "Comparison opens side-by-side analytics for the active case.";

  const saveRuleMutation = useMutation({
    mutationFn: async ({ payload, keywords }: { payload: TrackingRuleFormState; keywords: string[] }) => {
      if (payload.rule_type === "keyword" && !editingRule) {
        const normalizedBatch = dedupeKeywords(keywords);
        if (!normalizedBatch.length) {
          throw new Error("Add at least one keyword");
        }

        const existingNormalized = new Set(
          rules
            .filter(
              (rule) =>
                rule.crisis_id === payload.crisis_id &&
                rule.platform === payload.platform &&
                rule.rule_type === "keyword"
            )
            .map((rule) => normalizeRuleText(rule.rule_text))
        );

        const uniqueKeywords = normalizedBatch.filter((keyword) => !existingNormalized.has(normalizeRuleText(keyword)));
        const skippedCount = normalizedBatch.length - uniqueKeywords.length;

        if (!uniqueKeywords.length) {
          throw new Error("These keywords already exist for this case and platform");
        }

        const parsedPriority = z.coerce.number().int().min(0).max(9999).safeParse(payload.priority);
        if (!parsedPriority.success) {
          throw new Error(parsedPriority.error.flatten().formErrors[0] ?? "Invalid priority");
        }

        const insertRows = uniqueKeywords.map((keyword) => ({
          crisis_id: payload.crisis_id,
          platform: payload.platform,
          rule_type: "keyword" as const,
          rule_text: keyword,
          label: payload.label.trim() || null,
          notes: payload.notes.trim() || null,
          is_active: payload.is_active,
          priority: parsedPriority.data,
        }));

        const { error } = await supabase.from(TRACKING_RULES_TABLE).insert(insertRows);
        if (error) throw error;

        return { mode: "batch" as const, addedCount: uniqueKeywords.length, skippedCount };
      }

      const parsed = trackingRuleSchema.safeParse({
        ...payload,
        rule_text: payload.rule_text.trim(),
        label: payload.label.trim() || undefined,
        notes: payload.notes.trim() || undefined,
      });

      if (!parsed.success) {
        const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid rule";
        throw new Error(firstMessage);
      }

      const normalizedCandidate = normalizeRuleText(parsed.data.rule_text);
      const duplicateRule = rules.find(
        (rule) =>
          rule.id !== editingRule?.id &&
          rule.crisis_id === parsed.data.crisis_id &&
          rule.platform === parsed.data.platform &&
          rule.rule_type === parsed.data.rule_type &&
          normalizeRuleText(rule.rule_text) === normalizedCandidate
      );

      if (duplicateRule) {
        throw new Error("That rule already exists for this case, platform, and type");
      }

      const dbPayload = {
        crisis_id: parsed.data.crisis_id,
        platform: parsed.data.platform,
        rule_type: parsed.data.rule_type,
        rule_text: parsed.data.rule_text,
        label: parsed.data.label ?? null,
        notes: parsed.data.notes ?? null,
        is_active: parsed.data.is_active,
        priority: parsed.data.priority,
      };

      if (editingRule) {
        const { error } = await supabase.from(TRACKING_RULES_TABLE).update(dbPayload).eq("id", editingRule.id);
        if (error) throw error;
        return { mode: "single" as const, action: "updated" as const };
      }

      const { error } = await supabase.from(TRACKING_RULES_TABLE).insert(dbPayload);
      if (error) throw error;
      return { mode: "single" as const, action: "created" as const };
    },
    onSuccess: (result) => {
      if (result.mode === "batch") {
        const descriptionParts = [];
        if (result.skippedCount > 0) {
          descriptionParts.push(`${result.skippedCount} skipped because they already exist.`);
        }
        if (result.addedCount > 1) {
          descriptionParts.push("Select 2–5 saved keyword rows in the table, then click Compare selected.");
        }

        const description = descriptionParts.length > 0 ? descriptionParts.join(" ") : undefined;
        toast.success(`${result.addedCount} keyword${result.addedCount === 1 ? "" : "s"} added`, { description });
      } else {
        toast.success(editingRule ? "Tracking rule updated" : "Tracking rule created");
      }
      invalidateRules();
      setSheetOpen(false);
      resetForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to save rule";
      toast.error(message.includes("tracking_rules_unique_per_case") ? "That rule already exists for this case" : message);
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from(TRACKING_RULES_TABLE).update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "Rule activated" : "Rule paused");
      invalidateRules();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update rule");
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TRACKING_RULES_TABLE).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tracking rule deleted");
      invalidateRules();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete rule");
    },
  });

  const formCopy = getRuleTypeCopy(formState.rule_type);
  const hasRules = rules.length > 0;

  const toggleCompareRule = (rule: TrackingRuleRow, checked: boolean) => {
    if (rule.rule_type !== "keyword") return;

    if (!checked) {
      setCompareSelection((current) => current.filter((id) => id !== rule.id));
      if (compareSelection.length === 1) setCompareCaseId(null);
      return;
    }

    if (compareCaseId && compareCaseId !== rule.crisis_id && compareSelection.length > 0) {
      toast.message("Comparison is limited to one case at a time", {
        description: "Your selection was reset to keep analytics focused on a single case.",
      });
      setCompareSelection([rule.id]);
      setCompareCaseId(rule.crisis_id);
      return;
    }

    if (compareSelection.length >= 5) {
      toast.error("Choose up to 5 keywords to compare");
      return;
    }

    setCompareSelection((current) => [...current, rule.id]);
    setCompareCaseId(rule.crisis_id);
  };

  const launchCompare = () => {
    if (!canCompare || !activeComparableCaseId) return;
    const params = new URLSearchParams();
    params.set("case", activeComparableCaseId);
    compareRules.forEach((rule) => params.append("compare", rule.rule_text));
    navigate(`/analytics?${params.toString()}`);
  };

  if (crisesLoading || rulesLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Total rules" value={String(rules.length)} helper="All monitoring entries" />
        <StatPill label="Active now" value={String(activeRuleCount)} helper="Currently used by ingestion" />
        <StatPill label="Cases covered" value={String(casesCoveredCount)} helper="Cases with at least one rule" />
        <StatPill label="Updated today" value={String(recentUpdatesCount)} helper="Rules changed in the last 24h" />
      </div>

      {!hasRules ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-surface-elevated">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-mono font-semibold tracking-tight text-foreground">No tracking rules yet</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Start with the hero above, then compare saved keywords in Analytics once they are live.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Active rule coverage</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Filter existing rules, then compare 2–5 keywords inside analytics.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:self-start">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={launchCompare}
                  disabled={!canCompare}
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Compare selected {compareRules.length > 0 ? `(${compareRules.length})` : ""}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => openCreateSheet("keyword")} className="font-mono text-xs uppercase tracking-wider">
                  <Plus className="h-3.5 w-3.5" />
                  Add rule
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-sm border border-border bg-surface-elevated px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-foreground">{compareSummaryText}</p>
              <p className="text-[11px] text-muted-foreground">{compareScopeText}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={caseFilter === "all" ? "default" : "outline"} size="sm" className="font-mono text-xs" onClick={() => setCaseFilter("all")}>
                All cases
              </Button>
              {crises.map((crisis) => (
                <Button
                  key={crisis.id}
                  type="button"
                  variant={caseFilter === crisis.id ? "default" : "outline"}
                  size="sm"
                  className="font-mono text-xs"
                  onClick={() => setCaseFilter(crisis.id)}
                >
                  {crisis.title}
                  <span className="tabular-nums text-[10px] opacity-80">{countsByCase[crisis.id] ?? 0}</span>
                </Button>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_180px_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search rules, labels, notes..." className="bg-card pl-9 font-mono text-sm" />
              </div>

              <Select value={platformFilter} onValueChange={(value: TrackingPlatform) => setPlatformFilter(value)}>
                <SelectTrigger className="bg-card font-mono text-xs">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-mono text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(value: RuleTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger className="bg-card font-mono text-xs">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-mono text-xs">All rule types</SelectItem>
                  <SelectItem value="keyword" className="font-mono text-xs">Keywords</SelectItem>
                  <SelectItem value="query" className="font-mono text-xs">Queries</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: RuleStatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="bg-card font-mono text-xs">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-mono text-xs">All statuses</SelectItem>
                  <SelectItem value="active" className="font-mono text-xs">Active</SelectItem>
                  <SelectItem value="paused" className="font-mono text-xs">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-sm border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[7%]">Compare</TableHead>
                    <TableHead className="w-[20%]">Case</TableHead>
                    <TableHead className="w-[10%]">Type</TableHead>
                    <TableHead className="w-[12%]">Platform</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead className="w-[10%] text-right">Priority</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className="w-[12%]">Updated</TableHead>
                    <TableHead className="w-[16%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.length > 0 ? (
                    filteredRules.map((rule) => {
                      const isSelected = compareSelection.includes(rule.id);
                      const compareLocked = Boolean(compareCaseId && compareCaseId !== rule.crisis_id && compareSelection.length > 0);
                      const compareDisabled = rule.rule_type !== "keyword" || (!isSelected && (compareSelection.length >= 5 || compareLocked));

                      return (
                        <TableRow key={rule.id}>
                          <TableCell className="align-top">
                            <div className="flex h-9 items-start justify-center pt-1">
                              <Checkbox
                                checked={isSelected}
                                disabled={compareDisabled}
                                onCheckedChange={(checked) => toggleCompareRule(rule, checked === true)}
                                aria-label={`Compare ${rule.rule_text}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{rule.crisis?.title ?? "Unknown case"}</p>
                              {rule.label && <p className="text-xs font-mono text-muted-foreground">{rule.label}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">{rule.rule_type}</Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wide">
                              {PLATFORM_OPTIONS.find((option) => option.value === rule.platform)?.label ?? rule.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="break-words text-sm text-foreground">{rule.rule_text}</p>
                              {rule.notes && <p className="line-clamp-2 text-xs text-muted-foreground">{rule.notes}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-right font-mono tabular-nums">{rule.priority}</TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-center gap-2">
                              <Switch checked={rule.is_active} onCheckedChange={(checked) => toggleRuleMutation.mutate({ id: rule.id, isActive: checked })} disabled={toggleRuleMutation.isPending} />
                              <span className="text-xs font-mono text-muted-foreground">{rule.is_active ? "Active" : "Paused"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-xs font-mono text-muted-foreground">{new Date(rule.updated_at).toLocaleDateString()}</TableCell>
                          <TableCell className="align-top">
                            <div className="flex justify-end gap-1">
                              <Button type="button" variant="ghost" size="icon" onClick={() => openEditSheet(rule)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit rule</span>
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => openDuplicateSheet(rule)}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Duplicate rule</span>
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => deleteRuleMutation.mutate(rule.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete rule</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">No tracking rules match these filters.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) resetForm();
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-md sm:p-5">
          <SheetHeader className="space-y-1 pr-8">
            <SheetTitle className="font-mono text-base uppercase tracking-wider">
              {editingRule ? `Edit ${formState.rule_type === "keyword" ? "Keyword" : "Search Query"}` : formCopy.title}
            </SheetTitle>
            <SheetDescription>
              {editingRule ? "Update the target and save." : `${formCopy.description} Keep advanced options collapsed unless you need them.`}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-mono uppercase tracking-wider">Case</Label>
                {hasInlineCaseError ? <span className="text-[11px] text-destructive">Select a case first</span> : null}
              </div>
              <Select value={formState.crisis_id} onValueChange={(value) => setFormState((prev) => ({ ...prev, crisis_id: value }))}>
                <SelectTrigger className={cn("bg-card font-mono text-sm", hasInlineCaseError && "border-destructive")}> 
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {crises.map((crisis) => (
                    <SelectItem key={crisis.id} value={crisis.id} className="font-mono text-xs">{crisis.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Platform</Label>
              <Select value={formState.platform} onValueChange={(value: TrackingPlatform) => setFormState((prev) => ({ ...prev, platform: value }))}>
                <SelectTrigger className="bg-card font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-mono text-xs">{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formState.rule_type === "keyword" && !editingRule ? (
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider">Keywords</Label>
                <div className="rounded-md border border-border bg-card shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <div className="flex min-h-24 flex-wrap gap-2 p-2">
                    {keywordEntries.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1 rounded-sm px-2 py-1 font-mono text-xs">
                        <span>{keyword}</span>
                        <button type="button" onClick={() => removeKeyword(keyword)} className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {keyword}</span>
                        </button>
                      </Badge>
                    ))}
                    <input
                      ref={keywordInputRef}
                      value={keywordDraft}
                      onChange={(e) => setKeywordDraft(e.target.value)}
                      onBlur={commitKeywordDraft}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          commitKeywordDraft();
                        }
                      }}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData("text");
                        if (!/[\n,]/.test(pastedText)) return;
                        e.preventDefault();
                        addKeywords(parseKeywordBatch(pastedText));
                        setKeywordDraft("");
                      }}
                      placeholder={formCopy.placeholder}
                      className="min-w-[220px] flex-1 bg-transparent px-1 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <p className={cn("text-[11px]", hasInlineCaseError ? "text-destructive" : "text-muted-foreground")}>{keywordHelperText}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider">{formState.rule_type === "keyword" ? "Keyword" : "Search Query"}</Label>
                <Textarea
                  ref={queryTextareaRef}
                  rows={formState.rule_type === "keyword" ? 3 : 5}
                  value={formState.rule_text}
                  onChange={(e) => setFormState((prev) => ({ ...prev, rule_text: e.target.value }))}
                  placeholder={formCopy.placeholder}
                  className="min-h-0 bg-card font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  {formState.rule_type === "keyword" ? "Editing updates one saved keyword at a time." : "Queries stay as one expression so analytics can compare them cleanly."}
                </p>
              </div>
            )}

            <div className="rounded-sm border border-border bg-card px-3 py-3 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-elevated text-primary">
                  <Info className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-foreground">Compare keywords in Analytics</p>
                    <p className="mt-1 text-xs text-muted-foreground">Save first, then use the table selection to launch side-by-side keyword analytics.</p>
                  </div>
                  <ol className="space-y-1 text-xs text-foreground">
                    <li>1. Save your keywords.</li>
                    <li>2. Select 2–5 saved keyword rows in the table.</li>
                    <li>3. Click Compare selected.</li>
                  </ol>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible value={advancedOpen ? "advanced" : undefined} onValueChange={(value) => setAdvancedOpen(value === "advanced")}>
              <AccordionItem value="advanced" className="rounded-sm border border-border px-3">
                <AccordionTrigger className="py-3 text-xs font-mono uppercase tracking-wider hover:no-underline">
                  Advanced options
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="space-y-3 pb-3">
                    <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider">Type</Label>
                        <Select value={formState.rule_type} onValueChange={(value: RuleType) => setFormState((prev) => ({ ...prev, rule_type: value, rule_text: value === "query" ? prev.rule_text : "" }))}>
                          <SelectTrigger className="bg-card font-mono text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keyword" className="font-mono text-xs">Keyword</SelectItem>
                            <SelectItem value="query" className="font-mono text-xs">Search query</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider">Priority</Label>
                        <Input type="number" inputMode="numeric" min={0} max={9999} value={formState.priority} onChange={(e) => setFormState((prev) => ({ ...prev, priority: e.target.value }))} className="bg-card font-mono text-sm" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono uppercase tracking-wider">Label</Label>
                      <Input value={formState.label} onChange={(e) => setFormState((prev) => ({ ...prev, label: e.target.value }))} placeholder="Short category or label" className="bg-card font-mono text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono uppercase tracking-wider">Notes</Label>
                      <Textarea rows={2} value={formState.notes} onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Internal note" className="min-h-0 bg-card text-sm" />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-border bg-surface-elevated px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">Rule status</p>
                        <p className="text-xs text-muted-foreground">Paused rules are saved but skipped.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{formState.is_active ? "Active" : "Paused"}</span>
                        <Switch checked={formState.is_active} onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, is_active: checked }))} />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <SheetFooter className="mt-5">
            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} className="font-mono text-xs uppercase tracking-wider">Cancel</Button>
            <Button
              type="button"
              onClick={() => {
                const keywords = isKeywordCreateMode ? pendingKeywordEntries : [];
                const nextRuleText = !isKeywordCreateMode && formState.rule_type === "keyword" && keywordEntries[0]
                  ? keywordEntries[0]
                  : formState.rule_text;
                saveRuleMutation.mutate({
                  payload: {
                    ...formState,
                    rule_text: nextRuleText,
                  },
                  keywords,
                });
              }}
              disabled={saveRuleMutation.isPending || !formState.crisis_id || !hasPrimaryValue}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {saveRuleMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {editingRule ? "Save Rule" : formCopy.submitLabel}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
