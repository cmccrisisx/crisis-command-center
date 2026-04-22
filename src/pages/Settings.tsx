import { useMemo, useState, type ReactNode } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Save,
  X,
  Shield,
  Loader2,
  Plus,
  Minus,
  PlayCircle,
  Inbox,
  Trash2,
  Mail,
  Clock,
  Search,
  Filter,
  Pencil,
  Copy,
  Target,
} from "lucide-react";
import { CronJobsPanel } from "@/components/CronJobsPanel";
import { useLaunchTour } from "@/components/DemoWalkthrough";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { z } from "zod";

function RelaunchTourButton() {
  const launchTour = useLaunchTour();
  return (
    <Button variant="outline" size="sm" onClick={launchTour} className="font-mono text-xs gap-1.5">
      <PlayCircle className="h-3.5 w-3.5" />
      Launch Tour
    </Button>
  );
}

const ALL_ROLES = ["admin", "pr_manager", "legal_reviewer", "social_manager"] as const;
type AppRole = (typeof ALL_ROLES)[number];

type RuleType = "keyword" | "query";
type RuleStatusFilter = "all" | "active" | "paused";
type RuleTypeFilter = "all" | RuleType;

interface CrisisOption {
  id: string;
  title: string;
}

interface TrackingRule {
  id: string;
  crisis_id: string;
  rule_type: RuleType;
  rule_text: string;
  label: string | null;
  notes: string | null;
  is_active: boolean;
  priority: number;
  updated_at: string;
  created_at: string;
  created_by: string | null;
}

interface TrackingRuleRow extends TrackingRule {
  crisis: CrisisOption | null;
}

interface TrackingRuleFormState {
  crisis_id: string;
  rule_type: RuleType;
  rule_text: string;
  label: string;
  notes: string;
  is_active: boolean;
  priority: string;
}

const trackingRuleSchema = z.object({
  crisis_id: z.string().uuid({ message: "Select a case" }),
  rule_type: z.enum(["keyword", "query"]),
  rule_text: z.string().trim().min(2, "Rule text is too short").max(500, "Rule text must be 500 characters or less"),
  label: z.string().trim().max(120, "Label must be 120 characters or less").optional(),
  notes: z.string().trim().max(500, "Notes must be 500 characters or less").optional(),
  is_active: z.boolean(),
  priority: z.coerce.number().int().min(0, "Priority must be 0 or greater").max(9999, "Priority must be 9999 or less"),
});

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  pr_manager: "PR Manager",
  legal_reviewer: "Legal Reviewer",
  social_manager: "Social Manager",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "text-crisis-red border-crisis-red/30 bg-crisis-red/5",
  pr_manager: "text-crisis-blue border-crisis-blue/30 bg-crisis-blue/5",
  legal_reviewer: "text-crisis-purple border-crisis-purple/30 bg-crisis-purple/5",
  social_manager: "text-crisis-green border-crisis-green/30 bg-crisis-green/5",
};

interface SettingsState {
  spikeMultiplier: string;
  influencerThreshold: string;
  keywords: string[];
  notifications: {
    critical: boolean;
    influencer: boolean;
    sentiment: boolean;
    dailySummary: boolean;
  };
}

const DEFAULT_SETTINGS: SettingsState = {
  spikeMultiplier: "3.0",
  influencerThreshold: "50000",
  keywords: ["outage", "network down", "telecom", "service disruption", "#NetworkDown"],
  notifications: { critical: true, influencer: true, sentiment: false, dailySummary: true },
};

const DEFAULT_TRACKING_RULE_FORM: TrackingRuleFormState = {
  crisis_id: "",
  rule_type: "query",
  rule_text: "",
  label: "",
  notes: "",
  is_active: true,
  priority: "100",
};

interface UserWithRoles {
  user_id: string;
  display_name: string | null;
  department: string | null;
  email: string;
  roles: AppRole[];
  created_at: string;
}

