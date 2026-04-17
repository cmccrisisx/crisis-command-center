import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KADUNA_CRISIS_ID = "b1000000-0000-0000-0000-0000000ada00";

const BRAND_QUERIES: { query: string; brandKey: string }[] = [
  { query: "Kaduna State governor Uba Sani policy OR security OR budget", brandKey: "kaduna" },
  { query: "Kaduna State protest OR attack OR bandit OR insecurity", brandKey: "kaduna" },
  { query: "Kaduna State infrastructure OR education OR healthcare OR IDP", brandKey: "kaduna" },
  { query: "Kaduna government KADIPA investment OR economy", brandKey: "kaduna" },
];

const BRAND_CRISIS_MAP: Record<string, string> = {
  kaduna: KADUNA_CRISIS_ID,
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

    // Update signal counts
    for (const [, crisisId] of Object.entries(BRAND_CRISIS_MAP)) {
      const { count } = await supabase
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("crisis_id", crisisId);
      await supabase.from("crises").update({ signal_count: count || 0 }).eq("id", crisisId);
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
