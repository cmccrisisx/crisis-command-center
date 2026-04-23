import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  Radio,
  Settings,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { GuideStepCard } from "@/components/guide/GuideStepCard";
import { GuideToc } from "@/components/guide/GuideToc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageTitle } from "@/hooks/usePageTitle";

import authShot from "@/assets/guide/01-auth-signin.png";
import dashboardShot from "@/assets/guide/02-dashboard-command-center.png";
import trackingShot from "@/assets/guide/04-tracking-manager.png";
import signalsShot from "@/assets/guide/05-signals-monitoring.png";
import warRoomShot from "@/assets/guide/06-war-room.png";
import analyticsShot from "@/assets/guide/07-analytics-live-mode.png";
import reportsShot from "@/assets/guide/08-reports.png";
import qaShot from "@/assets/guide/09-admin-qa.png";
import settingsShot from "@/assets/guide/10-settings.png";

const tocSections = [
  { id: "welcome", title: "Welcome" },
  { id: "journeys", title: "User journeys" },
  { id: "workflow", title: "End-to-end workflow" },
  { id: "operators", title: "Admin operations" },
  { id: "cadence", title: "Daily operating rhythm" },
];

const userJourney = [
  "Sign in and enter the command center.",
  "Review active risk, freshness, and current case context.",
  "Move into Signals to watch live mentions and filter the stream.",
  "Escalate to War Room when coordination or approvals are needed.",
  "Use Analytics to monitor attribution, trends, and source mix.",
  "Export Reports to brief stakeholders and document outcomes.",
];

const adminJourney = [
  "Open Tracking Manager and add tracked keywords or search queries.",
  "Confirm the right case and monitoring window are active.",
  "Inspect live mentions in Signals and refresh ingestion when needed.",
  "Review Analytics for attribution coverage and pending repairs.",
  "Validate crawl quality in the QA Checklist.",
  "Use Settings to manage roles and workspace controls.",
];