const MANAGE_ROLES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-roles`;

async function callManageRoles(action: string, payload: Record<string, string> = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const resp = await fetch(MANAGE_ROLES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Request failed");
  return data;
}

function StatPill({ children }: { children: ReactNode }) {
  return <div className="rounded-sm border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-muted-foreground">{children}</div>;
}

function TrackingRuleManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [caseFilter, setCaseFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<RuleTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<RuleStatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrackingRuleRow | null>(null);
  const [formState, setFormState] = useState<TrackingRuleFormState>(DEFAULT_TRACKING_RULE_FORM);

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
        .from("tracking_rules")
        .select("id, crisis_id, rule_type, rule_text, label, notes, is_active, priority, updated_at, created_at, created_by, crises(id, title)")
        .order("priority", { ascending: true })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as Array<TrackingRule & { crises: CrisisOption | CrisisOption[] | null }>).map((rule) => ({
        ...rule,
        crisis: Array.isArray(rule.crises) ? rule.crises[0] ?? null : rule.crises,
      }));
    },
  });

  const filteredRules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesCase = caseFilter === "all" || rule.crisis_id === caseFilter;
      const matchesType = typeFilter === "all" || rule.rule_type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? rule.is_active : !rule.is_active);
      const haystack = [rule.rule_text, rule.label ?? "", rule.notes ?? "", rule.crisis?.title ?? ""].join(" ").toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesCase && matchesType && matchesStatus && matchesSearch;
    });
  }, [rules, caseFilter, typeFilter, statusFilter, searchQuery]);

  const countsByCase = useMemo(() => {
    return rules.reduce<Record<string, number>>((acc, rule) => {
      acc[rule.crisis_id] = (acc[rule.crisis_id] ?? 0) + 1;
      return acc;
    }, {});
  }, [rules]);

  const activeRuleCount = useMemo(() => rules.filter((rule) => rule.is_active).length, [rules]);

  const resetForm = () => {
    setEditingRule(null);
    setFormState({
      ...DEFAULT_TRACKING_RULE_FORM,
      crisis_id: caseFilter !== "all" ? caseFilter : crises[0]?.id ?? "",
    });
  };

  const openCreateSheet = () => {
    resetForm();
    setSheetOpen(true);
  };

  const openEditSheet = (rule: TrackingRuleRow) => {
    setEditingRule(rule);
    setFormState({
      crisis_id: rule.crisis_id,
      rule_type: rule.rule_type,
      rule_text: rule.rule_text,
      label: rule.label ?? "",
      notes: rule.notes ?? "",
      is_active: rule.is_active,
      priority: String(rule.priority),
    });
    setSheetOpen(true);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tracking-rules"] });
    queryClient.invalidateQueries({ queryKey: ["tracking-rule-cases"] });
  };

  const saveRuleMutation = useMutation({
    mutationFn: async (payload: TrackingRuleFormState) => {
      const parsed = trackingRuleSchema.safeParse({
        ...payload,
        label: payload.label.trim() || undefined,
        notes: payload.notes.trim() || undefined,
      });
      if (!parsed.success) {
        const message = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Invalid rule";
        throw new Error(message);
      }

      const dbPayload = {
        crisis_id: parsed.data.crisis_id,
        rule_type: parsed.data.rule_type,
        rule_text: parsed.data.rule_text,
        label: parsed.data.label ?? null,
        notes: parsed.data.notes ?? null,
        is_active: parsed.data.is_active,
        priority: parsed.data.priority,
      };

      if (editingRule) {
        const { error } = await supabase.from("tracking_rules").update(dbPayload).eq("id", editingRule.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("tracking_rules").insert(dbPayload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editingRule ? "Tracking rule updated" : "Tracking rule created");
      invalidate();
      setSheetOpen(false);
      resetForm();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to save rule";
      toast.error(message.includes("tracking_rules_unique_per_case") ? "That rule already exists for this case" : message);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tracking_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tracking rule deleted");
      invalidate();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete rule");
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("tracking_rules").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? "Rule activated" : "Rule paused");
      invalidate();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update rule");
    },
  });

  const duplicateRuleMutation = useMutation({
    mutationFn: async (rule: TrackingRuleRow) => {
      const { error } = await supabase.from("tracking_rules").insert({
        crisis_id: rule.crisis_id,
        rule_type: rule.rule_type,
        rule_text: rule.rule_text,
        label: rule.label ? `${rule.label} (copy)` : null,
        notes: rule.notes,
        is_active: false,
        priority: rule.priority + 10,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tracking rule duplicated as paused draft");
      invalidate();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to duplicate rule";
      toast.error(message.includes("tracking_rules_unique_per_case") ? "Duplicate blocked because that rule already exists for this case" : message);
    },
  });

  if (crisesLoading || rulesLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill>{rules.length} total rules</StatPill>
        <StatPill>{activeRuleCount} active now</StatPill>
        <StatPill>{filteredRules.length} shown</StatPill>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={caseFilter === "all" ? "default" : "outline"}
          size="sm"
          className="font-mono text-xs"
          onClick={() => setCaseFilter("all")}
        >
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

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules, labels, notes..."
              className="pl-9 font-mono text-sm bg-card"
            />
          </div>
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

        <Button type="button" onClick={openCreateSheet} className="font-mono text-xs uppercase tracking-wider shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </Button>
      </div>

      <div className="rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">Case</TableHead>
              <TableHead className="w-[10%]">Type</TableHead>
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
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
                      {rule.rule_type}
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
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleRuleMutation.mutate({ id: rule.id, is_active: checked })}
                        disabled={toggleRuleMutation.isPending}
                      />
                      <span className="text-xs font-mono text-muted-foreground">{rule.is_active ? "Active" : "Paused"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-xs font-mono text-muted-foreground">
                    {new Date(rule.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEditSheet(rule)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit rule</span>
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => duplicateRuleMutation.mutate(rule)}>
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
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No tracking rules match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open) => {
        setSheetOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-mono text-base uppercase tracking-wider">{editingRule ? "Edit Tracking Rule" : "Add Tracking Rule"}</SheetTitle>
            <SheetDescription>
              Map brand keywords and search queries to a case so ingestion stays editable from the admin console.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Case</Label>
              <Select
                value={formState.crisis_id}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, crisis_id: value }))}
              >
                <SelectTrigger className="font-mono text-sm bg-card">
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {crises.map((crisis) => (
                    <SelectItem key={crisis.id} value={crisis.id} className="font-mono text-xs">
                      {crisis.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider">Rule Type</Label>
                <Select
                  value={formState.rule_type}
                  onValueChange={(value: RuleType) => setFormState((prev) => ({ ...prev, rule_type: value }))}
                >
                  <SelectTrigger className="font-mono text-sm bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="query" className="font-mono text-xs">Search query</SelectItem>
                    <SelectItem value="keyword" className="font-mono text-xs">Keyword</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider">Priority</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={9999}
                  value={formState.priority}
                  onChange={(e) => setFormState((prev) => ({ ...prev, priority: e.target.value }))}
                  className="font-mono text-sm bg-card"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Rule Text</Label>
              <Textarea
                rows={5}
                value={formState.rule_text}
                onChange={(e) => setFormState((prev) => ({ ...prev, rule_text: e.target.value }))}
                placeholder={formState.rule_type === "query" ? 'Use OR, quotes, hashtags, names, events…' : 'Enter a tracked keyword or phrase…'}
                className="font-mono text-sm bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Label</Label>
              <Input
                value={formState.label}
                onChange={(e) => setFormState((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Short category or label"
                className="font-mono text-sm bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider">Notes</Label>
              <Textarea
                rows={3}
                value={formState.notes}
                onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal note for this tracking rule"
                className="text-sm bg-card"
              />
            </div>

            <div className="flex items-center justify-between rounded-sm border border-border bg-surface-elevated px-3 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Rule status</p>
                <p className="text-xs text-muted-foreground">Paused rules stay saved but are skipped by ingestion.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{formState.is_active ? "Active" : "Paused"}</span>
                <Switch
                  checked={formState.is_active}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} className="font-mono text-xs uppercase tracking-wider">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => saveRuleMutation.mutate(formState)}
              disabled={saveRuleMutation.isPending}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {saveRuleMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {editingRule ? "Save Rule" : "Create Rule"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ── Role Management Section ── */
function RoleManagement() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => callManageRoles("list_users") as Promise<UserWithRoles[]>,
  });

  const toggleRole = async (userId: string, role: AppRole, hasRole: boolean) => {
    const key = `${userId}-${role}`;
    setActionLoading(key);
    try {
      await callManageRoles(hasRole ? "remove_role" : "add_role", { user_id: userId, role });
      toast.success(`${hasRole ? "Removed" : "Added"} ${ROLE_LABELS[role]} role`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
        <span className="text-xs font-mono text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u.user_id} className="p-3 rounded-sm bg-surface-elevated border border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{u.display_name || u.email}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{u.email}</p>
              {u.department && <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{u.department}</p>}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground tabular-nums shrink-0">
              {new Date(u.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {ALL_ROLES.map((role) => {
              const has = u.roles.includes(role);
              const loading = actionLoading === `${u.user_id}-${role}`;
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(u.user_id, role, has)}
                  disabled={loading}
                  className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-sm border transition-all ${
                    has
                      ? ROLE_COLORS[role]
                      : "border-border/50 text-muted-foreground/50 hover:border-border hover:text-muted-foreground"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : has ? (
                    <Minus className="h-2.5 w-2.5" />
                  ) : (
                    <Plus className="h-2.5 w-2.5" />
                  )}
                  {ROLE_LABELS[role]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {users.length === 0 && <p className="text-xs font-mono text-muted-foreground text-center py-4">No users found</p>}
    </div>
  );
}

/* ── Demo Requests Section ── */
function DemoRequests() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["demo-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("demo_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("demo_requests").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      toast.error("Failed to delete request");
    } else {
      toast.success("Demo request deleted");
      queryClient.invalidateQueries({ queryKey: ["demo-requests"] });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return <p className="text-xs font-mono text-muted-foreground text-center py-6">No demo requests yet</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground">
        {requests.length} request{requests.length !== 1 ? "s" : ""}
      </p>
      {requests.map((r) => (
        <div key={r.id} className="p-3 rounded-sm bg-surface-elevated border border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <a href={`mailto:${r.email}`} className="text-[10px] font-mono text-crisis-blue hover:underline truncate flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5 shrink-0" />
                  {r.email}
                </a>
                <span className="text-[10px] font-mono text-muted-foreground">•</span>
                <span className="text-[10px] font-mono text-muted-foreground truncate">{r.company}</span>
              </div>
              {r.message && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{r.message}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono text-muted-foreground tabular-nums">{new Date(r.created_at).toLocaleDateString()}</span>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deleting === r.id}
                className="p-1 rounded-sm text-muted-foreground hover:text-crisis-red hover:bg-crisis-red/10 transition-colors"
              >
                {deleting === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  usePageTitle("Settings");
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [newKeyword, setNewKeyword] = useState("");
  const [saving, setSaving] = useState(false);

  useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("preferences").eq("user_id", user!.id).single();
      if (error) throw error;
      return data?.preferences as unknown as SettingsState | null;
    },
  });

  useState;

  useMemo(() => DEFAULT_SETTINGS, []);

  useState;

  usePageTitle;

  useState;

  useMemo;

  useMutation;

  useQueryClient;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferences")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferences && typeof data.preferences === "object") {
          setSettings({ ...DEFAULT_SETTINGS, ...(data.preferences as unknown as SettingsState) });
        }
      });
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ preferences: settings as unknown as Record<string, never> }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved successfully");
    }
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw) return;
    if (settings.keywords.includes(kw)) {
      toast.error("Keyword already exists");
      return;
    }
    setSettings((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    setSettings((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== kw) }));
  };

  const updateNotification = (key: keyof SettingsState["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const notificationItems = [
    { key: "critical" as const, label: "Critical Alert Notifications", desc: "Instant notification for critical risk events" },
    { key: "influencer" as const, label: "Influencer Trigger Alerts", desc: "Alert when high-follower accounts engage" },
    { key: "sentiment" as const, label: "Sentiment Spike Warnings", desc: "Notify on rapid sentiment changes" },
    { key: "dailySummary" as const, label: "Daily Summary Email", desc: "Daily digest of all monitoring activity" },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure your Crisis X workspace</p>
          </div>
          <Button onClick={saveSettings} className="font-mono text-xs uppercase tracking-wider" disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save Changes
          </Button>
        </div>

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Keyword & Queries Manager</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Admin control center for case-linked tracking rules that feed the ingestion pipeline.
              </p>
            </CardHeader>
            <CardContent>
              <TrackingRuleManager />
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-crisis-red" />
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Role Management</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Assign or remove roles for team members. Click a role to toggle it.</p>
            </CardHeader>
            <CardContent>
              <RoleManagement />
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-crisis-blue" />
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Demo Requests</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Incoming demo requests from the About page contact form.</p>
            </CardHeader>
            <CardContent>
              <DemoRequests />
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-crisis-blue" />
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Scheduled Jobs</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Background cron jobs and their last run status. Refreshes every 30s.</p>
            </CardHeader>
            <CardContent>
              <CronJobsPanel />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Alert Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-mono">Spike Multiplier</Label>
                <Input
                  value={settings.spikeMultiplier}
                  onChange={(e) => setSettings((prev) => ({ ...prev, spikeMultiplier: e.target.value }))}
                  className="mt-1 font-mono text-sm bg-card"
                />
                <p className="text-xs text-muted-foreground mt-1">Alert when volume exceeds baseline by this factor</p>
              </div>
              <div>
                <Label className="text-xs font-mono">Influencer Threshold (Followers)</Label>
                <Input
                  value={settings.influencerThreshold}
                  onChange={(e) => setSettings((prev) => ({ ...prev, influencerThreshold: e.target.value }))}
                  className="mt-1 font-mono text-sm bg-card"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum followers to flag as influencer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Keyword Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">Personal workspace keywords only. Admin tracking rules above control ingestion.</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {settings.keywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="font-mono text-xs cursor-pointer hover:bg-destructive/20 transition-colors"
                  onClick={() => removeKeyword(kw)}
                >
                  {kw} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword..."
                className="text-sm font-mono bg-card"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button variant="outline" size="sm" className="font-mono text-xs whitespace-nowrap" onClick={addKeyword}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={settings.notifications[item.key]} onCheckedChange={(v) => updateNotification(item.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Demo Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Telecom Outage Simulation</p>
                <p className="text-xs text-muted-foreground">Run the pre-built crisis scenario with mock data</p>
              </div>
              <Badge className="font-mono text-xs">ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Platform Tour</p>
                <p className="text-xs text-muted-foreground">Re-launch the guided walkthrough overlay</p>
              </div>
              <RelaunchTourButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
