import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar } from "lucide-react";
import { exportToPDF } from "@/lib/pdf-export";
import { mockData } from "@/lib/mock-data";
import { toast } from "sonner";

const reports = [
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

export default function Reports() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate and export crisis reports</p>
          </div>
          <Button className="font-mono text-xs uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            New Report
          </Button>
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
                        <Badge variant="outline" className="text-[9px] font-mono h-4 px-1">{report.type}</Badge>
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" /> {report.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === "Published" ? "default" : "secondary"} className="text-[10px] font-mono">
                      {report.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] font-mono"
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
                    <span key={section} className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-surface-elevated border border-border text-muted-foreground">
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