const workflowSteps = [
  {
    step: "01 · Access",
    title: "Sign in and reach the workspace",
    purpose: "Authenticate users and route them into the operational workspace with the right permissions.",
    action: "Use your work email and password on the sign-in screen. After authentication, the app redirects into the command center.",
    expectation: "You’ll see a branded sign-in screen, then the app shell with the sidebar, top bar, and live workspace modules.",
    whyItMatters: "This is the start of both the standard-user and admin/operator journey, and it establishes role-aware access to the rest of the platform.",
    screenshot: {
      src: authShot,
      alt: "Crisis-X sign-in experience",
      caption: "The sign-in screen is the entry point for all users, with a clear workspace handoff after authentication.",
      callouts: [
        { label: "Brand entry", x: "28%", y: "40%" },
        { label: "Secure sign-in", x: "76%", y: "62%" },
      ],
    },
  },
  {
    step: "02 · Orient",
    title: "Use the command center as the operational home base",
    purpose: "Give users a fast read on signal volume, active crises, freshness, and the next recommended action.",
    action: "Start on the dashboard to review the active case, KPI cards, freshness badge, and quick access into Tracking Manager or War Room.",
    expectation: "You’ll see high-level metrics, the current case summary, and shortcut actions that move you deeper into live operations.",
    whyItMatters: "The dashboard anchors daily work and helps teams decide whether to monitor, escalate, or report.",
    screenshot: {
      src: dashboardShot,
      alt: "Command center dashboard with key metrics and actions",
      caption: "The command center combines live risk context, case details, and fast access to escalation paths.",
      callouts: [
        { label: "Case switcher", x: "15%", y: "3.5%" },
        { label: "Freshness + KPIs", x: "26%", y: "25%" },
        { label: "Escalation", x: "87%", y: "14%" },
      ],
    },
  },
  {
    step: "03 · Monitor",
    title: "Track live mentions in Signals",
    purpose: "Let operators inspect raw mentions, filter by source or sentiment, and validate that live monitoring is current.",
    action: "Open Signals to review the live stream, apply filters, and use the monitoring window or refresh control when you need to narrow the view.",
    expectation: "You’ll see recent mentions with source metadata, sentiment, follower reach, and visible freshness cues.",
    whyItMatters: "Signals is where teams confirm whether a story is growing, who is amplifying it, and what needs escalation.",
    screenshot: {
      src: signalsShot,
      alt: "Signals monitoring view with filters and live mention list",
      caption: "Signals gives users a live feed of mentions with source, timing, and filtering controls for fast triage.",
      callouts: [
        { label: "Monitoring window", x: "8%", y: "16%" },
        { label: "Refresh", x: "46%", y: "11%" },
        { label: "Filters", x: "93%", y: "11%" },
      ],
    },
  },
  {
    step: "04 · Coordinate",
    title: "Escalate into the War Room",
    purpose: "Coordinate cross-functional response work, keep a decision trail, and move through the approval chain.",
    action: "When a case needs response coordination, open War Room, confirm the active case, and start logging decisions or requesting AI guidance.",
    expectation: "You’ll see case context, the chain of command, a decision log, and role-specific assignments.",
    whyItMatters: "War Room turns monitoring into action by giving PR, legal, exec, and social teams a shared operating space.",
    screenshot: {
      src: warRoomShot,
      alt: "War Room collaboration interface",
      caption: "War Room centralizes escalation, approvals, and coordinated crisis response work.",
      callouts: [
        { label: "Approval chain", x: "50%", y: "32%" },
        { label: "Decision log", x: "35%", y: "62%" },
        { label: "AI advisor", x: "84%", y: "63%" },
      ],
    },
  },
  {
    step: "05 · Analyze",
    title: "Review live analytics and attribution health",
    purpose: "Help teams understand volume, sentiment, coverage, and whether tracking rules are attributing mentions cleanly.",
    action: "Use Analytics to inspect scoped metrics, live mode, attribution status, and the latest KPI breakdown for the current monitoring window.",
    expectation: "You’ll see KPI cards, status badges, and real-time visibility into attributed versus pending-attribution mentions.",
    whyItMatters: "Analytics makes live monitoring measurable and shows whether the data is trustworthy enough for executive reporting.",
    screenshot: {
      src: analyticsShot,
      alt: "Analytics dashboard with attribution and KPI cards",
      caption: "Analytics highlights coverage, freshness, and pending-attribution signals so teams can separate ingestion from data quality.",
      callouts: [
        { label: "Filters", x: "54%", y: "23%" },
        { label: "Status strip", x: "48%", y: "43%" },
        { label: "Attribution KPIs", x: "60%", y: "73%" },
      ],
    },
  },
  {
    step: "06 · Report",
    title: "Export stakeholder-ready reports",
    purpose: "Package the current crisis state into shareable outputs for leadership, legal, or recurring reporting.",
    action: "Open Reports to review existing report templates, create a new report, and export PDF outputs for circulation.",
    expectation: "You’ll see report cards, status labels, included sections, and one-click export actions.",
    whyItMatters: "Reporting closes the loop between monitoring, response, and stakeholder communication.",
    screenshot: {
      src: reportsShot,
      alt: "Reports page with export options",
      caption: "Reports convert ongoing monitoring into reusable briefing outputs for leadership and stakeholders.",
      callouts: [
        { label: "New report", x: "92%", y: "9%" },
        { label: "Sections", x: "42%", y: "24%" },
        { label: "PDF export", x: "93%", y: "21%" },
      ],
    },
  },
];

const operatorSteps = [
  {
    step: "A1 · Configure",
    title: "Set up tracked keywords and search queries",
    purpose: "Admins define what the platform should look for so live monitoring stays aligned to brands, executives, and topics.",
    action: "Open Tracking Manager, add tracked keywords or search queries, and keep them organized by case.",
    expectation: "You’ll see an admin-focused page for creating, filtering, and maintaining monitoring rules.",
    whyItMatters: "Good rule setup is what makes later Signals, Analytics, and QA outputs relevant.",
    screenshot: {
      src: trackingShot,
      alt: "Tracking Manager admin page",
      caption: "Tracking Manager is the operational setup hub for admins who control monitored keywords and queries.",
      callouts: [
        { label: "Create rules", x: "20%", y: "45%" },
        { label: "Settings", x: "86%", y: "13%" },
        { label: "Live status", x: "21%", y: "66%" },
      ],
    },
  },
  {
    step: "A2 · Validate",
    title: "Audit crawl quality and freshness enforcement",
    purpose: "Show admins which crawl window was used, where timestamps came from, and how many stale results were rejected.",
    action: "Use the QA Checklist to review per-rule crawl telemetry and confirm freshness enforcement is active.",
    expectation: "You’ll see summary cards, pass/fail checklist items, and a rule-level table for timestamp-source extraction and stale skips.",
    whyItMatters: "This is how operators prove that old stories are not being surfaced as current data.",
    screenshot: {
      src: qaShot,
      alt: "Admin QA checklist with crawl telemetry",
      caption: "The QA Checklist gives admins direct visibility into crawl windows, extracted timestamps, and stale-result filtering.",
      callouts: [
        { label: "Window + counts", x: "50%", y: "22%" },
        { label: "Checklist", x: "47%", y: "46%" },
        { label: "Rule telemetry", x: "18%", y: "82%" },
      ],
    },
  },
  {
    step: "A3 · Govern",
    title: "Manage roles and workspace controls",
    purpose: "Admins maintain team access, notification behavior, and workspace-level configuration from one place.",
    action: "Use Settings to open the tracking workspace, assign or remove roles, and keep operational controls current.",
    expectation: "You’ll see role-management controls alongside workspace configuration cards and quick links into admin tools.",
    whyItMatters: "Settings keeps the platform governable as more teams join active crisis response work.",
    screenshot: {
      src: settingsShot,
      alt: "Settings page with role management",
      caption: "Settings centralizes user roles, workspace controls, and links back to admin-only monitoring tools.",
      callouts: [
        { label: "Workspace controls", x: "43%", y: "29%" },
        { label: "Role management", x: "18%", y: "46%" },
        { label: "Save", x: "92%", y: "9%" },
      ],
    },
  },
];

