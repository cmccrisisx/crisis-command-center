// Crisis X Mock Data Engine
// Simulates real-time crisis data for the Telecom Outage demo scenario

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type SentimentType = "positive" | "neutral" | "negative";
export type CrisisType = "pr" | "regulatory" | "operational";
export type SignalSource = "twitter" | "news" | "blog" | "linkedin";

export interface Signal {
  id: string;
  source: SignalSource;
  author: string;
  authorFollowers: number;
  content: string;
  sentiment: SentimentType;
  timestamp: Date;
  keywords: string[];
  reach: number;
  isInfluencer: boolean;
}

export interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  type: CrisisType;
  detectedAt: Date;
  signalCount: number;
  sentimentScore: number; // -1 to 1
  isActive: boolean;
}

export interface NarrativeCluster {
  id: string;
  title: string;
  summary: string;
  signalCount: number;
  sentiment: SentimentType;
  riskLevel: RiskLevel;
  topKeywords: string[];
  trending: boolean;
}

export interface SentimentDataPoint {
  time: string;
  positive: number;
  neutral: number;
  negative: number;
  volume: number;
}

export interface StakeholderImpact {
  group: string;
  sentiment: number;
  change: number;
  mentions: number;
}

// Generate the telecom outage scenario signals
const telecomSignals: Signal[] = [
  {
    id: "sig-001",
    source: "twitter",
    author: "@TechReporter_Jane",
    authorFollowers: 245000,
    content: "BREAKING: Major network outage reported across multiple cities. Users unable to make calls or access data. #NetworkDown #TelecomCrisis",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 180 * 60000),
    keywords: ["outage", "network down", "telecom"],
    reach: 450000,
    isInfluencer: true,
  },
  {
    id: "sig-002",
    source: "twitter",
    author: "@AngryCustomer42",
    authorFollowers: 320,
    content: "Been without service for 3 hours now. No response from customer support. This is unacceptable! @TelecomCo",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 170 * 60000),
    keywords: ["outage", "customer support", "no service"],
    reach: 800,
    isInfluencer: false,
  },
  {
    id: "sig-003",
    source: "news",
    author: "Reuters",
    authorFollowers: 25000000,
    content: "TelecomCo faces widespread network disruption affecting an estimated 2.3 million subscribers across the Eastern seaboard.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 150 * 60000),
    keywords: ["network disruption", "subscribers", "outage"],
    reach: 12000000,
    isInfluencer: true,
  },
  {
    id: "sig-004",
    source: "twitter",
    author: "@BusinessAnalyst",
    authorFollowers: 89000,
    content: "TelecomCo stock dropping 4.2% in pre-market trading following reports of massive network failure. $TELCO",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 130 * 60000),
    keywords: ["stock", "market", "network failure"],
    reach: 210000,
    isInfluencer: true,
  },
  {
    id: "sig-005",
    source: "blog",
    author: "TechCrunch",
    authorFollowers: 12000000,
    content: "Analysis: TelecomCo's infrastructure vulnerabilities exposed as outage enters fourth hour with no ETA for restoration.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 110 * 60000),
    keywords: ["infrastructure", "vulnerabilities", "outage"],
    reach: 5000000,
    isInfluencer: true,
  },
  {
    id: "sig-006",
    source: "twitter",
    author: "@EmergencyMgmt",
    authorFollowers: 500000,
    content: "Advisory: TelecomCo outage affecting 911 services in some areas. Please use landlines or alternative carriers for emergencies.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 90 * 60000),
    keywords: ["911", "emergency", "advisory"],
    reach: 2000000,
    isInfluencer: true,
  },
  {
    id: "sig-007",
    source: "twitter",
    author: "@TelecomCo_Official",
    authorFollowers: 2100000,
    content: "We are aware of the network issues and our teams are working around the clock to restore services. We sincerely apologize for the inconvenience.",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 60 * 60000),
    keywords: ["restore", "apology", "working"],
    reach: 3500000,
    isInfluencer: true,
  },
  {
    id: "sig-008",
    source: "news",
    author: "Bloomberg",
    authorFollowers: 20000000,
    content: "FCC launches investigation into TelecomCo network outage, demands report within 72 hours.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 45 * 60000),
    keywords: ["FCC", "investigation", "regulatory"],
    reach: 8000000,
    isInfluencer: true,
  },
  {
    id: "sig-009",
    source: "twitter",
    author: "@SatisfiedUser",
    authorFollowers: 150,
    content: "Service seems to be slowly coming back in my area. Thanks @TelecomCo for the update.",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 20 * 60000),
    keywords: ["service restored", "coming back"],
    reach: 200,
    isInfluencer: false,
  },
  {
    id: "sig-010",
    source: "linkedin",
    author: "Industry Analyst Group",
    authorFollowers: 180000,
    content: "TelecomCo's crisis response will be a case study in enterprise communications. Their delayed initial response cost them significant trust capital.",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 10 * 60000),
    keywords: ["crisis response", "case study", "trust"],
    reach: 350000,
    isInfluencer: true,
  },
];

