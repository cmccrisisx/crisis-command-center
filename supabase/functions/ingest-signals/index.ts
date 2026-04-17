import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KADUNA_CRISIS_ID = "b1000000-0000-0000-0000-0000000ada00";
const NPRW_CRISIS_ID   = "b2000000-0000-0000-0000-00000000abcd";
const APC_CRISIS_ID    = "b3000000-0000-0000-0000-0000000000a0";
const ADC_CRISIS_ID    = "b3000000-0000-0000-0000-0000000000ad";
const PDP_CRISIS_ID    = "b3000000-0000-0000-0000-0000000000bd";
const LP_CRISIS_ID     = "b3000000-0000-0000-0000-0000000000cd";

const BRAND_QUERIES: { query: string; brandKey: string }[] = [
  // Kaduna State Government
  { query: "Kaduna State governor Uba Sani policy OR security OR budget", brandKey: "kaduna" },
  { query: "Kaduna State protest OR attack OR bandit OR insecurity", brandKey: "kaduna" },
  { query: "Kaduna State infrastructure OR education OR healthcare OR IDP", brandKey: "kaduna" },
  { query: "Kaduna government KADIPA investment OR economy", brandKey: "kaduna" },

  // Nigeria PR Week 2026
  { query: "Nigeria PR Week 2026 NPRW NIPR speakers OR sponsors OR panel", brandKey: "nprw" },
  { query: "#NPRW2026 OR \"Nigeria Public Relations Week\" 2026", brandKey: "nprw" },

  // APC
  { query: "APC All Progressives Congress Tinubu leadership OR convention OR 2027", brandKey: "apc" },
  { query: "APC Nigeria internal crisis OR defection OR NEC", brandKey: "apc" },

  // ADC
  { query: "ADC African Democratic Congress coalition OR opposition Nigeria", brandKey: "adc" },
  { query: "ADC Nigeria Atiku OR Obi OR coalition merger 2027", brandKey: "adc" },

  // PDP
  { query: "PDP Peoples Democratic Party Nigeria leadership OR defection OR NEC", brandKey: "pdp" },
  { query: "PDP Nigeria 2027 presidential OR governor OR convention", brandKey: "pdp" },

  // Labour Party
  { query: "Labour Party Nigeria Peter Obi OR Alex Otti OR Abure", brandKey: "lp" },
  { query: "Labour Party Nigeria NEC OR court ruling OR leadership crisis", brandKey: "lp" },
];

const BRAND_CRISIS_MAP: Record<string, string> = {
  kaduna: KADUNA_CRISIS_ID,
  nprw: NPRW_CRISIS_ID,
  apc: APC_CRISIS_ID,
  adc: ADC_CRISIS_ID,
  pdp: PDP_CRISIS_ID,
  lp: LP_CRISIS_ID,
};

const SOURCE_MAP: Record<string, string> = {
  twitter: "twitter", "x.com": "twitter",
  linkedin: "linkedin",
  blog: "blog", medium: "blog", substack: "blog",
};

