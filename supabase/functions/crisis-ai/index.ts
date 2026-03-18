import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AnalysisType = "sentiment" | "narrative" | "response" | "emotional" | "reputation" | "draft_response" | "post_crisis_summary" | "scenario_simulation";

interface RequestBody {
  type: AnalysisType;
  signals?: { author: string; content: string; source: string; sentiment?: string }[];
  crisisContext?: string;
  templateContent?: string;
  channel?: string;
  responseHistory?: string;
}

function buildSystemPrompt(type: AnalysisType): string {
  const base =
    "You are CrisisX AI — a crisis intelligence analyst embedded in a real-time PR command center. Be precise, actionable, and data-driven. Use short paragraphs. No fluff.";

  switch (type) {
    case "sentiment":
      return `${base}

TASK: Sentiment Classification & Analysis
Analyze the provided signals and return a structured sentiment breakdown:
- Overall sentiment score (-1.0 to 1.0)
- Distribution percentages (positive / neutral / negative)
- Key drivers of negative sentiment
- Emerging sentiment shifts or inflection points
- Risk assessment based on sentiment trajectory

Format with clear headers and bullet points.`;

    case "narrative":
      return `${base}

TASK: Narrative Intelligence Summary
Analyze the provided signals to identify and summarize dominant narratives:
- Identify 3-5 distinct narrative clusters
- For each: title, one-line summary, estimated signal volume, risk level (critical/high/medium/low)
- Flag any narratives that are accelerating or could escalate
- Identify narrative gaps (stories NOT being told that should concern us)
- Recommend narrative counter-strategies

Format with clear headers and bullet points.`;

    case "response":
      return `${base}

TASK: AI-Recommended Crisis Responses
Based on the signals and crisis context, generate recommended responses:
- Provide 2-3 response options ranging from conservative to proactive
- For each option: tone, key messages (3-5 bullet points), recommended channels, timing
- Flag legal/regulatory considerations
- Suggest stakeholder-specific messaging variations
- Include a "DO NOT SAY" list of phrases to avoid

Format with clear headers and bullet points.`;

    case "emotional":
      return `${base}

TASK: Emotional Analysis & Classification
Analyze the emotional undertones across all provided signals:
- Classify dominant emotions: Fear, Anger, Frustration, Anxiety, Hope, Relief, Confusion, Outrage
- Provide percentage distribution of emotions across all signals
- Identify emotional escalation patterns (which emotions are intensifying)
- Map emotional clusters to stakeholder groups
- Flag high-risk emotional triggers (language that could incite further backlash)
- Provide an "Emotional Temperature" score (1-10, where 10 = extreme volatility)
- Recommend emotional de-escalation strategies

Format with clear headers, percentages, and actionable recommendations.`;

    case "reputation":
      return `${base}

TASK: Reputation & Brand Perception Analysis
Analyze the signals to assess brand/organizational reputation impact:
- **Reputation Score**: 0-100 scale based on signal sentiment, reach, and source authority
- **Trust Index**: How much trust capital has been lost (estimated % decline)
- **Brand Perception Dimensions**:
  - Reliability/Competence
  - Transparency/Honesty
  - Customer Care
  - Leadership/Accountability
  - Innovation/Resilience
- **Competitive Positioning**: How competitors are capitalizing on this crisis
- **Recovery Forecast**: Estimated time to reputation baseline (days/weeks)
- **Key Reputation Risks**: Top 3 long-term reputation threats
- **Recommended Reputation Repair Actions**: Prioritized list

Format with clear headers, scores, and actionable insights.`;

    case "draft_response":
      return `${base}

TASK: AI-Assisted Response Drafting
You are helping draft a crisis response message. The user will provide:
- A template or template type to base the response on
- The crisis context and target channel

Draft a polished, ready-to-publish response that:
- Matches the tone appropriate for the channel (Twitter = concise, Press Release = formal, LinkedIn = professional)
- Acknowledges the situation without admitting fault prematurely
- Includes specific commitments or next steps
- Maintains brand voice consistency
- Is appropriately sized for the channel (tweet = 280 chars, press release = 3-5 paragraphs)

Provide the drafted response, then a brief rationale for key messaging choices.`;

    case "post_crisis_summary":
      return `${base}

TASK: Post-Crisis Summary Report
Generate a comprehensive post-crisis analysis report:
- **Executive Summary**: 2-3 sentence overview
- **Timeline of Events**: Key milestones from detection to resolution
- **Sentiment Journey**: Before → During → After the crisis
- **Response Effectiveness**: What worked and what didn't
- **Stakeholder Impact Assessment**: How each group was affected
- **Lessons Learned**: Top 5 actionable takeaways
- **Recommendations**: Preventive measures for future crises
- **Reputation Recovery Status**: Current recovery trajectory

Format as a structured report with clear sections.`;

    case "scenario_simulation":
      return `${base}

TASK: Scenario Simulation
Based on the crisis context and proposed response, simulate outcomes:
- **Best Case Scenario**: Describe the optimal outcome if everything goes well
- **Most Likely Scenario**: The realistic middle-ground outcome
- **Worst Case Scenario**: What happens if the response backfires or new information emerges
- For each scenario: sentiment impact, media reaction, stakeholder response, timeline
- **Risk-Reward Assessment**: Rate the proposed approach
- **Alternative Strategies**: 2 alternative approaches with their own scenario projections

Format with clear scenario headers and impact metrics.`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body = (await req.json()) as RequestBody;
    const { type, signals, crisisContext, templateContent, channel, responseHistory } = body;

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Missing required field: type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userPrompt = "";

    if (type === "draft_response") {
      userPrompt = `CRISIS CONTEXT:\n${crisisContext || "No context provided"}\n\nTEMPLATE/BASE:\n${templateContent || "No template"}\n\nTARGET CHANNEL: ${channel || "general"}`;
    } else if (type === "post_crisis_summary") {
      userPrompt = `CRISIS CONTEXT:\n${crisisContext || "No context provided"}\n\nRESPONSE HISTORY:\n${responseHistory || "No history available"}`;
      if (signals?.length) {
        userPrompt += `\n\nSIGNALS:\n${signals.map((s, i) => `[${i + 1}] @${s.author} (${s.source}): "${s.content}"`).join("\n")}`;
      }
    } else if (type === "scenario_simulation") {
      userPrompt = `CRISIS CONTEXT:\n${crisisContext || "No context provided"}\n\nPROPOSED RESPONSE:\n${templateContent || "No response drafted yet"}`;
    } else {
      if (!signals?.length) {
        return new Response(
          JSON.stringify({ error: "Missing required field: signals" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const signalText = signals
        .map((s, i) => `[${i + 1}] @${s.author} (${s.source}): "${s.content}"`)
        .join("\n");

      userPrompt = crisisContext
        ? `CRISIS CONTEXT:\n${crisisContext}\n\nSIGNALS:\n${signalText}`
        : `SIGNALS:\n${signalText}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(type) },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("crisis-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
