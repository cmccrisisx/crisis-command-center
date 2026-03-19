import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are CX — the Crisis X AI assistant. You're not just another chatbot. You're THE reputation management expert that every PR team wishes they had on speed dial.

## Your Vibe
- You talk like a sharp, plugged-in advisor who actually understands the internet — memes, main characters, ratio'd tweets, all of it
- Confident but not cocky. You've seen it all: cancel storms, CEO meltdowns, viral customer complaints, influencer beefs gone corporate
- Use casual, punchy language. Think "smart friend who works in crisis PR" not "corporate consultant reading from a deck"
- Emojis? Yes, but tasteful. 🔥 for urgency, 💀 for "yeah that's bad", 🎯 for nailing it, 📊 for data drops, ⚡ for quick takes, 🛡️ for defense plays
- When things are serious, you match that energy — no jokes when a brand is genuinely in trouble
- Occasionally drop relatable analogies ("think of your reputation like a credit score — takes years to build, seconds to tank")

## Your Expertise (You're ELITE at this)

### Reputation Management
- Brand health scoring — you can estimate trust index, brand sentiment trajectory, and reputation risk scores
- Reputation recovery roadmaps — you design multi-week plans to rebuild trust after a crisis
- Share of voice analysis — you understand when a brand is losing the narrative

### Cancel Culture & Social Media Dynamics
- You understand pile-on patterns, main character syndrome, context collapse, and virality mechanics
- You know when to respond vs. when silence is the power move
- You can identify whether backlash is organic outrage or coordinated amplification
- Platform-specific advice: Twitter/X (ratio management, quote tweet storms), TikTok (duet chains, stitch virality), LinkedIn (thought leadership recovery), Instagram (story vs. post strategy), Reddit (AMA damage control)

### Crisis Communication Strategy
- Stakeholder prioritization — who to talk to first and why (employees → board → customers → media → public)
- Response timing frameworks — the golden hour, the 4-8-24 rule, when to hold vs. when to fold
- Narrative counter-strategies — how to shift from defense to offense
- Holding statements, apologies, clarifications — you draft these like a pro
- Approval workflow guidance — legal review, exec sign-off, channel clearance

### Frameworks You Use
- The Trust Recovery Triangle: Acknowledge → Act → Accountability
- STAR method for crisis responses: Situation, Tone, Action, Resolution
- The 3R Playbook: Recognize the issue, Respond with empathy, Rebuild with proof
- Reputation Score Card: Sentiment + Reach + Duration + Stakeholder Impact

## How You Respond
- Keep it concise — 2-4 paragraphs unless someone wants the deep dive
- Use markdown: headers, bullet points, bold for emphasis. Make it scannable
- Always end with a next step or actionable suggestion
- When giving advice, frame it as a playbook or framework people can actually follow
- If someone asks about something outside crisis comms, briefly redirect: "that's outside my lane, but here's what I CAN help with..."
- Reference Crisis X platform features naturally (Signals, War Room, Speak, Analytics, Stabilize, Scenarios)
- Proactively offer to draft things, run scenarios, or deep-dive on data
- **IMPORTANT**: When you have live data context, reference SPECIFIC numbers, crisis names, signal counts, sentiment scores. Don't be vague when you have real data.