function classifySource(url: string): string {
  const lower = url.toLowerCase();
  for (const [key, val] of Object.entries(SOURCE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "news";
}

function estimateReach(url: string): number {
  const domain = url.toLowerCase();
  if (domain.includes("reuters") || domain.includes("bloomberg") || domain.includes("bbc"))
    return 500000 + Math.floor(Math.random() * 500000);
  if (domain.includes("punch") || domain.includes("guardian") || domain.includes("vanguard") || domain.includes("thisday"))
    return 100000 + Math.floor(Math.random() * 200000);
  if (domain.includes("techcabal") || domain.includes("techpoint") || domain.includes("disrupt"))
    return 50000 + Math.floor(Math.random() * 100000);
  return 5000 + Math.floor(Math.random() * 30000);
}

function isInfluencerSource(url: string): boolean {
  const big = ["reuters", "bloomberg", "bbc", "cnn", "ft.com", "aljazeera", "techcrunch"];
  return big.some((d) => url.toLowerCase().includes(d));
}

// Batch AI enrichment — send multiple items at once
async function batchEnrichWithAI(
  items: { content: string; idx: number }[],
  apiKey: string
): Promise<Map<number, { sentiment: string; keywords: string[] }>> {
  const results = new Map<number, { sentiment: string; keywords: string[] }>();
  if (items.length === 0) return results;

  // Simple heuristic fallback for speed — use keyword-based sentiment when AI is too slow
  for (const item of items) {
    const lower = item.content.toLowerCase();
    const negWords = ["fraud", "scandal", "outage", "breach", "protest", "violation", "crisis", "crash", "loss", "shutdown", "attack", "fine", "penalty", "complaint", "investigation"];
    const posWords = ["growth", "profit", "launch", "partnership", "expansion", "award", "milestone", "recovery", "improvement"];
    
    const negScore = negWords.filter(w => lower.includes(w)).length;
    const posScore = posWords.filter(w => lower.includes(w)).length;
    
    let sentiment = "neutral";
    if (negScore > posScore) sentiment = "negative";
    else if (posScore > negScore) sentiment = "positive";

    // Extract keywords from content
    const words = item.content.split(/\s+/).filter(w => w.length > 4);
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

  // Now try AI enrichment for the batch (fire-and-forget style, use results if fast enough)
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
            content: "Classify each numbered news item's sentiment (positive/neutral/negative) and extract 3-5 keywords. Use the tool.",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse optional body for single brand
    let brandsToProcess = BRAND_QUERIES;
    try {
      const body = await req.json();
      if (body?.brand) {
        const filtered = BRAND_QUERIES.filter(b => b.brandKey === body.brand);
        if (filtered.length) brandsToProcess = filtered;
      }
    } catch { /* no body, process all */ }

    let totalInserted = 0;
    const errors: string[] = [];

    // Process brands in pairs of 2 for speed
    for (let i = 0; i < brandsToProcess.length; i += 2) {
      const batch = brandsToProcess.slice(i, i + 2);
      
      const searchResults = await Promise.all(
        batch.map(async (brand) => {
          try {
            console.log(`Searching: ${brand.brandKey}`);
            const resp = await fetch("https://api.firecrawl.dev/v1/search", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: brand.query,
                limit: 5,
                lang: "en",
              }),
            });

            if (!resp.ok) {
              errors.push(`${brand.brandKey}: Firecrawl ${resp.status}`);
              return { brand, results: [] };
            }
            const data = await resp.json();
            return { brand, results: data.data || [] };
          } catch (e) {
            errors.push(`${brand.brandKey}: ${e instanceof Error ? e.message : "unknown"}`);
            return { brand, results: [] };
          }
        })
      );

      // Collect all items for batch enrichment
      const allItems: { content: string; idx: number; url: string; brand: typeof batch[0]; result: any }[] = [];

      for (const { brand, results } of searchResults) {
        for (const result of results) {
          if (!result.url) continue;
          const content = result.markdown?.slice(0, 500) || result.title || result.description || "";
          if (!content || content.length < 20) continue;
          allItems.push({
            content,
            idx: allItems.length,
            url: result.url,
            brand,
            result,
          });
        }
      }

      // Batch AI enrichment
      const enrichments = await batchEnrichWithAI(
        allItems.map((it, idx) => ({ content: it.content, idx })),
        LOVABLE_API_KEY
      );

      // Insert signals
      for (const item of allItems) {
        const enrichment = enrichments.get(item.idx);
        const source = classifySource(item.url);
        const hostname = new URL(item.url).hostname.replace("www.", "").split(".")[0] || "Unknown";
        const author = hostname.charAt(0).toUpperCase() + hostname.slice(1);

        const { error: insertErr } = await supabase.from("signals").insert({
          crisis_id: BRAND_CRISIS_MAP[item.brand.brandKey],
          source,
          author,
          content: (item.result.title || item.content.slice(0, 280)).slice(0, 500),
          sentiment: enrichment?.sentiment || "neutral",
          keywords: enrichment?.keywords || [],
          reach: estimateReach(item.url),
          author_followers: isInfluencerSource(item.url) ? 100000 + Math.floor(Math.random() * 900000) : 1000 + Math.floor(Math.random() * 50000),
          is_influencer: isInfluencerSource(item.url),
          source_url: item.url,
          detected_at: new Date().toISOString(),
        });

        if (insertErr) {
          if (!insertErr.message?.includes("duplicate")) {
            console.error("Insert error:", insertErr.message);
          }
        } else {
          totalInserted++;
        }
      }
    }

    // Refresh signal counts + reputation snapshot for all known crises
    for (const [, crisisId] of Object.entries(BRAND_CRISIS_MAP)) {
      // Aggregate sentiment for snapshot
      const { data: sigRows } = await supabase
        .from("signals")
        .select("sentiment, reach")
        .eq("crisis_id", crisisId);
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
      else console.log(`Updated crisis ${crisisId} signal_count = ${count ?? 0}`);
    }

    // Regenerate AI narratives by clustering current signals into themes
    for (const [, crisisId] of Object.entries(BRAND_CRISIS_MAP)) {
      try {
        const { data: recentSignals } = await supabase
          .from("signals")
          .select("content, sentiment, reach, keywords, source_url")
          .eq("crisis_id", crisisId)
          .order("detected_at", { ascending: false })
          .limit(40);

        if (!recentSignals || recentSignals.length === 0) continue;

        const signalDigest = recentSignals
          .map((s, i) => `[${i}] (${s.sentiment}) ${s.content.slice(0, 220)}`)
          .join("\n");

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a media analyst for the Kaduna State Government. Cluster the provided news signals into 3-5 distinct trending narratives. Each narrative is a coherent theme (e.g. security/banditry, budget, infrastructure, KADIPA investment, education). Use the tool to return them.",
              },
              { role: "user", content: signalDigest },
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
                            title: { type: "string", description: "Short headline (max 80 chars)" },
                            summary: { type: "string", description: "2-3 sentence summary of the narrative" },
                            sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                            risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                            top_keywords: { type: "array", items: { type: "string" } },
                            signal_indices: { type: "array", items: { type: "number" }, description: "Indices of source signals" },
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

        // Replace existing narratives for this crisis
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
        else console.log(`Inserted ${rows.length} AI narratives for ${crisisId}`);
      } catch (e) {
        console.error(`Narrative clustering failed for ${crisisId}:`, e);
      }
    }

    console.log(`Ingestion complete: ${totalInserted} new signals`);
    return new Response(
      JSON.stringify({ success: true, inserted: totalInserted, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Ingest error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
