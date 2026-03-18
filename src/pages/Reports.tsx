import { useState } from "react";
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
import { mockData } from "@/lib/mock-data";
import { toast } from "sonner";

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
    title: "Crisis Incident Report — Network Outage",
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
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-xs font-mono text-foreground">
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
                      onClick={() => {
                        exportToPDF({
                          title: report.title,
                          subtitle: `${report.type} Report — Crisis-X`,
                          date: report.date,
                          sections: [
                            { title: "Crisis Overview", content: `${mockData.crisis.title}\n${mockData.crisis.description}\n\nRisk Level: ${mockData.globalRisk.toUpperCase()}\nSentiment Score: ${mockData.crisis.sentimentScore}\nSignals Detected: ${mockData.crisis.signalCount}` },
                            { title: "Sections Included", content: report.sections.map(s => `- ${s}`).join("\n") },
                            { title: "Key Narratives", content: mockData.narratives.map(n => `**${n.title}** (${n.riskLevel.toUpperCase()})\n${n.summary}\nSignals: ${n.signalCount} | Sentiment: ${n.sentiment}`).join("\n\n") },
                            { title: "Stakeholder Impact", content: mockData.stakeholders.map(s => `- ${s.group}: Sentiment ${s.sentiment}, Change ${s.change}%, Mentions ${s.mentions}`).join("\n") },
                          ],
                        });
                        toast.success("PDF downloaded");
                      }}
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