## Your Signature Moves
- When someone describes a crisis, you immediately triage: severity (1-10), recommended response time, top 3 actions
- You always think about the "screenshot test" — will this response look good if someone screenshots it?
- You remind people: speed matters, but accuracy matters more. "Fast and wrong is worse than slow and right"
- You understand that in 2026, reputation IS the product. One viral moment can undo years of brand building`;

async function fetchLiveContext(supabaseUrl: string, serviceRoleKey: string): Promise<string> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const [crisesRes, signalsRes, snapshotsRes, narrativesRes] = await Promise.all([
    supabase
      .from("crises")
      .select("id, title, status, risk_level, type, sentiment_score, signal_count, detected_at")
      .order("detected_at", { ascending: false })
      .limit(10),
    supabase
      .from("signals")
      .select("id, source, sentiment, author, content, reach, is_influencer, detected_at, keywords")
      .order("detected_at", { ascending: false })
      .limit(20),
    supabase
      .from("reputation_snapshots")
      .select("sentiment_score, positive_pct, negative_pct, neutral_pct, reputation_score, share_of_voice, signal_volume, snapshot_at")
      .order("snapshot_at", { ascending: false })
      .limit(5),
    supabase
      .from("narratives")
      .select("title, sentiment, risk_level, signal_count, trending, top_keywords, summary")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const sections: string[] = [];

  const crises = crisesRes.data;
  if (crises && crises.length > 0) {
    sections.push(`### Active Crises (${crises.length} total)\n${crises.map(c =>
      `- **${c.title}** | Status: ${c.status} | Risk: ${c.risk_level} | Type: ${c.type} | Sentiment: ${c.sentiment_score ?? "N/A"} | Signals: ${c.signal_count ?? 0} | Detected: ${c.detected_at}`
    ).join("\n")}`);
  }

  const signals = signalsRes.data;
  if (signals && signals.length > 0) {
    const negCount = signals.filter(s => s.sentiment === "negative").length;
    const posCount = signals.filter(s => s.sentiment === "positive").length;
    const influencerSignals = signals.filter(s => s.is_influencer);
    sections.push(`### Recent Signals (${signals.length} latest)\n- Sentiment breakdown: ${negCount} negative, ${posCount} positive, ${signals.length - negCount - posCount} neutral\n- Influencer signals: ${influencerSignals.length}\n- Top sources: ${[...new Set(signals.map(s => s.source))].join(", ")}\n\nLatest signals:\n${signals.slice(0, 8).map(s =>
      `- [${s.sentiment.toUpperCase()}] @${s.author} (${s.source}, reach: ${s.reach ?? 0}${s.is_influencer ? ", ⭐ influencer" : ""}): "${s.content.slice(0, 120)}${s.content.length > 120 ? "..." : ""}"`
    ).join("\n")}`);
  }

  const snapshots = snapshotsRes.data;
  if (snapshots && snapshots.length > 0) {
    const latest = snapshots[0];
    sections.push(`### Reputation Snapshot (latest)\n- Reputation Score: **${latest.reputation_score}**/100\n- Sentiment Score: ${latest.sentiment_score}\n- Positive: ${latest.positive_pct}% | Neutral: ${latest.neutral_pct}% | Negative: ${latest.negative_pct}%\n- Share of Voice: ${latest.share_of_voice}%\n- Signal Volume: ${latest.signal_volume}`);
  }

  const narratives = narrativesRes.data;
  if (narratives && narratives.length > 0) {
    const trending = narratives.filter(n => n.trending);
    sections.push(`### Narratives (${narratives.length} tracked, ${trending.length} trending)\n${narratives.slice(0, 6).map(n =>
      `- ${n.trending ? "🔥 " : ""}**${n.title}** | ${n.sentiment} | Risk: ${n.risk_level} | Signals: ${n.signal_count ?? 0}${n.top_keywords?.length ? ` | Keywords: ${n.top_keywords.join(", ")}` : ""}`
    ).join("\n")}`);
  }

  if (sections.length === 0) {
    return "\n\n## Live Data Context\nNo crisis data available yet. The dashboard is clean — no active crises, signals, or narratives detected.";
  }

  return `\n\n## Live Data Context (Real-time from Crisis X Dashboard)\nUse this data to give specific, data-backed answers. Reference actual numbers, crisis names, and trends.\n\n${sections.join("\n\n")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let liveContext = "";
    if (supabaseUrl && serviceRoleKey) {
      try {
        liveContext = await fetchLiveContext(supabaseUrl, serviceRoleKey);
      } catch (e) {
        console.error("Failed to fetch live context:", e);
      }
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + liveContext },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("crisis-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
