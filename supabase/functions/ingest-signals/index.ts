import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RulePlatform = "all" | "twitter" | "news" | "blog" | "linkedin";
type RuleType = "keyword" | "query";
type SignalSource = "twitter" | "news" | "blog" | "linkedin";

interface TrackingRule {
  id: string;
  crisis_id: string;
  platform: RulePlatform;
  rule_type: RuleType;
  rule_text: string;
  is_active: boolean;
  priority: number;
  crisis?: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    risk_level: string;
    status: string;
  } | null;
}

interface SearchTask {
  query: string;
  platform: RulePlatform;
  ruleType: RuleType;
  ruleId: string;
  crisisId: string;
  crisisTitle: string;
  crisisDescription: string;
  crisisType: string;
  riskLevel: string;
  status: string;
}

interface FirecrawlSearchResult {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

interface CandidateSignal {
  task: SearchTask;
  url: string;
  title: string;
  content: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_QUERY_HINTS: Record<Exclude<RulePlatform, "all">, string> = {
  twitter: "site:x.com OR site:twitter.com",
  news: "site:reuters.com OR site:bbc.com OR site:cnn.com OR site:thecable.ng OR site:vanguardngr.com OR site:guardian.ng OR site:punchng.com",
  blog: "site:medium.com OR site:substack.com OR site:blogspot.com",
  linkedin: "site:linkedin.com",
};

const SOURCE_MAP: Record<string, SignalSource> = {
  twitter: "twitter",
  "x.com": "twitter",
  linkedin: "linkedin",
  blog: "blog",
  medium: "blog",
  substack: "blog",
};

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function classifySource(url: string): SignalSource {
  const lower = url.toLowerCase();
  for (const [key, val] of Object.entries(SOURCE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "news";
}

function platformMatches(taskPlatform: RulePlatform, source: SignalSource) {
  return taskPlatform === "all" || taskPlatform === source;
}

function estimateReach(url: string): number {
  const domain = url.toLowerCase();
  if (domain.includes("reuters") || domain.includes("bloomberg") || domain.includes("bbc")) {
    return 500000 + Math.floor(Math.random() * 500000);
  }
  if (domain.includes("punch") || domain.includes("guardian") || domain.includes("vanguard") || domain.includes("thisday")) {
    return 100000 + Math.floor(Math.random() * 200000);
  }
  if (domain.includes("techcabal") || domain.includes("techpoint") || domain.includes("disrupt")) {
    return 50000 + Math.floor(Math.random() * 100000);
  }
  return 5000 + Math.floor(Math.random() * 30000);
}

function isInfluencerSource(url: string): boolean {
  const big = ["reuters", "bloomberg", "bbc", "cnn", "ft.com", "aljazeera", "techcrunch", "linkedin.com"];
  return big.some((d) => url.toLowerCase().includes(d));
}

function buildSearchQuery(rule: TrackingRule) {
  const normalized = normalizeWhitespace(rule.rule_text);
  const base = rule.rule_type === "keyword" ? `\"${normalized.replace(/\"/g, "")}\"` : normalized;
  if (rule.platform === "all") return base;
  return `${base} ${PLATFORM_QUERY_HINTS[rule.platform]}`;
}

async function batchEnrichWithAI(
  items: { content: string; idx: number }[],
  apiKey: string
): Promise<Map<number, { sentiment: string; keywords: string[] }>> {
  const results = new Map<number, { sentiment: string; keywords: string[] }>();
  if (items.length === 0) return results;

  for (const item of items) {
    const lower = item.content.toLowerCase();
    const negWords = ["fraud", "scandal", "outage", "breach", "protest", "violation", "crisis", "crash", "loss", "shutdown", "attack", "fine", "penalty", "complaint", "investigation"];
    const posWords = ["growth", "profit", "launch", "partnership", "expansion", "award", "milestone", "recovery", "improvement"];

    const negScore = negWords.filter((w) => lower.includes(w)).length;
    const posScore = posWords.filter((w) => lower.includes(w)).length;

    let sentiment = "neutral";
    if (negScore > posScore) sentiment = "negative";
    else if (posScore > negScore) sentiment = "positive";

    const words = item.content.split(/\s+/).filter((w) => w.length > 4);
    const freq = new Map<string, number>();
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z]/g, "");
      if (clean.length > 4) freq.set(clean, (freq.get(clean) || 0) + 1);
    }
    const keywords = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);

