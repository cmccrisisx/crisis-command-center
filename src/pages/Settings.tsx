import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

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

const STORAGE_KEY = "crisis-x-settings";

function loadSettings(): SettingsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    spikeMultiplier: "3.0",
    influencerThreshold: "50000",
    keywords: ["outage", "network down", "telecom", "service disruption", "#NetworkDown"],
    notifications: { critical: true, influencer: true, sentiment: false, dailySummary: true },
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [newKeyword, setNewKeyword] = useState("");

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Settings saved successfully");
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
          <Button onClick={saveSettings} className="font-mono text-xs uppercase tracking-wider">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>

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
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Telecom Outage Simulation</p>
                <p className="text-xs text-muted-foreground">Run the pre-built crisis scenario with mock data</p>
              </div>
              <Badge className="font-mono text-xs">ACTIVE</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
