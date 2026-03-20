import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND_QUERIES: { query: string; brandKey: string }[] = [
  { query: "MTN Nigeria network OR outage OR data breach OR NCC", brandKey: "mtn" },
  { query: "Dangote refinery OR regulation OR environmental OR NESREA", brandKey: "dangote" },
  { query: "Zenith Bank fraud OR customer OR CBN OR banking", brandKey: "zenith" },
  { query: "Flutterwave regulation OR dispute OR frozen funds OR CBN", brandKey: "flutterwave" },
  { query: "Opay fraud OR agent OR POS OR consumer protection Nigeria", brandKey: "opay" },
  { query: "Paystack downtime OR security OR payment gateway OR Stripe", brandKey: "paystack" },
];

// Map brand keys to crisis IDs (seeded data)
const BRAND_CRISIS_MAP: Record<string, string> = {
  mtn: "a1000000-0000-0000-0000-000000000001",
  dangote: "a2000000-0000-0000-0000-000000000002",
  zenith: "a3000000-0000-0000-0000-000000000003",
  flutterwave: "a4000000-0000-0000-0000-000000000004",
  opay: "a5000000-0000-0000-0000-000000000005",
  paystack: "a6000000-0000-0000-0000-000000000006",
};

const SOURCE_MAP: Record<string, string> = {
  twitter: "twitter",
  "x.com": "twitter",
  linkedin: "linkedin",
  blog: "blog",
  medium: "blog",
  substack: "blog",
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

async function enrichWithAI(
  content: string,
  apiKey: string
): Promise<{ sentiment: string; keywords: string[] } | null> {
  try {
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
            content:
              "You are a signal analysis tool. Analyze the text and extract sentiment and keywords. Use the provided tool.",
          },
          { role: "user", content: `Analyze this news signal:\n\n${content.slice(0, 1500)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_signal",
              description: "Classify a news signal's sentiment and extract keywords",
              parameters: {
                type: "object",
                properties: {
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative"],
                    description: "Overall sentiment of the content",
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 relevant keywords from the content",
                  },
                },
                required: ["sentiment", "keywords"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_signal" } },
      }),
    });

    if (!resp.ok) {
      console.error("AI enrichment failed:", resp.status);
      return null;
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return null;

    return JSON.parse(toolCall.function.arguments);
  } catch (e) {
    console.error("AI enrichment error:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalInserted = 0;
    const errors: string[] = [];

    for (const brand of BRAND_QUERIES) {
      try {
        console.log(`Searching: ${brand.query}`);

        const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: brand.query,
            limit: 10,
            lang: "en",
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        if (!searchResp.ok) {
          const errText = await searchResp.text();
          console.error(`Firecrawl error for ${brand.brandKey}:`, searchResp.status, errText);
          errors.push(`${brand.brandKey}: Firecrawl ${searchResp.status}`);
          continue;
        }

        const searchData = await searchResp.json();
        const results = searchData.data || [];

        for (const result of results) {
          const url = result.url;
          if (!url) continue;

          // Dedup: check if URL already exists
          const { data: existing } = await supabase
            .from("signals")
            .select("id")
            .eq("source_url", url)
            .maybeSingle();

          if (existing) continue;

          const content = result.markdown?.slice(0, 2000) || result.title || result.description || "";
          if (!content || content.length < 30) continue;

          // AI enrichment
          const enrichment = await enrichWithAI(content, LOVABLE_API_KEY);
          const sentiment = enrichment?.sentiment || "neutral";
          const keywords = enrichment?.keywords || [];

          const source = classifySource(url);
          const author = result.title
            ? (new URL(url).hostname.replace("www.", "").split(".")[0] || "Unknown")
            : "Unknown";
          const reach = estimateReach(url);
          const isInfluencer = isInfluencerSource(url);

          const { error: insertErr } = await supabase.from("signals").insert({
            crisis_id: BRAND_CRISIS_MAP[brand.brandKey],
            source,
            author: author.charAt(0).toUpperCase() + author.slice(1),
            content: (result.title || content.slice(0, 280)).slice(0, 500),
            sentiment,
            keywords,
            reach,
            author_followers: isInfluencer ? 100000 + Math.floor(Math.random() * 900000) : 1000 + Math.floor(Math.random() * 50000),
            is_influencer: isInfluencer,
            source_url: url,
            detected_at: new Date().toISOString(),
          });

          if (insertErr) {
            // Likely unique constraint violation — skip
            if (!insertErr.message?.includes("duplicate")) {
              console.error("Insert error:", insertErr.message);
            }
          } else {
            totalInserted++;
          }
        }

        // Rate limit between brands
        await new Promise((r) => setTimeout(r, 1000));
      } catch (brandErr) {
        console.error(`Error for ${brand.brandKey}:`, brandErr);
        errors.push(`${brand.brandKey}: ${brandErr instanceof Error ? brandErr.message : "unknown"}`);
      }
    }

    // Update signal counts on crises
    for (const [brandKey, crisisId] of Object.entries(BRAND_CRISIS_MAP)) {
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