const dailyRhythm = [
  {
    icon: Activity,
    title: "Start with freshness",
    text: "Open the dashboard or Signals first, confirm the active case, and verify that the latest mention timing aligns with expectations.",
  },
  {
    icon: Radio,
    title: "Monitor the feed",
    text: "Watch Signals for spikes, emerging narratives, and influential authors. Escalate fast when sentiment turns or reach expands.",
  },
  {
    icon: BarChart3,
    title: "Check attribution quality",
    text: "Use Analytics to separate live mention volume from pending attribution so the team knows whether rule-linking needs attention.",
  },
  {
    icon: ShieldCheck,
    title: "Close the loop",
    text: "Admins should validate the QA Checklist, then create or export Reports for internal and stakeholder briefings.",
  },
];

function JourneyList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-elevated text-[10px] font-mono text-foreground">
            {index + 1}
          </span>
          <p className="text-sm text-muted-foreground">{item}</p>
        </li>
      ))}
    </ol>
  );
}

export default function UserGuide() {
  usePageTitle("User Guide");

  return (
    <AppLayout>
      <div className="space-y-6">
        <section id="welcome" className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border bg-card/70">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="font-mono text-[10px] uppercase tracking-[0.22em]">User enablement</Badge>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.22em]">Web guide</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-mono font-bold tracking-tight">Crisis-X user journey</h1>
                <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                  A structured, screenshot-backed guide for both standard users and admins—from sign-in through live monitoring, escalation, analytics, QA, and reporting.
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: BookOpen, label: "Guide type", value: "Step by step" },
                { icon: Users, label: "Audience", value: "Users + admins" },
                { icon: Target, label: "Coverage", value: "End to end" },
                { icon: FileText, label: "Format", value: "Live in product" },
              ].map((item) => (
                <div key={item.label} className="rounded-sm border border-border bg-surface-elevated p-4">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <GuideToc sections={tocSections} />
        </section>

        <section id="journeys">
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="users">Core user journey</TabsTrigger>
              <TabsTrigger value="admins">Admin journey</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <Card className="border-border bg-card/70">
                <CardHeader>
                  <CardTitle className="text-xl font-mono">New User Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <JourneyList items={userJourney} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="admins">
              <Card className="border-border bg-card/70">
                <CardHeader>
                  <CardTitle className="text-xl font-mono">Admin Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <JourneyList items={adminJourney} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section id="workflow" className="space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">End-to-end workflow</p>
            <h2 className="mt-2 text-2xl font-mono font-bold tracking-tight">From access to reporting</h2>
          </div>
          <div className="space-y-4">
            {workflowSteps.map((step) => (
              <GuideStepCard key={step.step} {...step} />
            ))}
          </div>
        </section>

        <section id="operators" className="space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">Admin operations</p>
            <h2 className="mt-2 text-2xl font-mono font-bold tracking-tight">Setup, QA, and governance</h2>
          </div>
          <div className="space-y-4">
            {operatorSteps.map((step) => (
              <GuideStepCard key={step.step} {...step} />
            ))}
          </div>
        </section>

        <section id="cadence">
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-2xl font-mono">Recommended daily operating rhythm</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dailyRhythm.map((item) => (
                <div key={item.title} className="rounded-sm border border-border bg-surface-elevated p-4">
                  <item.icon className="h-4 w-4 text-primary" />
                  <h3 className="mt-3 text-sm font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}