const activeCrisis: CrisisAlert = {
  id: "crisis-001",
  title: "Major Network Outage — Eastern Seaboard",
  description: "Widespread network disruption affecting 2.3M+ subscribers. Emergency services impacted. FCC investigation launched. Stock price declining.",
  riskLevel: "critical",
  type: "operational",
  detectedAt: new Date(Date.now() - 180 * 60000),
  signalCount: 14500,
  sentimentScore: -0.72,
  isActive: true,
};

const narrativeClusters: NarrativeCluster[] = [
  {
    id: "narr-001",
    title: "Emergency Services Disruption",
    summary: "911 services affected in multiple jurisdictions due to network failure, creating public safety concerns.",
    signalCount: 3200,
    sentiment: "negative",
    riskLevel: "critical",
    topKeywords: ["911", "emergency", "public safety"],
    trending: true,
  },
  {
    id: "narr-002",
    title: "Stock Market Impact",
    summary: "Investor confidence shaken as TELCO stock drops 4.2%. Analysts downgrade outlook.",
    signalCount: 1800,
    sentiment: "negative",
    riskLevel: "high",
    topKeywords: ["stock", "investors", "market cap"],
    trending: true,
  },
  {
    id: "narr-003",
    title: "Regulatory Scrutiny",
    summary: "FCC demands answers within 72 hours. Congressional leaders call for infrastructure reform.",
    signalCount: 2100,
    sentiment: "negative",
    riskLevel: "high",
    topKeywords: ["FCC", "regulation", "investigation"],
    trending: false,
  },
  {
    id: "narr-004",
    title: "Customer Frustration & Churn Risk",
    summary: "Massive social media backlash from affected customers. Competitors promoting switch deals.",
    signalCount: 8500,
    sentiment: "negative",
    riskLevel: "medium",
    topKeywords: ["switching", "competitor", "frustrated"],
    trending: true,
  },
  {
    id: "narr-005",
    title: "Service Recovery Signals",
    summary: "Early reports of service restoration in some areas. Cautiously optimistic coverage emerging.",
    signalCount: 900,
    sentiment: "positive",
    riskLevel: "low",
    topKeywords: ["restored", "coming back", "fixed"],
    trending: false,
  },
];

// Generate 24-hour sentiment timeline
function generateSentimentTimeline(): SentimentDataPoint[] {
  const data: SentimentDataPoint[] = [];
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000);
    const timeStr = hour.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    // Simulate the crisis pattern
    let negative: number, neutral: number, positive: number, volume: number;

    if (i > 20) {
      // Before crisis
      negative = 10 + Math.random() * 5;
      neutral = 50 + Math.random() * 10;
      positive = 30 + Math.random() * 10;
      volume = 200 + Math.floor(Math.random() * 100);
    } else if (i > 15) {
      // Crisis onset
      negative = 30 + Math.random() * 20;
      neutral = 35 + Math.random() * 10;
      positive = 15 + Math.random() * 5;
      volume = 1500 + Math.floor(Math.random() * 500);
    } else if (i > 8) {
      // Peak crisis
      negative = 60 + Math.random() * 15;
      neutral = 20 + Math.random() * 10;
      positive = 5 + Math.random() * 5;
      volume = 5000 + Math.floor(Math.random() * 2000);
    } else if (i > 3) {
      // Response phase
      negative = 40 + Math.random() * 10;
      neutral = 30 + Math.random() * 10;
      positive = 15 + Math.random() * 10;
      volume = 3000 + Math.floor(Math.random() * 1000);
    } else {
      // Early recovery
      negative = 25 + Math.random() * 10;
      neutral = 35 + Math.random() * 10;
      positive = 25 + Math.random() * 10;
      volume = 2000 + Math.floor(Math.random() * 800);
    }

    data.push({
      time: timeStr,
      positive: Math.round(positive),
      neutral: Math.round(neutral),
      negative: Math.round(negative),
      volume: Math.round(volume),
    });
  }

  return data;
}

const stakeholderImpacts: StakeholderImpact[] = [
  { group: "Customers", sentiment: -0.68, change: -45, mentions: 8500 },
  { group: "Investors", sentiment: -0.55, change: -32, mentions: 1800 },
  { group: "Regulators", sentiment: -0.42, change: -28, mentions: 2100 },
  { group: "Employees", sentiment: -0.25, change: -15, mentions: 450 },
  { group: "Media", sentiment: -0.60, change: -38, mentions: 3200 },
];

export const mockData = {
  signals: telecomSignals,
  crisis: activeCrisis,
  narratives: narrativeClusters,
  sentimentTimeline: generateSentimentTimeline(),
  stakeholders: stakeholderImpacts,
  globalRisk: "critical" as RiskLevel,
  stats: {
    totalSignals: 14500,
    activeAlerts: 3,
    sentimentScore: -0.72,
    mediaReach: 32000000,
    responsesSent: 2,
    avgResponseTime: "47 min",
  },
};

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "critical": return "risk-critical";
    case "high": return "risk-high";
    case "medium": return "risk-medium";
    case "low": return "risk-low";
  }
}

export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case "positive": return "crisis-green";
    case "neutral": return "crisis-blue";
    case "negative": return "crisis-red";
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function getSourceIcon(source: SignalSource): string {
  switch (source) {
    case "twitter": return "𝕏";
    case "news": return "📰";
    case "blog": return "📝";
    case "linkedin": return "in";
  }
}
