import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, X, Shield, Loader2, Plus, Minus, PlayCircle, Inbox, Trash2, Mail } from "lucide-react";
import { useLaunchTour } from "@/components/DemoWalkthrough";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: { session } } = await supabase.auth.getSession();
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
              {u.department && (
                <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{u.department}</p>
              )}
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
      {users.length === 0 && (
        <p className="text-xs font-mono text-muted-foreground text-center py-4">No users found</p>
      )}
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
      const { data, error } = await supabase
        .from("demo_requests")
        .select("*")
        .order("created_at", { ascending: false });
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
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <p className="text-xs font-mono text-muted-foreground text-center py-6">No demo requests yet</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground">{requests.length} request{requests.length !== 1 ? "s" : ""}</p>
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
              {r.message && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{r.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono text-muted-foreground tabular-nums">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
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

  // Load preferences from DB
  const { isLoading: prefsLoading } = useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data?.preferences as unknown as SettingsState | null;
    },
    // On success, merge into state
    meta: { onSuccess: true },
  });

  // Sync loaded prefs into state
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
    const { error } = await supabase
      .from("profiles")
      .update({ preferences: settings as unknown as Record<string, never> })
      .eq("user_id", user.id);
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
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure your Crisis X workspace</p>
          </div>
          <Button onClick={saveSettings} className="font-mono text-xs uppercase tracking-wider" disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save Changes
          </Button>
        </div>

        {/* Role Management — Admin Only */}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Alert Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={settings.notifications[item.key]}
                  onCheckedChange={(v) => updateNotification(item.key, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Demo Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Telecom Outage Simulation</p>
                <p className="text-xs text-muted-foreground">Run the pre-built crisis scenario with mock data</p>
              </div>
              <Badge className="font-mono text-xs">ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between">
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
