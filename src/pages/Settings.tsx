import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-mono font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your Crisis X workspace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Alert Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-mono">Spike Multiplier</Label>
                <Input defaultValue="3.0" className="mt-1 font-mono text-sm bg-card" />
                <p className="text-[10px] text-muted-foreground mt-1">Alert when volume exceeds baseline by this factor</p>
              </div>
              <div>
                <Label className="text-xs font-mono">Influencer Threshold (Followers)</Label>
                <Input defaultValue="50000" className="mt-1 font-mono text-sm bg-card" />
                <p className="text-[10px] text-muted-foreground mt-1">Minimum followers to flag as influencer</p>
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
              {["outage", "network down", "telecom", "service disruption", "#NetworkDown"].map((kw) => (
                <Badge key={kw} variant="secondary" className="font-mono text-[10px]">{kw} ×</Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add keyword..." className="text-sm font-mono bg-card" />
              <Button variant="outline" size="sm" className="font-mono text-xs">Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase tracking-wider">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Critical Alert Notifications", desc: "Instant notification for critical risk events", default: true },
              { label: "Influencer Trigger Alerts", desc: "Alert when high-follower accounts engage", default: true },
              { label: "Sentiment Spike Warnings", desc: "Notify on rapid sentiment changes", default: false },
              { label: "Daily Summary Email", desc: "Daily digest of all monitoring activity", default: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.default} />
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
              <Badge className="font-mono text-[10px]">ACTIVE</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