    results.set(item.idx, { sentiment, keywords });
  }

  try {
    const batchText = items.slice(0, 5).map((it, i) => `[${i}] ${it.content.slice(0, 300)}`).join("\n\n");
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Classify each numbered news item sentiment (positive/neutral/negative) and extract 3-5 concise keywords using the tool.",
          },
          { role: "user", content: batchText },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_signals",
            description: "Classify multiple signals",
            parameters: {
              type: "object",
              properties: {
                signals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number" },
                      sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                      keywords: { type: "array", items: { type: "string" } },
                    },
                    required: ["index", "sentiment", "keywords"],
                  },
                },
              },
              required: ["signals"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_signals" } },
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        for (const sig of parsed.signals || []) {
          if (sig.index < items.length) {
            results.set(items[sig.index].idx, {
              sentiment: sig.sentiment,
              keywords: sig.keywords,
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("AI batch enrichment failed, using heuristic:", e);
  }

  return results;
}

async function fetchTrackingRules(supabase: any, requestedCrisisId?: string | null) {
  let query = supabase
    .from("tracking_rules")
    .select("id, crisis_id, platform, rule_type, rule_text, is_active, priority, crises(id, title, description, type, risk_level, status)")
    .eq("is_active", true)
    .order("priority", { ascending: true })
    .order("updated_at", { ascending: false });

  if (requestedCrisisId) {
    query = query.eq("crisis_id", requestedCrisisId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const crisisValue = row.crises;
    const crisis = Array.isArray(crisisValue)
      ? (crisisValue[0] as TrackingRule["crisis"]) ?? null
      : (crisisValue as TrackingRule["crisis"] | null);

    return {
      id: String(row.id),
      crisis_id: String(row.crisis_id),
      platform: (row.platform as RulePlatform | null) ?? "all",
      rule_type: (row.rule_type as RuleType | null) ?? "query",
      rule_text: String(row.rule_text ?? ""),
      is_active: Boolean(row.is_active),
      priority: Number(row.priority ?? 100),
      crisis,
    } satisfies TrackingRule;
  });
}

function buildSearchTasks(rules: TrackingRule[]) {
  const dedupe = new Map<string, SearchTask>();

  for (const rule of rules) {
    if (!rule.crisis) continue;
    const query = buildSearchQuery(rule);
    const key = `${rule.crisis_id}:${rule.platform}:${query.toLowerCase()}`;
    if (dedupe.has(key)) continue;

    dedupe.set(key, {
      query,
      platform: rule.platform,
      ruleType: rule.rule_type,
      ruleId: rule.id,
      crisisId: rule.crisis_id,
      crisisTitle: rule.crisis.title,
      crisisDescription: rule.crisis.description ?? "",
      crisisType: rule.crisis.type,
      riskLevel: rule.crisis.risk_level,
      status: rule.crisis.status,
    });
  }

  return [...dedupe.values()];
}

async function runSearch(task: SearchTask, apiKey: string): Promise<FirecrawlSearchResult[]> {
  const resp = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: task.query,
      limit: task.platform === "all" ? 5 : 4,
      lang: "en",
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  if (!resp.ok) {
    throw new Error(`Firecrawl ${resp.status}`);
  }

  const data = await resp.json();
  return (data.data ?? []) as FirecrawlSearchResult[];
}

function buildSignalContent(result: FirecrawlSearchResult) {
  return normalizeWhitespace(result.markdown?.slice(0, 600) || result.title || result.description || "");
}

async function upsertSnapshotsAndCounts(supabase: any, crisisIds: string[]) {
  for (const crisisId of crisisIds) {
    const { data } = await supabase
      .from("signals")
      .select("sentiment, reach")
      .eq("crisis_id", crisisId)
      .gte("detected_at", new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString());
    const sigRows = (data ?? []) as Array<{ sentiment: string; reach: number | null }>;

    const total = sigRows?.length || 0;
    if (total > 0) {
      const pos = sigRows!.filter((s) => s.sentiment === "positive").length;
      const neg = sigRows!.filter((s) => s.sentiment === "negative").length;
      const neu = total - pos - neg;
      const reach = sigRows!.reduce((a, s) => a + (s.reach || 0), 0);
      const sentiment_score = Number((((pos - neg) / total) * 100).toFixed(2));
      const reputation_score = Math.max(0, Math.min(100, 50 + sentiment_score / 2));
      await supabase.from("reputation_snapshots").insert({
        crisis_id: crisisId,
        sentiment_score,
        positive_pct: Number(((pos / total) * 100).toFixed(2)),
        neutral_pct: Number(((neu / total) * 100).toFixed(2)),
        negative_pct: Number(((neg / total) * 100).toFixed(2)),
        share_of_voice: 35,
        reputation_score,
        media_reach: reach,
        signal_volume: total,
        snapshot_at: new Date().toISOString(),
      });
    }

    const { count, error: countErr } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })
      .eq("crisis_id", crisisId);
    if (countErr) {
      console.error(`Count error for ${crisisId}:`, countErr.message);
      continue;
    }

    const { error: updErr } = await supabase
      .from("crises")
      .update({ signal_count: count ?? 0, updated_at: new Date().toISOString() })
      .eq("id", crisisId);
    if (updErr) console.error(`Crisis update error for ${crisisId}:`, updErr.message);
  }
}

async function regenerateNarratives(
  supabase: any,
  crisisTasks: SearchTask[],
  apiKey: string
) {
  const crisisMap = new Map<string, SearchTask>();
  for (const task of crisisTasks) {
    if (!crisisMap.has(task.crisisId)) crisisMap.set(task.crisisId, task);
  }

  for (const [crisisId, task] of crisisMap.entries()) {
    try {
      const { data } = await supabase
        .from("signals")
        .select("content, sentiment, reach, keywords, source_url")
        .eq("crisis_id", crisisId)
        .order("detected_at", { ascending: false })
        .limit(40);
      const recentSignals = (data ?? []) as Array<{ content: string; sentiment: string; reach: number | null; keywords: string[] | null; source_url: string | null }>;

      if (!recentSignals || recentSignals.length === 0) continue;

      const signalDigest = recentSignals
        .map((s, i) => `[${i}] (${s.sentiment}) ${s.content.slice(0, 220)}`)
        .join("\n");

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a media analyst in a crisis command center. Cluster the provided signals into 3-5 distinct trending narratives for the named case. Use the tool to emit concise, case-specific narratives only.",
            },
            {
              role: "user",
              content: `CASE: ${task.crisisTitle}\nTYPE: ${task.crisisType}\nRISK: ${task.riskLevel}\nSTATUS: ${task.status}\nDESCRIPTION: ${task.crisisDescription || "No description provided"}\n\nSIGNALS:\n${signalDigest}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "emit_narratives",
                description: "Emit 3-5 themed narratives clustering the signals.",
                parameters: {
                  type: "object",
                  properties: {
                    narratives: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          summary: { type: "string" },
                          sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                          risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                          top_keywords: { type: "array", items: { type: "string" } },
                          signal_indices: { type: "array", items: { type: "number" } },
                          trending: { type: "boolean" },
                        },
                        required: ["title", "summary", "sentiment", "risk_level", "top_keywords", "signal_indices", "trending"],
                      },
                    },
                  },
                  required: ["narratives"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "emit_narratives" } },
        }),
      });

      if (!aiResp.ok) {
        console.error(`Narrative AI failed for ${crisisId}: ${aiResp.status}`);
        continue;
      }

      const aiData = await aiResp.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;
      const parsed = JSON.parse(toolCall.function.arguments);
      const narratives = parsed.narratives || [];
      if (narratives.length === 0) continue;

      await supabase.from("narratives").delete().eq("crisis_id", crisisId);

      const rows = narratives.map((n: any) => ({
        crisis_id: crisisId,
        title: n.title.slice(0, 200),
        summary: n.summary,
        sentiment: n.sentiment,
        risk_level: n.risk_level,
        top_keywords: (n.top_keywords || []).slice(0, 8),
        signal_count: Array.isArray(n.signal_indices) ? n.signal_indices.length : 0,
        trending: !!n.trending,
        ai_generated: true,
      }));

      const { error: narrErr } = await supabase.from("narratives").insert(rows);
      if (narrErr) console.error(`Narrative insert error for ${crisisId}:`, narrErr.message);
    } catch (e) {
      console.error(`Narrative clustering failed for ${crisisId}:`, e);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Required backend secrets are not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let requestedCrisisId: string | null = null;
    try {
      const body = await req.json();
      requestedCrisisId = typeof body?.crisisId === "string" ? body.crisisId : null;
    } catch {
      requestedCrisisId = null;
    }

    const rules = await fetchTrackingRules(supabase, requestedCrisisId);
    const tasks = buildSearchTasks(rules);

    if (tasks.length === 0) {
      return new Response(JSON.stringify({ success: true, inserted: 0, errors: [], message: "No active tracking rules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const errors: string[] = [];
    let totalInserted = 0;
    const crisisIdsTouched = new Set<string>();
    const dedupeCandidates = new Map<string, CandidateSignal>();

    for (let i = 0; i < tasks.length; i += 3) {
      const batch = tasks.slice(i, i + 3);
      const searchResults = await Promise.all(
        batch.map(async (task) => {
          try {
            console.log(`Searching: ${task.crisisTitle} :: ${task.query}`);
            const results = await runSearch(task, FIRECRAWL_API_KEY);
            return { task, results };
          } catch (e) {
            errors.push(`${task.crisisTitle}: ${e instanceof Error ? e.message : "Search failed"}`);
            return { task, results: [] as FirecrawlSearchResult[] };
          }
        })
      );

      for (const { task, results } of searchResults) {
        for (const result of results) {
          if (!result.url) continue;
          const source = classifySource(result.url);
          if (!platformMatches(task.platform, source)) continue;
          const content = buildSignalContent(result);
          if (content.length < 20) continue;
          const title = normalizeWhitespace(result.title || result.description || content.slice(0, 160));
          const key = `${task.crisisId}:${result.url.toLowerCase()}`;
          if (!dedupeCandidates.has(key)) {
            dedupeCandidates.set(key, { task, url: result.url, title, content });
          }
        }
      }
    }

    const candidates = [...dedupeCandidates.values()];
    const enrichments = await batchEnrichWithAI(
      candidates.map((item, idx) => ({ content: item.content, idx })),
      LOVABLE_API_KEY
    );

    for (let idx = 0; idx < candidates.length; idx++) {
      const item = candidates[idx];
      const source = classifySource(item.url);
      const hostname = new URL(item.url).hostname.replace("www.", "").split(".")[0] || "Unknown";
      const author = hostname.charAt(0).toUpperCase() + hostname.slice(1);
      const enrichment = enrichments.get(idx);
      const keywords = Array.from(new Set([...(enrichment?.keywords || []), ...item.task.query.split(/\s+/).filter((part) => part.length > 4).slice(0, 3).map((part) => part.toLowerCase().replace(/[^a-z0-9-]/g, ""))].filter(Boolean))).slice(0, 8);

      const { error: insertErr } = await supabase.from("signals").insert({
        crisis_id: item.task.crisisId,
        source,
        author,
        content: item.title.slice(0, 500),
        sentiment: enrichment?.sentiment || "neutral",
        keywords,
        reach: estimateReach(item.url),
        author_followers: isInfluencerSource(item.url) ? 100000 + Math.floor(Math.random() * 900000) : 1000 + Math.floor(Math.random() * 50000),
        is_influencer: isInfluencerSource(item.url),
        source_url: item.url,
        detected_at: new Date().toISOString(),
      });

      if (insertErr) {
        if (!insertErr.message?.includes("signals_source_url_unique")) {
          console.error("Insert error:", insertErr.message);
          errors.push(`${item.task.crisisTitle}: ${insertErr.message}`);
        }
      } else {
        totalInserted += 1;
        crisisIdsTouched.add(item.task.crisisId);
      }
    }

    const touchedIds = crisisIdsTouched.size > 0 ? [...crisisIdsTouched] : [...new Set(tasks.map((task) => task.crisisId))];
    await upsertSnapshotsAndCounts(supabase, touchedIds);
    await regenerateNarratives(supabase, tasks, LOVABLE_API_KEY);

    return new Response(JSON.stringify({ success: true, inserted: totalInserted, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
