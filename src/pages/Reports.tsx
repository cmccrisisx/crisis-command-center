import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Calendar, Plus } from "lucide-react";
import { exportToPDF } from "@/lib/pdf-export";
import { formatNumber } from "@/lib/crisis-helpers";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  sections: string[];
}

const defaultReports: Report[] = [
  {
    id: "rpt-001",
    title: "Crisis Incident Report — Airtel Nigeria Network Outage",
    type: "Post-Crisis",
    date: new Date().toLocaleDateString(),
    status: "Draft",
    sections: ["Executive Summary", "Timeline", "Sentiment Analysis", "Response Audit", "Recommendations"],
  },
  {
    id: "rpt-002",
    title: "Weekly Reputation Monitor",
    type: "Recurring",
    date: new Date(Date.now() - 7 * 86400000).toLocaleDateString(),
    status: "Published",
    sections: ["Sentiment Overview", "Key Narratives", "Media Coverage", "Influencer Activity"],
  },
  {
    id: "rpt-003",
    title: "Stakeholder Impact Assessment",
    type: "Ad-hoc",
    date: new Date(Date.now() - 2 * 86400000).toLocaleDateString(),
    status: "In Review",
    sections: ["Customer Impact", "Investor Relations", "Regulatory Exposure", "Employee Sentiment"],
  },
];

const AVAILABLE_SECTIONS = [
  "Executive Summary",
  "Timeline",
  "Sentiment Analysis",
  "Response Audit",
  "Recommendations",
  "Key Narratives",
  "Media Coverage",
  "Influencer Activity",
  "Customer Impact",
  "Investor Relations",
  "Regulatory Exposure",
  "Employee Sentiment",
  "Stakeholder Impact",
];

const REPORT_TYPES = ["Post-Crisis", "Recurring", "Ad-hoc", "Incident", "Compliance"];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>(defaultReports);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Post-Crisis");
  const [newSections, setNewSections] = useState<string[]>(["Executive Summary", "Timeline"]);

  // Fetch live crisis data
  const { data: crisis } = useQuery({
    queryKey: ["reports-crisis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crises")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch live narratives
  const { data: narratives = [] } = useQuery({
    queryKey: ["reports-narratives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("narratives")
        .select("*")
        .order("signal_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch live signals for stats
  const { data: signals = [] } = useQuery({
    queryKey: ["reports-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest reputation snapshot
  const { data: latestSnapshot } = useQuery({
    queryKey: ["reports-snapshot"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reputation_snapshots")
        .select("*")
        .order("snapshot_at", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Build stakeholder data from signals
  const stakeholderSummary = (() => {
    const groups: Record<string, { mentions: number; sentimentSum: number }> = {
      "Subscribers": { mentions: 0, sentimentSum: 0 },
      "Investors (NSE)": { mentions: 0, sentimentSum: 0 },
      "NCC / Regulators": { mentions: 0, sentimentSum: 0 },
      "Nigerian Media": { mentions: 0, sentimentSum: 0 },
    };
    signals.forEach((s) => {
      const val = s.sentiment === "negative" ? -1 : s.sentiment === "positive" ? 1 : 0;
      const content = (s.content + " " + (s.keywords || []).join(" ")).toLowerCase();
      if (content.match(/ncc|regulat|senate|compliance/)) {
        groups["NCC / Regulators"].mentions++;
        groups["NCC / Regulators"].sentimentSum += val;
      }
      if (content.match(/stock|nse|investor|market/)) {
        groups["Investors (NSE)"].mentions++;
        groups["Investors (NSE)"].sentimentSum += val;
      }
      if (s.source === "news" || s.source === "blog") {
        groups["Nigerian Media"].mentions++;
        groups["Nigerian Media"].sentimentSum += val;
      }
      if (content.match(/customer|subscriber|user|service/)) {
        groups["Subscribers"].mentions++;
        groups["Subscribers"].sentimentSum += val;
      }
    });
    return Object.entries(groups).map(([group, d]) => ({
      group,
      sentiment: d.mentions > 0 ? (d.sentimentSum / d.mentions).toFixed(2) : "0",
      mentions: d.mentions,
    }));
  })();

  const toggleSection = (section: string) => {
    setNewSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const createReport = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a report title");
      return;
    }
    if (newSections.length === 0) {
      toast.error("Select at least one section");
      return;
    }

    const report: Report = {
      id: `rpt-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      date: new Date().toLocaleDateString(),
      status: "Draft",
      sections: newSections,
    };

    setReports((prev) => [report, ...prev]);
    setDialogOpen(false);
    setNewTitle("");
    setNewType("Post-Crisis");
    setNewSections(["Executive Summary", "Timeline"]);
    toast.success("Report created successfully");
  };

  const handleExportPDF = (report: Report) => {
    const crisisTitle = crisis?.title ?? "Crisis Report";
    const crisisDesc = crisis?.description ?? "";
    const riskLevel = crisis?.risk_level ?? "medium";
    const sentimentScore = crisis?.sentiment_score ?? 0;
    const signalCount = crisis?.signal_count ?? signals.length;

    exportToPDF({
      title: report.title,
      subtitle: `${report.type} Report — Crisis-X`,
      date: report.date,
      sections: [
        {
          title: "Crisis Overview",
          content: `${crisisTitle}\n${crisisDesc}\n\nRisk Level: ${riskLevel.toUpperCase()}\nSentiment Score: ${sentimentScore}\nSignals Detected: ${formatNumber(signalCount)}${latestSnapshot ? `\nReputation Score: ${latestSnapshot.reputation_score}/100\nMedia Reach: ${formatNumber(latestSnapshot.media_reach ?? 0)}` : ""}`,
        },
        { title: "Sections Included", content: report.sections.map((s) => `- ${s}`).join("\n") },
        {
          title: "Key Narratives",
          content: narratives.length > 0
            ? narratives.map((n) => `**${n.title}** (${n.risk_level.toUpperCase()})\n${n.summary}\nSignals: ${n.signal_count ?? 0} | Sentiment: ${n.sentiment}${n.trending ? " | 📈 Trending" : ""}`).join("\n\n")
            : "No narrative data available.",
        },
        {
          title: "Stakeholder Impact",
          content: stakeholderSummary.map((s) => `- ${s.group}: Sentiment ${s.sentiment}, Mentions ${s.mentions}`).join("\n"),
        },
      ],
    });
    toast.success("PDF downloaded");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate and export crisis reports</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono text-xs uppercase tracking-wider">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-mono text-sm uppercase tracking-wider">Create New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs font-mono">Report Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q1 Crisis Summary Report"
                    className="mt-1 text-sm font-mono bg-card"
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono">Report Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="mt-1 text-xs font-mono bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs font-mono">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-mono">Sections</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {AVAILABLE_SECTIONS.map((section) => (
                      <label key={section} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={newSections.includes(section)}
                          onCheckedChange={() => toggleSection(section)}
                        />
                        <span className="text-xs">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-xs font-mono">
                  Cancel
                </Button>
                <Button onClick={createReport} className="text-xs font-mono uppercase tracking-wider">
                  Create Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-sm font-mono">{report.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-mono h-5 px-1.5">{report.type}</Badge>
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {report.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === "Published" ? "default" : "secondary"} className="text-xs font-mono">
                      {report.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-mono whitespace-nowrap"
                      onClick={() => handleExportPDF(report)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {report.sections.map((section) => (
                    <span key={section} className="text-xs font-mono px-2 py-0.5 rounded-sm bg-surface-elevated border border-border text-muted-foreground">
                      {section}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
