import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  Copy,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  showHeroActions?: boolean;
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
        ? "Add a person, brand, issue, or phrase that should always be tracked for this case."
        : "Add a broader search expression to capture evolving conversations for this case.",
    placeholder:
      ruleType === "keyword"
        ? "Enter a tracked keyword or phrase…"
        : 'Use OR, quotes, hashtags, names, events…',
    submitLabel: ruleType === "keyword" ? "Create Keyword" : "Create Query",
    emptyLabel: ruleType === "keyword" ? "Add your first keyword" : "Add your first query",
  };
}

export function TrackingRuleManager({
  initialOpen = false,
  initialRuleType = "keyword",
  openSignal = 0,
  onInitialOpenHandled,
  showHeroActions = true,
}: TrackingRuleManagerProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [caseFilter, setCaseFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<TrackingPlatform>("all");
  const [typeFilter, setTypeFilter] = useState<RuleTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<RuleStatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrackingRuleRow | null>(null);
  const [formState, setFormState] = useState<TrackingRuleFormState>(DEFAULT_TRACKING_RULE_FORM);
  const autoOpenedEmptyRef = useRef(false);
  const lastHandledOpenSignalRef = useRef<number | null>(null);

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

  const saveRuleMutation = useMutation({
    mutationFn: async (payload: TrackingRuleFormState) => {
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
        return;
      }

      const { error } = await supabase.from(TRACKING_RULES_TABLE).insert(dbPayload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editingRule ? "Tracking rule updated" : "Tracking rule created");
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
      {showHeroActions ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Add names, brands, executives, and search phrases first.</p>
              <p className="mt-1 text-xs text-muted-foreground">Create rules before filtering or reviewing the table so monitoring starts immediately.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => openCreateSheet("keyword")} className="font-mono text-xs uppercase tracking-wider">
                <Plus className="h-3.5 w-3.5" />
                Add Keyword
              </Button>
              <Button type="button" variant="outline" onClick={() => openCreateSheet("query")} className="font-mono text-xs uppercase tracking-wider">
                <Search className="h-3.5 w-3.5" />
                Add Search Query
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Total rules" value={String(rules.length)} helper="All monitoring entries" />
        <StatPill label="Active now" value={String(activeRuleCount)} helper="Currently used by ingestion" />
        <StatPill label="Cases covered" value={String(casesCoveredCount)} helper="Cases with at least one rule" />
        <StatPill label="Updated today" value={String(recentUpdatesCount)} helper="Rules changed in the last 24h" />
      </div>

      {!hasRules ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-surface-elevated">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-mono font-semibold tracking-tight text-foreground">No tracking rules yet</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Add the names, brands, executives, or search queries this case should monitor so live ingestion has the right targets.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => openCreateSheet("keyword")} className="font-mono text-xs uppercase tracking-wider">
                <Plus className="h-3.5 w-3.5" />
                Add your first keyword
              </Button>
              <Button type="button" variant="outline" onClick={() => openCreateSheet("query")} className="font-mono text-xs uppercase tracking-wider">
                <Search className="h-3.5 w-3.5" />
                Add search query
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Active rule coverage</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Filter by case, platform, or rule type after you add the monitoring targets you need.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:self-start">
                <Button type="button" onClick={() => openCreateSheet("keyword")} className="font-mono text-xs uppercase tracking-wider">
                  <Plus className="h-3.5 w-3.5" />
                  Add Keyword
                </Button>
                <Button type="button" variant="outline" onClick={() => openCreateSheet("query")} className="font-mono text-xs uppercase tracking-wider">
                  <Search className="h-3.5 w-3.5" />
                  Add Query
                </Button>
              </div>
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
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search rules, labels, notes..." className="pl-9 font-mono text-sm bg-card" />
              </div>

              <Select value={platformFilter} onValueChange={(value: TrackingPlatform) => setPlatformFilter(value)}>
                <SelectTrigger className="font-mono text-xs bg-card">
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
                <SelectTrigger className="font-mono text-xs bg-card">
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
                <SelectTrigger className="font-mono text-xs bg-card">
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
                    <TableHead className="w-[22%]">Case</TableHead>
                    <TableHead className="w-[10%]">Type</TableHead>
                    <TableHead className="w-[12%]">Platform</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead className="w-[10%] text-right">Priority</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className="w-[12%]">Updated</TableHead>
                    <TableHead className="w-[18%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.length > 0 ? (
                    filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
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
                            <p className="text-sm text-foreground break-words">{rule.rule_text}</p>
                            {rule.notes && <p className="text-xs text-muted-foreground line-clamp-2">{rule.notes}</p>}
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No tracking rules match these filters.</TableCell>
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
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-mono text-base uppercase tracking-wider">
              {editingRule ? `Edit ${formState.rule_type === "keyword" ? "Keyword" : "Search Query"}` : formCopy.title}
            </SheetTitle>
            <SheetDescription>
              {editingRule
                ? "Update the monitoring target for this case and keep live ingestion aligned."
                : formCopy.description}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Case</Label>
              <Select value={formState.crisis_id} onValueChange={(value) => setFormState((prev) => ({ ...prev, crisis_id: value }))}>
                <SelectTrigger className="font-mono text-sm bg-card">
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
                <SelectTrigger className="font-mono text-sm bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-mono text-xs">{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Rule Text</Label>
              <Textarea rows={5} value={formState.rule_text} onChange={(e) => setFormState((prev) => ({ ...prev, rule_text: e.target.value }))} placeholder={formCopy.placeholder} className="font-mono text-sm bg-card" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider">Rule Type</Label>
                <Select value={formState.rule_type} onValueChange={(value: RuleType) => setFormState((prev) => ({ ...prev, rule_type: value }))}>
                  <SelectTrigger className="font-mono text-sm bg-card">
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
                <Input type="number" inputMode="numeric" min={0} max={9999} value={formState.priority} onChange={(e) => setFormState((prev) => ({ ...prev, priority: e.target.value }))} className="font-mono text-sm bg-card" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Label</Label>
              <Input value={formState.label} onChange={(e) => setFormState((prev) => ({ ...prev, label: e.target.value }))} placeholder="Short category or label" className="font-mono text-sm bg-card" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Notes</Label>
              <Textarea rows={3} value={formState.notes} onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Internal note for this tracking rule" className="text-sm bg-card" />
            </div>

            <div className="flex items-center justify-between rounded-sm border border-border bg-surface-elevated px-3 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Rule status</p>
                <p className="text-xs text-muted-foreground">Paused rules stay saved but are skipped by ingestion.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{formState.is_active ? "Active" : "Paused"}</span>
                <Switch checked={formState.is_active} onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, is_active: checked }))} />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} className="font-mono text-xs uppercase tracking-wider">Cancel</Button>
            <Button type="button" onClick={() => saveRuleMutation.mutate(formState)} disabled={saveRuleMutation.isPending} className="font-mono text-xs uppercase tracking-wider">
              {saveRuleMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {editingRule ? "Save Rule" : formCopy.submitLabel}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
