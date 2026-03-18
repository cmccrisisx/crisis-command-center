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
const airtelNigeriaSignals: Signal[] = [
  {
    id: "sig-001",
    source: "twitter",
    author: "@TechCabal",
    authorFollowers: 185000,
    content: "BREAKING: Massive Airtel Nigeria network outage reported across Lagos, Abuja, and PH. Millions unable to make calls or access data. #AirtelDown #AirtelNigeria",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 180 * 60000),
    keywords: ["outage", "Airtel Nigeria", "network down", "AirtelDown"],
    reach: 520000,
    isInfluencer: true,
  },
  {
    id: "sig-002",
    source: "twitter",
    author: "@LagosBigBoy_",
    authorFollowers: 280,
    content: "Airtel network don fail again o! 4 hours now, no calls, no data. Customer care line sef no dey go through. This one pass! @AirtelNigeria",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 170 * 60000),
    keywords: ["outage", "customer care", "no service", "Lagos"],
    reach: 650,
    isInfluencer: false,
  },
  {
    id: "sig-003",
    source: "news",
    author: "Channels TV",
    authorFollowers: 8500000,
    content: "Airtel Nigeria faces widespread network disruption affecting an estimated 15 million subscribers across major Nigerian cities including Lagos, Abuja, and Port Harcourt.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 150 * 60000),
    keywords: ["network disruption", "subscribers", "Airtel Nigeria", "Lagos"],
    reach: 15000000,
    isInfluencer: true,
  },
  {
    id: "sig-004",
    source: "twitter",
    author: "@NigeriaStockGuy",
    authorFollowers: 67000,
    content: "Airtel Africa stock dropping 5.1% on NSE following reports of massive network failure across Nigeria. $AIRTELAFRI #NSE",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 130 * 60000),
    keywords: ["stock", "NSE", "Airtel Africa", "market"],
    reach: 180000,
    isInfluencer: true,
  },
  {
    id: "sig-005",
    source: "blog",
    author: "TechPoint Africa",
    authorFollowers: 950000,
    content: "Analysis: Airtel Nigeria infrastructure vulnerabilities exposed as outage enters fifth hour with no ETA for restoration.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 110 * 60000),
    keywords: ["infrastructure", "vulnerabilities", "Airtel Nigeria"],
    reach: 3200000,
    isInfluencer: true,
  },
  {
    id: "sig-006",
    source: "twitter",
    author: "@NCCNigeria",
    authorFollowers: 380000,
    content: "ADVISORY: Airtel Nigeria outage affecting emergency services in Lagos and Abuja. Please use alternative carriers for emergency calls.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 90 * 60000),
    keywords: ["emergency", "advisory", "Lagos", "Abuja"],
    reach: 1800000,
    isInfluencer: true,
  },
  {
    id: "sig-007",
    source: "twitter",
    author: "@AirtelNigeria",
    authorFollowers: 1800000,
    content: "We are aware of the network challenges and our engineers are working around the clock to restore services. We sincerely apologize for the inconvenience.",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 60 * 60000),
    keywords: ["restore", "apology", "working", "engineers"],
    reach: 3000000,
    isInfluencer: true,
  },
  {
    id: "sig-008",
    source: "news",
    author: "The Guardian Nigeria",
    authorFollowers: 3200000,
    content: "NCC launches investigation into Airtel Nigeria network outage, demands comprehensive report within 48 hours.",
    sentiment: "negative",
    timestamp: new Date(Date.now() - 45 * 60000),
    keywords: ["NCC", "investigation", "regulatory", "consumer protection"],
    reach: 9000000,
    isInfluencer: true,
  },
  {
    id: "sig-009",
    source: "twitter",
    author: "@AbujaResident99",
    authorFollowers: 120,
    content: "My Airtel service just came back in Wuse area! Slow but at least calls going through now. Thank God 🙏 @AirtelNigeria",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 20 * 60000),
    keywords: ["service restored", "Abuja", "coming back"],
    reach: 180,
    isInfluencer: false,
  },
  {
    id: "sig-010",
    source: "linkedin",
    author: "Nairametrics",
    authorFollowers: 650000,
    content: "Airtel Nigeria's crisis response will be a case study in telecom crisis management. Their delayed initial response may cost them significant subscriber trust.",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 10 * 60000),
    keywords: ["crisis response", "case study", "trust", "subscribers"],
    reach: 420000,
    isInfluencer: true,
  },
];

const activeCrisis: CrisisAlert = {
  id: "crisis-001",
  title: "Major Network Outage — Airtel Nigeria",
  description: "Widespread network disruption affecting 15M+ Airtel Nigeria subscribers across Lagos, Abuja, Port Harcourt. Mobile banking and USSD services impacted. NCC investigation launched. Stock price declining on NSE.",
  riskLevel: "critical",
  type: "operational",
  detectedAt: new Date(Date.now() - 180 * 60000),
  signalCount: 18500,
  sentimentScore: -0.76,
  isActive: true,
};

const narrativeClusters: NarrativeCluster[] = [
  {
    id: "narr-001",
    title: "Emergency Services Disruption in Lagos & Abuja",
    summary: "Emergency call services affected in Lagos, Abuja, and Port Harcourt due to Airtel network failure, creating public safety concerns across Nigeria.",
    signalCount: 4200,
    sentiment: "negative",
    riskLevel: "critical",
    topKeywords: ["emergency", "public safety", "Lagos", "Abuja"],
    trending: true,
  },
  {
    id: "narr-002",
    title: "NSE Stock Market Impact",
    summary: "Investor confidence shaken as Airtel Africa stock drops 5.1% on NSE. Analysts downgrade outlook citing infrastructure concerns.",
    signalCount: 2400,
    sentiment: "negative",
    riskLevel: "high",
    topKeywords: ["stock", "NSE", "Airtel Africa", "investors"],
    trending: true,
  },
  {
    id: "narr-003",
    title: "NCC Regulatory Scrutiny",
    summary: "NCC demands answers within 48 hours. Senate Committee on ICT calls for hearing on telecom infrastructure standards in Nigeria.",
    signalCount: 2800,
    sentiment: "negative",
    riskLevel: "high",
    topKeywords: ["NCC", "regulation", "Senate", "investigation"],
    trending: false,
  },
  {
    id: "narr-004",
    title: "Customer Churn to MTN & Glo",
    summary: "Massive social media backlash from affected subscribers. MTN and Glo actively promoting porting deals. #SwitchToMTN trending.",
    signalCount: 9200,
    sentiment: "negative",
    riskLevel: "medium",
    topKeywords: ["MTN", "Glo", "porting", "churn", "frustrated"],
    trending: true,
  },
  {
    id: "narr-005",
    title: "Mobile Banking & USSD Disruption",
    summary: "Airtel Money and USSD banking services down, locking millions out of financial transactions. CBN monitoring situation.",
    signalCount: 3600,
    sentiment: "negative",
    riskLevel: "high",
    topKeywords: ["mobile banking", "USSD", "Airtel Money", "CBN"],
    trending: true,
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
